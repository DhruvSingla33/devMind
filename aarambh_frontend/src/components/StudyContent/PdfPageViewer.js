import { useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { WebView } from "react-native-webview";

import { colors, radius, spacing } from "../../theme/theme";

// Native build of the single-page PDF viewer: a WebView running pdf.js that
// draws one page at a time. The page number is pushed in with
// injectJavaScript so switching pages doesn't reload the document. The web
// build lives in PdfPageViewer.web.js.
const PDFJS_BASE = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174";

function buildHtml(url, initialPage) {
  return `<!doctype html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=4, user-scalable=yes" />
<style>
  html, body { margin: 0; padding: 0; background: #FFFFFF; }
  canvas { display: block; width: 100%; height: auto; }
</style>
<script src="${PDFJS_BASE}/pdf.min.js"></script>
</head>
<body>
<canvas id="page"></canvas>
<script>
  (function () {
    var post = function (msg) { window.ReactNativeWebView.postMessage(JSON.stringify(msg)); };
    var doc = null;
    var renderTask = null;
    var pending = ${Number(initialPage) || 1};

    function render(n) {
      pending = n;
      if (!doc) return;
      var target = Math.min(Math.max(n, 1), doc.numPages);
      if (renderTask) renderTask.cancel();
      post({ type: "rendering" });
      doc.getPage(target).then(function (page) {
        var dpr = window.devicePixelRatio || 1;
        var base = page.getViewport({ scale: 1 });
        var viewport = page.getViewport({ scale: (window.innerWidth / base.width) * dpr });
        var canvas = document.getElementById("page");
        canvas.width = Math.floor(viewport.width);
        canvas.height = Math.floor(viewport.height);
        renderTask = page.render({ canvasContext: canvas.getContext("2d"), viewport: viewport });
        return renderTask.promise;
      }).then(function () {
        window.scrollTo(0, 0);
        post({ type: "rendered" });
      }).catch(function (err) {
        if (err && err.name === "RenderingCancelledException") return;
        post({ type: "error", message: (err && err.message) || "Could not render this page." });
      });
    }

    window.showPage = render;

    if (!window.pdfjsLib) {
      post({ type: "error", message: "Could not load the PDF viewer." });
      return;
    }
    pdfjsLib.GlobalWorkerOptions.workerSrc = "${PDFJS_BASE}/pdf.worker.min.js";
    pdfjsLib.getDocument(${JSON.stringify(url)}).promise.then(function (loaded) {
      doc = loaded;
      post({ type: "loaded", numPages: loaded.numPages });
      render(pending);
    }).catch(function (err) {
      post({ type: "error", message: (err && err.message) || "Could not load the PDF." });
    });
  })();
</script>
</body>
</html>`;
}

const PdfPageViewer = ({ url, page, onDocumentLoad, onError }) => {
  const webViewRef = useRef(null);
  const [isRendering, setIsRendering] = useState(true);

  // The HTML only depends on the URL; later page changes are injected, so the
  // starting page is read once from a ref instead of rebuilding the document.
  const pageRef = useRef(page);
  pageRef.current = page;
  const html = useMemo(() => buildHtml(url, pageRef.current), [url]);

  useEffect(() => {
    webViewRef.current?.injectJavaScript(
      `window.showPage && window.showPage(${Number(page) || 1}); true;`
    );
  }, [page]);

  const handleMessage = (event) => {
    let msg;
    try {
      msg = JSON.parse(event.nativeEvent.data);
    } catch {
      return;
    }
    if (msg.type === "loaded") onDocumentLoad?.(msg.numPages);
    else if (msg.type === "rendering") setIsRendering(true);
    else if (msg.type === "rendered") setIsRendering(false);
    else if (msg.type === "error") onError?.(msg.message);
  };

  return (
    <View style={styles.sheet}>
      <WebView
        ref={webViewRef}
        originWhitelist={["*"]}
        source={{ html }}
        onMessage={handleMessage}
        style={styles.webView}
      />

      {isRendering ? (
        <View style={styles.overlay} pointerEvents="none">
          <ActivityIndicator color={colors.primary} />
          <Text style={styles.overlayText}>Loading page…</Text>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  sheet: {
    flex: 1,
    borderRadius: radius.md,
    overflow: "hidden",
    backgroundColor: "#FFFFFF",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border
  },

  webView: {
    flex: 1,
    backgroundColor: "#FFFFFF"
  },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    backgroundColor: colors.surface
  },

  overlayText: {
    color: colors.muted,
    fontSize: 12
  }
});

export default PdfPageViewer;

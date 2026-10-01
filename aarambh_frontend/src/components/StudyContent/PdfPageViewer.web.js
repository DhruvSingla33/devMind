import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import { radius, spacing } from "../../theme/theme";
import { useTheme, useThemedStyles } from "../../theme/ThemeContext";

// Web build of the single-page PDF viewer. react-native-webview has no web
// support, so here pdf.js (UMD build, loaded once from the CDN) draws the
// requested page straight onto a <canvas>. The native build lives in
// PdfPageViewer.js.
const PDFJS_BASE = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174";

let pdfjsPromise = null;

function loadPdfJs() {
  if (window.pdfjsLib) return Promise.resolve(window.pdfjsLib);
  if (!pdfjsPromise) {
    pdfjsPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = `${PDFJS_BASE}/pdf.min.js`;
      script.async = true;
      script.onload = () => {
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = `${PDFJS_BASE}/pdf.worker.min.js`;
        resolve(window.pdfjsLib);
      };
      script.onerror = () => {
        pdfjsPromise = null;
        reject(new Error("Could not load the PDF viewer."));
      };
      document.head.appendChild(script);
    });
  }
  return pdfjsPromise;
}

const PdfPageViewer = ({ url, page, onDocumentLoad, onError }) => {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const canvasRef = useRef(null);
  const [doc, setDoc] = useState(null);
  const [width, setWidth] = useState(0);
  const [isRendering, setIsRendering] = useState(true);

  // Keep the latest callbacks without re-running the load effect.
  const callbacks = useRef({ onDocumentLoad, onError });
  callbacks.current = { onDocumentLoad, onError };

  useEffect(() => {
    let cancelled = false;
    let loadingTask = null;
    setDoc(null);

    loadPdfJs()
      .then((pdfjsLib) => {
        if (cancelled) return null;
        loadingTask = pdfjsLib.getDocument(url);
        return loadingTask.promise;
      })
      .then((loaded) => {
        if (cancelled || !loaded) return;
        setDoc(loaded);
        callbacks.current.onDocumentLoad?.(loaded.numPages);
      })
      .catch((error) => {
        if (!cancelled) callbacks.current.onError?.(error?.message || "Could not load the PDF.");
      });

    return () => {
      cancelled = true;
      loadingTask?.destroy();
    };
  }, [url]);

  useEffect(() => {
    if (!doc || width <= 0 || !canvasRef.current) return undefined;

    let renderTask = null;
    let cancelled = false;
    setIsRendering(true);

    doc
      .getPage(Math.min(Math.max(page, 1), doc.numPages))
      .then((pdfPage) => {
        if (cancelled) return null;

        // Fit the page to the column width, drawn at device pixel density so
        // text stays crisp on high-DPI screens.
        const dpr = window.devicePixelRatio || 1;
        const baseViewport = pdfPage.getViewport({ scale: 1 });
        const cssScale = width / baseViewport.width;
        const viewport = pdfPage.getViewport({ scale: cssScale * dpr });

        const canvas = canvasRef.current;
        canvas.width = Math.floor(viewport.width);
        canvas.height = Math.floor(viewport.height);
        canvas.style.width = `${Math.floor(width)}px`;
        canvas.style.height = `${Math.floor(viewport.height / dpr)}px`;

        renderTask = pdfPage.render({ canvasContext: canvas.getContext("2d"), viewport });
        return renderTask.promise;
      })
      .then(() => {
        if (!cancelled) setIsRendering(false);
      })
      .catch((error) => {
        if (cancelled || error?.name === "RenderingCancelledException") return;
        callbacks.current.onError?.(error?.message || "Could not render this page.");
      });

    return () => {
      cancelled = true;
      renderTask?.cancel();
    };
  }, [doc, page, width]);

  return (
    <View
      style={styles.sheet}
      onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
    >
      <canvas ref={canvasRef} style={{ display: "block" }} />

      {isRendering ? (
        <View style={styles.overlay}>
          <ActivityIndicator color={colors.primary} />
          <Text style={styles.overlayText}>Loading page…</Text>
        </View>
      ) : null}
    </View>
  );
};

const makeStyles = ({ colors }) => StyleSheet.create({
  sheet: {
    minHeight: 320,
    borderRadius: radius.md,
    overflow: "hidden",
    backgroundColor: "#FFFFFF",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border
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

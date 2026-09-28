import { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  PanResponder,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View
} from "react-native";

import ModuleHeader from "../../components/StudyContent/ModuleHeader";
import PageRenderer from "../../components/StudyContent/PageRenderer";
import MCQPanel from "../../components/StudyContent/MCQPanel";
import PageNavigation from "../../components/StudyContent/PageNavigation";
import PdfPageViewer from "../../components/StudyContent/PdfPageViewer";
import { colors, radius, spacing, WIDE_BREAKPOINT } from "../../theme/theme";

// `loadPdfUrl` (optional) resolves to the chapter PDF's URL. When given, the
// reader offers a Notes / PDF toggle; with no notes pages it opens straight
// into the PDF.
const StudySection = ({ studyData, loadPdfUrl }) => {
  const [currentPageIndex, setCurrentPageIndex] = useState(0);

  const { width } = useWindowDimensions();
  const isWide = width >= WIDE_BREAKPOINT;

  const stackedScrollRef = useRef(null);
  const pageScrollRef = useRef(null);
  const mcqScrollRef = useRef(null);
  const pdfScrollRef = useRef(null);

  const pages = studyData?.pages || [];
  const hasText = pages.length > 0;
  const hasPdf = typeof loadPdfUrl === "function";

  // Default to the PDF view (the book page), with the quiz beside it.
  const [viewMode, setViewMode] = useState(hasPdf ? "pdf" : "text");
  const [pdfUrl, setPdfUrl] = useState(null);
  const [pdfError, setPdfError] = useState(null);
  const [pdfPageCount, setPdfPageCount] = useState(0);
  // Bumped by "Try again" to re-request the URL / remount the viewer.
  const [pdfAttempt, setPdfAttempt] = useState(0);

  // The PDF URL is only fetched the first time the reader switches to PDF —
  // the backend may have to slice the chapter out of the textbook first.
  useEffect(() => {
    if (viewMode !== "pdf" || !hasPdf || pdfUrl) return undefined;
    let cancelled = false;
    loadPdfUrl()
      .then((url) => {
        if (!cancelled) setPdfUrl(url);
      })
      .catch((error) => {
        if (!cancelled) setPdfError(error?.message || "Could not load the PDF.");
      });
    return () => {
      cancelled = true;
    };
  }, [viewMode, hasPdf, pdfUrl, loadPdfUrl, pdfAttempt]);

  const retryPdf = () => {
    setPdfError(null);
    setPdfAttempt((prev) => prev + 1);
  };
  const showPdf = viewMode === "pdf" && hasPdf;

  // ONE page model for the whole reader. A single index walks the chapter's page
  // range (startPage..endPage, laid out densely in mapStudyData), and everything
  // follows it: "Page X of N", the notes page, the PDF page, and the quiz on the
  // right are always the same book page. The Notes/PDF toggle only swaps what's
  // shown on the LEFT — it never changes which page you're on.
  const chapterStartPage = Number(studyData?.chapter?.startPage) || 1;

  // Fallback: a chapter with a PDF but no page docs at all — once the PDF's
  // length is known, synthesise a page list from it so navigation still works.
  const effectivePages =
    pages.length > 0
      ? pages
      : pdfPageCount > 0
        ? Array.from({ length: pdfPageCount }, (_, i) => ({
            pageNumber: chapterStartPage + i,
            sections: [],
            mcqs: [],
          }))
        : [];

  const totalPages = effectivePages.length;
  const currentPage = effectivePages[currentPageIndex];
  const currentBookPage = currentPage?.pageNumber ?? chapterStartPage + currentPageIndex;

  // The chapter PDF is sliced from the book starting at startPage, so the PDF
  // page showing this book page is (bookPage - startPage + 1). Clamp to the real
  // PDF length once we know it (the slice can be a page shorter than the range).
  const pdfPageForBook = Math.max(1, currentBookPage - chapterStartPage + 1);
  const pdfPage = pdfPageCount > 0 ? Math.min(pdfPageForBook, pdfPageCount) : pdfPageForBook;

  const activeMcqs = currentPage?.mcqs || [];
  const hasMcqs = activeMcqs.length > 0;
  // Wide screens always split: left = the page (notes or PDF), right = this
  // page's quiz (MCQPanel shows its own empty state when the page has none).
  const showTwoColumn = isWide;

  // Resizable split between the page content (left) and the MCQ panel (right).
  // `leftWidth` is null until the row is measured; before then the columns fall
  // back to a 2:1 flex ratio.
  const DIVIDER_WIDTH = 10;
  const MIN_COLUMN = 280;
  const [rowWidth, setRowWidth] = useState(0);
  const [leftWidth, setLeftWidth] = useState(null);
  const leftWidthRef = useRef(0);
  const dragStartWidth = useRef(0);
  leftWidthRef.current = leftWidth;

  // Seed the split once, and keep it within bounds when the row resizes.
  useEffect(() => {
    if (rowWidth <= 0) return;
    const max = rowWidth - DIVIDER_WIDTH - MIN_COLUMN;
    setLeftWidth((prev) => {
      const target = prev == null ? rowWidth * 0.62 : prev;
      return Math.round(Math.max(MIN_COLUMN, Math.min(target, max)));
    });
  }, [rowWidth]);

  // While dragging, suppress the browser's text selection (and force the
  // resize cursor) on the whole document — otherwise dragging over the page
  // content highlights text and makes the drag feel janky.
  const setDragging = (active) => {
    if (Platform.OS !== "web" || typeof document === "undefined") return;
    document.body.style.userSelect = active ? "none" : "";
    document.body.style.webkitUserSelect = active ? "none" : "";
    document.body.style.cursor = active ? "col-resize" : "";
  };

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderTerminationRequest: () => false,
        onPanResponderGrant: () => {
          dragStartWidth.current = leftWidthRef.current || 0;
          setDragging(true);
        },
        onPanResponderMove: (_evt, gesture) => {
          if (rowWidth <= 0) return;
          const max = rowWidth - DIVIDER_WIDTH - MIN_COLUMN;
          const next = dragStartWidth.current + gesture.dx;
          setLeftWidth(Math.round(Math.max(MIN_COLUMN, Math.min(next, max))));
        },
        onPanResponderRelease: () => setDragging(false),
        onPanResponderTerminate: () => setDragging(false)
      }),
    [rowWidth]
  );

  // Safety net: if this screen unmounts mid-drag, restore the document styles.
  useEffect(() => () => setDragging(false), []);

  // Every page change starts the reader back at the top.
  useEffect(() => {
    const options = { y: 0, animated: false };

    stackedScrollRef.current?.scrollTo(options);
    pageScrollRef.current?.scrollTo(options);
    mcqScrollRef.current?.scrollTo(options);
    pdfScrollRef.current?.scrollTo(options);
  }, [currentPageIndex, viewMode]);

  const handleNext = () => {
    setCurrentPageIndex((prev) => {
      if (prev >= totalPages - 1) {
        return prev;
      }

      return prev + 1;
    });
  };

  const handlePrevious = () => {
    setCurrentPageIndex((prev) => {
      if (prev <= 0) {
        return prev;
      }

      return prev - 1;
    });
  };

  if (!currentPage && !showPdf) {
    return (
      <View style={[styles.container, styles.emptyContainer]}>
        <Text style={styles.emptyText}>No study content available.</Text>
      </View>
    );
  }

  let pdfContent = null;
  if (showPdf) {
    if (pdfError) {
      pdfContent = (
        <View style={styles.pdfMessage}>
          <Text style={styles.emptyText}>{pdfError}</Text>
          <Pressable onPress={retryPdf} style={styles.retryButton}>
            <Text style={styles.retryText}>Try again</Text>
          </Pressable>
        </View>
      );
    } else if (!pdfUrl) {
      pdfContent = (
        <View style={styles.pdfMessage}>
          <ActivityIndicator color={colors.primary} />
          <Text style={styles.emptyText}>Preparing PDF…</Text>
        </View>
      );
    } else {
      pdfContent = (
        <PdfPageViewer
          key={pdfAttempt}
          url={pdfUrl}
          page={pdfPage}
          onDocumentLoad={setPdfPageCount}
          onError={setPdfError}
        />
      );
    }
  }

  return (
    <View style={styles.container}>
      {/* Header */}

      <ModuleHeader
        chapter={studyData.chapter}
        currentPage={currentBookPage}
        totalPages={totalPages}
        viewMode={hasText && hasPdf ? viewMode : undefined}
        onViewModeChange={setViewMode}
      />

      {/* Shared page navigation — ONE counter (1..N over the chapter range) for
          both the notes and PDF views. */}
      {totalPages > 0 ? (
        <PageNavigation
          currentPage={currentPageIndex}
          totalPages={totalPages}
          onPrevious={handlePrevious}
          onNext={handleNext}
        />
      ) : null}

      {/* Main Study Area. The LEFT pane switches between the notes/section
          content and the PDF for the SAME book page; the RIGHT pane always shows
          that page's quiz (empty-state panel when the page has none). */}
      {showTwoColumn ? (
        <View
          style={styles.wideContent}
          onLayout={(e) => setRowWidth(e.nativeEvent.layout.width)}
        >
          {/* Left — notes or PDF for the current page */}
          <View style={[leftWidth == null ? styles.leftColumnFlex : { width: leftWidth }]}>
            {showPdf && Platform.OS !== "web" ? (
              // Native PDF WebView scrolls/zooms itself — no ScrollView wrapper.
              <View style={styles.pdfNative}>{pdfContent}</View>
            ) : (
              <ScrollView
                ref={showPdf ? pdfScrollRef : pageScrollRef}
                style={styles.columnScroll}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
              >
                {showPdf ? (
                  <View style={styles.pdfColumn}>{pdfContent}</View>
                ) : (
                  <PageRenderer page={currentPage} />
                )}
              </ScrollView>
            )}
          </View>

          {/* Draggable divider */}
          <View
            {...panResponder.panHandlers}
            style={[styles.divider, { width: DIVIDER_WIDTH }]}
            accessibilityRole="adjustable"
            accessibilityLabel="Resize content and questions panels"
          >
            <View style={styles.dividerGrip} />
          </View>

          {/* Right — this page's quiz */}
          <ScrollView
            ref={mcqScrollRef}
            style={styles.wideMcq}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <MCQPanel questions={activeMcqs} />
          </ScrollView>
        </View>
      ) : (
        // Narrow screens: page on top, quiz stacked below (web; a native PDF owns
        // its own scroll, so nothing stacks under it there).
        <View style={styles.stackedContent}>
          {showPdf && Platform.OS !== "web" ? (
            <View style={styles.pdfNative}>{pdfContent}</View>
          ) : (
            <ScrollView
              ref={stackedScrollRef}
              style={styles.columnScroll}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              {showPdf ? (
                <View style={styles.pdfColumn}>{pdfContent}</View>
              ) : (
                <PageRenderer page={currentPage} />
              )}

              {hasMcqs ? (
                <>
                  <View style={styles.stackedDivider} />
                  <MCQPanel questions={activeMcqs} />
                </>
              ) : null}
            </ScrollView>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background
  },

  emptyContainer: {
    alignItems: "center",
    justifyContent: "center"
  },

  emptyText: {
    color: colors.muted,
    fontSize: 14
  },

  wideContent: {
    flex: 1,
    flexDirection: "row"
  },

  leftColumnFlex: {
    flex: 2
  },

  columnScroll: {
    flex: 1
  },

  divider: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surfaceAlt,
    borderLeftWidth: StyleSheet.hairlineWidth,
    borderRightWidth: StyleSheet.hairlineWidth,
    borderLeftColor: colors.border,
    borderRightColor: colors.border,
    ...Platform.select({
      web: { cursor: "col-resize", userSelect: "none" },
      default: {}
    })
  },

  dividerGrip: {
    width: 3,
    height: 36,
    borderRadius: radius.pill,
    backgroundColor: colors.border
  },

  wideMcq: {
    flex: 1
  },

  stackedContent: {
    flex: 1
  },

  scrollContent: {
    flexGrow: 1,
    padding: spacing.lg,
    paddingBottom: spacing.xxl
  },

  stackedDivider: {
    height: spacing.xl
  },

  pdfColumn: {
    flex: 1,
    width: "100%",
    maxWidth: 900,
    alignSelf: "center"
  },

  pdfNative: {
    flex: 1,
    padding: spacing.sm
  },

  pdfMessage: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.md,
    paddingVertical: spacing.xxl
  },

  retryButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.primary
  },

  retryText: {
    color: colors.textOnDark,
    fontSize: 13,
    fontWeight: "700"
  }
});

export default StudySection;

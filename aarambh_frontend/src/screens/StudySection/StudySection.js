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

  const [viewMode, setViewMode] = useState(hasText ? "text" : "pdf");
  const [pdfUrl, setPdfUrl] = useState(null);
  const [pdfError, setPdfError] = useState(null);
  const [pdfPage, setPdfPage] = useState(1);
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
  const currentPage = pages[currentPageIndex];
  const hasMcqs = (currentPage?.mcqs?.length || 0) > 0;
  const showTwoColumn = isWide && hasMcqs;

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
  }, [currentPageIndex, pdfPage]);

  const handleNext = () => {
    setCurrentPageIndex((prev) => {
      if (prev >= pages.length - 1) {
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

  const showPdf = viewMode === "pdf" && hasPdf;

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
        currentPage={showPdf ? pdfPage : currentPage.pageNumber}
        totalPages={showPdf ? pdfPageCount : pages.length}
        viewMode={hasText && hasPdf ? viewMode : undefined}
        onViewModeChange={setViewMode}
      />

      {/* Main Study Area */}

      {showPdf ? (
        <View style={styles.stackedContent}>
          {pdfPageCount > 0 && !pdfError ? (
            <PageNavigation
              currentPage={pdfPage - 1}
              totalPages={pdfPageCount}
              onPrevious={() => setPdfPage((prev) => Math.max(1, prev - 1))}
              onNext={() => setPdfPage((prev) => Math.min(pdfPageCount, prev + 1))}
            />
          ) : null}

          {/* Web draws the page on a canvas that grows with its width, so it
              scrolls here; the native WebView scrolls and zooms by itself. */}
          {Platform.OS === "web" ? (
            <ScrollView
              ref={pdfScrollRef}
              style={styles.columnScroll}
              contentContainerStyle={styles.scrollContent}
            >
              <View style={styles.pdfColumn}>{pdfContent}</View>
            </ScrollView>
          ) : (
            <View style={styles.pdfNative}>{pdfContent}</View>
          )}
        </View>
      ) : showTwoColumn ? (
        <View
          style={styles.wideContent}
          onLayout={(e) => setRowWidth(e.nativeEvent.layout.width)}
        >
          {/* Left - Book/Page (page navigation pinned on top) */}

          <View
            style={[
              leftWidth == null ? styles.leftColumnFlex : { width: leftWidth },
            ]}
          >
            <PageNavigation
              currentPage={currentPageIndex}
              totalPages={pages.length}
              onPrevious={handlePrevious}
              onNext={handleNext}
            />

            <ScrollView
              ref={pageScrollRef}
              style={styles.columnScroll}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              <PageRenderer page={currentPage} />
            </ScrollView>
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

          {/* Right - MCQs */}

          <ScrollView
            ref={mcqScrollRef}
            style={styles.wideMcq}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <MCQPanel questions={currentPage.mcqs || []} />
          </ScrollView>
        </View>
      ) : (
        <View style={styles.stackedContent}>
          {/* Page navigation pinned on top of the content */}

          <PageNavigation
            currentPage={currentPageIndex}
            totalPages={pages.length}
            onPrevious={handlePrevious}
            onNext={handleNext}
          />

          <ScrollView
            ref={stackedScrollRef}
            style={styles.columnScroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <PageRenderer page={currentPage} />

            {hasMcqs ? (
              <>
                <View style={styles.stackedDivider} />

                <MCQPanel questions={currentPage.mcqs || []} />
              </>
            ) : null}
          </ScrollView>
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

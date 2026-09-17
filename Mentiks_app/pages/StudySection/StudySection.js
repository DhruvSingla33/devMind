import { useEffect, useRef, useState } from "react";
import {
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
import { colors, spacing, WIDE_BREAKPOINT } from "../../theme/theme";

const StudySection = ({ studyData }) => {
  const [currentPageIndex, setCurrentPageIndex] = useState(0);

  const { width } = useWindowDimensions();
  const isWide = width >= WIDE_BREAKPOINT;

  const stackedScrollRef = useRef(null);
  const pageScrollRef = useRef(null);
  const mcqScrollRef = useRef(null);

  const pages = studyData?.pages || [];
  const currentPage = pages[currentPageIndex];

  // Every page change starts the reader back at the top.
  useEffect(() => {
    const options = { y: 0, animated: false };

    stackedScrollRef.current?.scrollTo(options);
    pageScrollRef.current?.scrollTo(options);
    mcqScrollRef.current?.scrollTo(options);
  }, [currentPageIndex]);

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

  if (!currentPage) {
    return (
      <View style={[styles.container, styles.emptyContainer]}>
        <Text style={styles.emptyText}>No study content available.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}

      <ModuleHeader
        chapter={studyData.chapter}
        currentPage={currentPage.pageNumber}
        totalPages={pages.length}
      />

      {/* Main Study Area */}

      {isWide ? (
        <View style={styles.wideContent}>
          {/* Left - Book/Page */}

          <ScrollView
            ref={pageScrollRef}
            style={styles.widePage}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <PageRenderer page={currentPage} />
          </ScrollView>

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
        <ScrollView
          ref={stackedScrollRef}
          style={styles.stackedContent}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <PageRenderer page={currentPage} />

          <View style={styles.stackedDivider} />

          <MCQPanel questions={currentPage.mcqs || []} />
        </ScrollView>
      )}

      {/* Bottom Navigation */}

      <PageNavigation
        currentPage={currentPageIndex}
        totalPages={pages.length}
        onPrevious={handlePrevious}
        onNext={handleNext}
      />
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

  widePage: {
    flex: 2
  },

  wideMcq: {
    flex: 1,
    maxWidth: 460,
    borderLeftWidth: StyleSheet.hairlineWidth,
    borderLeftColor: colors.border
  },

  stackedContent: {
    flex: 1
  },

  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl
  },

  stackedDivider: {
    height: spacing.xl
  }
});

export default StudySection;

import React, { useEffect, useRef, useState } from 'react';
import { Dimensions, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { spacing } from '../theme/theme';
import colors from '../theme/colors';

// A self-advancing, swipeable pager with dot indicators. Auto-advance pauses
// while the viewer is actively dragging/hovering so it never fights a
// manual swipe, and resumes on its own after they let go.
export default function Carousel({ slides, autoAdvanceMs = 5000, height = 220 }) {
  const scrollRef = useRef(null);
  const [index, setIndex] = useState(0);
  const [width, setWidth] = useState(Dimensions.get('window').width);
  const isInteracting = useRef(false);

  // Browser resize / device rotation changes the measured width — snap back
  // to the current slide at the new width instead of leaving the scroll
  // position stale (which would show half of two slides at once).
  useEffect(() => {
    scrollRef.current?.scrollTo({ x: index * width, animated: false });
  }, [width]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!autoAdvanceMs || slides.length <= 1) return undefined;
    const timer = setInterval(() => {
      if (isInteracting.current) return;
      setIndex((prev) => {
        const next = (prev + 1) % slides.length;
        scrollRef.current?.scrollTo({ x: next * width, animated: true });
        return next;
      });
    }, autoAdvanceMs);
    return () => clearInterval(timer);
  }, [autoAdvanceMs, slides.length, width]);

  const handleScrollEnd = (event) => {
    isInteracting.current = false;
    const newIndex = Math.round(event.nativeEvent.contentOffset.x / width);
    setIndex(newIndex);
  };

  const goTo = (target) => {
    setIndex(target);
    scrollRef.current?.scrollTo({ x: target * width, animated: true });
  };

  return (
    <View
      style={[styles.wrapper, { height }]}
      onLayout={(event) => setWidth(event.nativeEvent.layout.width)}
    >
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScrollBeginDrag={() => {
          isInteracting.current = true;
        }}
        onMomentumScrollEnd={handleScrollEnd}
      >
        {slides.map((slide, slideIndex) => (
          <View key={slide.key ?? slideIndex} style={{ width, height }}>
            {slide.render()}
          </View>
        ))}
      </ScrollView>

      {slides.length > 1 ? (
        <View style={styles.dots}>
          {slides.map((slide, slideIndex) => (
            <Pressable
              key={slide.key ?? slideIndex}
              onPress={() => goTo(slideIndex)}
              hitSlop={8}
              style={[styles.dot, slideIndex === index && styles.dotActive]}
            />
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.border,
  },
  dotActive: {
    width: 20,
    backgroundColor: colors.primary,
  },
});

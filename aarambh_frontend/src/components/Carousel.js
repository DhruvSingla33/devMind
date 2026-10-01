import React, { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { spacing } from '../theme/theme';
import { useThemedStyles } from '../theme/ThemeContext';

// A self-advancing, swipeable pager with dot indicators. Auto-advance pauses
// while the viewer is actively dragging/hovering so it never fights a
// manual swipe, and resumes on its own after they let go.
//
// `height` is a fixed pixel height (used as the fallback for any slide that
// doesn't specify its own, or as the only height if `aspectRatio` isn't
// given). `aspectRatio` (width/height, e.g. 16/9) instead derives the height
// from the carousel's own measured width every render — needed for full-
// bleed photo slides, where a fixed height mismatched against the actual
// viewport width crops the image badly (severe on wide desktop windows).
//
// A slide object may override both with its own `height` (a fixed number,
// for content — text, icons, a CTA — that needs a set amount of room
// regardless of width) or `aspectRatio` (for a slide that should keep
// scaling with width like the default). Forcing every slide to share one
// box sized for the photo banners was what broke the icon+headline slides on
// narrow screens — their stacked content needed far more height than the
// photo aspect ratio gave them at mobile widths. The wrapper animates
// between each slide's own height as the active index changes.
function slideHeight(slide, width, fallbackAspectRatio, fallbackHeight, maxHeight) {
  if (slide?.height != null) return Math.min(slide.height, maxHeight);
  const ratio = slide?.aspectRatio ?? fallbackAspectRatio;
  if (ratio) return Math.min(width / ratio, maxHeight);
  return fallbackHeight;
}

export default function Carousel({
  slides,
  autoAdvanceMs = 5000,
  height = 220,
  aspectRatio,
  maxHeight = Infinity,
  onIndexChange,
}) {
  const styles = useThemedStyles(makeStyles);
  const scrollRef = useRef(null);
  const [index, setIndex] = useState(0);
  const [width, setWidth] = useState(Dimensions.get('window').width);
  const isInteracting = useRef(false);
  const activeHeight = slideHeight(slides[index], width, aspectRatio, height, maxHeight);
  const animatedHeight = useRef(new Animated.Value(activeHeight)).current;

  useEffect(() => {
    Animated.timing(animatedHeight, {
      toValue: activeHeight,
      duration: 260,
      useNativeDriver: false,
    }).start();
  }, [activeHeight, animatedHeight]);

  // Tell the parent which slide is actually on screen — a slide's own content
  // (e.g. a CountUp) otherwise has no way to know it just became visible vs.
  // having been sitting off-screen since mount.
  useEffect(() => {
    onIndexChange?.(index, slides[index]?.key);
  }, [index, slides, onIndexChange]);

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
    <View style={styles.wrapper} onLayout={(event) => setWidth(event.nativeEvent.layout.width)}>
      <Animated.View style={[styles.clip, { height: animatedHeight }]}>
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
          {slides.map((slide, slideIndex) => {
            const ownHeight = slideHeight(slide, width, aspectRatio, height, maxHeight);
            return (
              <View key={slide.key ?? slideIndex} style={{ width, height: ownHeight }}>
                {slide.render({ width, height: ownHeight })}
              </View>
            );
          })}
        </ScrollView>
      </Animated.View>

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

const makeStyles = ({ colors }) => StyleSheet.create({
  wrapper: {
    width: '100%',
  },
  clip: {
    width: '100%',
    overflow: 'hidden',
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

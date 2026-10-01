import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

// Day/night switch: blue sky with clouds and a sun by day; the knob slides
// across into a cratered moon over a starry night sky. setMode updates
// ThemeContext live, so the app repaints as the animation runs.
//
// The scene uses fixed sky colors (not the app palette) because it depicts
// day/night itself rather than following the theme.
const W = 70;
const H = 32;
const PAD = 3;
const KNOB = H - PAD * 2;
const TRAVEL = W - KNOB - PAD * 2;

const SKY_DAY = '#3080C2';
const SKY_NIGHT = '#1B1F3B';
const SUN = '#F0C02A';
const MOON = '#F4F4F6';

// Stepped halo behind the knob (inner → outer), as in the classic switch.
// Day and night frames use different band widths, so each ring scales between
// its two diameters.
const RINGS = [51, 69, 88];
const RINGS_NIGHT = [38, 54, 66];
const RING_DAY = ['#6A9FC8', '#5E93C4', '#4A87BD'];
const RING_NIGHT = ['rgba(190,190,215,0.30)', 'rgba(150,150,185,0.24)', 'rgba(110,110,150,0.20)'];

// Dots and four-point sparkles, all on the left (night) side of the track.
const STARS = [
  { left: 8, top: 5, size: 2 },
  { left: 19, top: 3, size: 9, sparkle: true },
  { left: 5, top: 15, size: 8, sparkle: true },
  { left: 16, top: 12, size: 7, sparkle: true },
  { left: 13, top: 24, size: 2 },
  { left: 27, top: 22, size: 8, sparkle: true },
  { left: 30, top: 9, size: 2 },
];

// Cloud bank along the bottom/right: a pale back layer peeking above a white
// front layer, like the classic switch. Each puff is a circle (center x, y, r).
const CLOUDS_BACK = [
  [28, 29, 4.5], [38, 28, 4], [48, 27, 4.5], [58, 24, 5], [66, 20, 5],
];
const CLOUDS_FRONT = [
  [24, 33, 4.5], [33, 32, 5], [43, 32, 4], [52, 31, 4.5], [61, 29, 6], [69, 27, 6.5],
];

const CRATERS = [
  { left: 14, top: 4, size: 6 },
  { left: 5, top: 12, size: 3 },
  { left: 8, top: 14, size: 8 },
];

export default function ThemeToggle({ style }) {
  const { isDark, setMode } = useTheme();
  const progress = useRef(new Animated.Value(isDark ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(progress, {
      toValue: isDark ? 1 : 0,
      duration: 450,
      easing: Easing.inOut(Easing.cubic),
      // Color interpolation isn't supported by the native driver.
      useNativeDriver: false,
    }).start();
  }, [isDark, progress]);

  const toggle = () => setMode(isDark ? 'light' : 'dark');

  const skyColor = progress.interpolate({ inputRange: [0, 1], outputRange: [SKY_DAY, SKY_NIGHT] });
  const knobColor = progress.interpolate({ inputRange: [0, 1], outputRange: [SUN, MOON] });
  const knobEdge = progress.interpolate({ inputRange: [0, 1], outputRange: ['#C99A1C', 'rgba(90,90,140,0.35)'] });
  const knobX = progress.interpolate({ inputRange: [0, 1], outputRange: [0, TRAVEL] });
  const knobSpin = progress.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  const cloudY = progress.interpolate({ inputRange: [0, 1], outputRange: [0, H] });
  const dayOpacity = progress.interpolate({ inputRange: [0, 0.5], outputRange: [1, 0], extrapolate: 'clamp' });
  const nightOpacity = progress.interpolate({ inputRange: [0.5, 1], outputRange: [0, 1], extrapolate: 'clamp' });
  const starY = progress.interpolate({ inputRange: [0, 1], outputRange: [-H, 0] });

  return (
    <Pressable
      onPress={toggle}
      hitSlop={8}
      accessibilityRole="switch"
      accessibilityState={{ checked: isDark }}
      accessibilityLabel="Dark mode"
      style={style}
    >
      <Animated.View style={[styles.track, { backgroundColor: skyColor }]}>
        {/* Halo rings travel with the knob; the track clips them */}
        <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, { transform: [{ translateX: knobX }] }]}>
          {RINGS.slice().reverse().map((d, j) => {
            const i = RINGS.length - 1 - j;
            return (
              <Animated.View
                key={d}
                style={[
                  styles.ring,
                  {
                    width: d,
                    height: d,
                    borderRadius: d / 2,
                    left: PAD + KNOB / 2 - d / 2,
                    top: H / 2 - d / 2,
                    backgroundColor: progress.interpolate({ inputRange: [0, 1], outputRange: [RING_DAY[i], RING_NIGHT[i]] }),
                    transform: [{ scale: progress.interpolate({ inputRange: [0, 1], outputRange: [1, RINGS_NIGHT[i] / d] }) }],
                  },
                ]}
              />
            );
          })}
        </Animated.View>

        {/* Stars drop in from above at night */}
        <Animated.View
          pointerEvents="none"
          style={[StyleSheet.absoluteFill, { opacity: nightOpacity, transform: [{ translateY: starY }] }]}
        >
          {STARS.map((s, i) =>
            s.sparkle ? (
              <Text
                key={i}
                style={[styles.sparkle, { left: s.left, top: s.top - s.size / 3, fontSize: s.size, lineHeight: s.size * 1.2 }]}
              >
                ✦
              </Text>
            ) : (
              <View
                key={i}
                style={[styles.star, { left: s.left, top: s.top, width: s.size, height: s.size, borderRadius: s.size / 2 }]}
              />
            )
          )}
        </Animated.View>


        {/* Clouds sink away when night falls */}
        <Animated.View
          pointerEvents="none"
          style={[StyleSheet.absoluteFill, { opacity: dayOpacity, transform: [{ translateY: cloudY }] }]}
        >
          {CLOUDS_BACK.map(([x, y, r], i) => (
            <View key={`b${i}`} style={[styles.cloud, styles.cloudBack, puff(x, y, r)]} />
          ))}
          {CLOUDS_FRONT.map(([x, y, r], i) => (
            <View key={`f${i}`} style={[styles.cloud, puff(x, y, r)]} />
          ))}
        </Animated.View>

        <Animated.View
          style={[
            styles.knob,
            { backgroundColor: knobColor, borderBottomColor: knobEdge, transform: [{ translateX: knobX }, { rotate: knobSpin }] },
          ]}
        >
          {/* Moon craters */}
          <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, { opacity: nightOpacity }]}>
            {CRATERS.map((c, i) => (
              <View
                key={i}
                style={[styles.crater, { left: c.left, top: c.top, width: c.size, height: c.size, borderRadius: c.size / 2 }]}
              />
            ))}
          </Animated.View>
        </Animated.View>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  track: {
    width: W,
    height: H,
    borderRadius: H / 2,
    padding: PAD,
    overflow: 'hidden',
    justifyContent: 'center',
    ...Platform.select({ web: { cursor: 'pointer' }, default: {} }),
  },
  knob: {
    width: KNOB,
    height: KNOB,
    borderRadius: KNOB / 2,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 1.5,
    shadowOffset: { width: 0, height: 1 },
    elevation: 3,
    borderBottomWidth: 1.5,
  },
  ring: {
    position: 'absolute',
  },
  crater: {
    position: 'absolute',
    backgroundColor: '#E1E1E6',
    borderWidth: 1,
    borderColor: '#D2D2DA',
  },
  sparkle: {
    position: 'absolute',
    color: '#FFFFFF',
  },
  star: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
  },
  cloud: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
  },
  cloudBack: {
    backgroundColor: '#DCE8F2',
  },
});

const puff = (x, y, r) => ({ left: x - r, top: y - r, width: r * 2, height: r * 2, borderRadius: r });

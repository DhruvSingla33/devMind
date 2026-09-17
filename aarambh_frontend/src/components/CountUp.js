import React, { useEffect, useRef, useState } from 'react';
import { Animated, Text } from 'react-native';

// Animates a real number from 0 up to `value` — purely a presentation
// technique for an honest number, not a way to imply activity that isn't
// happening (see stats.api.js / the backend's /stats/public — every value
// passed in here is a real aggregate count).
export default function CountUp({ value = 0, duration = 1200, style, formatter }) {
  const animated = useRef(new Animated.Value(0)).current;
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const listener = animated.addListener(({ value: v }) => setDisplay(Math.round(v)));
    Animated.timing(animated, {
      toValue: value || 0,
      duration,
      useNativeDriver: false,
    }).start();
    return () => animated.removeListener(listener);
  }, [value, duration, animated]);

  return <Text style={style}>{formatter ? formatter(display) : display}</Text>;
}

import React from 'react';
import { View } from 'react-native';

// A rounded horizontal bar. `value` 0..100, `color` fills the track. Pure-View
// so it needs no SVG — used for Subject Performance and Subject-wise Progress.
export default function ProgressBar({ value = 0, color = '#4F86F7', track = 'rgba(140,140,150,0.18)', height = 8 }) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <View style={{ height, borderRadius: height, backgroundColor: track, overflow: 'hidden' }}>
      <View style={{ width: `${pct}%`, height: '100%', borderRadius: height, backgroundColor: color }} />
    </View>
  );
}

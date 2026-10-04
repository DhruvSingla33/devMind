import React from 'react';
import { View } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';

// A ring / donut chart. Pass a single `value`+`max` for a gauge (the overall
// accuracy ring), or `segments` [{ value, color }] for a multi-part donut (the
// question-intelligence breakdown). `children` render centered inside the hole.
export default function Donut({
  size = 160,
  strokeWidth = 14,
  value,
  max = 100,
  color = '#E63946',
  trackColor = 'rgba(0,0,0,0.08)',
  segments,
  rounded = true,
  children,
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const cap = rounded ? 'round' : 'butt';

  let parts = segments;
  if (!parts) {
    const frac = Math.max(0, Math.min(1, max > 0 ? value / max : 0));
    parts = [{ value: frac, color, absolute: true }];
  } else {
    const total = segments.reduce((s, p) => s + (p.value || 0), 0) || 1;
    parts = segments.map((p) => ({ ...p, value: p.value / total }));
  }

  let offsetAcc = 0;

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={{ position: 'absolute' }}>
        {/* rotate -90deg so arcs start at 12 o'clock */}
        <G rotation={-90} origin={`${size / 2}, ${size / 2}`}>
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={trackColor}
            strokeWidth={strokeWidth}
            fill="none"
          />
          {parts.map((p, i) => {
            const len = p.value * circumference;
            const gap = segments ? circumference * 0.012 : 0; // tiny gap between segments
            const dash = Math.max(0, len - gap);
            const dashoffset = -offsetAcc * circumference;
            offsetAcc += p.value;
            if (dash <= 0) return null;
            return (
              <Circle
                key={i}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke={p.color}
                strokeWidth={strokeWidth}
                strokeLinecap={cap}
                strokeDasharray={`${dash} ${circumference - dash}`}
                strokeDashoffset={dashoffset}
                fill="none"
              />
            );
          })}
        </G>
      </Svg>
      <View style={{ alignItems: 'center', justifyContent: 'center' }}>{children}</View>
    </View>
  );
}

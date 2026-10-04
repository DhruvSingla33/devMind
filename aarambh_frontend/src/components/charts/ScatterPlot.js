import React from 'react';
import { View } from 'react-native';
import Svg, { Circle, Line, Text as SvgText } from 'react-native-svg';

// 2D weakness matrix: each point is a topic plotted by accuracy (Y, High→Low)
// against time-per-question (X, Fast→Slow). Point color encodes mastery band.
// `points` = [{ x: avgTimeSeconds, y: accuracy, color }].
export default function ScatterPlot({
  points = [],
  width = 320,
  height = 200,
  maxTime = 120,
  axisColor = 'rgba(140,140,150,0.4)',
  gridColor = 'rgba(140,140,150,0.15)',
  textColor = '#8E8E98',
}) {
  const padL = 30;
  const padR = 14;
  const padT = 12;
  const padB = 26;
  const w = width - padL - padR;
  const h = height - padT - padB;

  const maxX = Math.max(maxTime, ...points.map((p) => p.x || 0), 1);
  const px = (t) => padL + (Math.min(maxX, t) / maxX) * w;
  const py = (a) => padT + h - (Math.max(0, Math.min(100, a)) / 100) * h;

  return (
    <View style={{ width, height }}>
      <Svg width={width} height={height}>
        {[0, 50, 100].map((g) => (
          <Line key={`h${g}`} x1={padL} y1={py(g)} x2={padL + w} y2={py(g)} stroke={gridColor} strokeWidth={1} />
        ))}
        {/* axes */}
        <Line x1={padL} y1={padT} x2={padL} y2={padT + h} stroke={axisColor} strokeWidth={1} />
        <Line x1={padL} y1={padT + h} x2={padL + w} y2={padT + h} stroke={axisColor} strokeWidth={1} />

        <SvgText x={padL - 6} y={py(96)} fontSize="9" fill={textColor} textAnchor="end">High</SvgText>
        <SvgText x={padL - 6} y={py(6)} fontSize="9" fill={textColor} textAnchor="end">Low</SvgText>
        <SvgText x={padL + 2} y={height - 6} fontSize="9" fill={textColor} textAnchor="start">Fast</SvgText>
        <SvgText x={padL + w} y={height - 6} fontSize="9" fill={textColor} textAnchor="end">Slow</SvgText>

        {points.map((p, i) => (
          <Circle key={i} cx={px(p.x)} cy={py(p.y)} r={6} fill={p.color} opacity={0.9} />
        ))}
      </Svg>
    </View>
  );
}

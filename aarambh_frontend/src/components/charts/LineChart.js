import React from 'react';
import { View } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Line, Path, Stop, Text as SvgText } from 'react-native-svg';

// A compact line/area chart. `data` is an array of numbers (0..maxY). Optional
// `target` draws a dashed reference line. Renders Y gridlines + labels and a
// gradient fill under the curve — matches the design's Performance Trend and
// Score Improvement charts.
export default function LineChart({
  data = [],
  width = 320,
  height = 180,
  color = '#4F86F7',
  targetColor = 'rgba(140,140,150,0.6)',
  target,
  maxY = 100,
  yTicks = [0, 25, 50, 75, 100],
  xLabels = [],
  showArea = true,
  showPeak = false,
  textColor = '#8E8E98',
  gridColor = 'rgba(140,140,150,0.18)',
}) {
  const padL = 34;
  const padR = 10;
  const padT = 12;
  const padB = xLabels.length ? 22 : 10;
  const w = width - padL - padR;
  const h = height - padT - padB;

  const n = data.length;
  const x = (i) => padL + (n <= 1 ? w / 2 : (i / (n - 1)) * w);
  const y = (v) => padT + h - (Math.max(0, Math.min(maxY, v)) / maxY) * h;

  const points = data.map((v, i) => [x(i), y(v)]);
  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p[0]} ${p[1]}`).join(' ');
  const areaPath =
    points.length > 0
      ? `${linePath} L ${points[points.length - 1][0]} ${padT + h} L ${points[0][0]} ${padT + h} Z`
      : '';

  const peakIdx = showPeak && n ? data.reduce((best, v, i) => (v > data[best] ? i : best), 0) : -1;

  return (
    <View style={{ width, height }}>
      <Svg width={width} height={height}>
        <Defs>
          <LinearGradient id="lineArea" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={color} stopOpacity="0.28" />
            <Stop offset="1" stopColor={color} stopOpacity="0" />
          </LinearGradient>
        </Defs>

        {yTicks.map((t) => (
          <React.Fragment key={t}>
            <Line x1={padL} y1={y(t)} x2={width - padR} y2={y(t)} stroke={gridColor} strokeWidth={1} />
            <SvgText x={padL - 6} y={y(t) + 3} fontSize="9" fill={textColor} textAnchor="end">
              {t}%
            </SvgText>
          </React.Fragment>
        ))}

        {typeof target === 'number' && (
          <Line
            x1={padL}
            y1={y(target)}
            x2={width - padR}
            y2={y(target)}
            stroke={targetColor}
            strokeWidth={1.5}
            strokeDasharray="5 4"
          />
        )}

        {showArea && areaPath ? <Path d={areaPath} fill="url(#lineArea)" /> : null}
        {linePath ? <Path d={linePath} fill="none" stroke={color} strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" /> : null}

        {points.map((p, i) => (
          <Circle key={i} cx={p[0]} cy={p[1]} r={i === peakIdx ? 4 : 2.5} fill={color} />
        ))}

        {peakIdx >= 0 && (
          <SvgText x={points[peakIdx][0]} y={points[peakIdx][1] - 8} fontSize="10" fontWeight="700" fill={color} textAnchor="middle">
            {data[peakIdx]}%
          </SvgText>
        )}

        {xLabels.map((lbl, i) => (
          <SvgText key={i} x={x(i)} y={height - 6} fontSize="9" fill={textColor} textAnchor="middle">
            {lbl}
          </SvgText>
        ))}
      </Svg>
    </View>
  );
}

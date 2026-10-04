// Data-viz palette for the analytics dashboard. These are deliberately distinct
// from the brand red (which stays the accent) so charts read as a system, and
// they're legible on both the light and dark canvases.
export const CHART = {
  blue: '#4F86F7',
  green: '#2FBF71',
  purple: '#9B6BF0',
  amber: '#E0A23C',
  orange: '#F08A24',
  teal: '#22B8A6',
  red: '#E63946',
  pink: '#FF6B74',
};

export const SUBJECT_COLOR = {
  Physics: CHART.blue,
  Chemistry: CHART.green,
  Biology: CHART.purple,
  Maths: CHART.teal,
  General: CHART.amber,
};

export const subjectColor = (s) => SUBJECT_COLOR[s] || CHART.blue;

// Mastery band -> color + soft background tint.
export const MASTERY = {
  Strong: { color: CHART.green, label: 'Strong' },
  Improving: { color: CHART.amber, label: 'Improving' },
  'Needs Work': { color: CHART.orange, label: 'Needs Work' },
  Weak: { color: CHART.pink, label: 'Weak' },
  Critical: { color: CHART.red, label: 'Critical' },
};

export const masteryColor = (m) => (MASTERY[m] || MASTERY.Improving).color;

export const DIFFICULTY = {
  easy: { color: CHART.green, label: 'Easy' },
  medium: { color: CHART.amber, label: 'Medium' },
  hard: { color: CHART.red, label: 'Hard' },
};

export const difficultyMeta = (d) => DIFFICULTY[d] || DIFFICULTY.medium;

// Accuracy -> text color (green good, amber mid, red low) for inline figures.
export const accuracyColor = (a) => {
  if (a >= 80) return CHART.green;
  if (a >= 60) return CHART.amber;
  return CHART.red;
};

export const formatSeconds = (s) => {
  const v = Math.round(s || 0);
  if (v < 60) return `${v}s`;
  const m = Math.floor(v / 60);
  const rem = v % 60;
  return rem ? `${m}m ${rem}s` : `${m}m`;
};

export const greeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good Morning';
  if (h < 17) return 'Good Afternoon';
  return 'Good Evening';
};

export const firstName = (name) => (name ? String(name).trim().split(/\s+/)[0] : 'there');

export const initials = (name) => {
  if (!name) return 'ME';
  const parts = String(name).trim().split(/\s+/);
  return ((parts[0]?.[0] || '') + (parts[1]?.[0] || '')).toUpperCase() || 'ME';
};

import apiClient from './client';

// The Prep Lab analytics — the full dashboard payload (overview tiles, topic
// matrix, weakness map, question intelligence, mistake analysis, trends and
// recommendations). Computed server-side from the student's completed attempts.
export const getPrepLabAnalytics = () =>
  apiClient.get('/analytics/prep-lab').then((res) => res.data.data);

import apiClient from './client';

export const getTodayPulse = () =>
  apiClient.get('/aarambh-pulse/today').then((res) => res.data.data);

// --- Admin ---

export const adminCreatePulse = (payload) =>
  apiClient.post('/aarambh-pulse/admin', payload).then((res) => res.data.data);

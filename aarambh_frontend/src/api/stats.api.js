import apiClient from './client';

export const getPublicStats = () => apiClient.get('/stats/public').then((res) => res.data.data);

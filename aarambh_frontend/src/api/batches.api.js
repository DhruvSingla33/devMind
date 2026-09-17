import apiClient from './client';

export const listBatches = (params = {}) =>
  apiClient.get('/batches', { params }).then((res) => res.data.data);

export const getBatch = (id) => apiClient.get(`/batches/${id}`).then((res) => res.data.data);

export const enrollBatch = (id) =>
  apiClient.post(`/batches/${id}/enroll`).then((res) => res.data.data);

// --- Admin ---

export const adminCreateBatch = (payload) =>
  apiClient.post('/batches/admin', payload).then((res) => res.data.data);

export const adminUpdateBatch = (id, payload) =>
  apiClient.put(`/batches/admin/${id}`, payload).then((res) => res.data.data);

export const adminDeleteBatch = (id) =>
  apiClient.delete(`/batches/admin/${id}`).then((res) => res.data.data);

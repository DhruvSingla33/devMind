import apiClient from './client';

export const listQuestions = (params = {}) =>
  apiClient.get('/questions', { params }).then((res) => res.data.data);

export const submitAnswer = ({ questionId, selectedOption }) =>
  apiClient
    .post('/questions/submit-answer', { questionId, selectedOption })
    .then((res) => res.data.data);

// --- Admin ---

export const adminCreateQuestion = (payload) =>
  apiClient.post('/questions/admin', payload).then((res) => res.data.data);

export const adminBulkCreateQuestions = (questions) =>
  apiClient.post('/questions/admin/bulk', { questions }).then((res) => res.data.data);

export const adminUpdateQuestion = (id, payload) =>
  apiClient.put(`/questions/admin/${id}`, payload).then((res) => res.data.data);

export const adminDeleteQuestion = (id) =>
  apiClient.delete(`/questions/admin/${id}`).then((res) => res.data.data);

import apiClient from './client';

export const submitDoubt = ({ subject, chapter, questionText }) =>
  apiClient.post('/doubts', { subject, chapter, questionText }).then((res) => res.data.data);

export const getMyDoubts = () => apiClient.get('/doubts/my-doubts').then((res) => res.data.data);

export const getDoubt = (id) => apiClient.get(`/doubts/${id}`).then((res) => res.data.data);

// --- Admin ---

export const adminListDoubts = (params = {}) =>
  apiClient.get('/doubts/admin/all', { params }).then((res) => res.data.data);

export const adminAnswerDoubt = (id, { answerText, solutionImageUrl }) =>
  apiClient
    .post(`/doubts/admin/${id}/answer`, { answerText, solutionImageUrl })
    .then((res) => res.data.data);

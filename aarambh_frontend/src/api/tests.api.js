import apiClient from './client';

export const listTests = (params = {}) =>
  apiClient.get('/tests', { params }).then((res) => res.data.data);

// Either `questionIds` (hand-picked quiz bank) or a random sample of
// `questionCount` questions matching `filters` (same keys as listQuestions).
export const createMixQuiz = ({
  chapterIds = [],
  questionIds,
  questionCount = 30,
  title,
  exam = 'NEET',
  filters,
}) =>
  apiClient
    .post('/tests/create-mix-quiz', { chapterIds, questionIds, questionCount, title, exam, filters })
    .then((res) => res.data.data);

export const startTest = (testId) =>
  apiClient.post(`/tests/${testId}/start`).then((res) => res.data.data);

export const submitTest = (attemptId, answers) =>
  apiClient.post(`/tests/${attemptId}/submit`, { answers }).then((res) => res.data.data);

export const getMyAttempts = () =>
  apiClient.get('/tests/my-attempts').then((res) => res.data.data);

// --- Admin ---

export const adminCreateTest = (payload) =>
  apiClient.post('/tests/admin', payload).then((res) => res.data.data);

export const adminUpdateTest = (id, payload) =>
  apiClient.put(`/tests/admin/${id}`, payload).then((res) => res.data.data);

export const adminDeleteTest = (id) =>
  apiClient.delete(`/tests/admin/${id}`).then((res) => res.data.data);

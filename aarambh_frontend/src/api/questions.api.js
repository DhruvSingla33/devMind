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

// Textbook-level CSV quiz upload. `file` is a browser File (from pickFile). The
// backend parses it (see question.service.importQuestionsFromCsv) and returns
// { imported, totalRows, failed, errors, pagesCreated, pagesOutsideChapter }.
// Content-Type is cleared to undefined so the browser sets the multipart
// boundary itself (same reason as upload.api.js uploadLocalFile).
export const adminImportQuestionsCsv = (file, textbookId) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('textbookId', textbookId);
  return apiClient
    .post('/questions/admin/import-csv', formData, {
      headers: { 'Content-Type': undefined },
    })
    .then((res) => res.data.data);
};

export const adminUpdateQuestion = (id, payload) =>
  apiClient.put(`/questions/admin/${id}`, payload).then((res) => res.data.data);

export const adminDeleteQuestion = (id) =>
  apiClient.delete(`/questions/admin/${id}`).then((res) => res.data.data);

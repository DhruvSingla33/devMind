import apiClient from './client';

export const listTextbooks = (params = {}) =>
  apiClient.get('/textbooks', { params }).then((res) => res.data.data);

export const getTextbook = (code) =>
  apiClient.get(`/textbooks/${code}`).then((res) => res.data.data);

export const getChapter = (code, chapterNumber) =>
  apiClient.get(`/textbooks/${code}/chapters/${chapterNumber}`).then((res) => res.data.data);

// Returns { fileKey, publicUrl } for a PDF containing just this chapter's
// pages — sliced server-side from the textbook's single master PDF (see
// pdf.service.js on the backend), not a separate per-chapter upload.
export const getChapterPdf = (code, chapterNumber) =>
  apiClient.get(`/textbooks/${code}/chapters/${chapterNumber}/pdf`).then((res) => res.data.data);

// --- Admin ---

export const adminCreateTextbook = (payload) =>
  apiClient.post('/textbooks/admin', payload).then((res) => res.data.data);

export const adminUpdateTextbook = (id, payload) =>
  apiClient.put(`/textbooks/admin/${id}`, payload).then((res) => res.data.data);

export const adminDeleteTextbook = (id) =>
  apiClient.delete(`/textbooks/admin/${id}`).then((res) => res.data.data);

export const adminCreateChapter = (textbookId, payload) =>
  apiClient.post(`/textbooks/admin/${textbookId}/chapters`, payload).then((res) => res.data.data);

export const adminUpdateChapter = (chapterId, payload) =>
  apiClient.put(`/textbooks/admin/chapters/${chapterId}`, payload).then((res) => res.data.data);

export const adminDeleteChapter = (chapterId) =>
  apiClient.delete(`/textbooks/admin/chapters/${chapterId}`).then((res) => res.data.data);

// --- Admin: content pages (sections + quiz) ---
// Pages belong to the BOOK now. A chapter is just a page-range, so listing a
// chapter's pages returns the book pages whose number falls in that range.

export const adminListChapterPages = (chapterId) =>
  apiClient.get(`/textbooks/admin/chapters/${chapterId}/pages`).then((res) => res.data.data);

export const adminCreatePage = (textbookId, payload) =>
  apiClient
    .post(`/textbooks/admin/textbooks/${textbookId}/pages`, payload)
    .then((res) => res.data.data);

export const adminUpdatePage = (pageId, payload) =>
  apiClient.put(`/textbooks/admin/pages/${pageId}`, payload).then((res) => res.data.data);

export const adminDeletePage = (pageId) =>
  apiClient.delete(`/textbooks/admin/pages/${pageId}`).then((res) => res.data.data);

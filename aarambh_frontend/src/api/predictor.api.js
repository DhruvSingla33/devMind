import apiClient from './client';

export const predictRank = ({ marks, year }) =>
  apiClient.post('/tools/predict-rank', { marks, year }).then((res) => res.data.data);

export const predictColleges = ({ marks, category, state, year }) =>
  apiClient
    .post('/tools/predict-colleges', { marks, category, state, year })
    .then((res) => res.data.data);

// --- Admin ---

export const adminBulkImportCutoffs = (cutoffs) =>
  apiClient.post('/tools/admin/college-cutoffs/bulk', { cutoffs }).then((res) => res.data.data);

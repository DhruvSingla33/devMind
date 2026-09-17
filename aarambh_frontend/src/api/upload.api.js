import apiClient from './client';

// S3 flow — kept for later, not currently used by the app (see uploadLocalFile below).
export const getPresignedUrl = ({ fileType, folder = 'general' }) =>
  apiClient.post('/upload/presigned-url', { fileType, folder }).then((res) => res.data.data);

// Local-disk upload flow — what the app actually uses right now.
// IMPORTANT: apiClient defaults to 'Content-Type: application/json' (see
// client.js) — that default must be explicitly cleared here (not just left
// unset), otherwise it rides along with the FormData body and the server
// can never find the multipart boundary. Setting it to `undefined` removes
// it from the merged headers so the browser generates the correct
// 'multipart/form-data; boundary=...' header itself.
export const uploadLocalFile = (file, folder = 'general') => {
  const formData = new FormData();
  formData.append('file', file);
  return apiClient
    .post(`/upload/local/${folder}`, formData, {
      headers: { 'Content-Type': undefined },
    })
    .then((res) => res.data.data);
};

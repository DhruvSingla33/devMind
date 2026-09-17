import apiClient from './client';

export const toggleBookmark = ({ questionId, notes }) =>
  apiClient.post('/bookmarks', { questionId, notes }).then((res) => res.data.data);

export const getMyBookmarks = () =>
  apiClient.get('/bookmarks/my-bookmarks').then((res) => res.data.data);

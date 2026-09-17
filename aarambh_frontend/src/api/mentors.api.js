import apiClient from './client';

export const listMentors = () => apiClient.get('/mentors').then((res) => res.data.data);

export const getMentorSlots = (mentorId) =>
  apiClient.get(`/mentors/${mentorId}/slots`).then((res) => res.data.data);

export const bookMentorSession = ({ mentorId, slotId, paymentType = 'paid' }) =>
  apiClient.post('/mentors/book', { mentorId, slotId, paymentType }).then((res) => res.data.data);

export const getMyStreak = () => apiClient.get('/mentors/my-streak').then((res) => res.data.data);

export const logPractice = (count = 1) =>
  apiClient.post('/mentors/log-practice', { count }).then((res) => res.data.data);

// --- Admin ---

export const adminCreateMentor = (payload) =>
  apiClient.post('/mentors/admin', payload).then((res) => res.data.data);

export const adminAddMentorSlots = (mentorId, slots) =>
  apiClient.post(`/mentors/admin/${mentorId}/slots`, { slots }).then((res) => res.data.data);

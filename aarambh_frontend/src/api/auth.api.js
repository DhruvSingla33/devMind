import apiClient from './client';

// Matches Aarambh-Backend src/validations/auth.validation.js field names exactly.
export const signup = (payload) =>
  apiClient.post('/auth/signup', payload).then((res) => res.data.data);

export const login = (payload) =>
  apiClient.post('/auth/login', payload).then((res) => res.data.data);

export const sendOtp = ({ target, purpose = 'login' }) =>
  apiClient.post('/auth/send-otp', { target, purpose }).then((res) => res.data.data);

export const verifyOtp = ({ target, otpCode, purpose = 'login', name }) =>
  apiClient.post('/auth/verify-otp', { target, otpCode, purpose, name }).then((res) => res.data.data);

export const resetPassword = ({ target, otpCode, newPassword }) =>
  apiClient
    .post('/auth/reset-password', { target, otpCode, newPassword })
    .then((res) => res.data.data);

export const changePassword = ({ oldPassword, newPassword }) =>
  apiClient
    .post('/auth/change-password', { oldPassword, newPassword })
    .then((res) => res.data.data);

export const googleAuth = (idToken) =>
  apiClient.post('/auth/google', { idToken }).then((res) => res.data.data);

export const getMe = () => apiClient.get('/auth/me').then((res) => res.data.data.user);

// Partial profile update — send only the changed fields.
export const updateProfile = (payload) =>
  apiClient.patch('/auth/me', payload).then((res) => res.data.data.user);

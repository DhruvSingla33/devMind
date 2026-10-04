import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import * as Crypto from 'expo-crypto';
import { GOOGLE_CLIENT_ID } from '../api/config';
import * as authApi from '../api/auth.api';
import { saveTokens, clearTokens, getAccessToken } from '../utils/tokenStorage';
import { setSessionExpiredHandler } from '../api/client';

WebBrowser.maybeCompleteAuthSession();

const AuthContext = createContext(null);

const GOOGLE_DISCOVERY = { authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth' };

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [authError, setAuthError] = useState(null);

  // A fresh nonce per app session ties the returned Google id_token to this
  // auth request, guarding against replay. Generated synchronously so it's
  // available before useAuthRequest builds its config (no render race).
  const [googleNonce] = useState(() => Crypto.randomUUID());
  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: GOOGLE_CLIENT_ID,
      scopes: ['openid', 'profile', 'email'],
      redirectUri: AuthSession.makeRedirectUri(),
      responseType: 'id_token',
      extraParams: { nonce: googleNonce },
    },
    GOOGLE_DISCOVERY
  );

  // Restore session on cold start.
  useEffect(() => {
    (async () => {
      try {
        const token = await getAccessToken();
        if (token) {
          const me = await authApi.getMe();
          setUser(me);
        }
      } catch (error) {
        await clearTokens();
      } finally {
        setIsBootstrapping(false);
      }
    })();
  }, []);

  // Log the user out automatically if the refresh token is ever rejected.
  useEffect(() => {
    setSessionExpiredHandler(() => setUser(null));
  }, []);

  useEffect(() => {
    if (response?.type === 'success' && response.params?.id_token) {
      (async () => {
        try {
          const result = await authApi.googleAuth(response.params.id_token);
          await saveTokens(result);
          setUser(result.user);
        } catch (error) {
          setAuthError(error);
        }
      })();
    }
  }, [response]);

  const requestGoogleSignIn = useCallback(() => {
    if (!GOOGLE_CLIENT_ID) {
      return Promise.reject(
        new Error('Google Sign-In is not configured yet. Set EXPO_PUBLIC_GOOGLE_CLIENT_ID in .env.')
      );
    }
    return promptAsync();
  }, [promptAsync]);

  const loginWithPassword = useCallback(async (email, password) => {
    const result = await authApi.login({ email, password });
    await saveTokens(result);
    setUser(result.user);
    return result.user;
  }, []);

  const signup = useCallback(async (name, email, phone, classLevel, password) => {
    const result = await authApi.signup({ name, email, phone, classLevel, password });
    await saveTokens(result);
    setUser(result.user);
    return result.user;
  }, []);

  const requestOtp = useCallback((target, purpose = 'login') => authApi.sendOtp({ target, purpose }), []);

  const confirmOtp = useCallback(async (target, otpCode, purpose = 'login', name) => {
    const result = await authApi.verifyOtp({ target, otpCode, purpose, name });
    await saveTokens(result);
    setUser(result.user);
    return result.user;
  }, []);

  // Unlike confirmOtp, this never logs the user in — it only verifies the
  // reset_password OTP and sets a new password. The caller sends the user
  // back to Login to sign in with their new credentials.
  const resetPassword = useCallback(
    (target, otpCode, newPassword) => authApi.resetPassword({ target, otpCode, newPassword }),
    []
  );

  // The "Reset password" feature the app actually surfaces: a signed-in user
  // enters their current password + a new one. Unlike resetPassword above
  // (OTP-based, unauthenticated, currently unwired) this requires a session.
  const changePassword = useCallback(
    (oldPassword, newPassword) => authApi.changePassword({ oldPassword, newPassword }),
    []
  );

  const updateProfile = useCallback(async (payload) => {
    const updated = await authApi.updateProfile(payload);
    setUser(updated);
    return updated;
  }, []);

  const logout = useCallback(async () => {
    await clearTokens();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: !!user,
      isBootstrapping,
      loginWithPassword,
      signup,
      requestOtp,
      confirmOtp,
      resetPassword,
      changePassword,
      updateProfile,
      requestGoogleSignIn,
      isGoogleReady: !!request,
      logout,
      authError,
    }),
    [
      user,
      isBootstrapping,
      loginWithPassword,
      signup,
      requestOtp,
      confirmOtp,
      resetPassword,
      changePassword,
      updateProfile,
      requestGoogleSignIn,
      request,
      logout,
      authError,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}

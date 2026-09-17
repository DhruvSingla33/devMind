import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ACCESS_TOKEN_KEY = 'aarambh_access_token';
const REFRESH_TOKEN_KEY = 'aarambh_refresh_token';

// expo-secure-store wraps Keychain/Keystore, which don't exist on web — its
// web shim doesn't implement these methods at all (throws instead of
// no-op-ing), so fall back to AsyncStorage (backed by localStorage) there.
const isWeb = Platform.OS === 'web';

const setItem = (key, value) => (isWeb ? AsyncStorage.setItem(key, value) : SecureStore.setItemAsync(key, value));
const getItem = (key) => (isWeb ? AsyncStorage.getItem(key) : SecureStore.getItemAsync(key));
const deleteItem = (key) => (isWeb ? AsyncStorage.removeItem(key) : SecureStore.deleteItemAsync(key));

export async function saveTokens({ accessToken, refreshToken }) {
  await setItem(ACCESS_TOKEN_KEY, accessToken);
  await setItem(REFRESH_TOKEN_KEY, refreshToken);
}

export async function getAccessToken() {
  return getItem(ACCESS_TOKEN_KEY);
}

export async function getRefreshToken() {
  return getItem(REFRESH_TOKEN_KEY);
}

export async function clearTokens() {
  await deleteItem(ACCESS_TOKEN_KEY);
  await deleteItem(REFRESH_TOKEN_KEY);
}

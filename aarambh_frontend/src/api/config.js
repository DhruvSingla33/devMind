import Constants from 'expo-constants';

// Aarambh-Backend mounts every client route under /api/v1 (see src/app.js
// and src/routes/index.js in Aarambh-Backend), so every request built from
// this base already lands on the client section (auth, textbooks, tests...).
const FALLBACK_PORT = 5000;

function resolveDevBaseUrl() {
  // On a physical device / Expo Go, "localhost" refers to the device itself,
  // not the machine running the backend — derive the LAN IP Expo used to
  // serve the bundle instead.
  const hostUri =
    Constants.expoConfig?.hostUri || Constants.expoGoConfig?.debuggerHost;
  const host = hostUri ? hostUri.split(':')[0] : 'localhost';
  return `http://${host}:${FALLBACK_PORT}/api/v1`;
}

export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL?.trim() || resolveDevBaseUrl();

export const GOOGLE_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID || '';

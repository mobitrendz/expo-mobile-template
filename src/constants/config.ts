import Constants from 'expo-constants';

/**
 * Backend server root URL (host + port only — do NOT include `/api/v1`).
 *
 * The OpenAPI-generated client already prefixes every route with `/api/v1`
 * (e.g. login → `/api/v1/login/access-token`).
 *
 * - Physical device (Expo Go): your Mac's LAN IP, e.g. http://10.119.230.201:8000
 * - iOS Simulator: http://localhost:8000
 * - Android Emulator: http://10.0.2.2:8000
 *
 * Set `expo.extra.apiUrl` in app.json or EXPO_PUBLIC_API_URL.
 */
export const API_BASE_URL =
  (Constants.expoConfig?.extra?.apiUrl as string | undefined) ??
  process.env.EXPO_PUBLIC_API_URL ??
  'http://macbook.local:8000';

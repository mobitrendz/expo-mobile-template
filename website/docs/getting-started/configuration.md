---
sidebar_position: 4
---

# Configuration

The mobile app needs the **backend root URL** — host and port only, **without** `/api/v1`. The generated OpenAPI client adds that prefix automatically.

## Resolution order

`src/constants/config.ts` resolves the URL in this order:

1. `expo.extra.apiUrl` in `app.json`
2. `EXPO_PUBLIC_API_URL` environment variable
3. Fallback: `http://macbook.local:8000`

```typescript title="src/constants/config.ts"
export const API_BASE_URL =
  (Constants.expoConfig?.extra?.apiUrl as string | undefined) ??
  process.env.EXPO_PUBLIC_API_URL ??
  'http://macbook.local:8000';
```

## Option A — app.json (recommended for builds)

```json title="app.json"
{
  "expo": {
    "extra": {
      "apiUrl": "https://your-api.example.com/"
    }
  }
}
```

After changing `app.json`, restart the Expo dev server so `expo-constants` picks up the new value.

## Option B — environment variable

```bash
export EXPO_PUBLIC_API_URL=http://192.168.1.100:8000
npm start
```

Useful for per-developer overrides without committing local URLs.

## API URL by environment

| Environment | Example URL | Notes |
|-------------|-------------|-------|
| **Production (MobiTrendz)** | `https://mobitrendz.onrender.com/` | Default in `app.json` |
| **iOS Simulator** | `http://localhost:8000` | Backend on same Mac |
| **Android Emulator** | `http://10.0.2.2:8000` | Maps to host `localhost` |
| **Physical device (Expo Go)** | `http://<LAN-IP>:8000` | e.g. `http://192.168.1.42:8000` |
| **Android physical device** | `http://<LAN-IP>:8000` | Same as above; ensure same Wi‑Fi |

:::tip Finding your LAN IP
On macOS: `ipconfig getifaddr en0`  
On Linux: `hostname -I | awk '{print $1}'`
:::

## How requests are built

If `API_BASE_URL` is `http://192.168.1.100:8000`, a login call becomes:

```
POST http://192.168.1.100:8000/api/v1/login/access-token
```

Configured in `src/api/client.ts`:

```typescript title="src/api/client.ts"
client.setConfig({
  baseUrl: API_BASE_URL,
  auth: async () => accessToken,
});
```

## Android cleartext HTTP

`app.json` enables `usesCleartextTraffic` so **HTTP** (non-TLS) local backends work during development. Use HTTPS in production.

## iOS local networking

`NSAllowsLocalNetworking` is set in `infoPlist` so the iOS simulator and devices can reach local HTTP servers.

## Verify connectivity

1. Start your FastAPI backend (default port `8000`).
2. Open `http://<your-api-url>/api/v1/checkDBConnection` in a browser on the same network.
3. Sign in from the app — network errors show the configured `API_BASE_URL` in the message (see `src/lib/api-error.ts`).

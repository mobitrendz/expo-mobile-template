# Expo Mobile Template

A React Native mobile app built with [Expo SDK 54](https://docs.expo.dev/) that connects to a FastAPI backend. It provides user authentication, a full-featured todo/task manager, and a profile screen for account management.

The app is intended for **regular user accounts only** — admin and super-user roles are rejected at sign-in.

### 🔗 Related Repositories

- **Backend Template**: [FastAPI Backend Template](https://github.com/mobitrendz/fastapi-backend-template)

- **React Frontend Template**: A companion frontend built with React 19, Vite, and Tailwind CSS. It is pre-configured to consume this API and handle its standardized error formats. [Frontend Template](https://github.com/mobitrendz/react-frontend-template)

---

## Features

### Authentication
- Sign in and sign up
- JWT bearer token stored in AsyncStorage
- Automatic session restore on app launch
- Sign out

### Todo / Task management
- List todos with pull-to-refresh
- Create tasks with all fields:
  - Title
  - Description
  - Priority (Low / Medium / High)
  - Status (Pending / In progress / Completed)
  - Due date & time
- Edit existing tasks
- Tap a task to cycle its status
- Delete tasks with a confirmation dialog
- Modal-based create/edit forms

### Profile
- Open by tapping your name on the home screen
- Edit full name and email
- Change password
- Delete account (with confirmation)
- Sign out

---

## Tech stack

| Layer | Technology |
|-------|------------|
| Framework | Expo ~54, React Native 0.81, React 19 |
| Language | TypeScript |
| API client | [@hey-api/openapi-ts](https://heyapi.dev/) (generated from OpenAPI spec) |
| HTTP | `@hey-api/client-fetch` |
| Storage | `@react-native-async-storage/async-storage` |
| Date picker | `@react-native-community/datetimepicker` |
| Backend | REST API (FastAPI-style, `/api/v1` prefix) |

---

## Prerequisites

- **Node.js** 18+ (LTS recommended)
- **npm**
- **Expo Go** app on a physical device, or:
  - **Android Studio** + Android SDK (for native Android builds)
  - **Xcode** (for native iOS builds, macOS only)
- A running backend instance compatible with `openapi.json`

---

## Getting started

### 1. Clone and install

```bash
git clone <repository-url>
cd expo-mobile-template
npm install
```

### 2. Configure the API URL

The backend **root URL** (host + port only — no `/api/v1` suffix) can be set in one of these ways:

**Option A — `app.json` (recommended for builds)**

```json
{
  "expo": {
    "extra": {
      "apiUrl": "https://your-api.example.com/"
    }
  }
}
```

**Option B — environment variable**

```bash
export EXPO_PUBLIC_API_URL=http://192.168.1.100:8000
```

**Option C — default fallback**

If neither is set, the app falls back to `http://macbook.local:8000` (see `src/constants/config.ts`).

#### API URL by environment

| Environment | Example URL |
|-------------|-------------|
| Production | `https://mobitrendz.onrender.com/` |
| iOS Simulator | `http://localhost:8000` |
| Android Emulator | `http://10.0.2.2:8000` |
| Physical device (Expo Go) | `http://<your-computer-lan-ip>:8000` |

> The generated API client automatically prefixes all routes with `/api/v1`.

### 3. Start the development server

```bash
npm start
```

Then press:
- `a` — open on Android emulator
- `i` — open on iOS simulator
- Scan the QR code — open in Expo Go on a physical device

---

## Available scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start the Expo development server |
| `npm run android` | Build and run on Android (`expo run:android`) |
| `npm run ios` | Build and run on iOS (`expo run:ios`) |
| `npm run web` | Start for web |
| `npm run generate-api` | Regenerate the TypeScript API client from `openapi.json` |

---

## Project structure

```
expo-mobile-template/
├── App.tsx                 # Root navigator (auth → todos / profile)
├── app.json                # Expo config (API URL, icons, bundle IDs)
├── openapi.json            # OpenAPI spec (source for API client)
├── openapi-ts.config.ts    # @hey-api/openapi-ts configuration
├── assets/                 # App icon, splash, favicon, Android adaptive icons
├── src/
│   ├── api/
│   │   └── client.ts       # Configured HTTP client + auth token injection
│   ├── client/             # Auto-generated API SDK (do not edit manually)
│   ├── constants/
│   │   └── config.ts       # API base URL resolution
│   ├── context/
│   │   └── AuthContext.tsx # Auth state, login/signup/logout
│   ├── lib/
│   │   ├── api-error.ts    # User-friendly API error messages
│   │   └── auth-storage.ts # JWT persistence in AsyncStorage
│   └── screens/
│       ├── LoginScreen.tsx
│       ├── TodoListScreen.tsx
│       └── ProfileScreen.tsx
├── android/                # Native Android project (generated via prebuild)
└── ios/                    # Native iOS project (generated via prebuild)
```

---

## API client generation

The API client in `src/client/` is generated from `openapi.json`. To regenerate after backend changes:

```bash
npm run generate-api
```

Configuration is in `openapi-ts.config.ts`:

```ts
export default defineConfig({
  input: './openapi.json',
  output: './src/client',
  plugins: ['@hey-api/typescript', '@hey-api/sdk', '@hey-api/client-fetch'],
});
```

---

## Native builds

Native `android/` and `ios/` folders are listed in `.gitignore`. Generate them with:

```bash
npx expo prebuild
```

For a clean regeneration:

```bash
npx expo prebuild --clean
```

### Android

```bash
npm run android
# or
npx expo run:android
```

**Android Studio sync:** If Gradle cannot find `node`, add this to `android/gradle.properties`:

```properties
nodeExecutable=/usr/local/bin/node
```

Use your actual Node path (e.g. `/opt/homebrew/bin/node` on Apple Silicon).

Alternatively, launch Android Studio from a terminal so it inherits your shell `PATH`:

```bash
open -a "Android Studio"
```

**Package name:** `com.mobitrendz.expomobiletemplate`

### iOS

```bash
npm run ios
# or
npx expo run:ios
```

**Bundle identifier:** `com.anonymous.expomobiletemplate`

---

## App configuration reference

| Setting | Value |
|---------|-------|
| App name | expo-mobile-template |
| Primary color | `#2563eb` |
| Orientation | Portrait |
| Hermes | Enabled |
| New Architecture | Enabled |
| Edge-to-edge (Android) | Enabled |
| Cleartext HTTP (Android) | Enabled (for local dev) |
| Default API | `https://mobitrendz.onrender.com/` |

Icons and splash assets live in `assets/`:
- `icon.png` — 1024×1024 app icon
- `splash-icon.png` — splash screen logo
- `android-icon-foreground.png`, `android-icon-background.png`, `android-icon-monochrome.png` — Android adaptive icon
- `favicon.png` — web favicon

---

## Authentication flow

1. User signs in or signs up via `LoginScreen`
2. Backend returns a JWT `access_token`
3. Token is saved to AsyncStorage and attached to all API requests via `src/api/client.ts`
4. On launch, a stored token is restored and `/api/v1/login/current-user` is called
5. Only users with role `user` are allowed; admin/super accounts are rejected

---

## Troubleshooting

### Cannot reach the API / network errors
- Confirm the backend is running
- Use the correct URL for your device (see [API URL by environment](#api-url-by-environment))
- On Android emulator, use `10.0.2.2` instead of `localhost`
- On a physical device, use your computer's LAN IP, not `localhost`

### `expo-constants` Kotlin compile error
Ensure `expo-constants` matches your Expo SDK version:

```bash
npx expo install expo-constants
```

Do **not** install `expo-constants@55` on Expo SDK 54 — use `~18.x`.

### Gradle autolinking warning
If you see `Autolinking is not set up in settings.gradle`, ensure:
- `android/settings.gradle` includes the Expo autolinking setup
- Node.js path is configured for Android Studio (see [Android](#android))

### Expo package version mismatches
Always align native module versions with your SDK:

```bash
npx expo install <package-name>
```

---

## License

Private project.

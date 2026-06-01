---
sidebar_position: 2
---

# Prerequisites

Before you begin, ensure your development environment meets these requirements.

## Required

| Tool | Version | Notes |
|------|---------|-------|
| **Node.js** | 18+ (LTS recommended) | Used by Expo CLI and Metro bundler |
| **npm** | 9+ | Ships with Node.js |
| **Git** | Any recent version | To clone the repository |

Verify installations:

```bash
node --version   # v18.x or higher
npm --version
```

## Mobile testing

Choose at least one way to run the app:

### Expo Go (fastest)

Install [Expo Go](https://expo.dev/go) on your physical iOS or Android device. Scan the QR code from `npm start` to load the app without a native build.

> Physical devices must reach your backend over the network — use your computer's LAN IP, not `localhost`.

### iOS Simulator (macOS only)

- **Xcode** with iOS Simulator
- Run with `npm run ios` or press `i` in the Expo dev server

Use `http://localhost:8000` as the API host when the backend runs on the same Mac.

### Android Emulator

- **Android Studio** with Android SDK and a virtual device
- Run with `npm run android` or press `a` in the Expo dev server

Use `http://10.0.2.2:8000` to reach `localhost` on your host machine from the emulator.

### Native development builds

For full native module access or custom native code, generate `ios/` and `android/` with `npx expo prebuild` and open the projects in Xcode or Android Studio. See [Native builds](../development/native-builds.md).

## Backend

You need a running API compatible with the bundled `openapi.json`. The recommended option is the companion [MobiTrendz FastAPI Backend Template](https://github.com/mobitrendz/fastapi-backend-template).

The mobile app calls routes under `/api/v1` (e.g. `/api/v1/login/access-token`, `/api/v1/todos`).

## Documentation site (optional)

To preview this Docusaurus site locally:

```bash
cd website
npm install
npm start
```

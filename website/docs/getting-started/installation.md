---
sidebar_position: 3
---

# Installation

## 1. Clone the repository

```bash
git clone <repository-url>
cd expo-mobile-template
```

## 2. Install dependencies

```bash
npm install
```

This installs Expo SDK 54, React Native 0.81, the OpenAPI client runtime, AsyncStorage, and the date picker package.

## 3. Start the development server

```bash
npm start
```

The Expo dev server opens in your terminal. From there:

| Key | Action |
|-----|--------|
| `a` | Open on Android emulator |
| `i` | Open on iOS simulator |
| `w` | Open in web browser |
| QR code | Scan with Expo Go on a physical device |

## Available npm scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start the Expo development server |
| `npm run android` | Build and run on Android (`expo run:android`) |
| `npm run ios` | Build and run on iOS (`expo run:ios`) |
| `npm run web` | Start for web |
| `npm run generate-api` | Regenerate TypeScript client from `openapi.json` |
| `npm run docs` | Start Docusaurus dev server (from project root) |
| `npm run docs:build` | Build static documentation site |

## Next steps

Configure the backend URL before testing sign-in or todos on a device:

→ [Configuration](./configuration.md)

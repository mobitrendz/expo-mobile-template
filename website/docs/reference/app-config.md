---
sidebar_position: 1
---

# App configuration

Reference for `app.json` and runtime settings.

## Expo app metadata

| Setting | Value |
|---------|-------|
| App name | `expo-mobile-template` |
| Slug | `expo-mobile-template` |
| Version | `1.0.0` |
| Orientation | Portrait |
| User interface style | Light |
| Primary brand color | `#2563eb` |

## API URL

The default points at the MobiTrendz hosted production API:

```json
"extra": {
  "apiUrl": "https://mobitrendz.onrender.com/"
}
```

Read at runtime via `expo-constants` → `Constants.expoConfig.extra.apiUrl`.

## iOS

```json
"ios": {
  "supportsTablet": true,
  "bundleIdentifier": "com.anonymous.expomobiletemplate",
  "infoPlist": {
    "NSAppTransportSecurity": {
      "NSAllowsLocalNetworking": true
    }
  }
}
```

## Android

```json
"android": {
  "usesCleartextTraffic": true,
  "package": "com.mobitrendz.expomobiletemplate",
  "versionCode": 1,
  "adaptiveIcon": {
    "backgroundColor": "#2563eb",
    "foregroundImage": "./assets/android-icon-foreground.png",
    "backgroundImage": "./assets/android-icon-background.png",
    "monochromeImage": "./assets/android-icon-monochrome.png"
  }
}
```

## Splash screen

```json
"splash": {
  "image": "./assets/splash-icon.png",
  "resizeMode": "contain",
  "backgroundColor": "#ffffff"
}
```

## Assets

| File | Purpose |
|------|---------|
| `assets/icon.png` | 1024×1024 app icon |
| `assets/splash-icon.png` | Splash logo |
| `assets/android-icon-foreground.png` | Adaptive icon foreground |
| `assets/android-icon-background.png` | Adaptive icon background |
| `assets/android-icon-monochrome.png` | Monochrome adaptive layer |
| `assets/favicon.png` | Web favicon |

## Plugins

```json
"plugins": ["@react-native-community/datetimepicker"]
```

Required for native date/time picker modules.

## Environment variables

| Variable | Purpose |
|----------|---------|
| `EXPO_PUBLIC_API_URL` | Override backend root URL at build/bundle time |

Only variables prefixed with `EXPO_PUBLIC_` are exposed to the app bundle.

## Dependencies (runtime)

| Package | Version | Role |
|---------|---------|------|
| `expo` | ~54.0.0 | Framework |
| `expo-constants` | ~18.0.13 | Read `app.json` extra at runtime |
| `react` | 19.1.0 | UI |
| `react-native` | 0.81.5 | Native bridge |
| `@hey-api/client-fetch` | ^0.13.1 | HTTP transport |
| `@react-native-async-storage/async-storage` | 2.2.0 | Token storage |
| `@react-native-community/datetimepicker` | 8.4.4 | Due date UI |

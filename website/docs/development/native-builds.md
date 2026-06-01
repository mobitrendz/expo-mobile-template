---
sidebar_position: 4
---

# Native builds

For Expo Go, you do not need native folders. For custom native code, store builds, or running without Expo Go, generate native projects with **prebuild**.

## Generate native projects

```bash
npx expo prebuild
```

Clean regeneration (deletes and recreates `ios/` and `android/`):

```bash
npx expo prebuild --clean
```

:::caution
`android/` and `ios/` are in `.gitignore`. Regenerate after cloning or when Expo config plugins change.
:::

## Run on device / emulator

```bash
npm run android   # expo run:android
npm run ios       # expo run:ios
```

## Android

| Setting | Value |
|---------|-------|
| Package name | `com.mobitrendz.expomobiletemplate` |
| Cleartext HTTP | Enabled (local dev) |
| Edge-to-edge | Enabled |
| Adaptive icon background | `#2563eb` |

### Gradle / Node.js

Android Studio may not inherit your shell `PATH`. If Gradle cannot find `node`:

**Option 1** — Add to `android/gradle.properties`:

```properties
nodeExecutable=/opt/homebrew/bin/node
```

Use your actual Node path (`which node`).

**Option 2** — Launch Android Studio from a terminal:

```bash
open -a "Android Studio"
```

### Autolinking

If you see `Autolinking is not set up in settings.gradle`, ensure `android/settings.gradle` includes the Expo autolinking setup from the official Expo SDK 54 template. Run `npx expo prebuild` to regenerate if needed.

## iOS

| Setting | Value |
|---------|-------|
| Bundle identifier | `com.anonymous.expomobiletemplate` |
| Local networking | `NSAllowsLocalNetworking` enabled |

Requires macOS and Xcode for simulator and device builds.

## Expo config plugins

`app.json` registers:

```json
"plugins": [
  "@react-native-community/datetimepicker"
]
```

Required for native date picker support on both platforms.

## Hermes and New Architecture

Expo SDK 54 enables Hermes and the New Architecture by default in generated native projects.

## Aligning native module versions

Always use Expo's installer to match SDK versions:

```bash
npx expo install <package-name>
```

Example: `expo-constants` must be `~18.x` on SDK 54 — not `55.x`.

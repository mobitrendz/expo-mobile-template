---
sidebar_position: 2
---

# Troubleshooting

Common issues when developing and running the Expo Mobile Template.

## Cannot reach the API / network errors

**Symptoms:** Error messages mentioning `Cannot reach the API at …` or `Network request failed`.

**Checks:**

1. Confirm the FastAPI backend is running.
2. Use the correct URL for your environment — see [Configuration](../getting-started/configuration.md).
3. **Android emulator:** use `http://10.0.2.2:8000`, not `localhost`.
4. **Physical device:** use your computer's LAN IP; device and computer must be on the same network.
5. Test `http://<api-url>/api/v1/checkDBConnection` from a browser on the device network.

## Invalid email or password (but credentials are correct)

- Ensure the backend database is seeded / user exists.
- Check you are not using an `admin` or `super` account — this app rejects those roles.

## `expo-constants` Kotlin compile error

**Cause:** Wrong `expo-constants` major version for SDK 54.

**Fix:**

```bash
npx expo install expo-constants
```

Use `~18.x` on Expo SDK 54. Do **not** install `expo-constants@55`.

## Gradle autolinking warning

**Message:** `Autolinking is not set up in settings.gradle`

**Fix:**

1. Run `npx expo prebuild` to regenerate Android project files.
2. Ensure `android/settings.gradle` includes Expo autolinking.
3. Configure Node path for Android Studio — see [Native builds](../development/native-builds.md).

## `useExpoModules()` not found

Use the Expo SDK 54 template pattern: `expoAutolinking.useExpoModules()` in `settings.gradle`, or the legacy `apply from` autolinking script from `expo/scripts/autolinking.gradle`.

Regenerate with `npx expo prebuild --clean` if the project was created with an older template.

## Date picker: `dismiss` of undefined (Android)

**Cause:** `DateTimePicker` with `mode="datetime"` is not supported on Android.

**Fix:** Already implemented — Android uses `DateTimePickerAndroid` with separate date and time steps. Do not use `mode="datetime"` on Android.

## Expo package version mismatches

Always align native modules with your SDK:

```bash
npx expo install <package-name>
```

Check the Expo doctor:

```bash
npx expo-doctor
```

## Documentation site won't build

From `website/`:

```bash
npm install
npm run build
```

Broken internal links fail the build (`onBrokenLinks: 'throw'`). Fix any moved doc paths referenced in markdown.

## Metro cache issues

```bash
npx expo start --clear
```

## Still stuck?

1. Compare your `openapi.json` with the running backend OpenAPI docs.
2. Regenerate the client: `npm run generate-api`.
3. Review backend logs for 4xx/5xx responses during the failing action.

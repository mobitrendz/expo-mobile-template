# Expo Mobile Template

A React Native mobile app built with [Expo SDK 54](https://docs.expo.dev/versions/v54.0.0/) that connects to the [MobiTrendz FastAPI Backend Template](https://github.com/mobitrendz/fastapi-backend-template). It provides user authentication, a full-featured todo/task manager, and a profile screen for account management.

Part of the **MobiTrendz** starter kit alongside the [React web frontend](https://github.com/mobitrendz/react-frontend-template). The app is intended for **regular user accounts only** — `admin` and `super` roles are rejected at sign-in.

## Documentation

**Live documentation:** [https://mobitrendz.github.io/expo-mobile-template/](https://mobitrendz.github.io/expo-mobile-template/)

The site is built with [Docusaurus](https://docusaurus.io/). Source lives in [`website/`](website/).

`website/build/` is **not committed** (it is in `.gitignore`). Pushes to `master` that change `website/` trigger [.github/workflows/deploy-docs.yml](.github/workflows/deploy-docs.yml), which builds the site and publishes it to GitHub Pages.

**One-time GitHub setup:** Settings → Pages → **Build and deployment** → Source: **GitHub Actions**.

To run locally:

```bash
npm run docs        # Dev server → http://localhost:3000
npm run docs:build  # Static build → website/build/
npm run docs:serve  # Preview production build (uses /expo-mobile-template/ base path)
```

Guides cover getting started, API configuration, authentication, tasks, profile, API client generation, native builds, and troubleshooting.

## Related repositories

| Project | Description |
|---------|-------------|
| [FastAPI Backend Template](https://github.com/mobitrendz/fastapi-backend-template) | REST API, JWT auth, OpenAPI spec (`openapi.json` source) |
| [React Frontend Template](https://github.com/mobitrendz/react-frontend-template) | React 19 + Vite + Tailwind web client for the same API |

## Features

### Authentication

- Sign in and sign up
- JWT bearer token in AsyncStorage
- Automatic session restore on launch
- Sign out

### Todo / task management

- List todos with pull-to-refresh
- Create and edit tasks (modal) with title, description, priority, status, due date & time
- Tap a task to cycle status (pending → in progress → completed)
- Delete with confirmation dialog
- Platform-aware date pickers (iOS spinner; Android date + time steps)

### Profile

- Open by tapping your name on the home screen
- Edit full name and email
- Change password
- Delete account (with confirmation)
- Sign out

## Tech stack

| Layer | Technology |
|-------|------------|
| Framework | Expo ~54, React Native 0.81, React 19 |
| Language | TypeScript |
| API client | [@hey-api/openapi-ts](https://heyapi.dev/) (from `openapi.json`) |
| HTTP | `@hey-api/client-fetch` |
| Storage | `@react-native-async-storage/async-storage` |
| Date picker | `@react-native-community/datetimepicker` |
| Backend | REST API, `/api/v1` prefix |

## Quick start

### 1. Clone and install

```bash
git clone <repository-url>
cd expo-mobile-template
npm install
```

### 2. Configure the API URL

Set the backend **root URL** (host + port only — no `/api/v1` suffix):

**`app.json` (recommended for builds)**

```json
{
  "expo": {
    "extra": {
      "apiUrl": "https://your-api.example.com/"
    }
  }
}
```

**Environment variable**

```bash
export EXPO_PUBLIC_API_URL=http://192.168.1.100:8000
```

**Fallback:** `http://macbook.local:8000` in `src/constants/config.ts` if neither is set.

| Environment | Example URL |
|-------------|-------------|
| Production (default) | `https://mobitrendz.onrender.com/` |
| iOS Simulator | `http://localhost:8000` |
| Android Emulator | `http://10.0.2.2:8000` |
| Physical device (Expo Go) | `http://<your-lan-ip>:8000` |

The generated client adds `/api/v1` to every route automatically.

### 3. Run the app

```bash
npm start
```

Then press `a` (Android), `i` (iOS), or scan the QR code with Expo Go.

## Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Expo development server |
| `npm run android` | Native Android build (`expo run:android`) |
| `npm run ios` | Native iOS build (`expo run:ios`) |
| `npm run web` | Expo web |
| `npm run generate-api` | Regenerate `src/client/` from `openapi.json` |
| `npm run docs` | Docusaurus dev server |
| `npm run docs:build` | Build documentation site |
| `npm run docs:serve` | Serve built documentation |

## Project structure

```
expo-mobile-template/
├── App.tsx                 # Auth gate + todos / profile navigation
├── app.json                # Expo config, API URL, icons, bundle IDs
├── openapi.json            # OpenAPI spec
├── openapi-ts.config.ts    # Codegen config
├── assets/                 # Icons and splash
├── website/                # Docusaurus docs
└── src/
    ├── api/client.ts       # HTTP client + JWT injection
    ├── client/             # Generated SDK (do not edit)
    ├── constants/config.ts # API base URL
    ├── context/AuthContext.tsx
    ├── lib/                # api-error, auth-storage
    └── screens/            # Login, TodoList, Profile
```

Native `android/` and `ios/` are gitignored — generate with `npx expo prebuild`.

## API client

```bash
npm run generate-api
```

```ts
// openapi-ts.config.ts
export default defineConfig({
  input: './openapi.json',
  output: './src/client',
  plugins: ['@hey-api/typescript', '@hey-api/sdk', '@hey-api/client-fetch'],
});
```

## Native builds

```bash
npx expo prebuild          # or: npx expo prebuild --clean
npm run android            # package: com.mobitrendz.expomobiletemplate
npm run ios                # bundle: com.anonymous.expomobiletemplate
```

If Gradle cannot find Node, set `nodeExecutable` in `android/gradle.properties` or launch Android Studio from a terminal. See [Native builds](website/docs/development/native-builds.md) in the docs.

## Configuration snapshot

| Setting | Value |
|---------|-------|
| Primary color | `#2563eb` |
| Default API | `https://mobitrendz.onrender.com/` |
| Android package | `com.mobitrendz.expomobiletemplate` |
| iOS bundle ID | `com.anonymous.expomobiletemplate` |
| Hermes / New Architecture | Enabled |

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Network / API unreachable | Correct URL per environment; Android emulator → `10.0.2.2` |
| `expo-constants` Kotlin error | `npx expo install expo-constants` (~18.x on SDK 54) |
| Gradle autolinking | Regenerate Android project; configure Node path |
| Package version drift | `npx expo install <package>` |

More detail: [Troubleshooting](website/docs/reference/troubleshooting.md).

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development setup, conventions, and pull request guidelines.

## Security

See [SECURITY.md](SECURITY.md) for supported versions and how to report vulnerabilities responsibly.

## License

[MIT](LICENSE) © MobiTrendz

# Contributing to Expo Mobile Template

Thank you for your interest in contributing to the MobiTrendz Expo Mobile Template. This guide explains how to set up your environment, make changes, and open a pull request.

## Table of contents

- [Code of conduct](#code-of-conduct)
- [Before you start](#before-you-start)
- [Development setup](#development-setup)
- [Making changes](#making-changes)
- [API and backend changes](#api-and-backend-changes)
- [Documentation](#documentation)
- [Native builds](#native-builds)
- [Pull request checklist](#pull-request-checklist)
- [Commit messages](#commit-messages)
- [Getting help](#getting-help)

## Code of conduct

Be respectful and constructive. Focus feedback on the work, not the person. Harassment or discrimination is not tolerated.

## Before you start

1. **Read the docs** — [README.md](README.md) and the [Docusaurus site](website/docs/intro.md) describe architecture, configuration, and features.
2. **Check existing work** — Search [issues](https://github.com/mobitrendz/expo-mobile-template/issues) and open PRs to avoid duplicate effort.
3. **Open an issue first** (recommended) — For large features or breaking changes, discuss the approach before investing significant time.

This app targets **Expo SDK 54**. When changing Expo or React Native APIs, use the versioned docs: [Expo SDK 54](https://docs.expo.dev/versions/v54.0.0/).

## Development setup

### Prerequisites

- **Node.js** 18+ (LTS recommended)
- **npm**
- A running [FastAPI Backend Template](https://github.com/mobitrendz/fastapi-backend-template) instance (local or hosted)
- **Expo Go** and/or Android Studio / Xcode for device testing

### Install and run

```bash
git clone https://github.com/mobitrendz/expo-mobile-template.git
cd expo-mobile-template
npm install
```

Configure the API URL for your environment (see [Configuration](website/docs/getting-started/configuration.md)):

```bash
# Example: local backend on your LAN
export EXPO_PUBLIC_API_URL=http://192.168.1.100:8000
npm start
```

Use a **`user`** role test account. Admin and super accounts are intentionally rejected by `AuthContext`.

### Useful commands

| Command | Purpose |
|---------|---------|
| `npm start` | Expo dev server |
| `npm run android` / `npm run ios` | Native run (after `npx expo prebuild`) |
| `npm run generate-api` | Regenerate `src/client/` from `openapi.json` |
| `npm run docs` | Documentation dev server |
| `npm run docs:build` | Verify docs build |
| `cd website && npm run typecheck` | Type-check docs site sources |

## Making changes

### Scope and conventions

- **Keep PRs focused** — One logical change per pull request when possible.
- **TypeScript** — App code is TypeScript; match existing patterns in `src/screens/`, `src/context/`, and `src/lib/`.
- **Do not edit generated code** — Files under `src/client/` are produced by `npm run generate-api`. Change `openapi.json` and regenerate instead.
- **API calls** — Use generated SDK functions from `src/client` and handle `{ data, error }` tuples. Format errors with `getApiErrorMessage()` from `src/lib/api-error.ts`.
- **Auth** — Token handling belongs in `src/api/client.ts` and `src/lib/auth-storage.ts`; session logic in `src/context/AuthContext.tsx`.
- **Styling** — Use `StyleSheet.create` colocated in screen files. Primary brand color is `#2563eb`.
- **Platform differences** — Test on both iOS and Android when touching UI that uses native modules (e.g. date pickers).

### Project layout (where to edit)

| Area | Location |
|------|----------|
| Screens | `src/screens/` |
| Auth state | `src/context/AuthContext.tsx` |
| HTTP client config | `src/api/client.ts` |
| API base URL | `src/constants/config.ts`, `app.json` `extra.apiUrl` |
| Shared utilities | `src/lib/` |
| Root navigation | `App.tsx` |
| Expo config | `app.json` |
| OpenAPI spec | `openapi.json` |

### Adding dependencies

Install Expo-compatible versions with:

```bash
npx expo install <package-name>
```

Do not bump `expo` or native modules to versions outside SDK 54 without a deliberate migration.

## API and backend changes

When the backend API changes:

1. Update `openapi.json` from the [FastAPI Backend Template](https://github.com/mobitrendz/fastapi-backend-template) (or your fork).
2. Regenerate the client:

   ```bash
   npm run generate-api
   ```

3. Commit **both** `openapi.json` and the regenerated `src/client/` files.
4. Update app code to use new types or endpoints.
5. Document behavioral changes in `website/docs/` if user-facing.

Remember: `API_BASE_URL` is the server root only — the client adds `/api/v1` automatically.

## Documentation

User-facing documentation lives in `website/docs/` (Docusaurus).

When your change affects setup, features, or troubleshooting:

1. Edit the relevant page under `website/docs/`.
2. Run `npm run docs:build` to confirm the site builds (`onBrokenLinks` is strict).
3. Keep **MobiTrendz** branding in prose; leave URLs (GitHub org, hosted API host, package identifiers) unchanged.

## Native builds

`android/` and `ios/` are gitignored. Contributors testing native code should generate them locally:

```bash
npx expo prebuild
npm run android   # or npm run ios
```

Do not commit generated native folders unless the project policy changes. Document any `app.json` plugin or native config changes in the docs.

## Pull request checklist

Before requesting review, confirm:

- [ ] The app runs with `npm start` against a compatible backend.
- [ ] You tested affected flows (login, todos, profile) on at least one platform.
- [ ] No manual edits in `src/client/` (or you regenerated via `npm run generate-api`).
- [ ] Documentation updated if behavior or setup changed.
- [ ] `npm run docs:build` passes when docs were touched.
- [ ] No secrets, API keys, or personal URLs committed (use `EXPO_PUBLIC_*` or local `app.json` overrides).
- [ ] PR description explains **what** changed and **why**.

## Commit messages

Write clear, imperative subject lines:

```
Add due-date validation on task create
Fix Android date picker dismiss error
Update profile screen error handling
Regenerate API client from openapi.json
```

Optional body for context, breaking changes, or issue references (`Fixes #123`).

## Getting help

- **Documentation:** `npm run docs` → http://localhost:3000
- **Troubleshooting:** [website/docs/reference/troubleshooting.md](website/docs/reference/troubleshooting.md)
- **Backend:** [FastAPI Backend Template](https://github.com/mobitrendz/fastapi-backend-template)
- **Issues:** Open a GitHub issue with steps to reproduce, platform (iOS/Android), Expo SDK version, and API URL configuration (redact secrets).

By contributing, you agree that your contributions will be licensed under the [MIT License](LICENSE) used by this project.

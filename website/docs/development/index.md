---
sidebar_position: 1
---

# Development

This section is for contributors and developers extending the template.

| Topic | Guide |
|-------|-------|
| Folder layout and conventions | [Project structure](./project-structure.md) |
| Regenerating the API SDK | [API client](./api-client.md) |
| `expo prebuild` and native IDEs | [Native builds](./native-builds.md) |

## TypeScript

The app entry is `App.tsx`. TypeScript config is in `tsconfig.json` at the project root. Generated client files under `src/client/` should not be edited manually.

## Regenerating the API

After backend OpenAPI changes:

```bash
# Update openapi.json from your backend, then:
npm run generate-api
```

## Running documentation locally

```bash
npm run docs        # Dev server at http://localhost:3000
npm run docs:build  # Static output in website/build/
```

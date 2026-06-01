---
sidebar_position: 3
---

# API client

The HTTP layer is fully generated from `openapi.json` using [@hey-api/openapi-ts](https://heyapi.dev/).

## Configuration

```typescript title="openapi-ts.config.ts"
import { defineConfig } from '@hey-api/openapi-ts';

export default defineConfig({
  input: './openapi.json',
  output: './src/client',
  plugins: [
    '@hey-api/typescript',
    '@hey-api/sdk',
    '@hey-api/client-fetch',
  ],
});
```

## Regenerate

When the backend API changes, update `openapi.json` then run:

```bash
npm run generate-api
```

This overwrites `src/client/`. Commit both `openapi.json` and the regenerated client together.

## Using the client

### 1. Import SDK functions

```typescript
import {
  readTodosApiV1TodosGet,
  createTodoApiV1TodosPost,
} from '../client';
```

### 2. Call with typed body/path

```typescript
const { data, error } = await createTodoApiV1TodosPost({
  body: {
    title: 'Buy groceries',
    priority: 'high',
    status: 'pending',
    description: null,
    due_date: null,
  },
});

if (error || !data) {
  throw new Error(getApiErrorMessage(error, 'Failed to create task'));
}
```

### 3. Authentication

The shared client in `src/api/client.ts` registers the bearer token:

```typescript
import { client, setAccessToken } from '../api/client';

// After login:
setAccessToken(token);

// All SDK calls use this client automatically
```

## OpenAPI spec source

`openapi.json` describes the [MobiTrendz FastAPI Backend Template](https://github.com/mobitrendz/fastapi-backend-template) API. Key tag groups:

| Tags | Mobile usage |
|------|----------------|
| Login | Auth, current user |
| Todos | Task CRUD |
| Users | Profile, password, delete |

## URL prefixing

Paths in the spec include `/api/v1`. The client combines `API_BASE_URL` + path:

```
baseUrl: http://localhost:8000
path:    /api/v1/todos
→        http://localhost:8000/api/v1/todos
```

Never include `/api/v1` in `API_BASE_URL`.

## Error types

Generated types include `ErrorDetail` and `HttpValidationError`. `getApiErrorMessage()` in `src/lib/api-error.ts` normalizes:

- Network failures (with configured base URL hint)
- String `detail` messages
- Validation error arrays (`detail[].msg`)

## Do not edit generated files

Files ending in `.gen.ts` are overwritten on every `generate-api` run. Extend behavior in:

- `src/api/client.ts` — client config
- `src/lib/api-error.ts` — error formatting
- Screen files — business logic

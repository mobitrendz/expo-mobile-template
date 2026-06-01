---
sidebar_position: 1
---

# Getting started

This section walks you from a fresh clone to a running app on a simulator, emulator, or physical device.

## Steps

1. [Prerequisites](./prerequisites.md) — Node.js, Expo Go, optional native tooling
2. [Installation](./installation.md) — Clone, `npm install`, start Metro
3. [Configuration](./configuration.md) — Point the app at your FastAPI backend

## Default backend

Out of the box, `app.json` points to the MobiTrendz hosted demo API:

```json
"extra": {
  "apiUrl": "https://mobitrendz.onrender.com/"
}
```

For local development, override this with your machine's LAN IP or emulator-specific hostnames — see [Configuration](./configuration.md).

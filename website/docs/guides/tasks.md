---
sidebar_position: 3
---

# Task management

`TodoListScreen` is the home screen after authentication. It lists the signed-in user's todos and supports full create, read, update, and delete operations.

## Features

| Feature | Description |
|---------|-------------|
| **List** | FlatList with pull-to-refresh |
| **Create** | Modal form via **Add Task** button |
| **Edit** | Modal form with pre-filled fields per task |
| **Delete** | Custom confirmation modal with red Delete button |
| **Quick status** | Tap a task row to cycle status |
| **Fields** | Title, description, priority, status, due date & time |

## Task fields

| Field | API type | Options / format |
|-------|----------|------------------|
| Title | `string` | Required |
| Description | `string` | Optional |
| Priority | `ToDoPriority` | `low`, `medium`, `high` |
| Status | `ToDoStatus` | `pending`, `in progress`, `completed` |
| Due date | ISO 8601 string | Date + time combined |

## Status cycling

Tapping a task cycles its status in order:

```
pending → in progress → completed → pending
```

This uses `PATCH /api/v1/todos/{id}` without opening the edit modal.

## Create and edit modals

Both flows share the same modal UI:

- **Create** — opened from **Add Task**; empty form with defaults (`medium` priority, `pending` status).
- **Edit** — opened from the edit button on a task row; loads existing values including parsed due date.

Submission calls:

- `POST /api/v1/todos` — create
- `PATCH /api/v1/todos/{id}` — update

## Date and time pickers

Platform behavior differs because Android does not support `mode="datetime"` on `@react-native-community/datetimepicker`.

### iOS

A single `DateTimePicker` with `mode="datetime"` and spinner display inside the modal.

### Android

Uses imperative `DateTimePickerAndroid`:

1. Open date picker first.
2. On confirm, open time picker.
3. Combine into one `Date` for the form.

This avoids the `Cannot read property 'dismiss' of undefined` error from unsupported datetime mode.

## Delete confirmation

Native `Alert` cannot style button backgrounds, so delete uses a **custom modal** with:

- Cancel (neutral)
- **Delete** (red destructive styling)

Confirmed delete calls `DELETE /api/v1/todos/{id}`.

## Status badges

Status pills use a wrapping `View` for the background color and `Text` for the label — background styles on `Text` alone caused misalignment for multi-word labels like "In progress".

## API endpoints used

| Action | Method | Endpoint |
|--------|--------|----------|
| List | `GET` | `/api/v1/todos` |
| Create | `POST` | `/api/v1/todos` |
| Update | `PATCH` | `/api/v1/todos/{id}` |
| Delete | `DELETE` | `/api/v1/todos/{id}` |

Generated functions in `src/client/sdk.gen.ts`:

- `readTodosApiV1TodosGet`
- `createTodoApiV1TodosPost`
- `updateTodoApiV1TodosIdPatch`
- `deleteTodoApiV1TodosIdDelete`

## UI structure

```
TodoListScreen
├── Header (greeting, user name → profile, sign out)
├── FlatList (tasks)
│   └── Task row (status badge, title, meta, edit, delete)
├── Add Task button
└── Modal (create / edit form)
    ├── Text inputs (title, description)
    ├── Priority chips
    ├── Status chips
    └── Due date picker (platform-specific)
```

## Opening profile

Tap your **display name** in the header to navigate to the profile screen (`onOpenProfile` callback to `App.tsx`).

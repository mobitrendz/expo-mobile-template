---
sidebar_position: 4
---

# Profile

The profile screen lets signed-in users manage their account. Open it by **tapping your name** on the todo list header.

## Sections

### Personal details

Edit and save:

- **Full name**
- **Email**

Calls `PATCH /api/v1/users/{id}` then `refreshUser()` from `AuthContext` to sync local state.

### Change password

Requires:

- Current password
- New password
- Confirm new password

Calls `PATCH /api/v1/users/password` with `current_password` and `new_password`. Client-side validation ensures new and confirm passwords match.

### Delete account

Opens a confirmation modal (same pattern as task delete — custom modal for styled destructive button).

On confirm:

1. `DELETE /api/v1/users/{id}`
2. `logout()` — clears token and returns to login

### Sign out

Clears JWT from AsyncStorage without deleting the account.

## Read-only information

The screen displays:

- **Member since** — formatted from `user.created_at`
- **User ID** — backend UUID

## Key file

`src/screens/ProfileScreen.tsx` — all profile UI and API calls.

## API endpoints

| Action | Method | Endpoint |
|--------|--------|----------|
| Update profile | `PATCH` | `/api/v1/users/{id}` |
| Change password | `PATCH` | `/api/v1/users/password` |
| Delete account | `DELETE` | `/api/v1/users/{id}` |

## Navigation

```typescript title="App.tsx"
if (screen === 'profile') {
  return <ProfileScreen onBack={() => setScreen('todos')} />;
}

return <TodoListScreen onOpenProfile={() => setScreen('profile')} />;
```

There is no separate "My Profile" link in the header — only the tappable user name.

## Success and error feedback

Each section (profile, password) has independent error and success message state. Saving shows inline feedback without leaving the screen.

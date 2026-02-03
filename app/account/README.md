# User Authentication Context Pattern

## Overview

Implemented a centralized authentication and user data management pattern for the `/account` section using React Context API.

## Architecture

### 1. **Layout-Level Authentication** (`/app/account/layout.tsx`)

- **Server Component** that fetches user data once
- Performs authentication check at the layout level
- Redirects to `/login` if not authenticated
- Wraps all child pages with `UserProvider`

### 2. **User Context** (`/app/account/UserContext.tsx`)

- **Client Component** that provides user data to all child components
- Exports `useUser()` hook for easy access
- Type-safe user data interface

### 3. **Child Pages** (e.g., `/app/account/page.tsx`)

- **Client Components** that consume user data via `useUser()` hook
- No need for redundant auth checks or data fetching
- Clean, simple implementation

## Benefits

✅ **Single Source of Truth**: User data fetched once in the layout  
✅ **No Redundant Checks**: Authentication verified only at layout level  
✅ **Better Performance**: Eliminates duplicate API calls  
✅ **Cleaner Code**: Child pages don't need auth logic  
✅ **Type Safety**: TypeScript types enforced throughout  
✅ **Easy to Use**: Simple `useUser()` hook for all pages

## File Structure

```
app/account/
├── layout.tsx          # Server component - fetches user, wraps with context
├── UserContext.tsx     # Client component - provides user data
├── page.tsx            # Client component - uses useUser()
├── SideBarMenu.tsx     # Client component - uses useUser()
├── ProfileForm.tsx     # Client component - uses useUser()
├── orders/
│   └── page.tsx        # Server component - can still use server actions
└── ...other pages
```

## Usage Example

### In any page under `/account`:

```tsx
"use client";

import { useUser } from "../UserContext";

export default function MyAccountPage() {
  const { user } = useUser();

  return (
    <div>
      <h1>Welcome, {user.fullname}!</h1>
      <p>Email: {user.email}</p>
    </div>
  );
}
```

## Key Points

1. **Layout is Server Component**: Fetches data server-side for better performance
2. **Context is Client Component**: Provides data to client components
3. **Pages can be either**:
   - Client components using `useUser()` for user data
   - Server components using server actions for other data
4. **Auth check happens once**: In the layout, protecting all child routes
5. **User data available everywhere**: Via the `useUser()` hook

## Migration Notes

- Removed duplicate `getCurrentUser()` calls from individual pages
- Removed duplicate `redirect('/login')` checks from pages
- Converted components that need user data to client components with `useUser()`
- Server components can still exist for pages that don't need user data directly

---
name: Clerk Authentication Implementation
description: "How to implement Clerk authentication across a Next.js App Router frontend and an Express.js backend using cookies for secure session management."
---

# Clerk Authentication Implementation Pattern

This skill documents the pattern used for implementing Clerk authentication in a full-stack application with a Next.js (App Router) frontend and an Express.js backend. This setup uses cookies for authentication, meaning the frontend does not need to send explicit tokens or user IDs in API requests.

## 1. Frontend (Next.js App Router)

### Dependencies
Install the Clerk Next.js SDK:
```bash
npm install @clerk/nextjs
```

### Provider Setup (`app/layout.tsx`)
Wrap your entire application with the `<ClerkProvider>`. This makes the authentication state available throughout the component tree.
```tsx
import { ClerkProvider } from '@clerk/nextjs';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}
```

### Route Protection (`middleware.ts`)
Use Clerk middleware at the root of the frontend src/app directory to protect specific routes.
```typescript
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import type { NextRequest } from 'next/server';

// Example: Protect all routes except the home page '/'
const isProtectedRoute = createRouteMatcher([
  '/((?!$).*)', // matches everything except root '/'
]);

export default clerkMiddleware(async (auth, req: NextRequest) => {
  if (isProtectedRoute(req)) {
    await auth.protect(); // enforce authentication
  }
});

export const config = {
  matcher: [
    '/((?!_next|.*\\.(?:css|js|png|jpg|jpeg|svg|webp|ico|json)).*)',
  ],
};
```

### UI Components
Use Clerk's built-in components to conditionally render UI based on authentication state without writing complex logic.
```tsx
import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from '@clerk/nextjs';

export default function Navbar() {
  return (
    <nav>
      {/* Shown only when the user is signed in */}
      <SignedIn>
        <UserButton afterSignOutUrl="/" />
      </SignedIn>

      {/* Shown only when the user is signed out */}
      <SignedOut>
        <SignUpButton>
          <button>Sign Up</button>
        </SignUpButton>
        <SignInButton>
          <button>Sign In</button>
        </SignInButton>
      </SignedOut>
    </nav>
  );
}
```

## 2. Backend (Express.js)

### Dependencies
Install the Clerk Express SDK:
```bash
npm install @clerk/express
```

### Global Middleware (`app.js`)
Apply `clerkMiddleware()` globally. This middleware will parse the Clerk session cookie sent by the Next.js frontend on cross-origin or same-origin requests.
```javascript
import express from "express";
import cors from "cors";
import { clerkMiddleware } from "@clerk/express";

const app = express();

app.use(express.json());
// Ensure CORS allows credentials if frontend and backend are on different domains/ports
app.use(cors({ 
  // origin: "http://localhost:3000",
  // credentials: true 
})); 
app.use(clerkMiddleware()); // Parses the Clerk session from cookies

export default app;
```

### Route Protection (`routes/api.js`)
Use `requireAuth()` middleware to protect specific API endpoints from unauthorized access.
```javascript
import { Router } from "express";
import { requireAuth } from "@clerk/express";
import * as myController from "../controllers/myController.js";

const router = Router();

// Protect this route, returns 401 if unauthenticated
router.get("/protected-data", requireAuth(), myController.getData);

export default router;
```

### Extracting User Information (`controllers/myController.js`)
Inside your controllers, use `getAuth(req)` to securely retrieve the user's ID. You do *not* need the frontend to send `clerkUserId` in the request body because the session is securely validated via cookies.
```javascript
import { getAuth } from "@clerk/express";

export const getData = async (req, res) => {
  try {
    const { userId } = getAuth(req);

    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    // Example logic using the secure userId
    // const data = await MyModel.find({ clerkUserId: userId });

    res.json({ message: "Success", userId });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
```

## Key Concept: Cookie-Based Auth vs Payload Headers
Because Next.js and frontend requests (via browser `fetch` or `axios` with credentials) send cookies automatically, the Express server uses `@clerk/express` to parse these cookies via `clerkMiddleware()`. This completely removes the need to manually pass a User ID from the frontend to the backend payload, making the system much more secure against spoofing.

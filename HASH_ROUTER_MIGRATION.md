# HashRouter Migration - Complete Guide

## Problem Solved

**Issue:** Next.js App Router was trying to fetch RSC (React Server Components) payloads and causing `ChunkLoadError` and `Failed to fetch RSC payload` errors in Chrome Extensions.

**Root Cause:** Next.js routing relies on server-side features that don't work in Chrome extensions (which use `chrome-extension://` protocol with no server).

## Solution: React Router HashRouter

Switched from Next.js routing to **React Router's HashRouter** for 100% client-side navigation.

## Changes Made

### 1. ✅ Installed Dependencies
```bash
npm install react-router-dom @types/react-router-dom
```

### 2. ✅ Updated Layout (`app/layout.tsx`)
- Changed to `"use client"` directive
- Removed Next.js `Metadata` export (not compatible with client components)
- Added `<head>` tag with title and description manually

### 3. ✅ Created Main App Entry (`app/page.tsx`)
- Set up `HashRouter` with all routes
- Configured `Routes` and `Route` components
- Added catch-all route with `Navigate` redirect

### 4. ✅ Created Page Components (`app/pages/`)
All page components moved to `app/pages/` directory:
- `HomePage.tsx` - Landing page
- `OnboardingPage.tsx` - Onboarding flow
- `CreateWalletPage.tsx` - Wallet creation
- `ImportWalletPage.tsx` - Wallet import
- `CreatePasswordPage.tsx` - Password creation
- `LoginPage.tsx` - Login/unlock
- `DashboardPage.tsx` - Main dashboard

### 5. ✅ Replaced Navigation
**Before (Next.js):**
```typescript
import { useExtensionRouter } from "@/lib/extensionRouter";
const router = useExtensionRouter();
router.push("/dashboard");
router.back();
```

**After (React Router):**
```typescript
import { useNavigate } from "react-router-dom";
const navigate = useNavigate();
navigate("/dashboard");
navigate(-1); // Go back
```

## How HashRouter Works

### Hash-Based URLs
- **Format:** `index.html#/dashboard`
- **Benefits:**
  - No server required
  - Works in Chrome extensions
  - No page reloads
  - Instant navigation

### Route Structure
```typescript
<HashRouter>
  <Routes>
    <Route path="/" element={<HomePage />} />
    <Route path="/dashboard" element={<DashboardPage />} />
    <Route path="/create" element={<CreateWalletPage />} />
    {/* ... */}
  </Routes>
</HashRouter>
```

## Navigation API

### Basic Navigation
```typescript
const navigate = useNavigate();

// Navigate to route
navigate("/dashboard");

// Go back
navigate(-1);

// Replace current history entry
navigate("/login", { replace: true });
```

### Link Component (if needed)
```typescript
import { Link } from "react-router-dom";

<Link to="/dashboard">Go to Dashboard</Link>
```

## File Structure

```
app/
├── layout.tsx          # Client-only layout with HashRouter wrapper
├── page.tsx            # Main entry point with HashRouter setup
├── pages/              # All page components
│   ├── HomePage.tsx
│   ├── OnboardingPage.tsx
│   ├── CreateWalletPage.tsx
│   ├── ImportWalletPage.tsx
│   ├── CreatePasswordPage.tsx
│   ├── LoginPage.tsx
│   └── DashboardPage.tsx
└── globals.css         # Global styles
```

## Benefits

1. ✅ **No Server Required** - 100% client-side routing
2. ✅ **Chrome Extension Compatible** - Works with `chrome-extension://` protocol
3. ✅ **No RSC Errors** - No server component fetching
4. ✅ **Instant Navigation** - No page reloads, smooth transitions
5. ✅ **Hash URLs** - Works everywhere, no server configuration needed

## Testing

After building:
1. Load extension in Chrome
2. Navigate between pages
3. Verify URLs show hash format: `index.html#/dashboard`
4. Check browser console - no RSC or ChunkLoad errors
5. Test all navigation buttons

## Migration Checklist

- ✅ Installed `react-router-dom`
- ✅ Updated `app/layout.tsx` to client component
- ✅ Created `app/page.tsx` with HashRouter
- ✅ Created all page components in `app/pages/`
- ✅ Replaced `useExtensionRouter` with `useNavigate`
- ✅ Replaced `router.push()` with `navigate()`
- ✅ Replaced `router.back()` with `navigate(-1)`
- ✅ Removed Next.js routing dependencies

## Next.js Configuration

The `next.config.mjs` remains configured for static export:
- ✅ `output: 'export'` - Static HTML generation
- ✅ `trailingSlash: true` - Proper file structure
- ✅ `images: { unoptimized: true }` - Extension compatible

**Note:** Next.js is now only used for:
- Building static HTML/CSS/JS
- TypeScript compilation
- CSS processing (Tailwind)
- **NOT** for routing (React Router handles that)

## Troubleshooting

### Still Getting RSC Errors?
- Verify `app/layout.tsx` has `"use client"` directive
- Check that `app/page.tsx` uses `HashRouter` not `BrowserRouter`
- Ensure all page components are in `app/pages/` directory

### Navigation Not Working?
- Check browser console for errors
- Verify routes are defined in `app/page.tsx`
- Ensure `HashRouter` wraps all routes

### Hash Not Appearing in URL?
- This is normal - hash routing works even if URL doesn't show it
- Check browser DevTools Network tab - should see no failed requests

## Summary

The extension now uses **pure client-side routing** with React Router's HashRouter. All navigation happens instantly via JavaScript without any server requests, making it fully compatible with Chrome Extensions.


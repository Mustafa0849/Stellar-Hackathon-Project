# Routing Cleanup - Complete Next.js to React Router Migration

## Problem

Still getting `Failed to fetch RSC payload` errors because:
1. Old Next.js route files existed in `app/` directory structure
2. `lib/extensionRouter.ts` was importing from `next/navigation`
3. Next.js was trying to process App Router structure

## Solution Applied

### 1. ✅ Deleted Old Route Files
Removed all old Next.js route files that were using `useExtensionRouter`:
- ❌ `app/create/page.tsx` (deleted)
- ❌ `app/import/page.tsx` (deleted)
- ❌ `app/create-password/page.tsx` (deleted)
- ❌ `app/login/page.tsx` (deleted)
- ❌ `app/dashboard/page.tsx` (deleted)
- ❌ `app/onboarding/page.tsx` (deleted)

**Reason:** These were the old Next.js App Router files. We now use React Router with components in `app/pages/`.

### 2. ✅ Deleted extensionRouter.ts
- ❌ `lib/extensionRouter.ts` (deleted)

**Reason:** This file imported from `next/navigation`, causing Next.js to try to compile App Router code. Since we're using React Router's `useNavigate` everywhere, this file is no longer needed.

### 3. ✅ Verified Current Structure
**Current Working Files:**
- ✅ `app/page.tsx` - Main entry with HashRouter
- ✅ `app/layout.tsx` - Client-only layout
- ✅ `app/pages/HomePage.tsx` - Uses `useNavigate`
- ✅ `app/pages/OnboardingPage.tsx` - Uses `useNavigate`
- ✅ `app/pages/CreateWalletPage.tsx` - Uses `useNavigate`
- ✅ `app/pages/ImportWalletPage.tsx` - Uses `useNavigate`
- ✅ `app/pages/CreatePasswordPage.tsx` - Uses `useNavigate`
- ✅ `app/pages/LoginPage.tsx` - Uses `useNavigate`
- ✅ `app/pages/DashboardPage.tsx` - Uses `useNavigate`

## Verification

### No Next.js Routing Imports
```bash
# Search results: NONE FOUND ✅
grep -r "next/link\|next/navigation\|next/router" app/
grep -r "useExtensionRouter" app/
```

### All Pages Use React Router
```bash
# All pages use useNavigate ✅
grep -r "useNavigate" app/pages/
```

## Current Architecture

```
app/
├── layout.tsx          # Client-only, no Next.js routing
├── page.tsx            # HashRouter entry point
├── pages/              # React Router components
│   ├── HomePage.tsx
│   ├── OnboardingPage.tsx
│   ├── CreateWalletPage.tsx
│   ├── ImportWalletPage.tsx
│   ├── CreatePasswordPage.tsx
│   ├── LoginPage.tsx
│   └── DashboardPage.tsx
└── globals.css
```

## Next.js Configuration

The `next.config.mjs` is correctly set for static export:
- ✅ `output: 'export'` - Static HTML only
- ✅ `images: { unoptimized: true }` - No server features
- ✅ `trailingSlash: true` - Proper file structure

**Important:** Next.js is now ONLY used for:
- Building static HTML/CSS/JS bundles
- TypeScript compilation
- CSS processing (Tailwind)
- **NOT** for routing (React Router handles that)

## Why This Fixes RSC Errors

1. **No App Router Structure** - Deleted all `app/*/page.tsx` files that Next.js was trying to process
2. **No Next.js Routing Imports** - Removed `lib/extensionRouter.ts` that imported `next/navigation`
3. **Pure Client-Side Routing** - All navigation uses React Router's HashRouter
4. **No Server Components** - Everything is `"use client"` components

## Testing

After cleanup:
1. Build: `npm run build`
2. Check `out/` directory - should only have:
   - `index.html` (main entry)
   - `pages/` directory (if any)
   - `next/` directory (static assets)
   - `assets/` directory (extracted scripts)
3. Load extension in Chrome
4. Verify no RSC errors in console
5. Test all navigation - should work instantly with hash routing

## Summary

✅ **Deleted:** All old Next.js route files  
✅ **Deleted:** `lib/extensionRouter.ts` (Next.js import)  
✅ **Verified:** All pages use React Router  
✅ **Verified:** No Next.js routing imports remain  

The extension should now run as a pure client-side SPA with no RSC payload errors!


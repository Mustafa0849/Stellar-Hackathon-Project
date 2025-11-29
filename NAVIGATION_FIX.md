# Chrome Extension Navigation Fix

## Problem

Chrome Extensions were getting `ERR_FILE_NOT_FOUND` errors when navigating between pages using Next.js `router.push()`. This happens because:

1. Chrome extensions use `chrome-extension://` protocol
2. Next.js static export creates files like `dashboard/index.html`
3. Standard Next.js routing doesn't work with extension protocol

## Solution

Created a custom router hook (`useExtensionRouter`) that:

1. ✅ **Detects Chrome Extension Context** - Checks if running in `chrome-extension://` protocol
2. ✅ **Uses Window Location** - In extensions, uses `window.location.href` instead of Next.js router
3. ✅ **Handles Path Normalization** - Ensures paths have trailing slashes to match Next.js static export structure
4. ✅ **Maintains API Compatibility** - Same API as Next.js `useRouter`, so drop-in replacement

## Implementation

### 1. Custom Router Hook (`lib/extensionRouter.ts`)

```typescript
export function useExtensionRouter() {
  // Detects Chrome extension and uses window.location
  // Falls back to Next.js router in regular web context
}
```

### 2. Updated Next.js Config

- ✅ `trailingSlash: true` - Ensures `/dashboard/` instead of `/dashboard`
- ✅ `skipTrailingSlashRedirect: true` - Prevents redirect issues

### 3. Updated All Navigation Components

Replaced `useRouter` from `next/navigation` with `useExtensionRouter` in:
- ✅ `app/page.tsx` (Landing page)
- ✅ `app/onboarding/page.tsx`
- ✅ `app/create/page.tsx`
- ✅ `app/import/page.tsx`
- ✅ `app/dashboard/page.tsx`
- ✅ `app/create-password/page.tsx`
- ✅ `app/login/page.tsx`

## How It Works

### In Chrome Extension:
```typescript
router.push("/dashboard")
// → window.location.href = "chrome-extension://.../dashboard/index.html"
```

### In Regular Web:
```typescript
router.push("/dashboard")
// → Uses Next.js router (standard behavior)
```

## Path Normalization

The router automatically:
- Adds leading slash if missing: `dashboard` → `/dashboard`
- Adds trailing slash: `/dashboard` → `/dashboard/`
- Appends `index.html`: `/dashboard/` → `/dashboard/index.html`

## Usage

No code changes needed in components - just import the new hook:

```typescript
// Before
import { useRouter } from "next/navigation";
const router = useRouter();

// After
import { useExtensionRouter } from "@/lib/extensionRouter";
const router = useExtensionRouter();

// Usage remains the same
router.push("/dashboard");
router.replace("/login");
```

## Testing

After building:
1. Load extension in Chrome
2. Click navigation buttons
3. Verify pages load without `ERR_FILE_NOT_FOUND` errors
4. Check browser console for any routing errors

## Benefits

1. ✅ **Works in Extensions** - Uses `window.location` for extension protocol
2. ✅ **Works in Web** - Falls back to Next.js router for regular sites
3. ✅ **No Breaking Changes** - Same API, drop-in replacement
4. ✅ **Automatic Detection** - No manual configuration needed

## Troubleshooting

### Still Getting ERR_FILE_NOT_FOUND?

1. **Verify Build Output:**
   ```bash
   ls out/dashboard/index.html  # Should exist
   ```

2. **Check Path Format:**
   - Ensure paths start with `/` (e.g., `/dashboard` not `dashboard`)
   - Router automatically adds trailing slash

3. **Clear Extension Cache:**
   - Remove extension from Chrome
   - Reload extension after rebuild

4. **Check Browser Console:**
   - Look for specific file paths being requested
   - Verify they match the file structure in `out/`

### Navigation Not Working?

- Verify `useExtensionRouter` is imported (not `useRouter` from `next/navigation`)
- Check that `isChromeExtension()` returns `true` in extension context
- Ensure `window.location.origin` is correct

## Related Fixes

This navigation fix works alongside:
- ✅ `_next/` → `next/` folder rename (Chrome blocks `_` prefix)
- ✅ Inline script extraction (CSP compliance)

All fixes run automatically in the build process!


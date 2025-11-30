# Multi-Account Management Implementation Guide

## Overview

This document outlines the implementation of multi-account management and persistent sessions for Nova Wallet.

## Architecture Changes

### 1. Vault Data Structure

The wallet now uses a `Vault` object instead of single account storage:

```typescript
interface Vault {
  accounts: Account[];
  activeAccountIndex: number;
}

interface Account {
  index: number;
  name: string;
  publicKey: string;
  secretKey: string | null;
  mnemonic?: string;
  isReadOnly?: boolean;
}
```

### 2. Storage Structure

- **Encrypted Vault**: Stored in `localStorage` as `nova_encrypted_vault`
  - Contains the entire vault encrypted with user password
  - Format: `{ accounts: [...], activeAccountIndex: 0 }`

- **Session Storage**: Uses `chrome.storage.session` (Manifest V3) or `sessionStorage`
  - Stores decrypted password temporarily for auto-login
  - Expires after 24 hours
  - Cleared on lock

### 3. Key Files

- `lib/vault.ts` - Vault data structures and utilities
- `lib/session.ts` - Session management (persistent login)
- `lib/encryption.ts` - Encryption utilities (updated for vault)
- `store/walletStore.ts` - Zustand store (updated for multi-account)
- `components/AccountDropdown.tsx` - Account switcher UI

## Implementation Status

### ✅ Completed

1. **Vault Data Structures** (`lib/vault.ts`)
   - Account interface
   - Vault interface
   - Utility functions (addAccount, switchAccount, etc.)

2. **Session Management** (`lib/session.ts`)
   - Chrome extension session storage
   - Session expiration (24 hours)
   - Auto-login support

3. **Wallet Store Updates** (`store/walletStore.ts`)
   - Added vault state
   - Added multi-account methods
   - Backward compatibility maintained

4. **Account Dropdown Component** (`components/AccountDropdown.tsx`)
   - Account list display
   - Account switching
   - Create/Import buttons

5. **Dashboard Integration**
   - Account dropdown in header
   - Account switching support

### ⚠️ Pending

1. **Encryption Flow Updates**
   - Update `CreatePasswordPage` to save vault structure
   - Update `LoginPage` to load vault and restore session
   - Migrate existing single-account data to vault format

2. **Import/Create Flow Updates**
   - Update `CreateWalletPage` to add account to vault
   - Update `ImportWalletPage` to add account to vault
   - Handle first account vs. additional accounts

3. **Session Persistence**
   - Auto-login on app init if session exists
   - Session restoration on popup open

4. **Migration Logic**
   - Convert existing single-account data to vault format
   - Handle legacy storage keys

## Next Steps

1. Update `app/pages/CreatePasswordPage.tsx` to encrypt vault structure
2. Update `app/pages/LoginPage.tsx` to decrypt vault and restore session
3. Update `app/pages/CreateWalletPage.tsx` to add to vault
4. Update `app/pages/ImportWalletPage.tsx` to add to vault
5. Add session restoration in `app/page.tsx` (main entry)
6. Add migration utility for existing users

## Testing Checklist

- [ ] Create first account and set password
- [ ] Create additional account
- [ ] Import account (adds to vault)
- [ ] Switch between accounts
- [ ] Session persists after popup close
- [ ] Auto-login works on popup reopen
- [ ] Lock wallet clears session
- [ ] Migration from single-account works


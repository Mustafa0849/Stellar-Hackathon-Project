/**
 * Vault data structures and types for multi-account management
 */

export interface Account {
  index: number;
  name: string;
  publicKey: string;
  secretKey: string | null; // null for read-only accounts
  mnemonic?: string; // Optional, only for accounts created from mnemonic
  isReadOnly?: boolean;
}

export interface Vault {
  accounts: Account[];
  activeAccountIndex: number;
}

/**
 * Create a new empty vault
 */
export function createEmptyVault(): Vault {
  return {
    accounts: [],
    activeAccountIndex: 0,
  };
}

/**
 * Get the active account from a vault
 */
export function getActiveAccount(vault: Vault): Account | null {
  if (vault.accounts.length === 0) return null;
  const account = vault.accounts.find((acc) => acc.index === vault.activeAccountIndex);
  return account || vault.accounts[0] || null;
}

/**
 * Add a new account to the vault
 */
export function addAccountToVault(vault: Vault, account: Omit<Account, "index">): Vault {
  const newIndex = vault.accounts.length > 0 
    ? Math.max(...vault.accounts.map((a) => a.index)) + 1 
    : 0;
  
  const newAccount: Account = {
    ...account,
    index: newIndex,
  };

  return {
    ...vault,
    accounts: [...vault.accounts, newAccount],
    activeAccountIndex: newIndex, // Switch to the new account
  };
}

/**
 * Update an account in the vault
 */
export function updateAccountInVault(vault: Vault, index: number, updates: Partial<Account>): Vault {
  return {
    ...vault,
    accounts: vault.accounts.map((acc) =>
      acc.index === index ? { ...acc, ...updates } : acc
    ),
  };
}

/**
 * Switch active account
 */
export function switchActiveAccount(vault: Vault, index: number): Vault {
  if (!vault.accounts.find((acc) => acc.index === index)) {
    return vault; // Account doesn't exist
  }
  return {
    ...vault,
    activeAccountIndex: index,
  };
}

/**
 * Remove an account from the vault
 */
export function removeAccountFromVault(vault: Vault, index: number): Vault {
  const filteredAccounts = vault.accounts.filter((acc) => acc.index !== index);
  
  // If we removed the active account, switch to the first remaining account
  let newActiveIndex = vault.activeAccountIndex;
  if (vault.activeAccountIndex === index) {
    newActiveIndex = filteredAccounts.length > 0 ? filteredAccounts[0].index : 0;
  }

  return {
    accounts: filteredAccounts,
    activeAccountIndex: newActiveIndex,
  };
}


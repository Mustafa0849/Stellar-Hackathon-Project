import { create } from "zustand";
import { loadAccountDetails } from "@/lib/stellar";
import type { Account } from "stellar-sdk";
import type { Vault, Account as VaultAccount } from "@/lib/vault";
import { addAccountToVault, getActiveAccount } from "@/lib/vault";

/**
 * Balance type from Stellar account
 */
export interface Balance {
  asset_type: string;
  balance: string;
  asset_code?: string;
  asset_issuer?: string;
  limit?: string;
  buying_liabilities?: string;
  selling_liabilities?: string;
}

/**
 * Wallet Store State
 */
interface WalletState {
  // Current active account (for backward compatibility)
  publicKey: string | null;
  secretKey: string | null;
  mnemonic: string | null;
  isConnected: boolean;
  isReadOnly: boolean; // Read-only mode (watch address only)
  balances: Balance[];
  availableXLM: number;
  isLoading: boolean;
  error: string | null;
  
  // Multi-account support
  vault: Vault | null;
  activeAccountIndex: number;
}

/**
 * Wallet Store Actions
 */
interface WalletActions {
  // Legacy methods (for backward compatibility)
  setWallet: (publicKey: string, secretKey: string | null, mnemonic?: string, isReadOnly?: boolean) => void;
  clearWallet: () => void;
  setAccount: (publicKey: string, balances: Balance[]) => void;
  clearAccount: () => void;
  fetchAccountData: (publicKey: string) => Promise<void>;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  
  // New multi-account methods
  setVault: (vault: Vault) => void;
  loadActiveAccount: () => void;
  switchAccount: (index: number) => void;
  createAccount: (name: string, publicKey: string, secretKey: string | null, mnemonic?: string, isReadOnly?: boolean) => void;
  addAccount: (account: Omit<VaultAccount, "index">) => void;
}

type WalletStore = WalletState & WalletActions;

/**
 * Calculate available XLM balance
 * Formula: AvailableXLM = TotalXLM - MinimumReserve
 * MinimumReserve = (2 + SubentryCount) * 0.5 XLM
 * 
 * Subentries include:
 * - Signers (minus 1 for master signer which is free)
 * - Trustlines (non-native balances)
 * - Offers (if available)
 * - Data entries (if available)
 */
function calculateAvailableXLM(account: Account): number {
  const totalXLM = parseFloat(
    (account as any).balances?.find((b: any) => b.asset_type === "native")?.balance || "0"
  );

  // Calculate subentry count
  // Base reserve: 2 (account + master signer)
  // Additional signers (excluding master signer)
  const additionalSigners = Math.max(0, ((account as any).signers?.length || 1) - 1);
  
  // Trustlines (non-native balances)
  const trustlineCount = ((account as any).balances || []).filter(
    (b: any) => b.asset_type !== "native"
  ).length;

  // Data entries - try to get from account if available
  let dataEntryCount = 0;
  try {
    // Account may have data_attr_names() method or similar
    if (typeof (account as any).data_attr_names === "function") {
      dataEntryCount = (account as any).data_attr_names().length;
    }
  } catch {
    // If method doesn't exist, data entries are 0
    dataEntryCount = 0;
  }

  // Subentry count = additional signers + trustlines + data entries
  // Note: Offers are not easily accessible from Account object, so we exclude them
  // This is a conservative estimate
  const subentryCount = additionalSigners + trustlineCount + dataEntryCount;

  // Minimum reserve: (2 + subentryCount) * 0.5 XLM
  const minimumReserve = (2 + subentryCount) * 0.5;
  const availableXLM = totalXLM - minimumReserve;

  // Ensure available balance is not negative
  return Math.max(0, availableXLM);
}

/**
 * Zustand Store for Wallet State Management
 */
export const useWalletStore = create<WalletStore>((set, get) => ({
  // Initial State
  publicKey: null,
  secretKey: null,
  mnemonic: null,
  isConnected: false,
  isReadOnly: false,
  balances: [],
  availableXLM: 0,
  isLoading: false,
  error: null,
  
  // Multi-account support
  vault: null,
  activeAccountIndex: 0,

  // Actions
  setWallet: (publicKey: string, secretKey: string | null, mnemonic?: string, isReadOnly: boolean = false) => {
    // Store in localStorage for persistence (only if not read-only)
    localStorage.setItem("stellar_publicKey", publicKey);
    if (secretKey && !isReadOnly) {
      localStorage.setItem("stellar_secretKey", secretKey);
    }
    if (mnemonic && !isReadOnly) {
      localStorage.setItem("stellar_mnemonic", mnemonic);
    }
    localStorage.setItem("stellar_isReadOnly", isReadOnly.toString());
    
    set({
      publicKey,
      secretKey,
      mnemonic: mnemonic || null,
      isConnected: true,
      isReadOnly,
      error: null,
    });
  },

  clearWallet: () => {
    // Note: We don't clear the encrypted vault here
    // Only clear unencrypted data and in-memory state
    if (typeof window !== "undefined") {
      localStorage.removeItem("stellar_publicKey");
      localStorage.removeItem("stellar_secretKey");
      localStorage.removeItem("stellar_mnemonic");
      localStorage.removeItem("stellar_isReadOnly");
    }
    
    set({
      publicKey: null,
      secretKey: null,
      mnemonic: null,
      isConnected: false,
      isReadOnly: false,
      balances: [],
      availableXLM: 0,
      error: null,
    });
  },
  setAccount: (publicKey: string, balances: Balance[]) => {
    // Calculate available XLM from balances
    const xlmBalance = balances.find((b) => b.asset_type === "native");
    const totalXLM = parseFloat(xlmBalance?.balance || "0");

    // For setAccount, we need to estimate subentries from balances
    // This is a simplified calculation - full calculation requires Account object
    const trustlineCount = balances.filter((b) => b.asset_type !== "native").length;
    const estimatedSubentries = trustlineCount;
    const minimumReserve = (2 + estimatedSubentries) * 0.5;
    const availableXLM = Math.max(0, totalXLM - minimumReserve);

    set({
      publicKey,
      balances,
      availableXLM,
      error: null,
    });
  },

  clearAccount: () => {
    set({
      balances: [],
      availableXLM: 0,
      error: null,
    });
  },

  fetchAccountData: async (publicKey: string) => {
    set({ isLoading: true, error: null });

    try {
      const account = await loadAccountDetails(publicKey);

      // Extract balances from account
      const balances: Balance[] = ((account as any).balances || []).map((balance: any) => ({
        asset_type: balance.asset_type,
        balance: balance.balance,
        asset_code: "asset_code" in balance ? balance.asset_code : undefined,
        asset_issuer: "asset_issuer" in balance ? balance.asset_issuer : undefined,
        limit: "limit" in balance ? balance.limit : undefined,
        buying_liabilities:
          "buying_liabilities" in balance
            ? balance.buying_liabilities
            : undefined,
        selling_liabilities:
          "selling_liabilities" in balance
            ? balance.selling_liabilities
            : undefined,
      }));

      // Calculate available XLM using the full account data
      const availableXLM = calculateAvailableXLM(account);

      set({
        publicKey,
        balances,
        availableXLM,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to fetch account data";

      set({
        isLoading: false,
        error: errorMessage,
        // Keep existing publicKey and balances if they exist
      });
    }
  },

  setLoading: (isLoading: boolean) => {
    set({ isLoading });
  },

  setError: (error: string | null) => {
    set({ error });
  },

  // Multi-account methods
  setVault: (vault: Vault) => {
    set({ vault, activeAccountIndex: vault.activeAccountIndex });
    get().loadActiveAccount();
  },

  loadActiveAccount: () => {
    const { vault } = get();
    if (!vault || vault.accounts.length === 0) return;

    const activeAccount = vault.accounts.find(
      (acc) => acc.index === vault.activeAccountIndex
    ) || vault.accounts[0];

    if (activeAccount) {
      set({
        publicKey: activeAccount.publicKey,
        secretKey: activeAccount.secretKey,
        mnemonic: activeAccount.mnemonic || null,
        isReadOnly: activeAccount.isReadOnly || false,
        isConnected: true,
      });
    }
  },

  switchAccount: (index: number) => {
    const { vault } = get();
    if (!vault) return;

    const account = vault.accounts.find((acc) => acc.index === index);
    if (!account) return;

    const updatedVault: Vault = {
      ...vault,
      activeAccountIndex: index,
    };

    set({ vault: updatedVault, activeAccountIndex: index });
    get().loadActiveAccount();
  },

  createAccount: (name: string, publicKey: string, secretKey: string | null, mnemonic?: string, isReadOnly: boolean = false) => {
    const { vault } = get();
    
    const newVault = vault 
      ? addAccountToVault(vault, { name, publicKey, secretKey, mnemonic, isReadOnly })
      : addAccountToVault({ accounts: [], activeAccountIndex: 0 }, { name, publicKey, secretKey, mnemonic, isReadOnly });

    get().setVault(newVault);
  },

  addAccount: (account: Omit<VaultAccount, "index">) => {
    const { vault } = get();
    
    const newVault = vault 
      ? addAccountToVault(vault, account)
      : addAccountToVault({ accounts: [], activeAccountIndex: 0 }, account);

    get().setVault(newVault);
  },
}));


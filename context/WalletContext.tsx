'use client';

/**
 * WalletContext - React Context for managing wallet state
 * Provides wallet operations and state to all components
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import WalletService, { WalletAccount, Balance, TransferParams } from '@/lib/stellar/walletService';

interface WalletContextType {
  account: WalletAccount | null;
  balances: Balance[];
  isLoading: boolean;
  error: string | null;
  createAccount: () => Promise<void>;
  recoverAccount: (secretKey: string) => Promise<void>;
  refreshBalance: () => Promise<void>;
  transfer: (params: TransferParams) => Promise<string>;
  clearAccount: () => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};

interface WalletProviderProps {
  children: ReactNode;
}

export const WalletProvider: React.FC<WalletProviderProps> = ({ children }) => {
  const [account, setAccount] = useState<WalletAccount | null>(null);
  const [balances, setBalances] = useState<Balance[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const walletService = WalletService.getInstance();

  // Initialize wallet service on mount
  useEffect(() => {
    const initialize = async () => {
      try {
        await walletService.init();
      } catch (err: any) {
        setError(err.message || 'Failed to initialize wallet');
      }
    };
    initialize();
  }, []);

  const createAccount = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const newAccount = await walletService.createAccount();
      setAccount(newAccount);
      await refreshBalance();
    } catch (err: any) {
      setError(err.message || 'Failed to create account');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const recoverAccount = async (secretKey: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const recoveredAccount = await walletService.recoverAccount(secretKey);
      setAccount(recoveredAccount);
      await refreshBalance();
    } catch (err: any) {
      setError(err.message || 'Failed to recover account');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const refreshBalance = async () => {
    if (!account) return;
    
    setIsLoading(true);
    setError(null);
    try {
      const accountBalances = await walletService.getBalance(account.publicKey);
      setBalances(accountBalances);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch balance');
    } finally {
      setIsLoading(false);
    }
  };

  const transfer = async (params: TransferParams): Promise<string> => {
    setIsLoading(true);
    setError(null);
    try {
      const txHash = await walletService.transfer(params);
      // Refresh balance after successful transfer
      await refreshBalance();
      return txHash;
    } catch (err: any) {
      setError(err.message || 'Transfer failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const clearAccount = () => {
    walletService.clearAccount();
    setAccount(null);
    setBalances([]);
    setError(null);
  };

  return (
    <WalletContext.Provider
      value={{
        account,
        balances,
        isLoading,
        error,
        createAccount,
        recoverAccount,
        refreshBalance,
        transfer,
        clearAccount,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};


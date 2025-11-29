'use client';

/**
 * ConnectWallet - Component for wallet onboarding
 * Supports both creating new accounts and recovering existing ones
 */

import React, { useState } from 'react';
import { useWallet } from '@/context/WalletContext';

const ConnectWallet: React.FC = () => {
  const { createAccount, recoverAccount, isLoading, error } = useWallet();
  const [showRecover, setShowRecover] = useState(false);
  const [secretKey, setSecretKey] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  const handleCreateAccount = async () => {
    setLocalError(null);
    try {
      await createAccount();
    } catch (err: any) {
      setLocalError(err.message);
    }
  };

  const handleRecoverAccount = async () => {
    setLocalError(null);
    if (!secretKey.trim()) {
      setLocalError('Please enter a secret key');
      return;
    }
    try {
      await recoverAccount(secretKey.trim());
      setSecretKey('');
      setShowRecover(false);
    } catch (err: any) {
      setLocalError(err.message);
    }
  };

  const displayError = error || localError;

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-900 dark:text-white">
          Connect Your Wallet
        </h2>

        {displayError && (
          <div className="mb-4 p-3 bg-red-100 dark:bg-red-900 border border-red-400 text-red-700 dark:text-red-200 rounded">
            {displayError}
          </div>
        )}

        {!showRecover ? (
          <div className="space-y-4">
            <button
              onClick={handleCreateAccount}
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
            >
              {isLoading ? 'Creating Account...' : 'Create New Account'}
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                  OR
                </span>
              </div>
            </div>

            <button
              onClick={() => setShowRecover(true)}
              className="w-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-semibold py-3 px-4 rounded-lg transition-colors"
            >
              Recover Existing Account
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Secret Key
              </label>
              <input
                type="password"
                value={secretKey}
                onChange={(e) => setSecretKey(e.target.value)}
                placeholder="Enter your secret key"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                Your secret key is encrypted and never stored on our servers.
              </p>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={handleRecoverAccount}
                disabled={isLoading || !secretKey.trim()}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
              >
                {isLoading ? 'Recovering...' : 'Recover Account'}
              </button>
              <button
                onClick={() => {
                  setShowRecover(false);
                  setSecretKey('');
                  setLocalError(null);
                }}
                className="flex-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-semibold py-3 px-4 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConnectWallet;


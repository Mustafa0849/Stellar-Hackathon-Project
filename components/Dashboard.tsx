'use client';

/**
 * Dashboard - Main wallet dashboard component
 * Displays balance and provides transfer functionality
 */

import React, { useState, useEffect } from 'react';
import { useWallet } from '@/context/WalletContext';

const Dashboard: React.FC = () => {
  const { account, balances, isLoading, error, refreshBalance, transfer, clearAccount } = useWallet();
  const [destination, setDestination] = useState('');
  const [amount, setAmount] = useState('');
  const [transferError, setTransferError] = useState<string | null>(null);
  const [transferSuccess, setTransferSuccess] = useState<string | null>(null);
  const [isTransferring, setIsTransferring] = useState(false);

  useEffect(() => {
    if (account) {
      refreshBalance();
    }
  }, [account]);

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    setTransferError(null);
    setTransferSuccess(null);

    if (!destination.trim() || !amount.trim()) {
      setTransferError('Please fill in all fields');
      return;
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setTransferError('Please enter a valid amount');
      return;
    }

    setIsTransferring(true);
    try {
      const txHash = await transfer({
        destination: destination.trim(),
        amount: amount,
      });
      setTransferSuccess(`Transaction successful! Hash: ${txHash}`);
      setDestination('');
      setAmount('');
    } catch (err: any) {
      setTransferError(err.message || 'Transfer failed');
    } finally {
      setIsTransferring(false);
    }
  };

  const formatPublicKey = (key: string) => {
    if (key.length <= 20) return key;
    return `${key.slice(0, 10)}...${key.slice(-10)}`;
  };

  const xlmBalance = balances.find(b => b.asset === 'XLM')?.amount || '0';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Wallet Dashboard
              </h1>
              {account && (
                <p className="text-sm text-gray-600 dark:text-gray-400 font-mono">
                  {formatPublicKey(account.publicKey)}
                </p>
              )}
            </div>
            <button
              onClick={clearAccount}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              Disconnect
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 dark:bg-red-900 border border-red-400 text-red-700 dark:text-red-200 rounded-lg">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Balance Card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Balances
            </h2>
            {isLoading ? (
              <div className="text-gray-500 dark:text-gray-400">Loading...</div>
            ) : balances.length === 0 ? (
              <div className="text-gray-500 dark:text-gray-400">No balances found</div>
            ) : (
              <div className="space-y-3">
                {balances.map((balance, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <span className="font-medium text-gray-900 dark:text-white">
                      {balance.asset}
                    </span>
                    <span className="text-lg font-bold text-gray-900 dark:text-white">
                      {parseFloat(balance.amount).toFixed(7)}
                    </span>
                  </div>
                ))}
              </div>
            )}
            <button
              onClick={refreshBalance}
              disabled={isLoading}
              className="mt-4 w-full px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg transition-colors disabled:opacity-50"
            >
              Refresh Balance
            </button>
          </div>

          {/* Transfer Card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Send XLM
            </h2>
            <form onSubmit={handleTransfer} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Destination Address
                </label>
                <input
                  type="text"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="G..."
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white font-mono text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Amount (XLM)
                </label>
                <input
                  type="number"
                  step="0.0000001"
                  min="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.0000000"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Available: {parseFloat(xlmBalance).toFixed(7)} XLM
                </p>
              </div>

              {transferError && (
                <div className="p-3 bg-red-100 dark:bg-red-900 border border-red-400 text-red-700 dark:text-red-200 rounded">
                  {transferError}
                </div>
              )}

              {transferSuccess && (
                <div className="p-3 bg-green-100 dark:bg-green-900 border border-green-400 text-green-700 dark:text-green-200 rounded">
                  {transferSuccess}
                </div>
              )}

              <button
                type="submit"
                disabled={isTransferring || isLoading || parseFloat(xlmBalance) === 0}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
              >
                {isTransferring ? 'Sending...' : 'Send Transaction'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;


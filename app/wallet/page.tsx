'use client';

import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { motion } from 'framer-motion';
import { useWallet } from '@/context/WalletContext';
import { Copy, Check } from 'lucide-react';
import { useState } from 'react';

export default function WalletPage() {
  const { account } = useWallet();
  const [copied, setCopied] = useState(false);

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  if (!account) {
    return null;
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-6 sm:px-8 py-8 sm:py-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">My Wallet Details</h1>
          <p className="text-slate-400">View and manage your wallet information</p>
        </motion.div>

        <div className="grid gap-6">
          {/* Public Key Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="rounded-3xl glass border border-white/5 p-6"
          >
            <h2 className="text-lg font-semibold text-white mb-4">Public Key</h2>
            <div className="flex items-center gap-3">
              <code className="flex-1 px-4 py-3 bg-slate-800/50 rounded-xl text-slate-300 font-mono text-sm break-all">
                {account.publicKey}
              </code>
              <button
                onClick={() => handleCopy(account.publicKey)}
                className="px-4 py-3 bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 hover:border-teal-500/50 rounded-xl transition-all duration-300"
              >
                {copied ? (
                  <Check className="w-5 h-5 text-green-400" />
                ) : (
                  <Copy className="w-5 h-5 text-slate-400" />
                )}
              </button>
            </div>
          </motion.div>

          {/* Wallet Info Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="rounded-3xl glass border border-white/5 p-6"
          >
            <h2 className="text-lg font-semibold text-white mb-4">Wallet Information</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Network</span>
                <span className="text-white font-medium">Stellar Testnet</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Account Type</span>
                <span className="text-white font-medium">Standard</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Status</span>
                <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm font-medium">
                  Active
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
}


'use client';

/**
 * ConnectWallet - Premium "Midnight & Aurora" design
 * High-end Fintech wallet onboarding screen
 */

import React, { useState } from 'react';
import { useWallet } from '@/context/WalletContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet, KeyRound, Sparkles, ArrowLeft } from 'lucide-react';

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
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
      {/* Animated background gradient mesh */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 opacity-50"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(56,189,248,0.1),transparent_50%)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(139,92,246,0.1),transparent_50%)]"></div>

      {/* Main Card Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Glassmorphism Card */}
        <div className="relative rounded-3xl backdrop-blur-md bg-gradient-to-br from-slate-900/80 via-slate-800/60 to-indigo-900/40 border border-slate-700/50 shadow-2xl overflow-hidden">
          {/* Subtle inner glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 via-transparent to-purple-500/5 pointer-events-none"></div>
          
          {/* Content */}
          <div className="relative z-10 p-8 sm:p-10">
            {/* Header with gradient text */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-center mb-8"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-400/20 to-purple-500/20 border border-teal-500/30 mb-4">
                <Wallet className="w-8 h-8 text-teal-400" />
              </div>
              <h2 className="text-4xl sm:text-5xl font-bold mb-2 bg-gradient-to-r from-white via-teal-200 to-purple-200 bg-clip-text text-transparent">
                Connect Your Wallet
              </h2>
              <p className="text-slate-400 text-sm mt-2">
                Secure, decentralized, and yours
              </p>
            </motion.div>

            {/* Error Message */}
            <AnimatePresence>
              {displayError && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl"
                >
                  <p className="text-red-400 text-sm text-center">{displayError}</p>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence mode="wait">
              {!showRecover ? (
                <motion.div
                  key="create"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-5"
                >
                  {/* Primary Button - Create New Account */}
                  <motion.button
                    onClick={handleCreateAccount}
                    disabled={isLoading}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full relative group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-teal-400 via-teal-500 to-purple-500 rounded-full blur-lg opacity-50 group-hover:opacity-75 transition-opacity"></div>
                    <div className="relative bg-gradient-to-r from-teal-400 to-purple-500 hover:from-teal-500 hover:to-purple-600 disabled:from-slate-600 disabled:to-slate-700 text-white font-bold py-4 px-6 rounded-full transition-all duration-300 flex items-center justify-center gap-3 shadow-lg shadow-teal-500/20">
                      {isLoading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          <span>Creating Account...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-5 h-5" />
                          <span>Create New Account</span>
                        </>
                      )}
                    </div>
                  </motion.button>

                  {/* OR Divider */}
                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-slate-700/50"></div>
                    </div>
                    <div className="relative flex justify-center">
                      <span className="px-4 bg-slate-900/60 text-slate-500 text-sm font-medium">
                        OR
                      </span>
                    </div>
                  </div>

                  {/* Secondary Button - Recover Account */}
                  <motion.button
                    onClick={() => setShowRecover(true)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full bg-slate-800/50 hover:bg-slate-800/70 border-2 border-slate-600 hover:border-teal-400/50 text-slate-200 hover:text-white font-semibold py-4 px-6 rounded-full transition-all duration-300 flex items-center justify-center gap-3"
                  >
                    <KeyRound className="w-5 h-5" />
                    <span>Recover Existing Account</span>
                  </motion.button>
                </motion.div>
              ) : (
                <motion.div
                  key="recover"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-5"
                >
                  {/* Back Button */}
                  <button
                    onClick={() => {
                      setShowRecover(false);
                      setSecretKey('');
                      setLocalError(null);
                    }}
                    className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span className="text-sm">Back</span>
                  </button>

                  {/* Secret Key Input */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-3">
                      Secret Key
                    </label>
                    <input
                      type="password"
                      value={secretKey}
                      onChange={(e) => setSecretKey(e.target.value)}
                      placeholder="Enter your secret key"
                      className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 hover:border-slate-600 focus:border-teal-500/50 rounded-2xl focus:ring-2 focus:ring-teal-500/20 focus:outline-none text-white placeholder-slate-500 transition-all duration-300"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && secretKey.trim() && !isLoading) {
                          handleRecoverAccount();
                        }
                      }}
                    />
                    <p className="mt-3 text-xs text-slate-500 text-center">
                      Your secret key is encrypted and never stored on our servers.
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-2">
                    <motion.button
                      onClick={handleRecoverAccount}
                      disabled={isLoading || !secretKey.trim()}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex-1 bg-gradient-to-r from-teal-400 to-purple-500 hover:from-teal-500 hover:to-purple-600 disabled:from-slate-600 disabled:to-slate-700 text-white font-bold py-3 px-6 rounded-full transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-teal-500/20"
                    >
                      {isLoading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          <span>Recovering...</span>
                        </>
                      ) : (
                        <>
                          <KeyRound className="w-4 h-4" />
                          <span>Recover Account</span>
                        </>
                      )}
                    </motion.button>
                    <motion.button
                      onClick={() => {
                        setShowRecover(false);
                        setSecretKey('');
                        setLocalError(null);
                      }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex-1 bg-slate-800/50 hover:bg-slate-800/70 border-2 border-slate-600 hover:border-slate-500 text-slate-200 hover:text-white font-semibold py-3 px-6 rounded-full transition-all duration-300"
                    >
                      Cancel
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ConnectWallet;

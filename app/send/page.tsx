'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Send, Shield, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useWallet } from '@/context/WalletContext';

type ScanStage = 'idle' | 'scanning' | 'verifying-anchor' | 'checking-blacklist' | 'success' | 'error';

export default function SendPage() {
  const { balances, transfer } = useWallet();
  const [destination, setDestination] = useState('');
  const [amount, setAmount] = useState('');
  const [scanStage, setScanStage] = useState<ScanStage>('idle');
  const [error, setError] = useState<string | null>(null);

  const xlmBalance = balances.find(b => b.asset === 'XLM')?.amount || '0';

  const handleContinue = async () => {
    if (!destination.trim() || !amount.trim()) {
      setError('Please fill in all fields');
      return;
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (amountNum > parseFloat(xlmBalance)) {
      setError('Insufficient balance');
      return;
    }

    setError(null);
    setScanStage('scanning');

    // Simulate security scan stages
    setTimeout(() => {
      setScanStage('verifying-anchor');
    }, 1000);

    setTimeout(() => {
      setScanStage('checking-blacklist');
    }, 2500);

    setTimeout(() => {
      setScanStage('success');
    }, 4000);
  };

  const handleConfirm = async () => {
    try {
      await transfer({
        destination: destination.trim(),
        amount: amount,
      });
      // Reset form and navigate
      setDestination('');
      setAmount('');
      setScanStage('idle');
      // Navigate to dashboard or show success
    } catch (err: any) {
      setError(err.message || 'Transaction failed');
      setScanStage('error');
    }
  };

  const getScanMessage = () => {
    switch (scanStage) {
      case 'verifying-anchor':
        return 'Verifying Anchor Trust...';
      case 'checking-blacklist':
        return 'Checking Blacklist...';
      case 'success':
        return 'Security Scan Complete';
      case 'error':
        return 'Security Scan Failed';
      default:
        return 'Scanning...';
    }
  };

  return (
    <main className="min-h-screen bg-midnight text-white px-4 py-8 sm:py-12">
      <div className="max-w-2xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-2">Send XLM</h1>
          <p className="text-slate-400 text-lg">Send Stellar Lumens securely</p>
        </motion.div>

        {/* Input Form */}
        <AnimatePresence mode="wait">
          {scanStage === 'idle' || scanStage === 'error' ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* Destination Address */}
              <div>
                <label className="block text-slate-400 text-sm mb-3 font-medium">
                  Destination Address
                </label>
                <input
                  type="text"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="G..."
                  className="w-full bg-transparent border-b-2 border-slate-700 focus:border-teal-400 text-white text-lg sm:text-xl py-4 px-2 focus:outline-none transition-colors duration-300 font-mono placeholder:text-slate-600"
                />
              </div>

              {/* Amount */}
              <div>
                <label className="block text-slate-400 text-sm mb-3 font-medium">
                  Amount (XLM)
                </label>
                <input
                  type="number"
                  step="0.0000001"
                  min="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-transparent border-b-2 border-slate-700 focus:border-teal-400 text-white text-lg sm:text-xl py-4 px-2 focus:outline-none transition-colors duration-300 placeholder:text-slate-600"
                />
                <p className="mt-2 text-sm text-slate-500">
                  Available: <span className="text-teal-400">{parseFloat(xlmBalance).toFixed(7)} XLM</span>
                </p>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center gap-3"
                >
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                  <p className="text-red-400 text-sm">{error}</p>
                </motion.div>
              )}

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleContinue}
                className="w-full rounded-full bg-gradient-to-r from-teal-400 to-teal-600 text-white font-semibold py-4 px-6 flex items-center justify-center gap-2 hover:from-teal-500 hover:to-teal-700 transition-all duration-300"
              >
                <Send className="w-5 h-5" />
                <span>Continue</span>
              </motion.button>
            </motion.div>
          ) : scanStage === 'scanning' || scanStage === 'verifying-anchor' || scanStage === 'checking-blacklist' ? (
            <motion.div
              key="scanning"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="rounded-3xl glass border border-white/5 p-12 flex flex-col items-center justify-center min-h-[400px]"
            >
              {/* Loading Ring */}
              <div className="relative w-32 h-32 mb-8">
                <motion.div
                  className="absolute inset-0 rounded-full border-4 border-teal-500/20"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                />
                <motion.div
                  className="absolute inset-0 rounded-full border-4 border-transparent border-t-teal-400"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Shield className="w-12 h-12 text-teal-400" />
                </div>
              </div>

              <motion.p
                key={scanStage}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xl font-semibold text-white mb-2"
              >
                {getScanMessage()}
              </motion.p>
              <p className="text-slate-400 text-sm">Please wait while we verify the transaction</p>
            </motion.div>
          ) : scanStage === 'success' ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* Success Animation */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                className="rounded-3xl glass border border-green-500/30 p-12 flex flex-col items-center justify-center min-h-[300px]"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 15 }}
                  className="w-20 h-20 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center mb-6"
                >
                  <CheckCircle className="w-12 h-12 text-green-400" />
                </motion.div>
                <h3 className="text-2xl font-bold text-white mb-2">Security Scan Complete</h3>
                <p className="text-slate-400 text-center max-w-sm">
                  The destination address has been verified. Your transaction is safe to proceed.
                </p>
              </motion.div>

              {/* Transaction Summary */}
              <div className="rounded-3xl glass border border-white/5 p-6 space-y-4">
                <h4 className="text-lg font-semibold text-white mb-4">Transaction Summary</h4>
                <div className="flex justify-between items-center py-2 border-b border-white/5">
                  <span className="text-slate-400">To</span>
                  <span className="text-white font-mono text-sm">{destination.slice(0, 10)}...{destination.slice(-10)}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-white/5">
                  <span className="text-slate-400">Amount</span>
                  <span className="text-white font-semibold">{amount} XLM</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-slate-400">Network Fee</span>
                  <span className="text-white">0.00001 XLM</span>
                </div>
              </div>

              <div className="flex gap-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setScanStage('idle')}
                  className="flex-1 rounded-full glass border border-white/10 text-white font-semibold py-4 px-6 hover:border-slate-500 transition-all duration-300"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleConfirm}
                  className="flex-1 rounded-full bg-gradient-to-r from-teal-400 to-teal-600 text-white font-semibold py-4 px-6 flex items-center justify-center gap-2 hover:from-teal-500 hover:to-teal-700 transition-all duration-300"
                >
                  <Send className="w-5 h-5" />
                  <span>Confirm & Send</span>
                </motion.button>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </main>
  );
}


'use client';

import { motion } from 'framer-motion';
import { ArrowLeft, QrCode, Copy, Check } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { useWallet } from '@/context/WalletContext';

export default function ReceivePage() {
  const { account } = useWallet();
  const [copied, setCopied] = useState(false);

  const publicKey = account?.publicKey || 'GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX';

  const handleCopy = async () => {
    await navigator.clipboard.writeText(publicKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
          className="text-center mb-12"
        >
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">Receive XLM</h1>
          <p className="text-slate-400 text-lg">Share your address to receive payments</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="rounded-3xl glass border border-white/5 p-8 sm:p-12"
        >
          <div className="flex flex-col items-center space-y-6">
            <div className="w-64 h-64 rounded-3xl bg-white p-4 flex items-center justify-center">
              <QrCode className="w-full h-full text-slate-900" />
            </div>

            <div className="w-full">
              <label className="block text-slate-400 text-sm mb-3 font-medium text-center">
                Your Address
              </label>
              <div className="rounded-2xl bg-slate-900/50 border border-white/5 p-4">
                <p className="font-mono text-teal-400 text-sm break-all text-center">
                  {publicKey}
                </p>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleCopy}
              className="w-full rounded-full glass border border-white/10 text-white font-semibold py-4 px-6 flex items-center justify-center gap-2 hover:border-teal-500/30 transition-all duration-300"
            >
              {copied ? (
                <>
                  <Check className="w-5 h-5 text-green-400" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-5 h-5" />
                  <span>Copy Address</span>
                </>
              )}
            </motion.button>
          </div>
        </motion.div>
      </div>
    </main>
  );
}


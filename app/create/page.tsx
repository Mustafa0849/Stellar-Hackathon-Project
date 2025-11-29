'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Copy, Check, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function CreateWallet() {
  const [isRevealed, setIsRevealed] = useState(false);
  const [isHolding, setIsHolding] = useState(false);
  const [copied, setCopied] = useState(false);
  const router = useRouter();

  // Mock secret key - replace with actual key generation later
  const secretKey = 'SXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX';

  const handleReveal = () => {
    setIsHolding(true);
    setTimeout(() => {
      setIsRevealed(true);
      setIsHolding(false);
    }, 500);
  };

  const handleRelease = () => {
    setIsHolding(false);
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(secretKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <main className="min-h-screen bg-midnight text-white flex items-center justify-center px-4 py-12">
      <div className="max-w-2xl w-full">
        <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">Create Wallet</h1>
          <p className="text-slate-400 text-lg">Your secret key is your master key. Keep it safe.</p>
        </motion.div>

        {/* Secret Key Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="relative rounded-3xl p-8 sm:p-12 glass border border-white/5 overflow-hidden"
        >
          <div className="relative">
            {/* Secret Key Display */}
            <div className="mb-6">
              <label className="block text-slate-400 text-sm mb-3 font-medium">Secret Key</label>
              <div className="relative">
                <div className="rounded-2xl bg-slate-900/50 border border-white/5 p-6 min-h-[120px] flex items-center justify-center">
                  <AnimatePresence mode="wait">
                    {!isRevealed ? (
                      <motion.div
                        key="hidden"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="text-center"
                      >
                        <div className="flex items-center justify-center gap-2 mb-4">
                          <EyeOff className="w-6 h-6 text-slate-500" />
                        </div>
                        <p className="text-slate-500 text-sm">Secret key is hidden</p>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="revealed"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="w-full"
                      >
                        <p className="font-mono text-teal-400 text-sm sm:text-base break-all text-left">
                          {secretKey}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Frosted Glass Overlay */}
                <AnimatePresence>
                  {!isRevealed && (
                    <motion.div
                      initial={{ opacity: 1, backdropFilter: 'blur(20px)' }}
                      animate={{ 
                        opacity: isHolding ? 0.3 : 1,
                        backdropFilter: isHolding ? 'blur(5px)' : 'blur(20px)'
                      }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 rounded-2xl bg-slate-950/80 backdrop-blur-xl flex items-center justify-center pointer-events-none"
                    >
                      <div className="text-center">
                        <Eye className="w-8 h-8 text-slate-400 mb-2" />
                        <p className="text-slate-400 text-sm">Hold to reveal</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              {!isRevealed ? (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onMouseDown={handleReveal}
                  onMouseUp={handleRelease}
                  onMouseLeave={handleRelease}
                  onTouchStart={handleReveal}
                  onTouchEnd={handleRelease}
                  className="flex-1 rounded-full bg-gradient-to-r from-teal-400 to-teal-600 text-white font-semibold py-4 px-6 flex items-center justify-center gap-2 hover:from-teal-500 hover:to-teal-700 transition-all duration-300"
                >
                  <Eye className="w-5 h-5" />
                  <span>Hold to Reveal</span>
                </motion.button>
              ) : (
                <>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleCopy}
                    className="flex-1 rounded-full glass border border-white/10 text-white font-semibold py-4 px-6 flex items-center justify-center gap-2 hover:border-teal-500/30 transition-all duration-300"
                  >
                    {copied ? (
                      <>
                        <Check className="w-5 h-5 text-green-400" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-5 h-5" />
                        <span>Copy Key</span>
                      </>
                    )}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => router.push('/')}
                    className="flex-1 rounded-full bg-gradient-to-r from-teal-400 to-teal-600 text-white font-semibold py-4 px-6 hover:from-teal-500 hover:to-teal-700 transition-all duration-300"
                  >
                    Continue to Wallet
                  </motion.button>
                </>
              )}
            </div>

            {/* Warning */}
            <div className="mt-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/20">
              <p className="text-red-400 text-sm text-center">
                ⚠️ Never share your secret key. Anyone with this key can access your wallet.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </main>
  );
}


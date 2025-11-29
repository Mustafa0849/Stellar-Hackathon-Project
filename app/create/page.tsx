<<<<<<< HEAD
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

=======
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { generateMnemonic, getKeypairFromMnemonic } from "@/lib/stellar";
import { useWalletStore } from "@/store/walletStore";
import { ArrowLeft, Copy, Check, ArrowRight } from "lucide-react";

type Phase = "display" | "verify";

export default function CreateWalletPage() {
  const router = useRouter();
  const setWallet = useWalletStore((state) => state.setWallet);
  
  const [phase, setPhase] = useState<Phase>("display");
  const [mnemonic, setMnemonic] = useState<string>("");
  const [mnemonicWords, setMnemonicWords] = useState<string[]>([]);
  const [verificationIndices, setVerificationIndices] = useState<number[]>([]);
  const [verificationInputs, setVerificationInputs] = useState<{ [key: number]: string }>({});
  const [isSaved, setIsSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [verificationError, setVerificationError] = useState<string | null>(null);

  // Generate mnemonic on mount
  useEffect(() => {
    const mnemonicPhrase = generateMnemonic();
    setMnemonic(mnemonicPhrase);
    setMnemonicWords(mnemonicPhrase.split(" "));
  }, []);

  // Generate random verification indices when entering verification phase
  const generateVerificationIndices = () => {
    const indices: number[] = [];
    while (indices.length < 3) {
      const randomIndex = Math.floor(Math.random() * 24);
      if (!indices.includes(randomIndex)) {
        indices.push(randomIndex);
      }
    }
    indices.sort((a, b) => a - b); // Sort for better UX
    setVerificationIndices(indices);
    setVerificationInputs({});
    setVerificationError(null);
  };

  const handleCopyMnemonic = async () => {
    if (!mnemonic) return;

    try {
      await navigator.clipboard.writeText(mnemonic);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleNextToVerification = () => {
    if (!isSaved) {
      alert("Please confirm that you have saved your recovery phrase before proceeding.");
      return;
    }
    generateVerificationIndices();
    setPhase("verify");
  };

  const handleBackToDisplay = () => {
    setPhase("display");
    setVerificationError(null);
    setVerificationInputs({});
  };

  const handleVerificationInputChange = (index: number, value: string) => {
    setVerificationInputs((prev) => ({
      ...prev,
      [index]: value,
    }));
    setVerificationError(null); // Clear error when user types
  };

  const handleVerifyAndCreate = () => {
    if (!mnemonic || mnemonicWords.length === 0) return;

    // Validate all 3 words are entered
    const allEntered = verificationIndices.every((index) => {
      const input = verificationInputs[index]?.trim();
      return input && input.length > 0;
    });

    if (!allEntered) {
      setVerificationError("Please enter all verification words");
      return;
    }

    // Check if inputs match (case-insensitive, trimmed)
    const allMatch = verificationIndices.every((index) => {
      const expectedWord = mnemonicWords[index].toLowerCase().trim();
      const inputWord = verificationInputs[index]?.toLowerCase().trim();
      return expectedWord === inputWord;
    });

    if (!allMatch) {
      setVerificationError("Incorrect words, please try again");
      return;
    }

    // Verification passed - create wallet and redirect
    try {
      const { publicKey, secretKey } = getKeypairFromMnemonic(mnemonic);
      setWallet(publicKey, secretKey, mnemonic);
      router.push("/dashboard");
    } catch (error) {
      console.error("Failed to create wallet:", error);
      setVerificationError("Failed to create wallet. Please try again.");
    }
  };

  // Display Phase
  if (phase === "display") {
    return (
      <div className="min-h-screen bg-slate-950 p-4">
        <div className="max-w-3xl mx-auto space-y-6">
          <button
            onClick={() => router.back()}
            className="flex items-center space-x-2 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>

          <div className="bg-slate-900 rounded-2xl p-8 border border-slate-800 shadow-xl">
            <h1 className="text-3xl font-bold mb-2 text-white">Create New Wallet</h1>
            <p className="text-slate-400 mb-8">
              Save these 24 words in the exact order shown. They are the only way to recover your wallet.
            </p>

            {/* Mnemonic Grid */}
            <div className="mb-6">
              <div className="grid grid-cols-4 gap-3 mb-4">
                {mnemonicWords.map((word, index) => (
                  <div
                    key={index}
                    className="bg-slate-800 rounded-lg p-3 border border-slate-700 flex items-center space-x-2"
                  >
                    <span className="text-xs text-slate-500 font-mono w-6">
                      {index + 1}.
                    </span>
                    <span className="text-slate-200 font-medium flex-1">
                      {word}
                    </span>
                  </div>
                ))}
              </div>
              <button
                onClick={handleCopyMnemonic}
                className="flex items-center space-x-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-green-400" />
                    <span className="text-green-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copy All Words</span>
                  </>
                )}
              </button>
            </div>

            {/* Save Confirmation Checkbox */}
            <div className="mb-6">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isSaved}
                  onChange={(e) => setIsSaved(e.target.checked)}
                  className="w-5 h-5 rounded border-slate-600 bg-slate-800 text-blue-600 focus:ring-blue-500 focus:ring-2"
                />
                <span className="text-slate-300">
                  I have saved my recovery phrase securely
                </span>
              </label>
            </div>

            {/* Next: Verify Phrase Button */}
            <button
              onClick={handleNextToVerification}
              disabled={!isSaved || !mnemonic}
              className="w-full px-6 py-4 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:cursor-not-allowed disabled:text-slate-500 text-white font-semibold rounded-lg transition-colors duration-200 shadow-lg flex items-center justify-center space-x-2"
            >
              <span>Next: Verify Phrase</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>

          {/* Warning Card */}
          <div className="bg-amber-900/20 border border-amber-800 rounded-lg p-4">
            <p className="text-sm text-amber-200">
              <strong className="font-semibold">Warning:</strong> If you lose your
              recovery phrase, you will lose access to your wallet permanently. There is
              no way to recover it. Never share your recovery phrase with anyone.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Verification Phase
  return (
    <div className="min-h-screen bg-slate-950 p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <button
          onClick={handleBackToDisplay}
          className="flex items-center space-x-2 text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <div className="bg-slate-900 rounded-2xl p-8 border border-slate-800 shadow-xl">
          <h1 className="text-3xl font-bold mb-2 text-white">
            Verify your Recovery Phrase
          </h1>
          <p className="text-slate-400 mb-8">
            Please enter the words at the positions shown below to verify you have saved your recovery phrase correctly.
          </p>

          {/* Verification Inputs */}
          <div className="space-y-4 mb-6">
            {verificationIndices.map((index) => (
              <div key={index}>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Word #{index + 1}
                </label>
                <input
                  type="text"
                  value={verificationInputs[index] || ""}
                  onChange={(e) =>
                    handleVerificationInputChange(index, e.target.value)
                  }
                  placeholder={`Enter word #${index + 1}`}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  autoComplete="off"
                />
              </div>
            ))}
          </div>

          {/* Error Message */}
          {verificationError && (
            <div className="mb-6 bg-red-900/50 border border-red-700 rounded-lg p-4 text-red-200">
              <p>{verificationError}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-4">
            <button
              onClick={handleBackToDisplay}
              className="flex-1 px-6 py-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-lg transition-colors duration-200 border border-slate-700"
            >
              Back
            </button>
            <button
              onClick={handleVerifyAndCreate}
              className="flex-1 px-6 py-4 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg transition-colors duration-200 shadow-lg"
            >
              Verify & Create
            </button>
          </div>
        </div>

        {/* Info Card */}
        <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-4">
          <p className="text-sm text-blue-200">
            <strong className="font-semibold">Tip:</strong> Make sure you have
            written down all 24 words before proceeding. You can go back to view
            them again if needed.
          </p>
        </div>
      </div>
    </div>
  );
}
>>>>>>> 8af063860f0d2dadd53e73ed7d1705cd4787b45b

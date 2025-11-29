"use client";

import { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import { generateMnemonic, getKeypairFromMnemonic } from "@/lib/stellar";
import { useWalletStore } from "@/store/walletStore";
import { ArrowLeft, Copy, Check, ArrowRight } from "lucide-react";

type Phase = "display" | "verify";

export default function CreateWalletPage() {
  const navigate = useNavigate();
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
      setWallet(publicKey, secretKey, mnemonic, false);
      // Redirect to create password page instead of dashboard
      navigate("/create-password");
    } catch (error) {
      console.error("Failed to create wallet:", error);
      setVerificationError("Failed to create wallet. Please try again.");
    }
  };

  // Display Phase
  if (phase === "display") {
    return (
      <div className="w-full h-full bg-slate-950 p-4 overflow-auto">
        <div className="w-full space-y-6">
          <button
            onClick={() => navigate(-1)}
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
    <div className="w-full h-full bg-slate-950 p-4 overflow-auto">
      <div className="w-full space-y-6">
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

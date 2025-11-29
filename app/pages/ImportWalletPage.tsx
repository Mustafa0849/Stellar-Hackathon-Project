"use client";

import { useState } from "react";
import { useNavigate } from 'react-router-dom';
import { importWallet, getKeypairFromMnemonic, isValidPublicKey } from "@/lib/stellar";
import { useWalletStore } from "@/store/walletStore";
import { ArrowLeft, Eye, EyeOff, Key, Eye as EyeIcon } from "lucide-react";

type ImportMode = "full" | "watch";

export default function ImportWalletPage() {
  const navigate = useNavigate();
  const setWallet = useWalletStore((state) => state.setWallet);

  const [mode, setMode] = useState<ImportMode>("full");
  const [input, setInput] = useState("");
  const [showInput, setShowInput] = useState(false);
  const [isMnemonic, setIsMnemonic] = useState(true); // Default to mnemonic (only for full mode)
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleImport = async () => {
    if (!input.trim()) {
      if (mode === "watch") {
        setError("Please enter a Stellar public address");
      } else {
        setError(`Please enter your ${isMnemonic ? "recovery phrase" : "secret key"}`);
      }
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      if (mode === "watch") {
        // Watch Address (Read-Only Mode)
        const publicKey = input.trim();
        
        if (!isValidPublicKey(publicKey)) {
          throw new Error("Invalid Stellar public address. Addresses must start with 'G' and be 56 characters long.");
        }

        // Set wallet in read-only mode (no secret key)
        setWallet(publicKey, null, undefined, true);
        
        // Clear input for security
        setInput("");
        
        // Redirect directly to dashboard (no password needed for read-only)
        navigate("/dashboard");
      } else {
        // Full Access Mode (Recovery Phrase / Private Key)
        if (isMnemonic) {
          // Import from mnemonic
          const { publicKey, secretKey } = getKeypairFromMnemonic(input.trim());
          setWallet(publicKey, secretKey, input.trim(), false);
        } else {
          // Import from secret key
          const wallet = importWallet(input.trim());
          setWallet(wallet.publicKey, wallet.secretKey, undefined, false);
        }
        
        // Clear input for security
        setInput("");
        
        // Redirect to create password page
        navigate("/create-password");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to import wallet";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setInput(e.target.value);
    setError(null); // Clear error when user types
  };

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
          <h1 className="text-3xl font-bold mb-2 text-white">
            Import Wallet
          </h1>
          <p className="text-slate-400 mb-8">
            Choose how you want to import your wallet
          </p>

          {/* Mode Tabs */}
          <div className="mb-6 flex space-x-4">
            <button
              onClick={() => {
                setMode("full");
                setInput("");
                setError(null);
              }}
              className={`flex-1 px-4 py-3 rounded-lg transition-colors flex items-center justify-center space-x-2 ${
                mode === "full"
                  ? "bg-blue-600 text-white"
                  : "bg-slate-800 text-slate-400 hover:bg-slate-700"
              }`}
            >
              <Key className="w-5 h-5" />
              <span>Import Recovery Phrase / Private Key</span>
            </button>
            <button
              onClick={() => {
                setMode("watch");
                setInput("");
                setError(null);
              }}
              className={`flex-1 px-4 py-3 rounded-lg transition-colors flex items-center justify-center space-x-2 ${
                mode === "watch"
                  ? "bg-blue-600 text-white"
                  : "bg-slate-800 text-slate-400 hover:bg-slate-700"
              }`}
            >
              <EyeIcon className="w-5 h-5" />
              <span>Watch Address (Read-Only)</span>
            </button>
          </div>

          {mode === "watch" ? (
            // Watch Address Mode
            <div className="space-y-6">
              <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-4">
                <p className="text-sm text-blue-200">
                  <strong className="font-semibold">Read-Only Mode:</strong> You can view balances
                  and transactions, but cannot send funds or sign transactions.
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Stellar Public Address
                </label>
                <input
                  type="text"
                  value={input}
                  onChange={handleInputChange}
                  placeholder="GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                  autoComplete="off"
                />
                {error && (
                  <p className="mt-2 text-sm text-red-400">{error}</p>
                )}
              </div>

              <button
                onClick={handleImport}
                disabled={isLoading || !input.trim()}
                className="w-full px-6 py-4 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:cursor-not-allowed disabled:text-slate-500 text-white font-semibold rounded-lg transition-colors duration-200 shadow-lg"
              >
                {isLoading ? "Importing..." : "Watch Address"}
              </button>
            </div>
          ) : (
            // Full Access Mode
            <div className="space-y-6">
              {/* Toggle between Mnemonic and Secret Key */}
              <div className="flex space-x-4">
                <button
                  onClick={() => {
                    setIsMnemonic(true);
                    setInput("");
                    setError(null);
                  }}
                  className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
                    isMnemonic
                      ? "bg-blue-600 text-white"
                      : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                  }`}
                >
                  Recovery Phrase
                </button>
                <button
                  onClick={() => {
                    setIsMnemonic(false);
                    setInput("");
                    setError(null);
                  }}
                  className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
                    !isMnemonic
                      ? "bg-blue-600 text-white"
                      : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                  }`}
                >
                  Private Key
                </button>
              </div>

              {/* Input Field */}
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  {isMnemonic ? "Recovery Phrase (24 words)" : "Private Key (Secret Key)"}
                </label>
                <div className="relative">
                  {isMnemonic ? (
                    <textarea
                      value={input}
                      onChange={handleInputChange}
                      placeholder="word1 word2 word3 ... word24"
                      rows={4}
                      className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      autoComplete="off"
                    />
                  ) : (
                    <>
                      <input
                        type={showInput ? "text" : "password"}
                        value={input}
                        onChange={handleInputChange}
                        placeholder="SXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
                        className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                        autoComplete="off"
                      />
                      <button
                        type="button"
                        onClick={() => setShowInput(!showInput)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-slate-200 transition-colors"
                        title={showInput ? "Hide" : "Show"}
                      >
                        {showInput ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </>
                  )}
                </div>
                {error && (
                  <p className="mt-2 text-sm text-red-400">{error}</p>
                )}
              </div>

              {/* Import Button */}
              <button
                onClick={handleImport}
                disabled={isLoading || !input.trim()}
                className="w-full px-6 py-4 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:cursor-not-allowed disabled:text-slate-500 text-white font-semibold rounded-lg transition-colors duration-200 shadow-lg"
              >
                {isLoading ? "Importing..." : "Import Account"}
              </button>
            </div>
          )}
        </div>

        {/* Security Notice */}
        {mode === "full" && (
          <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-4">
            <p className="text-sm text-blue-200">
              <strong className="font-semibold">Security:</strong> Your secret key
              is processed locally and never sent to any server. Make sure you&apos;re
              on a secure device before entering your secret key.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

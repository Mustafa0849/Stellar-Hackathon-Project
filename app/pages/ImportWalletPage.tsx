"use client";

import { useState } from "react";
import { useNavigate } from 'react-router-dom';
import { importWallet, getKeypairFromMnemonic } from "@/lib/stellar";
import { useWalletStore } from "@/store/walletStore";
import { hasEncryptedVault, getEncryptedVault, decryptWalletData, encryptWalletData, storeEncryptedVault } from "@/lib/encryption";
import { getSession } from "@/lib/session";
import { addAccountToVault, type Vault } from "@/lib/vault";
import { ArrowLeft, Eye, EyeOff, Key, FileText } from "lucide-react";

type ImportMode = "mnemonic" | "privateKey";

export default function ImportWalletPage() {
  const navigate = useNavigate();
  const setWallet = useWalletStore((state) => state.setWallet);

  const [mode, setMode] = useState<ImportMode>("mnemonic");
  const [input, setInput] = useState("");
  const [showInput, setShowInput] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleImport = async () => {
    if (!input.trim()) {
      setError(`Please enter your ${mode === "mnemonic" ? "recovery phrase" : "private key"}`);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      let publicKey: string;
      let secretKey: string | null;
      let mnemonic: string | undefined;

      if (mode === "mnemonic") {
        // Import from mnemonic (12 or 24 words)
        const trimmedInput = input.trim();
        
        // Basic validation: check if it looks like a mnemonic (has spaces)
        const wordCount = trimmedInput.split(/\s+/).filter(w => w.length > 0).length;
        if (wordCount !== 12 && wordCount !== 24) {
          throw new Error("Recovery phrase must be 12 or 24 words");
        }
        
        // Import from mnemonic
        const keypair = getKeypairFromMnemonic(trimmedInput);
        publicKey = keypair.publicKey;
        secretKey = keypair.secretKey;
        mnemonic = trimmedInput;
      } else {
        // Import from private key (Secret Key)
        const trimmedInput = input.trim();
        
        // Validate secret key format (starts with 'S', 56 chars)
        if (!trimmedInput.startsWith("S") || trimmedInput.length !== 56) {
          throw new Error("Invalid private key format. Stellar secret keys must start with 'S' and be 56 characters long.");
        }
        
        // Import from secret key
        const wallet = importWallet(trimmedInput);
        publicKey = wallet.publicKey;
        secretKey = wallet.secretKey;
        mnemonic = undefined;
      }
      
      // Check if vault exists (user is adding account to existing vault)
      const session = await getSession();
      if (session && hasEncryptedVault()) {
        try {
          const encryptedVault = getEncryptedVault();
          if (encryptedVault) {
            const decryptedData = await decryptWalletData(encryptedVault, session.password);
            const vault: Vault = JSON.parse(decryptedData);
            
            // Add new account to vault
            const accountNumber = vault.accounts.length + 1;
            const updatedVault = addAccountToVault(vault, {
              name: `Account ${accountNumber}`,
              publicKey,
              secretKey,
              mnemonic,
              isReadOnly: false,
            });
            
            // Re-encrypt and save vault
            const vaultData = JSON.stringify(updatedVault);
            const encryptedData = await encryptWalletData(vaultData, session.password);
            storeEncryptedVault(encryptedData);
            
            // Update store and redirect to dashboard
            const { setVault } = useWalletStore.getState();
            setVault(updatedVault);
            
            // Clear input for security
            setInput("");
            navigate("/dashboard");
            return;
          }
        } catch (err) {
          console.error("Failed to add account to vault:", err);
          // Fall through to password creation flow
        }
      }
      
      // First account or no session - use legacy flow
      setWallet(publicKey, secretKey, mnemonic, false);
      
      // Clear input for security
      setInput("");
      
      // Redirect to create password page
      navigate("/create-password");
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

          {/* Mode Selection Buttons */}
          <div className="mb-6 flex space-x-4">
            <button
              onClick={() => {
                setMode("mnemonic");
                setInput("");
                setError(null);
                setShowInput(false);
              }}
              className={`flex-1 px-4 py-3 rounded-lg transition-colors flex items-center justify-center space-x-2 ${
                mode === "mnemonic"
                  ? "bg-blue-600 text-white"
                  : "bg-slate-800 text-slate-400 hover:bg-slate-700"
              }`}
            >
              <FileText className="w-5 h-5" />
              <span>Recovery Phrase</span>
            </button>
            <button
              onClick={() => {
                setMode("privateKey");
                setInput("");
                setError(null);
                setShowInput(false);
              }}
              className={`flex-1 px-4 py-3 rounded-lg transition-colors flex items-center justify-center space-x-2 ${
                mode === "privateKey"
                  ? "bg-blue-600 text-white"
                  : "bg-slate-800 text-slate-400 hover:bg-slate-700"
              }`}
            >
              <Key className="w-5 h-5" />
              <span>Private Key</span>
            </button>
          </div>

          {/* Import Form */}
          <div className="space-y-6">
            {/* Input Field */}
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                {mode === "mnemonic" 
                  ? "Recovery Phrase (12 or 24 words)" 
                  : "Private Key (Stellar Secret Key)"}
              </label>
              <div className="relative">
                {mode === "mnemonic" ? (
                  <textarea
                    value={input}
                    onChange={handleInputChange}
                    placeholder="Enter your 12 or 24-word recovery phrase"
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
                      placeholder="Paste your Stellar Secret Key (starts with &apos;S&apos;)"
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
              {mode === "mnemonic" && (
                <p className="mt-2 text-xs text-slate-500">
                  Enter your recovery phrase with spaces between words
                </p>
              )}
              {mode === "privateKey" && (
                <p className="mt-2 text-xs text-slate-500">
                  Your secret key starts with &apos;S&apos; and is 56 characters long
                </p>
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
        </div>

        {/* Security Notice */}
        <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-4">
          <p className="text-sm text-blue-200">
            <strong className="font-semibold">Security:</strong> Your {mode === "mnemonic" ? "recovery phrase" : "private key"}
            is processed locally and never sent to any server. Make sure you&apos;re
            on a secure device before entering your {mode === "mnemonic" ? "recovery phrase" : "private key"}.
          </p>
        </div>
      </div>
    </div>
  );
}

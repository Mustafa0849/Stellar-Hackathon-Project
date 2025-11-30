"use client";

import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { useWalletStore } from "@/store/walletStore";
import {
  getEncryptedVault,
  decryptWalletData,
  clearEncryptedVault,
  hasEncryptedVault,
} from "@/lib/encryption";
import { Lock, Eye, EyeOff, AlertTriangle } from "lucide-react";

export default function LoginPage() {
  const navigate = useNavigate();
  const setWallet = useWalletStore((state) => state.setWallet);

  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  // Redirect if no encrypted vault exists
  useEffect(() => {
    if (typeof window !== "undefined") {
      if (!hasEncryptedVault()) {
        navigate("/");
      } else {
        setIsChecking(false);
      }
    }
  }, [navigate]);

  // Don't render if no vault exists (redirect will happen)
  if (isChecking || (typeof window !== "undefined" && !hasEncryptedVault())) {
    return null;
  }

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!password.trim()) {
      setError("Please enter your password");
      return;
    }

    setIsLoading(true);

    try {
      const encryptedVault = getEncryptedVault();
      if (!encryptedVault) {
        setError("No encrypted wallet found");
        setIsLoading(false);
        return;
      }

      // Decrypt wallet data
      const decryptedData = await decryptWalletData(encryptedVault, password);
      const walletData = JSON.parse(decryptedData);

      // Restore wallet to store
      setWallet(
        walletData.publicKey,
        walletData.secretKey,
        walletData.mnemonic || undefined,
        false // Not read-only (encrypted wallet has secret key)
      );

      // Clear password from memory
      setPassword("");

      // Redirect to dashboard
      navigate("/dashboard");
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to unlock wallet";
      setError("Incorrect password. Please try again.");
      setPassword("");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetWallet = () => {
    if (!showResetConfirm) {
      setShowResetConfirm(true);
      return;
    }

    // Clear encrypted vault
    clearEncryptedVault();
    useWalletStore.getState().clearWallet();

    // Redirect to import page
    navigate("/import");
  };

  return (
    <div className="w-full h-full bg-slate-950 p-4 overflow-auto flex items-center justify-center">
      <div className="w-full max-w-md space-y-6">
        <div className="bg-slate-900 rounded-2xl p-8 border border-slate-800 shadow-xl">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
              <Lock className="w-8 h-8 text-white" />
            </div>
          </div>

          <h1 className="text-3xl font-bold mb-2 text-white text-center">
            Welcome Back
          </h1>
          <p className="text-slate-400 mb-8 text-center">
            Enter your password to unlock Nova Wallet
          </p>

          <form onSubmit={handleUnlock} className="space-y-6">
            {/* Password Input */}
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError(null);
                  }}
                  placeholder="Enter your password"
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  autoComplete="current-password"
                  autoFocus
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-slate-200 transition-colors"
                  title={showPassword ? "Hide" : "Show"}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-900/30 border border-red-700 rounded-lg p-4">
                <p className="text-sm text-red-200">{error}</p>
              </div>
            )}

            {/* Unlock Button */}
            <button
              type="submit"
              disabled={isLoading || !password.trim()}
              className="w-full px-6 py-4 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:cursor-not-allowed disabled:text-slate-500 text-white font-semibold rounded-lg transition-colors duration-200 shadow-lg"
            >
              {isLoading ? "Unlocking..." : "Unlock"}
            </button>
          </form>

          {/* Forgot Password Link */}
          <div className="mt-6 pt-6 border-t border-slate-800">
            {!showResetConfirm ? (
              <button
                onClick={handleResetWallet}
                className="w-full text-sm text-slate-400 hover:text-slate-200 transition-colors"
              >
                Forgot Password?
              </button>
            ) : (
              <div className="space-y-4">
                <div className="bg-red-900/30 border border-red-700 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-red-200 mb-2">
                        Warning: Reset Wallet
                      </p>
                      <p className="text-sm text-red-200">
                        This will delete your current wallet data. You will need
                        your original recovery phrase to restore it. This action
                        cannot be undone.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={handleResetWallet}
                    className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-semibold rounded-lg transition-colors"
                  >
                    Confirm Reset
                  </button>
                  <button
                    onClick={() => setShowResetConfirm(false)}
                    className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


"use client";

import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { useWalletStore } from "@/store/walletStore";
import { encryptWalletData, storeEncryptedVault } from "@/lib/encryption";
import { ArrowLeft, Eye, EyeOff, Lock } from "lucide-react";

export default function CreatePasswordPage() {
  const navigate = useNavigate();
  const { publicKey, secretKey, mnemonic } = useWalletStore();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if no wallet data
  useEffect(() => {
    if (!publicKey || !secretKey) {
      navigate("/");
    }
  }, [publicKey, secretKey, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!password.trim()) {
      setError("Please enter a password");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);

    try {
      // Prepare wallet data for encryption
      const walletData = JSON.stringify({
        publicKey,
        secretKey,
        mnemonic: mnemonic || null,
      });

      // Encrypt and store
      const encryptedData = await encryptWalletData(walletData, password);
      storeEncryptedVault(encryptedData);

      // Keep wallet in store (user is already authenticated)
      // Only clear unencrypted localStorage data, not the store
      if (typeof window !== "undefined") {
        localStorage.removeItem("stellar_publicKey");
        localStorage.removeItem("stellar_secretKey");
        localStorage.removeItem("stellar_mnemonic");
      }

      // Redirect directly to dashboard (user is already logged in)
      navigate("/dashboard");
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to create password";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Don't render if no wallet data (redirect will happen via useEffect)
  if (!publicKey || !secretKey) {
    return null;
  }

  return (
    <div className="w-full h-full bg-slate-950 p-4 overflow-auto">
      <div className="w-full max-w-md mx-auto space-y-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2 text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <div className="bg-slate-900 rounded-2xl p-8 border border-slate-800 shadow-xl">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
              <Lock className="w-8 h-8 text-white" />
            </div>
          </div>

          <h1 className="text-3xl font-bold mb-2 text-white text-center">
            Create Password
          </h1>
          <p className="text-slate-400 mb-8 text-center">
            Create a password to protect your wallet. You&apos;ll need this password
            to unlock your wallet each time you open Nova Wallet.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* New Password */}
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError(null);
                  }}
                  placeholder="Enter password (min. 8 characters)"
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  autoComplete="new-password"
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

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setError(null);
                  }}
                  placeholder="Confirm your password"
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  autoComplete="new-password"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-slate-200 transition-colors"
                  title={showConfirmPassword ? "Hide" : "Show"}
                >
                  {showConfirmPassword ? (
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

            {/* Security Notice */}
            <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-4">
              <p className="text-sm text-blue-200">
                <strong className="font-semibold">Important:</strong> If you
                forget this password, you will need your recovery phrase to
                restore your wallet. Make sure to save your recovery phrase in a
                safe place.
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={
                isLoading ||
                !password.trim() ||
                !confirmPassword.trim() ||
                password !== confirmPassword
              }
              className="w-full px-6 py-4 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:cursor-not-allowed disabled:text-slate-500 text-white font-semibold rounded-lg transition-colors duration-200 shadow-lg"
            >
              {isLoading ? "Creating..." : "Create Password & Continue"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}


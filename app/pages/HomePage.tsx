"use client";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { hasEncryptedVault, clearEncryptedVault } from "@/lib/encryption";
import { Wallet, Download, Lock, RotateCcw } from "lucide-react";

export default function HomePage() {
  const navigate = useNavigate();
  const [hasVault, setHasVault] = useState<boolean | null>(null);

  useEffect(() => {
    // Check if encrypted vault exists
    const vaultExists = hasEncryptedVault();
    setHasVault(vaultExists);
  }, []);

  const handleCreateAccount = () => {
    navigate("/create");
  };

  const handleImportAccount = () => {
    navigate("/import");
  };

  const handleUnlockWallet = () => {
    navigate("/login");
  };

  const handleResetWallet = () => {
    // Clear encrypted vault and redirect to import
    clearEncryptedVault();
    navigate("/import");
  };

  // Show loading state while checking
  if (hasVault === null) {
    return (
      <div className="w-full h-full bg-slate-950 flex items-center justify-center">
        <div className="text-slate-400">Loading...</div>
      </div>
    );
  }

  // Landing page - show different buttons based on vault existence
  return (
    <div className="flex flex-col items-center justify-center space-y-6 p-6 h-full w-full overflow-auto bg-slate-950">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">
          Welcome to Caelus Wallet
        </h1>
        <p className="text-slate-400 text-sm">
          Your secure gateway to the Stellar network
        </p>
      </div>

      <div className="w-full space-y-4">
        {hasVault ? (
          // Case A: Wallet exists - show login button and reset link
          <>
            <button
              onClick={handleUnlockWallet}
              className="w-full flex items-center justify-center space-x-3 px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl"
            >
              <Lock className="w-5 h-5" />
              <span>Login</span>
            </button>

            <div className="text-center">
              <button
                onClick={handleResetWallet}
                className="text-sm text-slate-400 hover:text-slate-300 transition-colors underline"
              >
                Reset Wallet
              </button>
            </div>
          </>
        ) : (
          // Case B: No wallet - show create and import options
          <>
            <button
              onClick={handleCreateAccount}
              className="w-full flex items-center justify-center space-x-3 px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl"
            >
              <Wallet className="w-5 h-5" />
              <span>Create New Wallet</span>
            </button>

            <button
              onClick={handleImportAccount}
              className="w-full flex items-center justify-center space-x-3 px-6 py-4 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl"
            >
              <Download className="w-5 h-5" />
              <span>Import Wallet</span>
            </button>
          </>
        )}
      </div>

      <div className="mt-8 text-center">
        <p className="text-xs text-slate-500">
          By continuing, you agree to use Caelus Wallet responsibly
        </p>
      </div>
    </div>
  );
}


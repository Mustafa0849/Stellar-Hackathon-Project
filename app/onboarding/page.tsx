"use client";

import { Wallet, Download } from "lucide-react";
import { useRouter } from "next/navigation";

export default function OnboardingPage() {
  const router = useRouter();

  const handleCreateWallet = () => {
    router.push("/create");
  };

  const handleImportWallet = () => {
    router.push("/import");
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-6 p-8">
      <h1 className="text-3xl font-bold text-center mb-8">
        Welcome to Nova Wallet
      </h1>
      
      <div className="w-full space-y-4">
        <button
          onClick={handleCreateWallet}
          className="w-full flex items-center justify-center space-x-3 px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl"
        >
          <Wallet className="w-5 h-5" />
          <span>Create New Wallet</span>
        </button>

        <button
          onClick={handleImportWallet}
          className="w-full flex items-center justify-center space-x-3 px-6 py-4 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl"
        >
          <Download className="w-5 h-5" />
          <span>Import Existing Wallet</span>
        </button>
      </div>
    </div>
  );
}


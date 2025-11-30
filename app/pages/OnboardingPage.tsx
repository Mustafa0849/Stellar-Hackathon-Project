"use client";

import { Wallet, Download } from "lucide-react";
import { useNavigate } from 'react-router-dom';

export default function OnboardingPage() {
  const navigate = useNavigate();

  const handleCreateWallet = () => {
    navigate("/create");
  };

  const handleImportWallet = () => {
    navigate("/import");
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-6 p-6 h-full w-full overflow-auto">
      <h1 className="text-2xl font-bold text-center mb-6">
        Welcome to Caelus Wallet
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


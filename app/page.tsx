"use client";

import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { hasEncryptedVault } from "@/lib/encryption";

// Import all page components
import HomePage from "./pages/HomePage";
import OnboardingPage from "./pages/OnboardingPage";
import CreateWalletPage from "./pages/CreateWalletPage";
import ImportWalletPage from "./pages/ImportWalletPage";
import CreatePasswordPage from "./pages/CreatePasswordPage";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";

export default function App() {
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    // Small delay to ensure everything is loaded
    setInitialized(true);
  }, []);

  if (!initialized) {
    return (
      <div className="w-full h-full bg-slate-950 flex items-center justify-center">
        <div className="text-slate-400">Loading...</div>
      </div>
    );
  }

  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route path="/create" element={<CreateWalletPage />} />
        <Route path="/import" element={<ImportWalletPage />} />
        <Route path="/create-password" element={<CreatePasswordPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        {/* Catch all - redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
}

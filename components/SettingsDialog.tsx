"use client";

import { useState } from "react";
import { useWalletStore } from "@/store/walletStore";
import { getEncryptedVault, decryptWalletData } from "@/lib/encryption";
import {
  X,
  Settings,
  Shield,
  Network,
  Info,
  Eye,
  EyeOff,
  Copy,
  Check,
  AlertTriangle,
} from "lucide-react";

type SettingsTab = "general" | "security" | "networks" | "about";

interface SettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsDialog({ isOpen, onClose }: SettingsDialogProps) {
  const [activeTab, setActiveTab] = useState<SettingsTab>("general");
  const [currency, setCurrency] = useState("USD");
  const [language, setLanguage] = useState("English");
  const [showSecretKey, setShowSecretKey] = useState(false);
  const [showRevealConfirmation, setShowRevealConfirmation] = useState(false);
  const [password, setPassword] = useState("");
  const [copied, setCopied] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const { secretKey } = useWalletStore();

  const handleRevealSecretKey = () => {
    if (!showRevealConfirmation) {
      setShowRevealConfirmation(true);
      setPasswordError(null);
      return;
    }

    // This will be handled by the async handler
  };

  const handleConfirmAndReveal = async () => {
    if (!password.trim()) {
      setPasswordError("Please enter your password");
      return;
    }

    setIsVerifying(true);
    setPasswordError(null);

    try {
      // Get encrypted vault from localStorage
      const encryptedVault = getEncryptedVault();
      if (!encryptedVault) {
        setPasswordError("No encrypted wallet found");
        setIsVerifying(false);
        return;
      }

      // Attempt to decrypt with the provided password
      // This will throw an error if the password is incorrect
      await decryptWalletData(encryptedVault, password);

      // If decryption succeeds, reveal the secret key
      setShowSecretKey(true);
      setShowRevealConfirmation(false);
      setPassword("");
      setPasswordError(null);
    } catch (err) {
      // Decryption failed - password is incorrect
      setPasswordError("Invalid password. Please try again.");
      setPassword("");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleCopySecretKey = async () => {
    if (!secretKey) return;
    try {
      await navigator.clipboard.writeText(secretKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  if (!isOpen) return null;

  const tabs = [
    { id: "general" as SettingsTab, label: "General", icon: Settings },
    { id: "security" as SettingsTab, label: "Security & Privacy", icon: Shield },
    { id: "networks" as SettingsTab, label: "Networks", icon: Network },
    { id: "about" as SettingsTab, label: "About", icon: Info },
  ];

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-2"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="bg-slate-950 rounded-2xl border border-slate-800 w-full max-w-[356px] max-h-[592px] h-full flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 flex-shrink-0">
          <h2 className="text-xl font-bold text-white">Settings</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex flex-1 overflow-hidden min-h-0">
          {/* Left Sidebar - Tabs */}
          <div className="w-32 bg-slate-900 border-r border-slate-800 p-2 overflow-y-auto flex-shrink-0">
            <nav className="space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex flex-col items-center space-y-1 px-2 py-2 rounded-lg transition-colors ${
                      activeTab === tab.id
                        ? "bg-slate-800 text-white"
                        : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                    }`}
                    title={tab.label}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-xs font-medium text-center leading-tight">{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Right Content Area */}
          <div className="flex-1 overflow-y-auto p-4 min-w-0">
            {/* General Tab */}
            {activeTab === "general" && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-white mb-4">General</h3>

                {/* Currency */}
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">
                    Currency
                  </label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="USD">USD - US Dollar</option>
                    <option value="EUR">EUR - Euro</option>
                    <option value="TRY">TRY - Turkish Lira</option>
                  </select>
                </div>

                {/* Language */}
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">
                    Language
                  </label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="English">English</option>
                    <option value="Turkish">Turkish (Türkçe)</option>
                  </select>
                </div>

                {/* Theme */}
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">
                    Theme
                  </label>
                  <div className="flex items-center justify-between p-4 bg-slate-800 border border-slate-700 rounded-lg">
                    <div>
                      <div className="text-white font-medium">Dark Mode</div>
                      <div className="text-xs text-slate-400">
                        Dark theme is currently enforced
                      </div>
                    </div>
                    <div className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg">
                      Dark
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Security & Privacy Tab */}
            {activeTab === "security" && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-white mb-4">
                  Security & Privacy
                </h3>

                {/* Secret Recovery Phrase - Danger Zone */}
                <div className="border-2 border-red-600/50 bg-red-900/10 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-4">
                    <AlertTriangle className="w-5 h-5 text-red-400" />
                    <h4 className="text-lg font-bold text-red-400">
                      Secret Recovery Phrase
                    </h4>
                  </div>

                  <p className="text-sm text-slate-300 mb-4">
                    Your secret key is the master key to your wallet. Anyone with
                    access to it can control your funds. Never share it with anyone.
                  </p>

                  {!showSecretKey && !showRevealConfirmation && (
                    <button
                      onClick={handleRevealSecretKey}
                      className="px-6 py-3 bg-red-600 hover:bg-red-500 text-white font-semibold rounded-lg transition-colors"
                    >
                      Reveal Secret Key
                    </button>
                  )}

                  {showRevealConfirmation && !showSecretKey && (
                    <div className="space-y-4">
                      <div className="bg-red-900/30 border border-red-700 rounded-lg p-4">
                        <p className="text-sm text-red-200 font-semibold mb-2">
                          ⚠️ Warning
                        </p>
                        <p className="text-sm text-red-200">
                          Are you sure? Anyone with this key can steal your funds.
                          Make sure you&apos;re in a private location and no one can see
                          your screen.
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-slate-300 mb-2">
                          Enter Password to Confirm
                        </label>
                        <input
                          type="password"
                          value={password}
                          onChange={(e) => {
                            setPassword(e.target.value);
                            setPasswordError(null);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && !isVerifying) {
                              handleConfirmAndReveal();
                            }
                          }}
                          placeholder="Enter your wallet password"
                          disabled={isVerifying}
                          className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                        {passwordError && (
                          <p className="mt-2 text-sm text-red-400">{passwordError}</p>
                        )}
                      </div>

                      <div className="flex space-x-3">
                        <button
                          onClick={handleConfirmAndReveal}
                          disabled={isVerifying || !password.trim()}
                          className="px-6 py-3 bg-red-600 hover:bg-red-500 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
                        >
                          {isVerifying ? "Verifying..." : "Confirm & Reveal"}
                        </button>
                        <button
                          onClick={() => {
                            setShowRevealConfirmation(false);
                            setPassword("");
                            setPasswordError(null);
                          }}
                          disabled={isVerifying}
                          className="px-6 py-3 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  {showSecretKey && (
                    <div className="space-y-4">
                      <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                        <div className="flex items-center space-x-2 mb-2">
                          <label className="text-sm font-semibold text-slate-300">
                            Secret Key
                          </label>
                          <button
                            onClick={() => setShowSecretKey(false)}
                            className="ml-auto p-1 text-slate-400 hover:text-white transition-colors"
                            title="Hide"
                          >
                            <EyeOff className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="relative">
                          <code
                            className={`block text-sm font-mono p-3 rounded-lg ${
                              showSecretKey
                                ? "text-slate-200 break-all"
                                : "text-slate-500 blur-sm select-none"
                            }`}
                          >
                            {secretKey || "Not available"}
                          </code>
                          <button
                            onClick={handleCopySecretKey}
                            className="absolute top-3 right-3 p-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg transition-colors"
                            title="Copy"
                          >
                            {copied ? (
                              <Check className="w-4 h-4 text-green-400" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Networks Tab */}
            {activeTab === "networks" && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-white mb-4">Networks</h3>

                {/* Network List */}
                <div className="space-y-2">
                  {/* Stellar Testnet - Active */}
                  <div className="flex items-center justify-between p-3 bg-slate-800 border-2 border-green-600 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <div>
                        <div className="text-white font-semibold">Stellar Testnet</div>
                        <div className="text-xs text-slate-400">
                          https://horizon-testnet.stellar.org
                        </div>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-green-600/20 text-green-400 text-xs font-semibold rounded-full">
                      Active
                    </span>
                  </div>

                  {/* Stellar Mainnet - Inactive */}
                  <div className="flex items-center justify-between p-3 bg-slate-800 border border-slate-700 rounded-lg opacity-50">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-slate-500 rounded-full"></div>
                      <div>
                        <div className="text-white font-semibold">Stellar Mainnet</div>
                        <div className="text-xs text-slate-400">
                          https://horizon.stellar.org
                        </div>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-slate-700 text-slate-400 text-xs font-semibold rounded-full">
                      Coming Soon
                    </span>
                  </div>
                </div>

                {/* Add Custom Network */}
                <button className="w-full px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white text-sm font-semibold rounded-lg transition-colors flex items-center justify-center space-x-2">
                  <span>+</span>
                  <span>Add Custom Network</span>
                </button>
              </div>
            )}

            {/* About Tab */}
            {activeTab === "about" && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-white mb-4">About</h3>

                <div className="space-y-3">
                  <div className="p-4 bg-slate-800 rounded-lg border border-slate-700">
                    <div className="text-xl font-bold text-white mb-1">
                      Caelus Wallet
                    </div>
                    <div className="text-sm text-slate-400">Version 1.0.1</div>
                  </div>

                  <div className="space-y-2">
                    <a
                      href="#"
                      className="block p-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-white text-sm transition-colors"
                      onClick={(e) => {
                        e.preventDefault();
                        alert("Support page coming soon");
                      }}
                    >
                      Support
                    </a>
                    <a
                      href="#"
                      className="block p-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-white text-sm transition-colors"
                      onClick={(e) => {
                        e.preventDefault();
                        alert("Terms of Use page coming soon");
                      }}
                    >
                      Terms of Use
                    </a>
                    <a
                      href="#"
                      className="block p-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-white text-sm transition-colors"
                      onClick={(e) => {
                        e.preventDefault();
                        alert("Privacy Policy page coming soon");
                      }}
                    >
                      Privacy Policy
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


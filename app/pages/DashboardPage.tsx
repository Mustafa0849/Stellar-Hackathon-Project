"use client";

import { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import { useWalletStore } from "@/store/walletStore";
import { sendPayment, fetchRecentTransactions, getTestnetUSDC, type TransactionHistoryItem } from "@/lib/stellar";
import { hasEncryptedVault, clearEncryptedVault } from "@/lib/encryption";
import { clearSession } from "@/lib/session";
import QRCode from "react-qr-code";
import SettingsDialog from "@/components/SettingsDialog";
import AccountDropdown from "@/components/AccountDropdown";
import { Sparklines, SparklinesLine } from "react-sparklines";
import {
  Copy,
  Check,
  Wallet,
  RefreshCw,
  Send,
  QrCode,
  X,
  ArrowUp,
  ArrowDown,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  Settings,
  Eye,
  EyeOff,
  Menu,
  Bell,
  Shield,
  ExternalLink,
  Lock,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Droplet,
} from "lucide-react";

type Tab = "assets" | "activity";

export default function DashboardPage() {
  const navigate = useNavigate();
  const {
    publicKey,
    secretKey,
    balances,
    availableXLM,
    isLoading,
    error,
    isReadOnly,
    fetchAccountData,
    setError,
    vault,
    switchAccount,
  } = useWalletStore();

  const [activeTab, setActiveTab] = useState<Tab>("assets");
  const [copied, setCopied] = useState(false);
  const [showReceive, setShowReceive] = useState(false);
  const [showSend, setShowSend] = useState(false);
  const [sendDestination, setSendDestination] = useState("");
  const [sendAmount, setSendAmount] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [sendSuccess, setSendSuccess] = useState(false);
  const [transactions, setTransactions] = useState<TransactionHistoryItem[]>([]);
  const [loadingTransactions, setLoadingTransactions] = useState(false);
  const [xlmPrice, setXlmPrice] = useState<number | null>(null);
  const [xlm24hChange, setXlm24hChange] = useState<number | null>(null);
  const [sparklineData, setSparklineData] = useState<number[]>([]);
  const [priceError, setPriceError] = useState<string | null>(null);
  const [showSecretKey, setShowSecretKey] = useState(false);
  const [showSecretKeyModal, setShowSecretKeyModal] = useState(false);
  const [addressCopied, setAddressCopied] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<TransactionHistoryItem | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [unreadCount, setUnreadCount] = useState(4); // WhatsApp-style notification count
  const [isAccountCopied, setIsAccountCopied] = useState(false);
  const [showGetUSDC, setShowGetUSDC] = useState(false);
  const [gettingUSDC, setGettingUSDC] = useState(false);
  const [usdcError, setUsdcError] = useState<string | null>(null);
  const [usdcSuccess, setUsdcSuccess] = useState(false);
  
  // Privacy Mode: Hide balance
  const [isBalanceHidden, setIsBalanceHidden] = useState(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("nova_balanceHidden");
      return stored === "true";
    }
    return false;
  });

  // Simple session check - redirect if no public key
  useEffect(() => {
    // Ensure we're in browser environment
    if (typeof window === "undefined") return;

    // If no public key in store, check if we need to redirect to login
    if (!publicKey) {
      // Check for read-only wallet in localStorage
      const storedPublicKey = localStorage.getItem("stellar_publicKey");
      const storedIsReadOnly = localStorage.getItem("stellar_isReadOnly") === "true";
      
      if (storedPublicKey && storedIsReadOnly) {
        // Restore read-only wallet
        const setWallet = useWalletStore.getState().setWallet;
        setWallet(storedPublicKey, null, undefined, true);
        return;
      }
      
      if (hasEncryptedVault()) {
        // Encrypted vault exists but wallet not unlocked - redirect to login
        navigate("/login");
        return;
      } else {
        // No vault, redirect to landing page
        navigate("/");
        return;
      }
    }

    // If we have a public key, fetch account data
    if (publicKey && !isLoading) {
      fetchAccountData(publicKey);
    }
  }, [publicKey, navigate, fetchAccountData, isLoading]);

  // Fetch XLM price and 24h change from CoinGecko
  useEffect(() => {
    const fetchXlmPrice = async () => {
      try {
        setPriceError(null);
        const response = await fetch(
          "https://api.coingecko.com/api/v3/simple/price?ids=stellar&vs_currencies=usd&include_24hr_change=true&include_sparkline=true"
        );
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        if (data.stellar) {
          if (data.stellar.usd) {
            setXlmPrice(data.stellar.usd);
            // Cache price in localStorage as fallback
            if (typeof window !== "undefined") {
              localStorage.setItem("nova_cachedXlmPrice", String(data.stellar.usd));
            }
          }
          if (data.stellar.usd_24h_change !== undefined) {
            setXlm24hChange(data.stellar.usd_24h_change);
          }
          // Store sparkline data (7-day price history)
          if (data.stellar.sparkline_7d && Array.isArray(data.stellar.sparkline_7d.price)) {
            setSparklineData(data.stellar.sparkline_7d.price);
          }
        }
      } catch (error) {
        console.error("Failed to fetch XLM price:", error);
        setPriceError("Unable to fetch live price");
        
        // Fallback to cached price if available
        if (typeof window !== "undefined") {
          const cachedPrice = localStorage.getItem("nova_cachedXlmPrice");
          if (cachedPrice) {
            setXlmPrice(parseFloat(cachedPrice));
          }
        }
      }
    };
    
    fetchXlmPrice();
    // Refresh price every 5 minutes
    const interval = setInterval(fetchXlmPrice, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch transactions when activity tab is active
  useEffect(() => {
    if (activeTab === "activity" && publicKey && !loadingTransactions) {
      loadTransactions();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, publicKey]);

  const loadTransactions = async () => {
    if (!publicKey) return;
    setLoadingTransactions(true);
    try {
      const txns = await fetchRecentTransactions(publicKey);
      setTransactions(txns);
    } catch (error) {
      console.error("Failed to load transactions:", error);
    } finally {
      setLoadingTransactions(false);
    }
  };

  const handleCopyPublicKey = async () => {
    if (!publicKey) return;
    try {
      await navigator.clipboard.writeText(publicKey);
      setCopied(true);
      setAddressCopied(true);
      setTimeout(() => {
        setCopied(false);
        setAddressCopied(false);
      }, 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleLockWallet = async () => {
    // Clear only the in-memory wallet state (does NOT clear encrypted vault)
    const { clearWallet } = useWalletStore.getState();
    clearWallet();
    
    // Clear session data (decrypted password/session tokens)
    await clearSession();
    
    // Redirect to unlock/login screen (encrypted vault remains intact)
    navigate("/login");
  };


  const toggleBalanceVisibility = () => {
    const newValue = !isBalanceHidden;
    setIsBalanceHidden(newValue);
    if (typeof window !== "undefined") {
      localStorage.setItem("nova_balanceHidden", String(newValue));
    }
  };

  const handleCopyAccount = async () => {
    if (!publicKey) return;
    try {
      await navigator.clipboard.writeText(publicKey);
      setIsAccountCopied(true);
      setTimeout(() => {
        setIsAccountCopied(false);
      }, 2000);
    } catch (err) {
      console.error("Failed to copy account:", err);
    }
  };

  const truncateAddress = (address: string) => {
    if (!address) return "";
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  const handleRefresh = () => {
    if (publicKey) {
      fetchAccountData(publicKey);
      if (activeTab === "activity") {
        loadTransactions();
      }
    }
  };

  const handleGetTestnetUSDC = async () => {
    if (!secretKey || isReadOnly) {
      setUsdcError("Secret key is required to get USDC");
      return;
    }

    setGettingUSDC(true);
    setUsdcError(null);
    setUsdcSuccess(false);

    try {
      await getTestnetUSDC(secretKey);
      setUsdcSuccess(true);
      
      // Refresh account data to show new USDC balance
      if (publicKey) {
        await fetchAccountData(publicKey);
        // Also refresh transactions to show the new transaction
        await loadTransactions();
      }
      
      // Auto-close modal after 2 seconds on success
      setTimeout(() => {
        setShowGetUSDC(false);
        setUsdcSuccess(false);
      }, 2000);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to get testnet USDC";
      setUsdcError(errorMessage);
      console.error("Error getting testnet USDC:", error);
    } finally {
      setGettingUSDC(false);
    }
  };

  const handleSend = async () => {
    if (!sendDestination || !sendAmount || !secretKey) {
      setSendError("Please fill in all fields");
      return;
    }

    if (!sendDestination.startsWith("G") || sendDestination.length !== 56) {
      setSendError("Invalid destination address");
      return;
    }

    const amount = parseFloat(sendAmount);
    if (isNaN(amount) || amount <= 0) {
      setSendError("Invalid amount");
      return;
    }

    if (amount > availableXLM) {
      setSendError("Insufficient balance");
      return;
    }

    setSending(true);
    setSendError(null);
    setSendSuccess(false);

    try {
      await sendPayment(sendDestination, sendAmount, secretKey);
      setSendSuccess(true);
      setSendDestination("");
      setSendAmount("");
      // Refresh account data and transactions
      if (publicKey) {
        setTimeout(async () => {
          await fetchAccountData(publicKey);
          await loadTransactions();
          setSendSuccess(false);
        }, 2000);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to send payment";
      setSendError(errorMessage);
    } finally {
      setSending(false);
    }
  };

  // Show loading state
  if (isLoading && !publicKey) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-500" />
          <p className="text-slate-400">Loading account data...</p>
        </div>
      </div>
    );
  }

  if (!publicKey) {
    return null;
  }

  const xlmBalance = balances.find((b) => b.asset_type === "native");
  const totalXLM = parseFloat(xlmBalance?.balance || "0");

  return (
    <div className="w-full h-full bg-slate-950 overflow-auto">
      <div className="w-full">
        {/* Header Section */}
        <div className="bg-slate-900 border-b border-slate-800 p-6">
          {/* App Bar: Menu Icon | Account Name | Network Badge */}
          <div className="flex items-center justify-between mb-6">
            {/* Left: Menu Icon with Notification Badge */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="relative p-2 text-white hover:bg-slate-800 rounded-lg transition-colors"
              aria-label="Open menu"
            >
              <Menu className="w-6 h-6" />
              {/* Notification Badge - Only show if unreadCount > 0 */}
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 px-1.5 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full min-w-[18px] flex items-center justify-center transition-opacity duration-200">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Center: Account Name (Dropdown) */}
            {vault && vault.accounts.length > 0 ? (
              <AccountDropdown
                vault={vault}
                onSwitchAccount={switchAccount}
                onCopyAddress={handleCopyAccount}
                isCopied={isAccountCopied}
              />
            ) : (
              <button
                onClick={handleCopyAccount}
                className="flex items-center justify-center space-x-2 px-2 py-1 rounded-lg hover:opacity-80 transition-opacity cursor-pointer"
                title="Click to copy address"
              >
                <h1 className="text-xl font-semibold text-white">
                  {isAccountCopied ? "Address Copied!" : "Account 1"}
                </h1>
                {isAccountCopied ? (
                  <Check className="w-4 h-4 text-green-400" />
                ) : (
                  <Copy className="w-4 h-4 text-slate-400" />
                )}
              </button>
            )}

            {/* Right: Network Badge */}
            <div className="flex items-center space-x-2 px-3 py-1 bg-green-900/30 border border-green-700 rounded-full">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-xs text-green-400 font-medium">
                Stellar Testnet
              </span>
            </div>
          </div>

          {/* Main Balance Header - Total Fiat Value Only */}
          <div className="flex flex-col items-center justify-center text-center mb-6">
            {xlmPrice ? (
              <>
                {/* Row 1: Main Balance (The Hero) */}
                <div className="flex items-center justify-center space-x-3 mb-2">
                  <div className="text-4xl font-bold text-white">
                    {isBalanceHidden ? (
                      "$****"
                    ) : (
                      `$${(totalXLM * xlmPrice).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}`
                    )}
                  </div>
                  <button
                    onClick={toggleBalanceVisibility}
                    className="p-2 text-slate-400 hover:text-white transition-colors"
                    title={isBalanceHidden ? "Show balance" : "Hide balance"}
                  >
                    {isBalanceHidden ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>

                {/* Row 2: Performance Indicator (24h Change + Sparkline) */}
                {!isBalanceHidden && (
                  <div className="flex flex-row items-center justify-center gap-2 mt-1">
                    {/* 24h Percentage */}
                    <div className="flex items-center space-x-1.5">
                      {xlm24hChange !== null ? (
                        <>
                          {xlm24hChange > 0 ? (
                            <TrendingUp className="w-4 h-4 text-green-400" />
                          ) : xlm24hChange < 0 ? (
                            <TrendingDown className="w-4 h-4 text-red-400" />
                          ) : null}
                          <span
                            className={`text-sm font-medium ${
                              xlm24hChange > 0
                                ? "text-green-400"
                                : xlm24hChange < 0
                                ? "text-red-400"
                                : "text-slate-400"
                            }`}
                          >
                            {xlm24hChange > 0 ? "+" : ""}
                            {xlm24hChange.toFixed(2)}%
                          </span>
                        </>
                      ) : (
                        <span className="text-sm font-medium text-slate-400">0.00%</span>
                      )}
                    </div>

                    {/* Sparkline Graph */}
                    {sparklineData.length > 0 && (
                      <div className="flex items-center w-24">
                        <Sparklines
                          data={sparklineData}
                          width={100}
                          height={30}
                          margin={2}
                        >
                          <SparklinesLine
                            color={
                              xlm24hChange !== null
                                ? xlm24hChange > 0
                                  ? "#4ade80"
                                  : xlm24hChange < 0
                                  ? "#f87171"
                                  : "#94a3b8"
                                : "#94a3b8"
                            }
                            style={{ strokeWidth: 2 }}
                          />
                        </Sparklines>
                      </div>
                    )}
                  </div>
                )}
                {isBalanceHidden && (
                  <div className="flex flex-row items-center justify-center gap-2 mt-1">
                    <span className="text-sm font-medium text-slate-500">****%</span>
                    <div className="w-24 h-[30px] bg-slate-800 rounded blur-sm"></div>
                  </div>
                )}
                {priceError && (
                  <div className="text-xs text-amber-400 mt-1" title={priceError}>
                    ⚠️ Using cached price
                  </div>
                )}
              </>
            ) : (
              <div className="text-4xl font-bold text-white mb-2">
                {isBalanceHidden ? "$****" : "Loading..."}
              </div>
            )}
          </div>

          {/* Read-Only Notice */}
          {isReadOnly && (
            <div className="mb-4 bg-yellow-900/20 border border-yellow-800 rounded-lg p-3">
              <p className="text-sm text-yellow-200 text-center">
                <strong className="font-semibold">Read-Only Mode:</strong> You can view balances and transactions, but cannot send funds.
              </p>
            </div>
          )}

          {/* Action Bar */}
          <div className="flex items-center justify-center space-x-8 mb-6">
            <button
              onClick={() => setShowSend(true)}
              disabled={isReadOnly}
              className={`flex flex-col items-center space-y-2 group ${
                isReadOnly ? "opacity-50 cursor-not-allowed" : ""
              }`}
              title={isReadOnly ? "Send is disabled in read-only mode" : "Send XLM"}
            >
              <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${
                isReadOnly 
                  ? "bg-slate-700" 
                  : "bg-blue-600 group-hover:bg-blue-500"
              }`}>
                <ArrowUp className="w-6 h-6 text-white" />
              </div>
              <span className="text-sm text-slate-300">Send</span>
            </button>
            <button
              onClick={() => setShowReceive(true)}
              className="flex flex-col items-center space-y-2 group"
            >
              <div className="w-14 h-14 bg-green-600 rounded-full flex items-center justify-center group-hover:bg-green-500 transition-colors">
                <ArrowDown className="w-6 h-6 text-white" />
              </div>
              <span className="text-sm text-slate-300">Receive</span>
            </button>
            <button
              onClick={() => setShowGetUSDC(true)}
              disabled={isReadOnly}
              className={`flex flex-col items-center space-y-2 group ${
                isReadOnly ? "opacity-50 cursor-not-allowed" : ""
              }`}
              title={isReadOnly ? "Add Asset is disabled in read-only mode" : "Get Testnet USDC"}
            >
              <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${
                isReadOnly 
                  ? "bg-slate-700" 
                  : "bg-purple-600 group-hover:bg-purple-500"
              }`}>
                <Droplet className="w-6 h-6 text-white" />
              </div>
              <span className="text-sm text-slate-300">Get USDC</span>
            </button>
          </div>
        </div>

        {/* Tabbed Interface */}
        <div className="bg-slate-900">
          {/* Tabs */}
          <div className="flex border-b border-slate-800">
            <button
              onClick={() => setActiveTab("assets")}
              className={`flex-1 py-4 text-center font-medium transition-colors ${
                activeTab === "assets"
                  ? "text-blue-400 border-b-2 border-blue-400"
                  : "text-slate-400 hover:text-slate-300"
              }`}
            >
              Assets
            </button>
            <button
              onClick={() => setActiveTab("activity")}
              className={`flex-1 py-4 text-center font-medium transition-colors ${
                activeTab === "activity"
                  ? "text-blue-400 border-b-2 border-blue-400"
                  : "text-slate-400 hover:text-slate-300"
              }`}
            >
              Activity
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-4">
            {activeTab === "assets" && (
              <div className="space-y-2">
                {/* XLM (Native) - Always present */}
                <div className="flex items-center justify-between p-4 bg-slate-800 rounded-lg border border-slate-700">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">X</span>
                    </div>
                    <div>
                      <div className="text-white font-semibold">XLM</div>
                      <div className="text-xs text-slate-400">
                        Stellar Lumens
                        {xlmPrice && (
                          <span className="ml-1">
                            • 1 XLM ≈ ${xlmPrice.toLocaleString(undefined, {
                              minimumFractionDigits: 4,
                              maximumFractionDigits: 6,
                            })}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-white font-semibold">
                      {totalXLM.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 7,
                      })}
                    </div>
                    <div className="text-xs text-slate-400">
                      {availableXLM.toFixed(7)} available
                    </div>
                  </div>
                </div>

                {/* Other Assets */}
                {balances
                  .filter((b) => b.asset_type !== "native")
                  .map((balance, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 bg-slate-800 rounded-lg border border-slate-700"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold text-xs">
                            {balance.asset_code?.charAt(0) || "T"}
                          </span>
                        </div>
                        <div>
                          <div className="text-white font-semibold">
                            {balance.asset_code || "Unknown"}
                          </div>
                          <div className="text-xs text-slate-400">
                            {balance.asset_issuer
                              ? truncateAddress(balance.asset_issuer)
                              : "Token"}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-white font-semibold">
                          {parseFloat(balance.balance).toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 7,
                          })}
                        </div>
                      </div>
                    </div>
                  ))}

                {balances.filter((b) => b.asset_type !== "native").length === 0 && (
                  <div className="text-center py-8 text-slate-500 text-sm">
                    No other assets
                  </div>
                )}
              </div>
            )}

            {activeTab === "activity" && (
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {loadingTransactions ? (
                  <div className="flex items-center justify-center py-12">
                    <RefreshCw className="w-6 h-6 animate-spin text-blue-500" />
                  </div>
                ) : transactions.length === 0 ? (
                  <div className="text-center py-12 text-slate-500 text-sm">
                    No transaction history
                  </div>
                ) : (
                  transactions.map((tx) => {
                    const isReceived = tx.to === publicKey;
                    const isSent = tx.from === publicKey;
                    const amount = parseFloat(tx.amount);

                    return (
                      <div
                        key={tx.id}
                        onClick={() => setSelectedTransaction(tx)}
                        className="flex items-center justify-between p-4 bg-slate-800 rounded-lg border border-slate-700 cursor-pointer hover:bg-slate-700 transition-colors"
                      >
                        <div className="flex items-center space-x-3 flex-1">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              isReceived
                                ? "bg-green-600/20"
                                : isSent
                                ? "bg-red-600/20"
                                : "bg-slate-700"
                            }`}
                          >
                            {isReceived ? (
                              <ArrowDownLeft className="w-5 h-5 text-green-400" />
                            ) : isSent ? (
                              <ArrowUpRight className="w-5 h-5 text-red-400" />
                            ) : (
                              <Wallet className="w-5 h-5 text-slate-400" />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="text-white font-medium">
                              {isReceived ? "Received" : isSent ? "Sent" : "Transaction"}{" "}
                              {tx.asset}
                            </div>
                            <div className="text-xs text-slate-400">
                              {tx.formattedDate || tx.date.toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                              })}
                            </div>
                          </div>
                        </div>
                        <div
                          className={`font-semibold ${
                            isReceived ? "text-green-400" : "text-red-400"
                          }`}
                        >
                          {isReceived ? "+" : "-"}
                          {amount.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 7,
                          })}{" "}
                          {tx.asset}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Receive Modal */}
      {showReceive && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 rounded-2xl p-8 border border-slate-800 max-w-md w-full">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Receive XLM</h2>
              <button
                onClick={() => setShowReceive(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex flex-col items-center space-y-6">
              <div className="bg-white p-4 rounded-lg">
                {publicKey && <QRCode value={publicKey} size={200} />}
              </div>

              <div className="w-full">
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Your Address
                </label>
                <div className="flex items-center space-x-2">
                  <code className="flex-1 text-sm text-slate-200 break-all font-mono bg-slate-800 p-3 rounded-lg">
                    {publicKey}
                  </code>
                  <button
                    onClick={handleCopyPublicKey}
                    className="px-4 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors"
                  >
                    {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Send Modal */}
      {showSend && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 rounded-2xl p-8 border border-slate-800 max-w-md w-full">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Send XLM</h2>
              <button
                onClick={() => {
                  setShowSend(false);
                  setSendDestination("");
                  setSendAmount("");
                  setSendError(null);
                  setSendSuccess(false);
                }}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6">
              {sendError && (
                <div className="bg-red-900/50 border border-red-700 rounded-lg p-4 text-red-200">
                  <p>{sendError}</p>
                </div>
              )}

              {sendSuccess && (
                <div className="bg-green-900/50 border border-green-700 rounded-lg p-4 text-green-200">
                  <p>Transaction sent successfully!</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Destination Address
                </label>
                <input
                  type="text"
                  value={sendDestination}
                  onChange={(e) => {
                    setSendDestination(e.target.value);
                    setSendError(null);
                  }}
                  placeholder="GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Amount (XLM)
                </label>
                <input
                  type="number"
                  value={sendAmount}
                  onChange={(e) => {
                    setSendAmount(e.target.value);
                    setSendError(null);
                  }}
                  placeholder="0.00"
                  step="0.0000001"
                  min="0"
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-slate-400 mt-2">
                  Available: {availableXLM.toFixed(7)} XLM
                </p>
              </div>

              <button
                onClick={handleSend}
                disabled={sending || !sendDestination || !sendAmount || !secretKey || isReadOnly}
                className="w-full px-6 py-4 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
              >
                {sending ? "Sending..." : "Send Transaction"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar Navigation Drawer */}
      {sidebarOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setSidebarOpen(false)}
          />
          {/* Sidebar */}
          <div className="fixed inset-y-0 left-0 z-50 w-64 bg-slate-950 border-r border-slate-800 flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-slate-800">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-white">Menu</h2>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-1 text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-lg">
                    {vault && vault.accounts.length > 0
                      ? vault.accounts.find((acc) => acc.index === vault.activeAccountIndex)?.name?.charAt(0) || "A"
                      : "A"}
                  </span>
                </div>
                <div className="flex flex-col min-w-0 flex-1">
                  <div className="text-white font-medium truncate">
                    {vault && vault.accounts.length > 0
                      ? vault.accounts.find((acc) => acc.index === vault.activeAccountIndex)?.name || "Account 1"
                      : "Account 1"}
                  </div>
                  <div className="text-xs text-slate-400 font-mono truncate">
                    {truncateAddress(publicKey || "")}
                  </div>
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <div className="flex-1 overflow-y-auto p-4 space-y-1">
              {/* Notifications */}
              <button
                onClick={() => {
                  setShowNotifications(true);
                  setSidebarOpen(false);
                  setUnreadCount(0); // Mark as read when clicked
                }}
                className="w-full flex items-center justify-between px-4 py-3 text-white hover:bg-slate-800 rounded-lg transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <Bell className="w-5 h-5" />
                  <span>Notifications</span>
                </div>
                {/* Notification Badge - Only show if unreadCount > 0 */}
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full transition-opacity duration-200">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* View on Explorer */}
              <a
                href={`https://stellar.expert/explorer/testnet/account/${publicKey}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-between px-4 py-3 text-white hover:bg-slate-800 rounded-lg transition-colors"
                onClick={() => setSidebarOpen(false)}
              >
                <div className="flex items-center space-x-3">
                  <ExternalLink className="w-5 h-5" />
                  <span>View on Explorer</span>
                </div>
              </a>

              {/* Settings */}
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setSidebarOpen(false);
                  // Small delay to ensure sidebar closes first
                  setTimeout(() => {
                    setShowSettings(true);
                  }, 100);
                }}
                className="w-full flex items-center space-x-3 px-4 py-3 text-white hover:bg-slate-800 rounded-lg transition-colors"
              >
                <Settings className="w-5 h-5" />
                <span>Settings</span>
              </button>

              {/* Lock Wallet */}
              <button
                onClick={handleLockWallet}
                className="w-full flex items-center space-x-3 px-4 py-3 text-white hover:bg-slate-800 rounded-lg transition-colors"
              >
                <Lock className="w-5 h-5" />
                <span>Lock Wallet</span>
              </button>
            </div>
          </div>
        </>
      )}

      {/* Notifications Modal */}
      {showNotifications && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 rounded-2xl p-8 border border-slate-800 max-w-md w-full">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Notifications</h2>
              <button
                onClick={() => setShowNotifications(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {[
                {
                  title: "Welcome to Stellar Wallet",
                  message: "Your wallet is ready to use",
                  time: "2 hours ago",
                },
                {
                  title: "Testnet Funds Received",
                  message: "You received 10,000 XLM from Friendbot",
                  time: "1 day ago",
                },
                {
                  title: "Transaction Confirmed",
                  message: "Your payment was successfully sent",
                  time: "2 days ago",
                },
                {
                  title: "Account Created",
                  message: "Your Stellar wallet has been created",
                  time: "3 days ago",
                },
              ].map((notification, index) => (
                <div
                  key={index}
                  className="p-4 bg-slate-800 rounded-lg border border-slate-700"
                >
                  <div className="flex items-start justify-between mb-1">
                    <h3 className="text-white font-semibold">
                      {notification.title}
                    </h3>
                  </div>
                  <p className="text-sm text-slate-400 mb-2">
                    {notification.message}
                  </p>
                  <p className="text-xs text-slate-500">{notification.time}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Security & Privacy Modal (Secret Key) */}
      {showSecretKeyModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 rounded-2xl p-8 border border-slate-800 max-w-md w-full">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">
                Security & Privacy
              </h2>
              <button
                onClick={() => {
                  setShowSecretKeyModal(false);
                  setShowSecretKey(false);
                }}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Reveal Secret Key */}
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Secret Key
                </label>
                <div className="relative">
                  <div className="flex items-center space-x-2">
                    <code
                      className={`flex-1 text-sm font-mono bg-slate-800 p-3 rounded-lg ${
                        showSecretKey
                          ? "text-slate-200 break-all"
                          : "text-slate-500 blur-sm select-none"
                      }`}
                    >
                      {secretKey || "Not available"}
                    </code>
                    <button
                      onClick={() => setShowSecretKey(!showSecretKey)}
                      className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
                      title={showSecretKey ? "Hide" : "Reveal"}
                    >
                      {showSecretKey ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                    <button
                      onClick={async () => {
                        if (secretKey) {
                          await navigator.clipboard.writeText(secretKey);
                          setCopied(true);
                          setTimeout(() => setCopied(false), 2000);
                        }
                      }}
                      className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
                      title="Copy"
                    >
                      {copied ? (
                        <Check className="w-5 h-5 text-green-400" />
                      ) : (
                        <Copy className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  ⚠️ Never share your secret key with anyone. Keep it secure.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Transaction Details Modal */}
      {selectedTransaction && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 rounded-2xl p-8 border border-slate-800 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Transaction Details</h2>
              <button
                onClick={() => {
                  setSelectedTransaction(null);
                  setCopiedField(null);
                }}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {(() => {
              const tx = selectedTransaction;
              const isReceived = tx.to === publicKey;
              const isSent = tx.from === publicKey;
              const amount = parseFloat(tx.amount);

              return (
                <div className="space-y-6">
                  {/* Header with Icon and Title */}
                  <div className="text-center">
                    <div className="w-16 h-16 bg-green-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle2 className="w-8 h-8 text-green-400" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">
                      {isReceived ? "Payment Received" : isSent ? "Payment Sent" : "Transaction"}
                    </h3>
                    <p className="text-sm text-slate-400">{tx.formattedDate}</p>
                  </div>

                  {/* Amount Display */}
                  <div className="text-center py-4 border-y border-slate-800">
                    <div
                      className={`text-4xl font-bold ${
                        isReceived ? "text-green-400" : "text-red-400"
                      }`}
                    >
                      {isReceived ? "+" : "-"}
                      {amount.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 7,
                      })}{" "}
                      {tx.asset}
                    </div>
                    <div className="mt-2">
                      <span className="px-3 py-1 bg-green-600/20 text-green-400 text-xs font-semibold rounded-full">
                        Confirmed
                      </span>
                    </div>
                  </div>

                  {/* Data Grid */}
                  <div className="space-y-4">
                    {/* From */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-2">
                        From
                      </label>
                      <div className="flex items-center space-x-2">
                        <code className="flex-1 text-sm text-slate-200 font-mono bg-slate-800 p-3 rounded-lg">
                          {truncateAddress(tx.from)}
                        </code>
                        <button
                          onClick={async () => {
                            await navigator.clipboard.writeText(tx.from);
                            setCopiedField("from");
                            setTimeout(() => setCopiedField(null), 2000);
                          }}
                          className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
                          title="Copy"
                        >
                          {copiedField === "from" ? (
                            <Check className="w-4 h-4 text-green-400" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Arrow Icon */}
                    <div className="flex justify-center">
                      <ArrowRight className="w-5 h-5 text-slate-500" />
                    </div>

                    {/* To */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-2">
                        To
                      </label>
                      <div className="flex items-center space-x-2">
                        <code className="flex-1 text-sm text-slate-200 font-mono bg-slate-800 p-3 rounded-lg">
                          {truncateAddress(tx.to)}
                        </code>
                        <button
                          onClick={async () => {
                            await navigator.clipboard.writeText(tx.to);
                            setCopiedField("to");
                            setTimeout(() => setCopiedField(null), 2000);
                          }}
                          className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
                          title="Copy"
                        >
                          {copiedField === "to" ? (
                            <Check className="w-4 h-4 text-green-400" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Network Fee */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-2">
                        Network Fee
                      </label>
                      <div className="text-sm text-slate-200 bg-slate-800 p-3 rounded-lg">
                        {tx.fee} XLM
                      </div>
                    </div>

                    {/* Memo */}
                    {tx.memo && (
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 mb-2">
                          Memo
                        </label>
                        <div className="text-sm text-slate-200 bg-slate-800 p-3 rounded-lg">
                          {tx.memo}
                        </div>
                      </div>
                    )}

                    {/* Transaction Hash */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-2">
                        Transaction ID
                      </label>
                      <div className="flex items-center space-x-2">
                        <code className="flex-1 text-sm text-slate-200 font-mono bg-slate-800 p-3 rounded-lg">
                          {truncateAddress(tx.hash)}
                        </code>
                        <button
                          onClick={async () => {
                            await navigator.clipboard.writeText(tx.hash);
                            setCopiedField("hash");
                            setTimeout(() => setCopiedField(null), 2000);
                          }}
                          className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
                          title="Copy"
                        >
                          {copiedField === "hash" ? (
                            <Check className="w-4 h-4 text-green-400" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Footer - View on Explorer */}
                  <div className="pt-4 border-t border-slate-800">
                    <a
                      href={`https://stellar.expert/explorer/testnet/tx/${tx.hash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg transition-colors"
                    >
                      <ExternalLink className="w-5 h-5" />
                      <span>View on Explorer</span>
                    </a>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* Get Testnet USDC Modal */}
      {showGetUSDC && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 rounded-2xl p-8 border border-slate-800 max-w-md w-full">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Get Testnet USDC</h2>
              <button
                onClick={() => {
                  setShowGetUSDC(false);
                  setUsdcError(null);
                  setUsdcSuccess(false);
                }}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6">
              {usdcError && (
                <div className="bg-red-900/50 border border-red-700 rounded-lg p-4 text-red-200">
                  <p className="font-semibold mb-1">Error</p>
                  <p className="text-sm">{usdcError}</p>
                  {usdcError.includes("Insufficient XLM") && (
                    <p className="text-xs mt-2 text-red-300">
                      💡 Tip: Get free XLM from Friendbot first to cover transaction fees.
                    </p>
                  )}
                </div>
              )}

              {usdcSuccess && (
                <div className="bg-green-900/50 border border-green-700 rounded-lg p-4 text-green-200">
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-5 h-5" />
                    <p className="font-semibold">Received USDC!</p>
                  </div>
                  <p className="text-sm mt-1">Your USDC balance will update shortly.</p>
                </div>
              )}

              <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                <div className="flex items-center space-x-3 mb-3">
                  <Droplet className="w-8 h-8 text-purple-400" />
                  <div>
                    <div className="text-white font-semibold">Swap XLM for USDC</div>
                    <div className="text-xs text-slate-400">Testnet USDC Faucet</div>
                  </div>
                </div>
                <div className="space-y-2 text-sm text-slate-300">
                  <div className="flex justify-between">
                    <span>Swap Amount:</span>
                    <span className="text-white font-medium">10 XLM</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Expected USDC:</span>
                    <span className="text-white font-medium">~1-2 USDC</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Network Fee:</span>
                    <span className="text-white font-medium">~0.00001 XLM</span>
                  </div>
                </div>
              </div>

              <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-3">
                <p className="text-xs text-blue-200">
                  <strong>Note:</strong> This will automatically create a USDC trustline if you don&apos;t have one, then swap 10 XLM for USDC on the Stellar testnet.
                </p>
              </div>

              <button
                onClick={handleGetTestnetUSDC}
                disabled={gettingUSDC || !secretKey || isReadOnly}
                className="w-full px-6 py-4 bg-purple-600 hover:bg-purple-500 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors flex items-center justify-center space-x-2"
              >
                {gettingUSDC ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>Minting USDC...</span>
                  </>
                ) : (
                  <>
                    <Droplet className="w-5 h-5" />
                    <span>Get Testnet USDC</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Settings Dialog */}
      <SettingsDialog
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />

    </div>
  );
}


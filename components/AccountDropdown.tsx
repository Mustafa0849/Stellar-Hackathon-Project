"use client";

import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useWalletStore } from "@/store/walletStore";
import type { Vault } from "@/lib/vault";
import { ChevronDown, Plus, Key, Copy, Check, ArrowLeft, Wallet } from "lucide-react";

interface AccountDropdownProps {
  vault: Vault;
  onSwitchAccount: (index: number) => void;
  onCopyAddress: () => void;
  isCopied: boolean;
}

export default function AccountDropdown({
  vault,
  onSwitchAccount,
  onCopyAddress,
  isCopied,
}: AccountDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "add">("list");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { createAccount } = useWalletStore();

  const activeAccount = vault.accounts.find(
    (acc) => acc.index === vault.activeAccountIndex
  ) || vault.accounts[0];

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setViewMode("list"); // Reset view mode when closing
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  // Reset view mode when dropdown closes
  useEffect(() => {
    if (!isOpen) {
      setViewMode("list");
    }
  }, [isOpen]);

  const handleCreateAccount = () => {
    setIsOpen(false);
    setViewMode("list");
    navigate("/create");
  };

  const handleImportAccount = () => {
    setIsOpen(false);
    setViewMode("list");
    navigate("/import");
  };

  const handleAddAccount = () => {
    setViewMode("add");
  };

  const handleBackToList = () => {
    setViewMode("list");
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex flex-row items-center space-x-2 px-2 py-1 rounded-lg hover:opacity-80 transition-opacity cursor-pointer"
        title="Click to copy address or switch account"
      >
        <h1 className="text-xl font-semibold text-white whitespace-nowrap">
          {isCopied ? "Address Copied!" : activeAccount?.name || "Account 1"}
        </h1>
        {isCopied ? (
          <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
        ) : (
          <>
            <Copy className="w-4 h-4 text-slate-400 flex-shrink-0" onClick={(e) => { e.stopPropagation(); onCopyAddress(); }} />
            <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
          </>
        )}
      </button>

      {isOpen && !isCopied && (
        <div className="absolute top-full left-0 mt-2 w-56 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-50 overflow-hidden max-h-[400px]">
          {viewMode === "list" ? (
            <>
              {/* Account List */}
              <div className="max-h-64 overflow-y-auto">
                {vault.accounts.map((account) => (
                  <button
                    key={account.index}
                    onClick={() => {
                      onSwitchAccount(account.index);
                      setIsOpen(false);
                    }}
                    className={`w-full px-4 py-3 text-left hover:bg-slate-700 transition-colors ${
                      account.index === vault.activeAccountIndex
                        ? "bg-slate-700 border-l-2 border-blue-500"
                        : ""
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-white font-semibold">{account.name}</div>
                        <div className="text-xs text-slate-400 font-mono mt-1">
                          {account.publicKey.slice(0, 8)}...{account.publicKey.slice(-6)}
                        </div>
                      </div>
                      {account.index === vault.activeAccountIndex && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      )}
                    </div>
                  </button>
                ))}
              </div>

              {/* Divider */}
              {vault.accounts.length > 0 && (
                <div className="border-t border-slate-700"></div>
              )}

              {/* Add Account Button */}
              <div className="p-2">
                <button
                  onClick={handleAddAccount}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-2 text-white hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Account</span>
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Back Button */}
              <div className="p-2 border-b border-slate-700">
                <button
                  onClick={handleBackToList}
                  className="w-full flex items-center space-x-2 px-4 py-2 text-white hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
              </div>

              {/* Add Account Options */}
              <div className="p-2 space-y-1">
                <button
                  onClick={handleCreateAccount}
                  className="w-full flex items-center space-x-2 px-4 py-3 text-white hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <Wallet className="w-5 h-5" />
                  <span>Create New Wallet</span>
                </button>
                <button
                  onClick={handleImportAccount}
                  className="w-full flex items-center space-x-2 px-4 py-3 text-white hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <Key className="w-5 h-5" />
                  <span>Import Private Key</span>
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}


"use client";

import { Balance } from "@/store/walletStore";
import { Coins } from "lucide-react";

interface BalancesCardProps {
  balances: Balance[];
}

export default function BalancesCard({ balances }: BalancesCardProps) {
  if (balances.length === 0) {
    return (
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <div className="flex items-center justify-center text-gray-400">
          <Coins className="w-5 h-5 mr-2" />
          <span>No balances found</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <h2 className="text-xl font-semibold mb-4 flex items-center">
        <Coins className="w-5 h-5 mr-2" />
        Assets
      </h2>
      <div className="space-y-3">
        {balances.map((balance, index) => {
          const isNative = balance.asset_type === "native";
          const isCreditAlphanum4 = balance.asset_type === "credit_alphanum4";
          const assetCode = isNative ? "XLM" : balance.asset_code || "Unknown";
          const assetIssuer = balance.asset_issuer;

          return (
            <div
              key={index}
              className="flex items-center justify-between p-4 bg-gray-900 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors"
            >
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <span className="font-semibold text-white">{assetCode}</span>
                  {isNative && (
                    <span className="px-2 py-0.5 text-xs bg-blue-600 text-white rounded">
                      Native
                    </span>
                  )}
                  {isCreditAlphanum4 && (
                    <span className="px-2 py-0.5 text-xs bg-purple-600 text-white rounded">
                      Token
                    </span>
                  )}
                  {!isNative && !isCreditAlphanum4 && (
                    <span className="px-2 py-0.5 text-xs bg-gray-600 text-white rounded">
                      {balance.asset_type}
                    </span>
                  )}
                </div>
                {!isNative && assetIssuer && (
                  <p className="text-xs text-gray-400 mt-1 truncate">
                    Issuer: {assetIssuer}
                  </p>
                )}
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-white">
                  {parseFloat(balance.balance).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 7,
                  })}
                </div>
                {balance.limit && (
                  <div className="text-xs text-gray-400">
                    Limit: {parseFloat(balance.limit).toLocaleString()}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}


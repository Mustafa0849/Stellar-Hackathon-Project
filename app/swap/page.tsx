'use client';

import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { motion } from 'framer-motion';
import { ArrowDownUp, ArrowDown } from 'lucide-react';
import { useState } from 'react';
import { StellarLogo } from '@/components/icons/StellarLogo';
import { USDCLogo } from '@/components/icons/USDCLogo';

export default function SwapPage() {
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [fromAsset, setFromAsset] = useState('XLM');
  const [toAsset, setToAsset] = useState('USDC');

  const assets = [
    { code: 'XLM', name: 'Stellar', icon: 'stellar' },
    { code: 'USDC', name: 'USD Coin', icon: 'usdc' },
  ];

  const handleSwap = () => {
    // Swap logic would go here
    const temp = fromAsset;
    setFromAsset(toAsset);
    setToAsset(temp);
    const tempAmount = fromAmount;
    setFromAmount(toAmount);
    setToAmount(tempAmount);
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto px-6 sm:px-8 py-8 sm:py-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8 text-center"
        >
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">Swap Assets</h1>
          <p className="text-slate-400">Exchange one asset for another instantly</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="rounded-3xl backdrop-blur-md bg-gradient-to-br from-slate-900/80 via-slate-800/60 to-indigo-900/40 border border-slate-700/50 shadow-2xl p-8"
        >
          {/* From Section */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-400 mb-3">From</label>
            <div className="rounded-2xl bg-slate-800/50 border border-slate-700/50 p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-700/50 flex items-center justify-center">
                    {fromAsset === 'XLM' ? (
                      <StellarLogo size={24} className="text-white" />
                    ) : (
                      <USDCLogo size={24} className="text-white" />
                    )}
                  </div>
                  <select
                    value={fromAsset}
                    onChange={(e) => setFromAsset(e.target.value)}
                    className="bg-transparent text-white font-semibold text-lg border-none outline-none cursor-pointer"
                  >
                    {assets.map((asset) => (
                      <option key={asset.code} value={asset.code} className="bg-slate-800">
                        {asset.code}
                      </option>
                    ))}
                  </select>
                </div>
                <input
                  type="number"
                  value={fromAmount}
                  onChange={(e) => setFromAmount(e.target.value)}
                  placeholder="0.00"
                  className="text-right text-2xl font-bold text-white bg-transparent border-none outline-none w-32 placeholder-slate-600"
                />
              </div>
              <p className="text-slate-400 text-sm">Balance: 1,200.00 {fromAsset}</p>
            </div>
          </div>

          {/* Swap Button */}
          <div className="flex justify-center my-4">
            <motion.button
              onClick={handleSwap}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="w-12 h-12 rounded-full bg-slate-800/50 border-2 border-slate-700/50 hover:border-teal-500/50 flex items-center justify-center transition-all duration-300"
            >
              <ArrowDownUp className="w-5 h-5 text-slate-400" />
            </motion.button>
          </div>

          {/* To Section */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-400 mb-3">To</label>
            <div className="rounded-2xl bg-slate-800/50 border border-slate-700/50 p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-700/50 flex items-center justify-center">
                    {toAsset === 'XLM' ? (
                      <StellarLogo size={24} className="text-white" />
                    ) : (
                      <USDCLogo size={24} className="text-white" />
                    )}
                  </div>
                  <select
                    value={toAsset}
                    onChange={(e) => setToAsset(e.target.value)}
                    className="bg-transparent text-white font-semibold text-lg border-none outline-none cursor-pointer"
                  >
                    {assets.map((asset) => (
                      <option key={asset.code} value={asset.code} className="bg-slate-800">
                        {asset.code}
                      </option>
                    ))}
                  </select>
                </div>
                <input
                  type="number"
                  value={toAmount}
                  onChange={(e) => setToAmount(e.target.value)}
                  placeholder="0.00"
                  className="text-right text-2xl font-bold text-white bg-transparent border-none outline-none w-32 placeholder-slate-600"
                />
              </div>
              <p className="text-slate-400 text-sm">Balance: 450.00 {toAsset}</p>
            </div>
          </div>

          {/* Swap Now Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={!fromAmount || !toAmount}
            className="w-full bg-gradient-to-r from-teal-400 to-purple-500 hover:from-teal-500 hover:to-purple-600 disabled:from-slate-600 disabled:to-slate-700 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-full transition-all duration-300 shadow-lg shadow-teal-500/20"
          >
            Swap Now
          </motion.button>

          {/* Rate Info */}
          <div className="mt-6 p-4 bg-slate-800/30 rounded-xl border border-white/5">
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-400">Exchange Rate</span>
              <span className="text-white font-medium">1 {fromAsset} = 0.37 {toAsset}</span>
            </div>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}

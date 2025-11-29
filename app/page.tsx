<<<<<<< HEAD
'use client';

import { useWallet } from '@/context/WalletContext';
import ConnectWallet from '@/components/ConnectWallet';
import { motion } from 'framer-motion';
import { 
  Send, 
  Download, 
  ArrowLeftRight, 
  ScanLine, 
  ArrowUpRight, 
  ArrowDownLeft,
  TrendingUp
} from 'lucide-react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { StellarLogo } from '@/components/icons/StellarLogo';
import { USDCLogo } from '@/components/icons/USDCLogo';

export default function Home() {
  const { account, balances, isLoading } = useWallet();

  if (!account) {
    return <ConnectWallet />;
  }

  const xlmBalance = balances.find(b => b.asset === 'XLM')?.amount || '0';
  const formattedBalance = parseFloat(xlmBalance).toFixed(2);

  // Mock transaction data
  const transactions = [
    { type: 'send', address: 'GABCD...XYZ123', amount: '-50.00', time: '2h ago' },
    { type: 'receive', address: 'GEFGH...UVW456', amount: '+200.00', time: '1d ago' },
    { type: 'send', address: 'GIJKL...RST789', amount: '-25.50', time: '3d ago' },
  ];

  // Mock assets data
  const assets = [
    { 
      name: 'Stellar', 
      code: 'XLM', 
      balance: formattedBalance, 
      value: formattedBalance,
      icon: 'stellar',
      change: '+2.4%'
    },
    { 
      name: 'USD Coin', 
      code: 'USDC', 
      balance: '450.00', 
      value: '450.00',
      icon: 'usdc',
      change: '+0.1%'
    },
  ];

  const quickActions = [
    { icon: Send, label: 'Send', href: '/send' },
    { icon: Download, label: 'Receive', href: '/receive' },
    { icon: ArrowLeftRight, label: 'Swap', href: '/swap' },
    { icon: ScanLine, label: 'Scan', href: '/scan' },
  ];

  // Sparkline SVG - wavy green line
  const Sparkline = () => (
    <svg 
      className="absolute bottom-0 left-0 right-0 h-20 opacity-20" 
      preserveAspectRatio="none"
      viewBox="0 0 400 100"
    >
      <path
        d="M 0 80 Q 50 60, 100 70 T 200 65 T 300 55 T 400 50"
        fill="none"
        stroke="#10b981"
        strokeWidth="2"
        vectorEffect="non-scaling-stroke"
      />
      <path
        d="M 0 80 Q 50 60, 100 70 T 200 65 T 300 55 T 400 50 L 400 100 L 0 100 Z"
        fill="url(#sparklineGradient)"
        opacity="0.3"
      />
      <defs>
        <linearGradient id="sparklineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  );

  return (
    <DashboardLayout>
        <div className="max-w-7xl mx-auto px-6 sm:px-8 py-8 sm:py-12">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-8"
          >
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">Dashboard</h1>
            <p className="text-slate-400">Welcome back, manage your assets</p>
          </motion.div>

          {/* Balance Card - More Compact */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="relative rounded-3xl p-6 sm:p-8 mb-6 gradient-mesh border border-white/5 overflow-hidden"
          >
            <Sparkline />
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-slate-400 text-sm mb-1">Total Balance</p>
                  <h2 className="text-4xl sm:text-5xl font-bold text-white mb-1">
                    {isLoading ? '...' : formattedBalance}
                  </h2>
                  <div className="flex items-center gap-2 mt-2">
                    <TrendingUp className="w-4 h-4 text-green-400" />
                    <p className="text-green-400 text-sm font-medium">+2.4% (24h)</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-slate-400 text-sm">XLM</p>
                  <p className="text-teal-400 text-lg font-semibold">Stellar</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Quick Action Row - Pill-shaped buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-wrap gap-3 mb-8"
          >
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <Link key={index} href={action.href}>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-2 px-6 py-3 bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 hover:border-teal-500/50 text-slate-200 hover:text-white rounded-full transition-all duration-300 group"
                  >
                    <Icon className="w-4 h-4 group-hover:text-teal-400 transition-colors" />
                    <span className="font-medium text-sm">{action.label}</span>
                  </motion.button>
                </Link>
              );
            })}
          </motion.div>

          {/* Assets Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mb-8"
          >
            <h3 className="text-xl font-semibold text-white mb-4">Your Assets</h3>
            <div className="space-y-3">
              {assets.map((asset, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.4 + index * 0.1 }}
                  className="rounded-2xl glass border border-white/5 p-4 hover:border-teal-500/20 transition-all duration-300"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-slate-800/50 flex items-center justify-center">
                        {asset.icon === 'stellar' ? (
                          <StellarLogo size={28} className="text-white" />
                        ) : asset.icon === 'usdc' ? (
                          <USDCLogo size={28} className="text-white" />
                        ) : (
                          <span className="text-2xl">{asset.icon}</span>
                        )}
                      </div>
                      <div>
                        <p className="text-white font-semibold">{asset.name}</p>
                        <p className="text-slate-400 text-sm">{asset.code}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-semibold text-lg">{asset.balance} {asset.code}</p>
                      <div className="flex items-center gap-2 justify-end">
                        <p className="text-slate-400 text-sm">${asset.value}</p>
                        <span className="text-green-400 text-xs font-medium">{asset.change}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Recent Transactions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <h3 className="text-xl font-semibold text-white mb-4">Recent Transactions</h3>
            <div className="space-y-3">
              {transactions.map((tx, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.5 + index * 0.1 }}
                  className="rounded-2xl glass border border-white/5 p-4 flex items-center justify-between hover:border-teal-500/20 transition-all duration-300"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      tx.type === 'send' 
                        ? 'bg-red-500/20 border border-red-500/30' 
                        : 'bg-green-500/20 border border-green-500/30'
                    }`}>
                      {tx.type === 'send' ? (
                        <ArrowUpRight className="w-5 h-5 text-red-400" />
                      ) : (
                        <ArrowDownLeft className="w-5 h-5 text-green-400" />
                      )}
                    </div>
                    <div>
                      <p className="text-white font-medium text-sm sm:text-base">{tx.address}</p>
                      <p className="text-slate-400 text-xs">{tx.time}</p>
                    </div>
                  </div>
                  <p className={`font-semibold text-base sm:text-lg ${
                    tx.type === 'send' ? 'text-red-400' : 'text-green-400'
                  }`}>
                    {tx.amount} XLM
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
    </DashboardLayout>
  );
}
=======
import { redirect } from "next/navigation";

export default function Home() {
  redirect("/onboarding");
}

>>>>>>> 8af063860f0d2dadd53e73ed7d1705cd4787b45b

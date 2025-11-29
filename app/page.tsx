'use client';

import { useWallet } from '@/context/WalletContext';
import ConnectWallet from '@/components/ConnectWallet';
import { motion } from 'framer-motion';
import { Send, Download, ArrowLeftRight, ScanLine, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  const { account, balances, isLoading } = useWallet();

  if (!account) {
    return <ConnectWallet />;
  }

  const xlmBalance = balances.find(b => b.asset === 'XLM')?.amount || '0';
  const formattedBalance = parseFloat(xlmBalance).toFixed(2);

  // Mock transaction data - replace with real data later
  const transactions = [
    { type: 'send', address: 'GABCD...XYZ123', amount: '-50.00', time: '2h ago' },
    { type: 'receive', address: 'GEFGH...UVW456', amount: '+200.00', time: '1d ago' },
    { type: 'send', address: 'GIJKL...RST789', amount: '-25.50', time: '3d ago' },
  ];

  const actionButtons = [
    { icon: Send, label: 'Send', href: '/send', color: 'from-teal-400 to-teal-600' },
    { icon: Download, label: 'Receive', href: '/receive', color: 'from-violet-soft to-purple-500' },
    { icon: ArrowLeftRight, label: 'Swap', href: '/swap', color: 'from-teal-400 to-cyan-500' },
    { icon: ScanLine, label: 'Scan', href: '/scan', color: 'from-violet-soft to-pink-500' },
  ];

  return (
    <main className="min-h-screen bg-midnight text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex justify-between items-center mb-8"
        >
          <h1 className="text-3xl sm:text-4xl font-bold text-white">Wallet</h1>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full glass border border-teal-500/30">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
            <span className="text-sm font-medium text-slate-300">Security Score: 98</span>
          </div>
        </motion.div>

        {/* Balance Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="relative rounded-3xl p-8 sm:p-12 mb-8 gradient-mesh border border-white/5 overflow-hidden"
        >
          <div className="relative z-10">
            <p className="text-slate-400 text-sm sm:text-base mb-2">Total Balance</p>
            <h2 className="text-5xl sm:text-7xl font-bold text-white mb-2">
              {isLoading ? '...' : formattedBalance}
            </h2>
            <p className="text-teal-400 text-lg sm:text-xl font-medium">XLM</p>
          </div>
        </motion.div>

        {/* Action Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="grid grid-cols-4 gap-4 mb-12"
        >
          {actionButtons.map((action, index) => (
            <Link key={index} href={action.href}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`w-full aspect-square rounded-full bg-gradient-to-br ${action.color} flex flex-col items-center justify-center gap-2 border border-white/10 hover:border-teal-500/30 transition-all duration-300`}
              >
                <action.icon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                <span className="text-xs sm:text-sm font-medium text-white">{action.label}</span>
              </motion.button>
            </Link>
          ))}
        </motion.div>

        {/* Transaction List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="space-y-3"
        >
          <h3 className="text-lg font-semibold text-slate-300 mb-4">Recent Transactions</h3>
          {transactions.map((tx, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.4 + index * 0.1 }}
              className="rounded-3xl glass border border-white/5 p-4 flex items-center justify-between hover:border-teal-500/20 transition-all duration-300"
            >
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
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
        </motion.div>
      </div>
    </main>
  );
}


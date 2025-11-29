'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home as HomeIcon,
  Wallet as WalletIcon,
  Shield,
  Settings
} from 'lucide-react';
import { StellarLogo } from '@/components/icons/StellarLogo';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const menuItems = [
  { id: 'dashboard', icon: HomeIcon, label: 'Dashboard', href: '/' },
  { id: 'wallet', icon: WalletIcon, label: 'Wallet', href: '/wallet' },
  { id: 'security', icon: Shield, label: 'Security Center', href: '/security', highlight: true },
  { id: 'settings', icon: Settings, label: 'Settings', href: '/settings' },
];

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const pathname = usePathname();
  
  const getActiveMenu = () => {
    if (pathname === '/') return 'dashboard';
    if (pathname === '/wallet') return 'wallet';
    if (pathname === '/settings') return 'settings';
    if (pathname?.includes('security')) return 'security';
    return 'dashboard';
  };
  
  const activeMenu = getActiveMenu();

  return (
    <div className="min-h-screen bg-slate-950 flex">
      {/* Sidebar */}
      <motion.aside
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="fixed left-0 top-0 h-screen w-64 bg-slate-900/80 backdrop-blur-md border-r border-slate-800/50 z-40"
      >
        <div className="p-6">
          {/* Logo/Brand */}
          <div className="mb-8">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-400 to-purple-500 flex items-center justify-center p-2">
                <StellarLogo size={24} className="text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                Stellar
              </span>
            </Link>
          </div>

          {/* Menu Items */}
          <nav className="space-y-2">
            {menuItems.map((item) => {
              const isActive = activeMenu === item.id;
              const Icon = item.icon;
              
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`relative w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                    isActive
                      ? 'bg-gradient-to-r from-teal-500/20 to-purple-500/20 border border-teal-500/30 shadow-lg shadow-teal-500/10'
                      : item.highlight
                      ? 'hover:bg-slate-800/50 border border-teal-500/20 bg-teal-500/5'
                      : 'hover:bg-slate-800/50 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {isActive && (
                      <motion.div
                        layoutId="activeMenu"
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-teal-400 to-purple-500 rounded-r-full"
                      />
                    )}
                    <Icon className={`w-5 h-5 ${
                      isActive ? 'text-teal-400' : item.highlight ? 'text-teal-400' : 'text-slate-400'
                    }`} />
                    <span className={`font-medium ${
                      isActive ? 'text-white' : item.highlight ? 'text-teal-300' : 'text-slate-300'
                    }`}>
                      {item.label}
                    </span>
                  </div>
                  {item.highlight && !isActive && (
                    <span className="px-2 py-0.5 text-xs font-semibold text-teal-400 bg-teal-500/10 rounded-full border border-teal-500/20">
                      New
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Security Score Badge */}
          <div className="mt-8 p-4 rounded-xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
              <span className="text-xs font-medium text-green-400">Security Score</span>
            </div>
            <p className="text-2xl font-bold text-white">98</p>
          </div>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 ml-64">
        {children}
      </main>
    </div>
  );
};


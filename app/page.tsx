'use client';

import { useWallet } from '@/context/WalletContext';
import ConnectWallet from '@/components/ConnectWallet';
import Dashboard from '@/components/Dashboard';

export default function Home() {
  const { account } = useWallet();

  return (
    <main>
      {!account ? <ConnectWallet /> : <Dashboard />}
    </main>
  );
}


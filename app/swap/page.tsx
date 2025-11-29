'use client';

import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function SwapPage() {
  return (
    <main className="min-h-screen bg-midnight text-white px-4 py-8 sm:py-12">
      <div className="max-w-2xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center"
        >
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">Swap</h1>
          <p className="text-slate-400 text-lg">Token swap functionality coming soon</p>
        </motion.div>
      </div>
    </main>
  );
}


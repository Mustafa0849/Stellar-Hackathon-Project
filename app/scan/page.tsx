'use client';

import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { motion } from 'framer-motion';
import { ScanLine, Upload, X } from 'lucide-react';
import { useState } from 'react';

export default function ScanPage() {
  const [isScanning, setIsScanning] = useState(false);

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto px-6 sm:px-8 py-8 sm:py-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8 text-center"
        >
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">Scan QR Code</h1>
          <p className="text-slate-400">Scan a QR code to send or receive payments</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="relative"
        >
          {/* Camera Viewfinder */}
          <div className="relative rounded-3xl backdrop-blur-md bg-gradient-to-br from-slate-900/80 via-slate-800/60 to-indigo-900/40 border border-slate-700/50 shadow-2xl overflow-hidden aspect-square">
            {/* Scanning Overlay */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative w-64 h-64">
                {/* Corner indicators */}
                <div className="absolute top-0 left-0 w-12 h-12 border-t-4 border-l-4 border-teal-400 rounded-tl-2xl"></div>
                <div className="absolute top-0 right-0 w-12 h-12 border-t-4 border-r-4 border-teal-400 rounded-tr-2xl"></div>
                <div className="absolute bottom-0 left-0 w-12 h-12 border-b-4 border-l-4 border-teal-400 rounded-bl-2xl"></div>
                <div className="absolute bottom-0 right-0 w-12 h-12 border-b-4 border-r-4 border-teal-400 rounded-br-2xl"></div>
                
                {/* Scanning line animation */}
                {isScanning && (
                  <motion.div
                    initial={{ top: 0 }}
                    animate={{ top: '100%' }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: 'linear',
                    }}
                    className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-teal-400 to-transparent"
                  />
                )}
              </div>
            </div>

            {/* Instructions */}
            <div className="absolute bottom-8 left-0 right-0 text-center px-6">
              <p className="text-slate-300 text-lg font-medium mb-2">
                Align QR Code within frame to scan
              </p>
              <p className="text-slate-500 text-sm">
                Make sure the QR code is clearly visible
              </p>
            </div>

            {/* Camera placeholder */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900/50 to-slate-800/50 flex items-center justify-center">
              <div className="text-center">
                <ScanLine className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-500">Camera view</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 space-y-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsScanning(!isScanning)}
              className={`w-full py-4 px-6 rounded-full font-semibold transition-all duration-300 ${
                isScanning
                  ? 'bg-red-500/20 border-2 border-red-500/50 text-red-400 hover:bg-red-500/30'
                  : 'bg-gradient-to-r from-teal-400 to-purple-500 hover:from-teal-500 hover:to-purple-600 text-white shadow-lg shadow-teal-500/20'
              }`}
            >
              {isScanning ? (
                <span className="flex items-center justify-center gap-2">
                  <X className="w-5 h-5" />
                  Stop Scanning
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <ScanLine className="w-5 h-5" />
                  Start Scanning
                </span>
              )}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 hover:border-teal-500/50 text-slate-200 hover:text-white font-semibold py-4 px-6 rounded-full transition-all duration-300 flex items-center justify-center gap-2"
            >
              <Upload className="w-5 h-5" />
              Or upload an image
            </motion.button>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}

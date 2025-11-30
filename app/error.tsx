"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="w-full h-full bg-slate-950 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-slate-900 rounded-2xl border border-slate-800 p-8 text-center">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-red-900/30 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-red-400" />
          </div>
        </div>
        
        <h1 className="text-2xl font-bold text-white mb-3">
          Something went wrong
        </h1>
        
        <p className="text-slate-400 mb-6">
          An unexpected error occurred. Please try again or contact support if the problem persists.
        </p>

        {error.message && (
          <div className="bg-slate-800 rounded-lg p-4 mb-6 text-left">
            <p className="text-xs text-slate-500 mb-1">Error details:</p>
            <p className="text-sm text-red-400 font-mono break-all">
              {error.message}
            </p>
          </div>
        )}

        <div className="flex space-x-3">
          <button
            onClick={reset}
            className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg transition-colors"
          >
            <RefreshCw className="w-5 h-5" />
            <span>Try Again</span>
          </button>
        </div>
      </div>
    </div>
  );
}


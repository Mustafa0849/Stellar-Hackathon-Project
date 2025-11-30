/**
 * API Service Layer for Stellar Wallet Backend
 * 
 * This file contains all API calls to the backend server.
 * Update NEXT_PUBLIC_API_URL in .env.local to point to your backend.
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

// Types
export interface WalletResponse {
  address: string
  publicKey: string
  secretKey?: string // Only returned during creation
}

export interface BalanceResponse {
  total: string
  assets: Asset[]
}

export interface Asset {
  symbol: string
  name: string
  balance: string
  available: string
  price?: string
  contract?: string
}

export interface Transaction {
  id: string
  type: "send" | "receive"
  from: string
  to: string
  amount: string
  token: string
  time: string
  status: "pending" | "confirmed" | "failed"
  txHash?: string
}

export interface CreateWalletRequest {
  recoveryPhrase: string[]
  password: string
}

export interface ImportWalletRequest {
  recoveryPhrase?: string[]
  privateKey?: string
  password: string
}

export interface SendTransactionRequest {
  to: string
  amount: string
  asset: string
  memo?: string
}

export interface SwapRequest {
  fromAsset: string
  toAsset: string
  amount: string
}

// Helper function for API calls
async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_URL}${endpoint}`
  
  const defaultHeaders: HeadersInit = {
    "Content-Type": "application/json",
  }

  // Add auth token if available
  const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null
  if (token) {
    defaultHeaders["Authorization"] = `Bearer ${token}`
  }

  const response = await fetch(url, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "An error occurred" }))
    throw new Error(error.message || `API Error: ${response.statusText}`)
  }

  return response.json()
}

// Wallet Operations
export const walletAPI = {
  /**
   * Create a new wallet
   */
  createWallet: async (data: CreateWalletRequest): Promise<WalletResponse> => {
    return apiCall<WalletResponse>("/api/wallet/create", {
      method: "POST",
      body: JSON.stringify(data),
    })
  },

  /**
   * Import an existing wallet
   */
  importWallet: async (data: ImportWalletRequest): Promise<WalletResponse> => {
    return apiCall<WalletResponse>("/api/wallet/import", {
      method: "POST",
      body: JSON.stringify(data),
    })
  },

  /**
   * Get wallet balance and assets
   */
  getBalance: async (address: string): Promise<BalanceResponse> => {
    return apiCall<BalanceResponse>(`/api/wallet/balance/${address}`)
  },

  /**
   * Get wallet address
   */
  getAddress: async (): Promise<{ address: string }> => {
    return apiCall<{ address: string }>("/api/wallet/address")
  },
}

// Transaction Operations
export const transactionAPI = {
  /**
   * Send a transaction
   */
  send: async (data: SendTransactionRequest): Promise<Transaction> => {
    return apiCall<Transaction>("/api/transaction/send", {
      method: "POST",
      body: JSON.stringify(data),
    })
  },

  /**
   * Get transaction history
   */
  getHistory: async (address: string, limit = 20): Promise<Transaction[]> => {
    return apiCall<Transaction[]>(`/api/transaction/history/${address}?limit=${limit}`)
  },

  /**
   * Get transaction details
   */
  getDetails: async (txId: string): Promise<Transaction> => {
    return apiCall<Transaction>(`/api/transaction/${txId}`)
  },
}

// Asset Operations
export const assetAPI = {
  /**
   * Get asset price
   */
  getPrice: async (symbol: string): Promise<{ price: string; change24h: number }> => {
    return apiCall<{ price: string; change24h: number }>(`/api/asset/price/${symbol}`)
  },

  /**
   * Swap assets
   */
  swap: async (data: SwapRequest): Promise<Transaction> => {
    return apiCall<Transaction>("/api/asset/swap", {
      method: "POST",
      body: JSON.stringify(data),
    })
  },

  /**
   * Get testnet USDC (faucet)
   */
  getTestnetUSDC: async (): Promise<Transaction> => {
    return apiCall<Transaction>("/api/asset/faucet/usdc", {
      method: "POST",
    })
  },
}

// Auth Operations
export const authAPI = {
  /**
   * Login/Unlock wallet
   */
  login: async (password: string): Promise<{ token: string }> => {
    const response = await apiCall<{ token: string }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ password }),
    })
    
    // Store token
    if (typeof window !== "undefined") {
      localStorage.setItem("authToken", response.token)
    }
    
    return response
  },

  /**
   * Reset password using recovery phrase
   */
  resetPassword: async (recoveryPhrase: string[], newPassword: string): Promise<void> => {
    return apiCall<void>("/api/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ recoveryPhrase, newPassword }),
    })
  },

  /**
   * Logout
   */
  logout: (): void => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("authToken")
    }
  },
}

// Network Operations
export const networkAPI = {
  /**
   * Get network status
   */
  getStatus: async (): Promise<{ status: string; network: "testnet" | "mainnet" }> => {
    return apiCall<{ status: string; network: "testnet" | "mainnet" }>("/api/network/status")
  },

  /**
   * Switch network
   */
  switchNetwork: async (network: "testnet" | "mainnet"): Promise<void> => {
    return apiCall<void>("/api/network/switch", {
      method: "POST",
      body: JSON.stringify({ network }),
    })
  },
}


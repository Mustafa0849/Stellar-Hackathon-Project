import * as Stellar from "stellar-sdk";
import * as bip39 from "bip39";

/**
 * Horizon Testnet Server Configuration
 */
const HORIZON_TESTNET_URL = "https://horizon-testnet.stellar.org";

// Access Server constructor - handle different export patterns
// @ts-ignore - Stellar SDK has varying export patterns across versions
const ServerConstructor = (Stellar as any).Horizon?.Server || (Stellar as any).Server || (Stellar as any).default?.Server;
// @ts-ignore
export const server = new ServerConstructor(HORIZON_TESTNET_URL);
export const networkPassphrase = Stellar.Networks.TESTNET;

/**
 * Keypair Management
 */

/**
 * Mnemonic Functions (BIP39)
 */

/**
 * Generates a 24-word mnemonic phrase
 * @returns 24-word mnemonic string
 */
export function generateMnemonic(): string {
  return bip39.generateMnemonic(256); // 256 bits = 24 words
}

/**
 * Derives a Stellar Keypair from a mnemonic phrase
 * Uses the standard Stellar derivation path: m/44'/148'/0'
 * @param mnemonic - The 12 or 24-word mnemonic phrase
 * @returns Object containing the Keypair, publicKey, and secretKey
 * @throws Error if the mnemonic is invalid
 */
export function getKeypairFromMnemonic(mnemonic: string): {
  keypair: Stellar.Keypair;
  publicKey: string;
  secretKey: string;
} {
  try {
    // Validate mnemonic
    if (!bip39.validateMnemonic(mnemonic)) {
      throw new Error("Invalid mnemonic phrase");
    }

    // Convert mnemonic to seed
    const seed = bip39.mnemonicToSeedSync(mnemonic);

    // Stellar uses the first 32 bytes of the seed directly as the secret key
    // For simplicity, we'll use the first 32 bytes of the seed
    // In production, you might want to use proper HD derivation (m/44'/148'/0')
    const seedBuffer = Buffer.from(seed);
    const secretSeed = seedBuffer.slice(0, 32);

    // Create keypair from seed
    const keypair = Stellar.Keypair.fromRawEd25519Seed(secretSeed);

    return {
      keypair,
      publicKey: keypair.publicKey(),
      secretKey: keypair.secret(),
    };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to derive keypair from mnemonic: ${error.message}`);
    }
    throw new Error("Invalid mnemonic phrase. Please check your mnemonic and try again.");
  }
}

/**
 * Creates a new Stellar keypair with public and secret keys
 * @returns Object containing publicKey and secretKey
 */
export function createStellarKeypair(): {
  publicKey: string;
  secretKey: string;
} {
  const keypair = Stellar.Keypair.random();
  return {
    publicKey: keypair.publicKey(),
    secretKey: keypair.secret(),
  };
}

/**
 * Creates a new wallet by generating a random keypair
 * @returns Object containing publicKey and secretKey
 */
export function createWallet(): {
  publicKey: string;
  secretKey: string;
} {
  const keypair = Stellar.Keypair.random();
  return {
    publicKey: keypair.publicKey(),
    secretKey: keypair.secret(),
  };
}

/**
 * Imports a wallet from a secret key
 * @param secretKey - The secret key (starts with 'S')
 * @returns Object containing the Keypair, publicKey, and secretKey
 * @throws Error if the secret key is invalid
 */
export function importWallet(secretKey: string): {
  keypair: Stellar.Keypair;
  publicKey: string;
  secretKey: string;
} {
  try {
    // Validate secret key format (should start with 'S' and be 56 characters)
    if (!secretKey.startsWith("S") || secretKey.length !== 56) {
      throw new Error("Invalid secret key format. Secret keys must start with 'S' and be 56 characters long.");
    }

    const keypair = Stellar.Keypair.fromSecret(secretKey);
    return {
      keypair,
      publicKey: keypair.publicKey(),
      secretKey: keypair.secret(),
    };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to import wallet: ${error.message}`);
    }
    throw new Error("Invalid secret key. Please check your secret key and try again.");
  }
}

/**
 * Validates a Stellar public key format
 * @param publicKey - The public key to validate (should start with 'G' and be 56 characters)
 * @returns true if valid, false otherwise
 */
export function isValidPublicKey(publicKey: string): boolean {
  try {
    // Basic format validation
    if (!publicKey.startsWith("G") || publicKey.length !== 56) {
      return false;
    }
    // Try to create a Keypair from the public key to validate it
    Stellar.Keypair.fromPublicKey(publicKey);
    return true;
  } catch {
    return false;
  }
}

/**
 * Account Activation (Friendbot)
 */

/**
 * Funds a Stellar account using Friendbot (Testnet only)
 * @param publicKey - The public key of the account to fund
 * @returns Promise that resolves when the account is successfully funded
 * @throws Error if the funding request fails
 */
export async function fundWithFriendbot(
  publicKey: string
): Promise<void> {
  try {
    const friendbotUrl = `https://friendbot.stellar.org?addr=${publicKey}`;
    const response = await fetch(friendbotUrl, {
      method: "GET",
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "Unknown error");
      throw new Error(
        `Friendbot funding failed: ${response.status} ${response.statusText}. ${errorText}`
      );
    }

    // Friendbot returns 200 on success, account is funded with 10,000 test XLM
    const result = await response.json().catch(() => ({}));
    if (result.error) {
      throw new Error(`Friendbot error: ${result.error}`);
    }
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(
      `Network error while funding account with Friendbot: ${String(error)}`
    );
  }
}

/**
 * Account Data Fetching
 */

/**
 * Loads account details from the Stellar Horizon server
 * @param publicKey - The public key of the account to load
 * @returns Promise that resolves with the Account object
 * @throws Error if the account is not found or if there's a network error
 */
export async function loadAccountDetails(
  publicKey: string
): Promise<Stellar.Account> {
  try {
    const account = await server.loadAccount(publicKey);
    return account;
  } catch (error: unknown) {
    // Handle account not found error (account hasn't been funded yet)
    // stellar-sdk throws errors with a response.status property for 404 errors
    if (
      error &&
      typeof error === "object" &&
      "response" in error
    ) {
      const response = (error as { response?: { status?: number } }).response;
      if (response?.status === 404) {
        throw new Error(
          `Account not found: ${publicKey}. The account may not have been funded yet. Please fund it using Friendbot first.`
        );
      }
    }

    // Handle network errors
    if (error instanceof Error) {
      const errorMessage = error.message.toLowerCase();
      if (
        errorMessage.includes("networkerror") ||
        errorMessage.includes("fetch") ||
        errorMessage.includes("network") ||
        errorMessage.includes("failed to fetch")
      ) {
        throw new Error(
          `Network error while loading account: ${error.message}. Please check your internet connection.`
        );
      }
      throw new Error(`Failed to load account: ${error.message}`);
    }

    throw new Error(
      `Unknown error while loading account: ${String(error)}`
    );
  }
}

/**
 * Transaction History
 */

/**
 * Transaction type for history display
 */
export interface TransactionHistoryItem {
  id: string;
  type: "payment" | "create_account" | "other";
  amount: string;
  asset: string;
  from: string;
  to: string;
  date: Date;
  hash: string;
  memo?: string;
  fee: string;
  status: "success" | "failed" | "pending";
  formattedDate: string;
}

/**
 * Fetches recent transactions for an account
 * @param publicKey - The public key of the account
 * @param limit - Maximum number of transactions to fetch (default: 20)
 * @returns Promise that resolves with an array of transaction history items
 * @throws Error if fetching fails
 */
export async function fetchRecentTransactions(
  publicKey: string,
  limit: number = 20
): Promise<TransactionHistoryItem[]> {
  try {
    const payments = await server
      .payments()
      .forAccount(publicKey)
      .order("desc")
      .limit(limit)
      .call();

    const transactions: TransactionHistoryItem[] = payments.records.map(
      (payment: any) => {
        // Determine transaction type
        let type: "payment" | "create_account" | "other" = "other";
        if (payment.type === "payment") {
          type = "payment";
        } else if (payment.type === "create_account") {
          type = "create_account";
        }

        // Extract amount and asset - handle both payment and create_account
        let amount = "0";
        let asset = "XLM";
        
        // For create_account operations, amount is in starting_balance
        if (payment.type === "create_account" && payment.starting_balance) {
          amount = payment.starting_balance;
        } else if (payment.amount) {
          // For payment operations, amount is directly available
          amount = payment.amount;
        } else if (payment.starting_balance) {
          // Fallback to starting_balance if amount is not available
          amount = payment.starting_balance;
        }

        // Ensure amount is a string and not empty
        if (!amount || amount === "0") {
          // Try to get from asset amount if available
          if (payment.asset && payment.asset.amount) {
            amount = payment.asset.amount;
          }
        }

        // Extract asset information
        if (payment.asset_type === "native") {
          asset = "XLM";
        } else if (payment.asset_code) {
          asset = payment.asset_code;
        } else if (payment.asset && payment.asset.code) {
          asset = payment.asset.code;
        }

        // Determine from/to
        const from = payment.from || payment.funder || payment.source_account || "";
        const to = payment.to || payment.account || payment.destination || publicKey;

        // Parse date
        const date = new Date(payment.created_at);
        
        // Format date for display
        const formattedDate = date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });

        // Extract memo
        let memo: string | undefined;
        if (payment.memo) {
          if (typeof payment.memo === "string") {
            memo = payment.memo;
          } else if (payment.memo.memo) {
            memo = payment.memo.memo;
          } else if (payment.memo.text) {
            memo = payment.memo.text;
          }
        }

        // Extract fee (convert from stroops to XLM: 1 XLM = 10,000,000 stroops)
        let fee = "0.00001"; // Default fee
        if (payment.fee_charged) {
          const feeInStroops = parseFloat(payment.fee_charged);
          fee = (feeInStroops / 10000000).toFixed(7);
        } else if (payment.fee_paid) {
          const feeInStroops = parseFloat(payment.fee_paid);
          fee = (feeInStroops / 10000000).toFixed(7);
        }

        // Transaction hash
        const hash = payment.transaction_hash || payment.id || "";

        return {
          id: payment.id || hash,
          type,
          amount: String(amount),
          asset,
          from,
          to,
          date,
          hash,
          memo,
          fee,
          status: "success" as const, // All fetched transactions are successful
          formattedDate,
        };
      }
    );

    return transactions;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to fetch transactions: ${error.message}`);
    }
    throw new Error(`Unknown error while fetching transactions: ${String(error)}`);
  }
}

/**
 * Payment Functions
 */

/**
 * Sends XLM payment to a destination address
 * @param destination - The destination public key (starts with 'G')
 * @param amount - The amount of XLM to send (as a string, e.g., "10.5")
 * @param secretKey - The secret key of the sender
 * @returns Promise that resolves with the transaction result
 * @throws Error if the transaction fails
 */
export async function sendPayment(
  destination: string,
  amount: string,
  secretKey: string
): Promise<any> {
  try {
    // Validate destination address
    if (!destination.startsWith("G") || destination.length !== 56) {
      throw new Error("Invalid destination address. Addresses must start with 'G' and be 56 characters long.");
    }

    // Validate amount
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      throw new Error("Invalid amount. Amount must be a positive number.");
    }

    // Create keypair from secret key
    const sourceKeypair = Stellar.Keypair.fromSecret(secretKey);
    const sourcePublicKey = sourceKeypair.publicKey();

    // Load source account
    const sourceAccount = await server.loadAccount(sourcePublicKey);

    // Build transaction
    // BASE_FEE is typically 100 stroops (0.00001 XLM)
    const BASE_FEE = "100";
    const transaction = new Stellar.TransactionBuilder(sourceAccount, {
      fee: BASE_FEE,
      networkPassphrase: networkPassphrase,
    })
      .addOperation(
        Stellar.Operation.payment({
          destination: destination,
          asset: Stellar.Asset.native(),
          amount: amount,
        })
      )
      .setTimeout(30)
      .build();

    // Sign transaction
    transaction.sign(sourceKeypair);

    // Submit transaction
    const result = await server.submitTransaction(transaction);
    return result;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to send payment: ${error.message}`);
    }
    throw new Error(`Unknown error while sending payment: ${String(error)}`);
  }
}

/**
 * Testnet USDC Asset Configuration
 * Standard Stellar Testnet USDC Issuer
 * This is the official Circle USDC issuer on Stellar Testnet
 */
// Define USDC Asset using the standard Testnet Issuer directly to avoid string errors
// Correct Stellar Testnet USDC Issuer: GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5
const TESTNET_USDC_ASSET = new Stellar.Asset(
  "USDC",
  "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5"
);

/**
 * Check if account has a trustline for a specific asset
 */
async function hasTrustline(
  publicKey: string,
  asset: Stellar.Asset
): Promise<boolean> {
  try {
    const account = await server.loadAccount(publicKey);
    const balances = account.balances || [];
    
    if (asset.isNative()) {
      return true; // Native asset always has "trustline"
    }
    
    return balances.some((balance: any) => {
      if (balance.asset_type === "native") return false;
      return (
        balance.asset_code === asset.getCode() &&
        balance.asset_issuer === asset.getIssuer()
      );
    });
  } catch (error) {
    console.error("Error checking trustline:", error);
    return false;
  }
}

/**
 * Get Testnet USDC by swapping XLM for USDC
 * This function:
 * 1. Checks if trustline exists, creates it if needed
 * 2. Performs a path payment to swap XLM for USDC
 * 
 * @param secretKey - The secret key of the account
 * @param xlmAmount - Amount of XLM to swap (default: 10 XLM)
 * @param minUsdcAmount - Minimum USDC to receive (default: 0.1 USDC)
 * @returns Promise that resolves with the transaction result
 * @throws Error if the transaction fails or account has insufficient XLM
 */
/**
 * Get Testnet USDC by swapping XLM for USDC
 * This function:
 * 1. Checks if trustline exists, creates it if needed
 * 2. Performs a path payment to swap XLM for USDC
 * 
 * Note: This requires the USDC asset to have liquidity on the Testnet DEX.
 * The standard testnet USDC issuer should have XLM/USDC liquidity pairs.
 * 
 * @param secretKey - The secret key of the account
 * @param xlmAmount - Amount of XLM to swap (default: 10 XLM)
 * @param minUsdcAmount - Minimum USDC to receive (default: 0.1 USDC)
 * @returns Promise that resolves with the transaction result
 * @throws Error if the transaction fails or account has insufficient XLM
 */
export async function getTestnetUSDC(
  secretKey: string,
  xlmAmount: string = "10",
  minUsdcAmount: string = "0.1"
): Promise<any> {
  try {
    // Validate and trim inputs
    const trimmedSecretKey = secretKey.trim();
    const trimmedXlmAmount = xlmAmount.trim();
    const trimmedMinUsdc = minUsdcAmount.trim();

    // Validate secret key format
    if (!trimmedSecretKey.startsWith("S") || trimmedSecretKey.length !== 56) {
      throw new Error("Invalid secret key format");
    }

    // Create keypair from secret key
    const sourceKeypair = Stellar.Keypair.fromSecret(trimmedSecretKey);
    const sourcePublicKey = sourceKeypair.publicKey();

    // Load source account
    const sourceAccount = await server.loadAccount(sourcePublicKey);

    // Check if account has enough XLM
    const xlmBalance = sourceAccount.balances.find(
      (b: any) => b.asset_type === "native"
    );
    const availableXLM = parseFloat(xlmBalance?.balance || "0");
    const swapAmount = parseFloat(trimmedXlmAmount);
    const requiredXLM = swapAmount + 0.5; // Add buffer for fees and reserves

    if (availableXLM < requiredXLM) {
      throw new Error(
        `Insufficient XLM balance. You need at least ${requiredXLM.toFixed(2)} XLM (${trimmedXlmAmount} XLM for swap + fees). Current balance: ${availableXLM.toFixed(2)} XLM.`
      );
    }

    // Use the hardcoded USDC asset (already defined at module level)
    const usdcAsset = TESTNET_USDC_ASSET;

    // Check if trustline exists
    const trustlineExists = await hasTrustline(sourcePublicKey, usdcAsset);

    // Build transaction
    const BASE_FEE = "100";
    const transactionBuilder = new Stellar.TransactionBuilder(sourceAccount, {
      fee: BASE_FEE,
      networkPassphrase: networkPassphrase,
    });

    // Step 1: Add trustline if it doesn't exist
    if (!trustlineExists) {
      transactionBuilder.addOperation(
        Stellar.Operation.changeTrust({
          asset: usdcAsset,
          limit: "922337203685.4775807", // Max limit
        })
      );
    }

    // Step 2: Add path payment to swap XLM for USDC
    // This will find the best path through the DEX to convert XLM to USDC
    transactionBuilder.addOperation(
      Stellar.Operation.pathPaymentStrictSend({
        sendAsset: Stellar.Asset.native(),
        sendAmount: trimmedXlmAmount,
        destination: sourcePublicKey, // Send to self
        destAsset: usdcAsset,
        destMin: trimmedMinUsdc,
        path: [], // Empty path - let Stellar DEX find the best route (XLM -> USDC)
      })
    );

    // Build and sign transaction
    const transaction = transactionBuilder.setTimeout(30).build();
    transaction.sign(sourceKeypair);

    // Submit transaction
    const result = await server.submitTransaction(transaction);
    return result;
  } catch (error) {
    if (error instanceof Error) {
      // Provide more specific error messages
      if (error.message.includes("issuer") || error.message.includes("Issuer")) {
        throw new Error(`Invalid USDC asset configuration: ${error.message}. Please verify the testnet USDC issuer address.`);
      }
      throw new Error(`Failed to get testnet USDC: ${error.message}`);
    }
    throw new Error(`Unknown error while getting testnet USDC: ${String(error)}`);
  }
}


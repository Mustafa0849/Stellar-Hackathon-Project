/**
 * WalletService - Singleton wrapper for Stellar wallet operations
 * Uses @stellar/stellar-sdk for all blockchain operations
 */

import { Keypair, TransactionBuilder, Operation, Networks, Asset, BASE_FEE, Horizon } from '@stellar/stellar-sdk';

export interface WalletAccount {
  publicKey: string;
  secretKey: string;
  keypair: Keypair;
}

export interface Balance {
  asset: string;
  amount: string;
}

export interface TransferParams {
  destination: string;
  amount: string;
  asset?: string; // Defaults to XLM
}

class WalletService {
  private static instance: WalletService;
  private server: Horizon.Server | null = null;
  private currentAccount: WalletAccount | null = null;
  private isInitialized: boolean = false;
  private readonly HORIZON_TESTNET_URL = 'https://horizon-testnet.stellar.org';
  private readonly FRIENDBOT_URL = 'https://friendbot.stellar.org';

  private constructor() {
    // Private constructor for Singleton pattern
  }

  /**
   * Get the singleton instance of WalletService
   */
  public static getInstance(): WalletService {
    if (!WalletService.instance) {
      WalletService.instance = new WalletService();
    }
    return WalletService.instance;
  }

  /**
   * Initialize the wallet service with Stellar Testnet configuration
   */
  public async init(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      // Initialize Horizon server for Testnet
      this.server = new Horizon.Server(this.HORIZON_TESTNET_URL, { allowHttp: true });
      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize wallet service:', error);
      throw new Error('Failed to initialize wallet service. Please check your network connection.');
    }
  }

  /**
   * Create a new Stellar account
   * Generates a new keypair and funds it on Testnet using Friendbot
   */
  public async createAccount(): Promise<WalletAccount> {
    if (!this.server) {
      await this.init();
    }

    try {
      // Generate a new keypair
      const keypair = Keypair.random();
      
      const account: WalletAccount = {
        publicKey: keypair.publicKey(),
        secretKey: keypair.secret(),
        keypair,
      };

      // Fund the account on Testnet using Friendbot
      try {
        const response = await fetch(`${this.FRIENDBOT_URL}?addr=${account.publicKey}`);
        if (!response.ok) {
          throw new Error('Failed to fund account on testnet');
        }
        // Wait a bit for the transaction to be processed
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (error) {
        console.error('Friendbot funding failed:', error);
        // Still return the account even if funding fails (for development)
        console.warn('Account created but not funded. You may need to fund it manually.');
      }

      this.currentAccount = account;
      return account;
    } catch (error) {
      console.error('Failed to create account:', error);
      throw new Error('Failed to create account. Please try again.');
    }
  }

  /**
   * Recover an existing account using a secret key
   * @param secretKey - The secret key of the account to recover
   */
  public async recoverAccount(secretKey: string): Promise<WalletAccount> {
    if (!this.server) {
      await this.init();
    }

    try {
      // Create keypair from secret key
      const keypair = Keypair.fromSecret(secretKey);

      const account: WalletAccount = {
        publicKey: keypair.publicKey(),
        secretKey: keypair.secret(),
        keypair,
      };

      // Verify account exists on network by trying to load it
      if (!this.server) {
        throw new Error('Server not initialized');
      }
      try {
        await this.server.loadAccount(account.publicKey);
      } catch (error: any) {
        if (error.response?.status === 404) {
          throw new Error('Account not found on network. It may not exist yet.');
        }
        throw error;
      }

      this.currentAccount = account;
      return account;
    } catch (error: any) {
      console.error('Failed to recover account:', error);
      if (error.message?.includes('Invalid secret key')) {
        throw new Error('Invalid secret key format. Please check and try again.');
      }
      throw new Error(error.message || 'Failed to recover account. Please check your secret key.');
    }
  }

  /**
   * Get the current account's balance
   * @param publicKey - Optional public key, defaults to current account
   */
  public async getBalance(publicKey?: string): Promise<Balance[]> {
    if (!this.server) {
      await this.init();
    }

    const accountPublicKey = publicKey || this.currentAccount?.publicKey;
    if (!accountPublicKey) {
      throw new Error('No account selected. Please create or recover an account first.');
    }

    try {
      // Load account data from Horizon
      if (!this.server) {
        throw new Error('Server not initialized');
      }
      const account = await this.server.loadAccount(accountPublicKey);
      
      const balances: Balance[] = account.balances.map((balance: any) => {
        if (balance.asset_type === 'native') {
          return {
            asset: 'XLM',
            amount: balance.balance,
          };
        } else {
          return {
            asset: `${balance.asset_code}:${balance.asset_issuer}`,
            amount: balance.balance,
          };
        }
      });

      return balances;
    } catch (error: any) {
      console.error('Failed to fetch balance:', error);
      if (error.response?.status === 404) {
        throw new Error('Account not found on network.');
      }
      throw new Error('Failed to fetch balance. Please check your network connection.');
    }
  }

  /**
   * Transfer XLM or other assets
   * @param params - Transfer parameters (destination, amount, optional asset)
   */
  public async transfer(params: TransferParams): Promise<string> {
    if (!this.server) {
      await this.init();
    }

    if (!this.currentAccount) {
      throw new Error('No account selected. Please create or recover an account first.');
    }

    try {
      if (!this.server) {
        throw new Error('Server not initialized');
      }
      // Load the source account to get the current sequence number
      const sourceAccount = await this.server.loadAccount(this.currentAccount.publicKey);

      // Determine the asset (default to native XLM)
      let asset: Asset;
      if (params.asset && params.asset !== 'XLM') {
        // Parse asset code and issuer (format: "CODE:ISSUER")
        const [code, issuer] = params.asset.split(':');
        if (!issuer) {
          throw new Error('Invalid asset format. Use "CODE:ISSUER" for non-native assets.');
        }
        asset = new Asset(code, issuer);
      } else {
        asset = Asset.native();
      }

      // Build the transaction
      const transaction = new TransactionBuilder(sourceAccount, {
        fee: BASE_FEE,
        networkPassphrase: Networks.TESTNET,
      })
        .addOperation(
          Operation.payment({
            destination: params.destination,
            asset: asset,
            amount: params.amount,
          })
        )
        .setTimeout(30)
        .build();

      // Sign the transaction
      transaction.sign(this.currentAccount.keypair);

      // Submit the transaction
      if (!this.server) {
        throw new Error('Server not initialized');
      }
      const result = await this.server.submitTransaction(transaction);
      
      return result.hash;
    } catch (error: any) {
      console.error('Failed to transfer:', error);
      
      // Provide user-friendly error messages
      if (error.response?.data?.extras?.result_codes?.operations) {
        const opCode = error.response.data.extras.result_codes.operations[0];
        if (opCode === 'op_underfunded') {
          throw new Error('Insufficient balance for this transaction.');
        }
      }
      if (error.message?.includes('insufficient')) {
        throw new Error('Insufficient balance for this transaction.');
      } else if (error.message?.includes('invalid') || error.message?.includes('Invalid')) {
        throw new Error('Invalid destination address or amount.');
      } else {
        throw new Error(error.message || 'Transaction failed. Please try again.');
      }
    }
  }

  /**
   * Get the current active account
   */
  public getCurrentAccount(): WalletAccount | null {
    return this.currentAccount;
  }

  /**
   * Clear the current account (logout)
   */
  public clearAccount(): void {
    this.currentAccount = null;
  }

  /**
   * Check if wallet service is initialized
   */
  public getIsInitialized(): boolean {
    return this.isInitialized;
  }
}

export default WalletService;

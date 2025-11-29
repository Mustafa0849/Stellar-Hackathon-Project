<<<<<<< HEAD
# Stellar Security Wallet MVP

A Security-First Wallet MVP built for the Stellar Hackathon using Next.js 14+, TypeScript, and the `@stellar/wallet-sdk`.

## Features

- **Onboarding**: Create new accounts or recover existing ones using secret keys
- **Balance Viewing**: Display XLM and other asset balances
- **Transfers**: Send XLM transactions on Stellar Testnet
- **Security-First**: Secret keys are handled securely and never stored on servers

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript (Strict mode)
- **Styling**: Tailwind CSS
- **Blockchain SDK**: `@stellar/wallet-sdk` (v0.11.2)
- **State Management**: React Context API

## Installation

1. Install dependencies:
=======
# Stellar Wallet

A Next.js 14 application for managing Stellar blockchain wallets.

## Getting Started

First, install the dependencies:
>>>>>>> 8af063860f0d2dadd53e73ed7d1705cd4787b45b

```bash
npm install
```

<<<<<<< HEAD
## Development

Run the development server:
=======
Then, run the development server:
>>>>>>> 8af063860f0d2dadd53e73ed7d1705cd4787b45b

```bash
npm run dev
```

<<<<<<< HEAD
Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
├── app/
│   ├── layout.tsx          # Root layout with WalletProvider
│   ├── page.tsx             # Main page component
│   └── globals.css          # Global styles
├── components/
│   ├── ConnectWallet.tsx    # Onboarding component
│   └── Dashboard.tsx        # Wallet dashboard
├── context/
│   └── WalletContext.tsx    # Wallet state management
├── lib/
│   └── stellar/
│       └── walletService.ts # Core wallet service (Singleton)
└── package.json
```

## Core Architecture

### WalletService (`lib/stellar/walletService.ts`)

Singleton service that wraps `@stellar/wallet-sdk`:

- `init()`: Initialize connection to Stellar Testnet
- `createAccount()`: Generate new keypair and create account
- `recoverAccount(secretKey)`: Recover account from secret key
- `getBalance(publicKey)`: Fetch account balances
- `transfer(params)`: Send XLM transactions

### WalletContext

React Context providing wallet state and operations to all components.

## Usage

1. **Create Account**: Click "Create New Account" to generate a new Stellar account
2. **Recover Account**: Click "Recover Existing Account" and enter your secret key
3. **View Balance**: After connecting, view your XLM balance on the dashboard
4. **Send XLM**: Enter destination address and amount to send transactions

## Security Notes

- This MVP uses Stellar **Testnet** for development
- Secret keys are handled in memory only and never persisted
- Always use Testnet for development and testing
- Never share your secret keys

## License

MIT
=======
Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

- `app/` - Next.js App Router pages and layouts
- `app/onboarding/` - Onboarding page with wallet creation/import options

## Technologies

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Stellar SDK
- Zustand (State Management)
- Lucide React (Icons)
>>>>>>> 8af063860f0d2dadd53e73ed7d1705cd4787b45b


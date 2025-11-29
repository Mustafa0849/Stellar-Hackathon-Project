# Installation Guide

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

## Step-by-Step Installation

### 1. Install Dependencies

Run the following command to install all required dependencies:

```bash
npm install
```

This will install:
- **Next.js 14+** - React framework
- **@stellar/wallet-sdk** (v0.11.2) - Stellar Wallet SDK (core blockchain library)
- **@stellar/stellar-sdk** - Stellar SDK (for additional utilities if needed)
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling framework
- All other required dependencies

### 2. Verify Installation

Check that all packages are installed correctly:

```bash
npm list --depth=0
```

### 3. Run Development Server

Start the development server:

```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000)

## Troubleshooting

### Issue: `@stellar/wallet-sdk` not found

If you encounter issues with `@stellar/wallet-sdk`, try:

```bash
npm install @stellar/wallet-sdk@latest
```

### Issue: TypeScript errors

Ensure TypeScript is properly installed:

```bash
npm install --save-dev typescript @types/node @types/react @types/react-dom
```

### Issue: Tailwind CSS not working

Make sure PostCSS is configured:

```bash
npm install --save-dev postcss autoprefixer tailwindcss
```

## Next Steps

After installation:

1. Open the application in your browser
2. Click "Create New Account" to generate a test wallet
3. Or use "Recover Existing Account" with a testnet secret key
4. View your balance and send test transactions

## Important Notes

- This MVP uses **Stellar Testnet** - no real funds are involved
- Secret keys are stored in memory only (not persisted)
- For production use, implement proper key storage and encryption


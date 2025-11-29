import type { Metadata } from "next";
<<<<<<< HEAD
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { WalletProvider } from "@/context/WalletContext";

const inter = Inter({ 
  subsets: ["latin"],
  variable: '--font-inter',
  display: 'swap',
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: '--font-jakarta',
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Stellar Security Wallet",
  description: "Security-First Wallet MVP for Stellar Network",
=======
import "./globals.css";

export const metadata: Metadata = {
  title: {
    template: "%s | Nova Wallet",
    default: "Nova Wallet - Stellar Crypto Wallet",
  },
  description: "Experience the speed of Stellar with Nova Wallet. Secure, modern, and fast.",
>>>>>>> 8af063860f0d2dadd53e73ed7d1705cd4787b45b
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
<<<<<<< HEAD
      <body className={`${plusJakarta.variable} ${inter.variable} font-sans antialiased`}>
        <WalletProvider>
          <div className="relative z-10">
            {children}
          </div>
        </WalletProvider>
=======
      <body className="min-h-screen bg-background text-foreground">
        <div className="flex min-h-screen items-center justify-center p-4">
          <div className="w-full max-w-md">{children}</div>
        </div>
>>>>>>> 8af063860f0d2dadd53e73ed7d1705cd4787b45b
      </body>
    </html>
  );
}


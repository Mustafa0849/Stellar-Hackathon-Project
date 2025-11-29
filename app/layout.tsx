import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    template: "%s | Nova Wallet",
    default: "Nova Wallet - Stellar Crypto Wallet",
  },
  description: "Experience the speed of Stellar with Nova Wallet. Secure, modern, and fast.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-background text-foreground">
        <div className="flex min-h-screen items-center justify-center p-4">
          <div className="w-full max-w-md">{children}</div>
        </div>
      </body>
    </html>
  );
}


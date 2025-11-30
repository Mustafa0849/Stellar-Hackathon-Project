"use client";

import "./globals.css";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-background text-foreground" style={{ width: '360px', height: '600px', overflow: 'hidden', margin: 0, padding: 0 }}>
        <div className="w-full h-full overflow-auto">
          {children}
        </div>
      </body>
    </html>
  );
}


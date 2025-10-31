import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Sithe's Harmonic Vault",
  description:
    "Personal music library companion that cleans metadata and keeps your collection ready to play."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-ice text-ink`}>{children}</body>
    </html>
  );
}

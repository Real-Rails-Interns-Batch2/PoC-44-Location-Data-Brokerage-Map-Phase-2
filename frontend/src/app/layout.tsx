import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Real Rails — Location Data Brokerage Map",
  description: "PoC 44 · Distribution & Demand Rail · Real Rails Intelligence Library",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="bg-[#030712] text-slate-200 antialiased">{children}</body>
    </html>
  );
}

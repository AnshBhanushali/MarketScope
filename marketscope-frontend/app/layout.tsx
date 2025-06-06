import React from "react";
import "./globals.css";
import { Geist, Geist_Mono } from "next/font/google";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist-sans" });
const mono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" });

export const metadata = {
  title: "MarketScope",
  description: "AI-driven market intelligence",
};

export const dynamic = "force-dynamic"; // ✅ Add this line

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${geist.variable} ${mono.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Sumit AI – Your AI Consultant",
  description: "AI Consultant for Homeopathy, Yoga, English, and Ayurvedic wellness",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} h-full`} suppressHydrationWarning>
      <body className={`h-full font-[var(--font-inter)] antialiased`} suppressHydrationWarning>{children}</body>
    </html>
  );
}

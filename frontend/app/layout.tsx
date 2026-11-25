import type { Metadata, Viewport } from "next";
import { Inter, Plus_Jakarta_Sans, IBM_Plex_Sans } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import AuthGate from "@/components/AuthGate";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["400", "500", "600", "700"],
});

const ibmPlexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  variable: "--font-ibm-plex",
  weight: ["400", "500", "600", "700"],
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "SumitAI – Your AI Consultant",
  description:
    "AI-powered assistant for Homeopathy, Yoga, Allopathy, Ayurveda, Nutrition, and Mental Wellness",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/images/favicon.png", type: "image/png", sizes: "48x48" },
    ],
    apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${jakarta.variable} ${ibmPlexSans.variable} h-full`} suppressHydrationWarning>
      <body className={`h-full font-[var(--font-inter)] antialiased`} suppressHydrationWarning>
        <AuthProvider>
          <AuthGate>{children}</AuthGate>
        </AuthProvider>
      </body>
    </html>
  );
}

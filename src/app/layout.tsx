import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ELK.Zone 2.0 - Federated Social Media Platform",
  description: "Next-generation federated social media combining Akkoma, Matrix, Reddit-style communities, Threads/Twitter feed, Stories, and live streaming.",
  keywords: ["ELK.Zone", "federated", "social media", "ActivityPub", "Matrix", "Next.js", "TypeScript", "real-time"],
  authors: [{ name: "ELK.Zone Team" }],
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "ELK.Zone 2.0",
    description: "Federated social media platform with real-time features",
    url: "https://elkzone.com",
    siteName: "ELK.Zone",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ELK.Zone 2.0",
    description: "Federated social media platform with real-time features",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}

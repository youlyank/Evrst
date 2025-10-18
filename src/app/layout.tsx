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
<<<<<<< HEAD
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
=======
  title: "Z.ai Code Scaffold - AI-Powered Development",
  description: "Modern Next.js scaffold optimized for AI-powered development with Z.ai. Built with TypeScript, Tailwind CSS, and shadcn/ui.",
  keywords: ["Z.ai", "Next.js", "TypeScript", "Tailwind CSS", "shadcn/ui", "AI development", "React"],
  authors: [{ name: "Z.ai Team" }],
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
  openGraph: {
    title: "Z.ai Code Scaffold",
    description: "AI-powered development with modern React stack",
    url: "https://chat.z.ai",
    siteName: "Z.ai",
>>>>>>> 3e6010f31bad40bef18ce5f8790f80e2506e21ef
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
<<<<<<< HEAD
    title: "ELK.Zone 2.0",
    description: "Federated social media platform with real-time features",
=======
    title: "Z.ai Code Scaffold",
    description: "AI-powered development with modern React stack",
>>>>>>> 3e6010f31bad40bef18ce5f8790f80e2506e21ef
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

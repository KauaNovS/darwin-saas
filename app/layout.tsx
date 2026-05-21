import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
export const metadata: Metadata = { title: "Darwin", description: "Sistema operacional evolutivo contextual", manifest: "/manifest.json", appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "Darwin" } };
export const viewport: Viewport = { themeColor: "#0e0f1a", width: "device-width", initialScale: 1 };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (<html lang="pt-BR"><body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#0e0f1a] text-zinc-100`}>{children}</body></html>);
}
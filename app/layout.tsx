import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import SupportWidget from "./components/SupportWidget";
import { AuthProvider } from "./context/AuthContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LegendaryTopUp — Пополнение игр и сервисов",
  description:
    "Быстрое и безопасное пополнение игровой валюты: PUBG Mobile, Genshin Impact, Mobile Legends, Telegram Premium и другие.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#09090b",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ru"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col overflow-x-hidden bg-zinc-950 text-white">
        <AuthProvider>
          {children}
          <SupportWidget />
        </AuthProvider>
      </body>
    </html>
  );
}

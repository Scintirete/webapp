import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import {NextIntlClientProvider} from 'next-intl';
import {getMessages} from 'next-intl/server';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Scintirete - 开源高性能向量数据库",
  description: "Scintirete 是一个简单、轻量、面向生产的高性能向量数据库，为中小型项目和边缘计算场景而设计。点亮数据之网，发现无限近邻。",
  keywords: ["Scintirete", "向量数据库", "vector database", "HNSW", "相似性搜索", "开源", "高性能", "gRPC", "HTTP"],
  authors: [{ name: "Scintirete Team" }],
  openGraph: {
    title: "Scintirete - 开源高性能向量数据库",
    description: "点亮数据之网，发现无限近邻。简单、轻量、面向生产的向量数据库。",
    url: "https://github.com/Scintirete/Scintirete/",
    siteName: "Scintirete",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Scintirete - 开源高性能向量数据库",
    description: "点亮数据之网，发现无限近邻。简单、轻量、面向生产的向量数据库。",
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
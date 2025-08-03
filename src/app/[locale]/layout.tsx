import {NextIntlClientProvider} from 'next-intl';
import {getMessages} from 'next-intl/server';
import {notFound} from 'next/navigation';
import { Metadata } from 'next';

const locales = ['en', 'zh'];

export function generateStaticParams() {
  return locales.map((locale) => ({locale}));
}

export const metadata: Metadata = {
  title: "Scintirete - Open Source High-Performance Vector Database",
  description: "Scintirete is a simple, lightweight, production-ready high-performance vector database designed for small to medium projects and edge computing scenarios. Illuminate the data web, discover infinite neighbors.",
  keywords: ["Scintirete", "向量数据库", "vector database", "HNSW", "相似性搜索", "开源", "高性能", "gRPC", "HTTP"],
  authors: [{ name: "Scintirete Team" }],
  openGraph: {
    title: "Scintirete - Open Source High-Performance Vector Database",
    description: "Illuminate the data web, discover infinite neighbors. Simple, lightweight, production-ready high-performance vector database.",
    url: "https://github.com/Scintirete/Scintirete/",
    siteName: "Scintirete",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Scintirete - Open Source High-Performance Vector Database",
    description: "Illuminate the data web, discover infinite neighbors. Simple, lightweight, production-ready high-performance vector database.",
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{locale: string}>;
}) {
  const { locale } = await params;
  
  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale as any)) {
    notFound();
  }

  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}
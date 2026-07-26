import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "中文詞彙學習",
  description: "Theo 的中文詞彙練習平台",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-Hant" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}

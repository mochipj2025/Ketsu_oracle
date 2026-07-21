import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "尻ノ間",
  description: "3Dオラクルカード・シャッフルシステム",
  icons: { icon: "/favicon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}

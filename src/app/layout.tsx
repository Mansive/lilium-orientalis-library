import type { Metadata } from "next";
import "./globals.css";

import { Noto_Sans_JP } from "next/font/google";

const font = Noto_Sans_JP({ subsets: ["latin"], weight: "400" });

export const metadata: Metadata = {
  title: "lolibrary",
  description: "Search for Japanese literature.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className={font.className}>{children}</body>
    </html>
  );
}

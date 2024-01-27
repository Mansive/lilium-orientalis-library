import type { Metadata } from "next";
import "./globals.css";

import localFont from "next/font/local";
import { Suspense } from "react";

const font = localFont({ src: "../../fonts/NotoSansJP-Regular.woff2" });

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
      <Suspense>
        <body className={font.className}>{children}</body>
      </Suspense>
    </html>
  );
}

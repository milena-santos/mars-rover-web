import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "Mars Rover Control",
  description:
    "Interface React para lançar e controlar sondas no planalto marciano.",
};

const FONT_HREF =
  "https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@100..800&family=Manrope:wght@200..800&family=Outfit:wght@100..900&display=swap";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link href={FONT_HREF} rel="stylesheet" />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}

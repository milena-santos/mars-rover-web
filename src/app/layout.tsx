import type { Metadata } from "next";
import { Oxanium, Sora } from "next/font/google";

import "./globals.css";

const oxanium = Oxanium({
  variable: "--font-oxanium",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Mars Rover Control",
  description:
    "Interface React para lançar e controlar sondas no planalto marciano.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${oxanium.variable} ${sora.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}

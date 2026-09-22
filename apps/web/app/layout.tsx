import type { Metadata } from "next";
import { Caprasimo, Figtree } from "next/font/google";
import type { ReactNode } from "react";
import "./globals.css";

const caprasimo = Caprasimo({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-caprasimo",
});

const figtree = Figtree({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-figtree",
});

export const metadata: Metadata = {
  title: "Still Hour",
  description: "A community of daily sitters — timer, streak, and shared feed.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`h-full antialiased ${caprasimo.variable} ${figtree.variable}`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}

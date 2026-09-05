import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ShopAgent — Agentic Commerce",
  description: "Bounded, explainable agentic commerce demo."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
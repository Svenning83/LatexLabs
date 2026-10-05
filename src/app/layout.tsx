import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LatexLabs — Colour Studies",
  description:
    "Explore latex colour combinations. Choose a garment, pick 1–3 Libidex colours, see it as a LatexLabs Colour Study.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

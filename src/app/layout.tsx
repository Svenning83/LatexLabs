import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

const TITLE = "LatexLabs — Colour Studies";
const DESCRIPTION =
  "Explore latex colour combinations. Choose a garment, pick 1–3 Libidex colours, see it as a LatexLabs Colour Study.";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.LATEXLABS_BASE_URL ?? "https://latex-labs.vercel.app",
  ),
  title: TITLE,
  description: DESCRIPTION,
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    siteName: "LatexLabs",
    type: "website",
    images: [{ url: "/og.jpg", width: 1200, height: 628 }],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: ["/og.jpg"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}

import type { Metadata, Viewport } from "next";
import { Space_Grotesk, IBM_Plex_Mono } from "next/font/google";
import { profile } from "@/data/profile";
import "./globals.css";

// Variable font (wght 300-700): no weight option needed.
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-space-grotesk",
});

// NOT a variable font: weight is REQUIRED or the build fails.
const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-ibm-plex-mono",
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(profile.domain),
  title: "Devin McCaw — Founder, Engineer, Salesman-Class Unit",
  description:
    "Founder & CEO of Parasource. CS & Engineering @ UC Irvine. AI systems, sales records, and one slightly smug android interface.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "Devin McCaw — Founder, Engineer, Salesman-Class Unit",
    description:
      "Founder & CEO of Parasource. CS & Engineering @ UC Irvine. Interrogate the unit yourself.",
    url: "/",
    siteName: "Devin McCaw",
    locale: "en_US",
    type: "profile",
    firstName: "Devin",
    lastName: "McCaw",
    // no images key — app/opengraph-image.tsx wins by file convention
  },
  twitter: {
    card: "summary_large_image",
    title: "Devin McCaw — Founder, Engineer, Salesman-Class Unit",
    description:
      "Founder & CEO of Parasource. CS & Engineering @ UC Irvine. Interrogate the unit yourself.",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#0A0E0F",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${ibmPlexMono.variable} antialiased`}
    >
      <body>
        {children}
        {/* full-page scanline texture */}
        <div aria-hidden className="scanlines" />
      </body>
    </html>
  );
}

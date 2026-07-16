import type { Metadata, Viewport } from "next";
import { Space_Grotesk, IBM_Plex_Mono } from "next/font/google";
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

// Placeholder metadata — Task 14 replaces this block with the full SEO surface.
export const metadata: Metadata = {
  title: "Devin McCaw",
  description: "Founder, engineer, salesman-class unit.",
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

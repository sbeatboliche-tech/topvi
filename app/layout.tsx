import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { site } from "@/lib/config";
import MetaPixel from "@/components/MetaPixel";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Display con carácter para titulares (geométrica, moderna, "tech/crecimiento").
const spaceGrotesk = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

export const viewport: Viewport = {
  themeColor: "#060912",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: `${site.name} — ${site.tagline}`,
  description: site.description,
  metadataBase: new URL(`https://${site.domain}`),
  openGraph: {
    title: `${site.name} — ${site.tagline}`,
    description: site.description,
    type: "website",
    locale: "es_AR",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: site.name }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.name} — ${site.tagline}`,
    description: site.description,
    images: ["/og.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} ${spaceGrotesk.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <MetaPixel />
        {children}
      </body>
    </html>
  );
}

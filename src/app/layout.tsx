import type { Metadata } from "next";
import { Cormorant_Garamond, Instrument_Sans } from "next/font/google";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

const instrument = Instrument_Sans({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-instrument",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://hamdi-van-buuren.netlify.app"),
  title: {
    default: "Hamdi Van Buuren — Photographer, Tunis",
    template: "%s — Hamdi Van Buuren",
  },
  description:
    "Wedding, portrait, commercial and live-stage photography by Hamdi Van Buuren, founder of HVB Studio and HVB Weddings. Based in Tunis, available worldwide.",
  openGraph: {
    title: "Hamdi Van Buuren — Photographer, Tunis",
    description:
      "Wedding, portrait, commercial and live-stage photography by Hamdi Van Buuren, founder of HVB Studio and HVB Weddings.",
    type: "website",
    locale: "en_US",
    images: ["/images/hamdi/weddings/wedding-golden-car-intimate.jpg"],
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${cormorant.variable} ${instrument.variable}`}>
      <body>{children}</body>
    </html>
  );
}

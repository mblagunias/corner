import type { Metadata } from "next";
import { Playfair_Display, Source_Sans_3 } from "next/font/google";
import { DevAgentation } from "@/components/DevAgentation";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-serif",
  subsets: ["latin"],
});

const sourceSans = Source_Sans_3({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Vinyl Wall · Corner",
  description: "Your top nine Spotify albums from last month, on the wall.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${playfair.variable} ${sourceSans.variable} h-full`}>
      <body className="min-h-full font-sans antialiased">
        {children}
        <DevAgentation />
      </body>
    </html>
  );
}

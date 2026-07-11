import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { DevAgentation } from "@/components/DevAgentation";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Corner",
  description: "Your top nine Spotify albums from the last 4 weeks, 6 months, or all time.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full`}>
      <body className="min-h-full font-sans antialiased">
        {children}
        <DevAgentation />
      </body>
    </html>
  );
}

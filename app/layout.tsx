import type { Metadata } from "next";
import { Inter, Manrope, Nunito, Advent_Pro } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
});

const adventPro = Advent_Pro({
  variable: "--font-advent-pro",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Forge — From idea to real startup",
  description:
    "Turn your startup idea into something real. Get honest feedback, define your MVP, and generate a pitch deck — all in one guided flow.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${manrope.variable} ${nunito.variable} ${adventPro.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}

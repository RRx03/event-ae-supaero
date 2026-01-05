import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import DotGrid from "../components/DotGrid";
import WoodSprite from "../components/Woodsprite";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SUPAVATAR",
  description: "Site de billeterie pour les événements de l'ISAE-SUPAERO",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="relative isolate min-h-screen w-screen overflow-x-hidden">
        <DotGrid
          dotSize={6}
          gap={24}
          baseColor="#00bfff"
          opacity={1}
          className="z-[0]"
        />
        {children}
        <WoodSprite numberOfSprites={5} className="z-[5]" />
      </body>
    </html>
  );
}

"use client";

import DotGrid from "../components/DotGrid";
import { Inter } from "next/font/google";
import localFont from "next/font/local";
import Image from "next/image";
import WoodSprite from "../components/Woodsprite";

import { useState, useEffect } from "react";

const Avatar = localFont({
  src: "./fonts/Avatar.ttf",
  display: "swap",
});

export default function Home() {
  return (
    <main className="transparent h-[1200px] w-screen overflow-hidden bg-[#050014] flex flex-col items-center justify-start gap-4 relative">
      <DotGrid
        dotSize={1.4}
        gap={15}
        baseColor="#00bfffff"
        className="absolute top-0 left-0 h-screen w-screen z-100"
      />
      <div
        className={`w-full flex flex-col items-center justify-center gap-4 absolute top-0 left-0 ${Avatar.className}`}
      >
        <svg
          viewBox="0 0 1000 400"
          className="w-full h-auto md:w-1/2 md:h-auto z-130"
        >
          <defs>
            <filter
              id="textShadow"
              x="-50%"
              y="-50%"
              width="200%"
              height="200%"
            >
              <feDropShadow
                dx="0"
                dy="0"
                stdDeviation="40"
                floodColor="#4de1ff"
                floodOpacity="0.9"
              />
            </filter>
          </defs>

          <text
            x="54%"
            y="50%"
            dominantBaseline="middle"
            textAnchor="middle"
            fontSize="130"
            fontWeight="800"
            fill="#b5f3ffff"
            filter="url(#textShadow)"
          >
            SUPAVATAR
          </text>
          <text
            x="50%"
            y="70%"
            dominantBaseline="middle"
            textAnchor="middle"
            fontSize="35"
            fontWeight="800"
            fill="#b5f3ffff"
          >
            AE ISAE-SUPAERO
          </text>
        </svg>
        <iframe
          id="haWidget"
          title="HelloAsso – Inscription"
          src="https://www.helloasso.com/associations/association-des-eleves-de-l-isae/evenements/billeterie-supavatar-tarif-normal/widget"
          className="w-5/6 border-0 h-[1000px] z-110"
          onLoad={() => {
            const handler = (e: MessageEvent<{ height?: number }>) => {
              if (!String(e.origin).endsWith("helloasso.com")) return;
              const h = e.data?.height;
              const el = document.getElementById(
                "haWidget"
              ) as HTMLIFrameElement | null;
              if (el && typeof h === "number") el.style.height = `${h}px`;
            };
            window.addEventListener("message", handler, { once: false });
          }}
        />
      </div>
      <WoodSprite />
      {/* <WoodSprite />
      <WoodSprite />
      <WoodSprite />
      <WoodSprite /> */}
    </main>
  );
}

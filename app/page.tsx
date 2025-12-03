"use client";

import DotGrid from "./components/DotGrid";
import { Inter } from "next/font/google";
import localFont from "next/font/local";
import Image from "next/image";


const Avatar = localFont({
  src: "./fonts/Avatar.ttf",
  display: "swap",
});

export default function Home() {
  return (
    <main className="transparent h-[1200px] w-screen overflow-hidden bg-[#050014] flex flex-col items-center justify-start gap-4 relative">
      <DotGrid
        dotSize={1.5}
        gap={15}
        baseColor="#00bfffff"
        className="absolute top-0 left-0 h-screen w-screen z-100"
      />
      <div
        className={`w-full flex flex-col items-center justify-start gap-4 absolute top-0 left-0 z-110 ${Avatar.className}`}
      >
        <svg  viewBox="0 0 1000 400" className="transform translate-y-[-30%] w-1/2 h-auto">
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
                floodOpacity="1"
              />
            </filter>
          </defs>

          <text
            x="50%"
            y="50%"
            dominantBaseline="middle"
            textAnchor="middle"
            fontSize="100"
            fontWeight="800"
            fill="#b5f3ffff"
            filter="url(#textShadow)"
          >
            SUPAVATAR
          </text>
        </svg>
      </div>
    </main>
  );
}

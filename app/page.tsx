"use client";

import DotGrid from "../components/DotGrid";
import WoodSprite from "../components/Woodsprite";
import localFont from "next/font/local";
import { useEffect, useState } from "react";

const Avatar = localFont({
  src: "./fonts/Avatar.ttf",
  display: "swap",
});

export default function Home() {
  const [iframeHeight, setIframeHeight] = useState<number>(800);

  useEffect(() => {
    const handler = (e: MessageEvent<{ height?: number }>) => {
      if (!String(e.origin).endsWith("helloasso.com")) return;
      const h = e.data?.height;
      if (typeof h === "number") setIframeHeight(h);
    };

    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, []);

  return (
    <main className={`w-screen bg-[#050014] ${Avatar.className} relative`}>
      <DotGrid
        dotSize={1.4}
        gap={15}
        baseColor="#00bfffff"
        className="fixed inset-0 h-screen w-screen z-0 pointer-events-none"
      />
      <WoodSprite numberOfSprites={5} />

      {/* Contenu dans le flux => main grandit */}
      <div className="relative z-10 flex flex-col items-center gap-6 pt-6 pb-24">
        <svg viewBox="0 0 1000 400" className="w-full h-auto md:w-1/2">
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
          src="https://www.helloasso.com/associations/association-des-eleves-de-l-isae/evenements/billeterie-supavatar-tarif-late/widget"
          className="w-5/6 border-0"
          style={{ height: `${iframeHeight}px` }}
        />
      </div>
    </main>
  );
}

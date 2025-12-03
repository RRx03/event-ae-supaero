"use client";

import React, { useEffect, useId, useRef } from "react";

type Props = {
  text?: string;
  font?: string;
  fontSize?: number;
  dprMax?: number; // limite le devicePixelRatio
  resolutionScale?: number; // rend en plus basse résolution interne (0.5 = moitié)
};

function field(x: number, y: number): [number, number, number] {
  let pseudo = Math.abs(Math.sin(x * 374761393 + y * 668265263)) * 43758.5453123;
  let t = pseudo - Math.floor(pseudo);
  const color1 = 0x518DDC;
  const color2 = 0x69B9E8;
  let finalr = 1/5*Math.floor(((color1 >> 16) & 0xFF) * (1 - t) + ((color2 >> 16) & 0xFF) * t);
  let finalg = 1/5*Math.floor(((color1 >> 8) & 0xFF) * (1 - t) + ((color2 >> 8) & 0xFF) * t);
  let finalb = 1/5*Math.floor((color1 & 0xFF) * (1 - t) + (color2 & 0xFF) * t);
  pseudo = Math.abs(Math.sin((x-1) * 374761393 + (y) * 668265263)) * 43758.5453123;
  t = pseudo - Math.floor(pseudo);
  finalr += 1/5*Math.floor(((color1 >> 16) & 0xFF) * (1 - t) + ((color2 >> 16) & 0xFF) * t);
  finalg += 1/5*Math.floor(((color1 >> 8) & 0xFF) * (1 - t) + ((color2 >> 8) & 0xFF) * t);
  finalb += 1/5*Math.floor((color1 & 0xFF) * (1 - t) + (color2 & 0xFF) * t);
  pseudo = Math.abs(Math.sin((x+1) * 374761393 + (y) * 668265263)) * 43758.5453123;
  t = pseudo - Math.floor(pseudo);
  finalr += 1/5*Math.floor(((color1 >> 16) & 0xFF) * (1 - t) + ((color2 >> 16) & 0xFF) * t);
  finalg += 1/5*Math.floor(((color1 >> 8) & 0xFF) * (1 - t) + ((color2 >> 8) & 0xFF) * t);
  finalb += 1/5*Math.floor((color1 & 0xFF) * (1 -t) + (color2 & 0xFF) * t);  
  pseudo = Math.abs(Math.sin((x) * 374761393 + (y-1) * 668265263)) * 43758.5453123;
  t = pseudo - Math.floor(pseudo);
  finalr += 1/5*Math.floor(((color1 >> 16) & 0xFF) * (1 - t) + ((color2 >> 16) & 0xFF) * t);
  finalg += 1/5*Math.floor(((color1 >> 8) & 0xFF) * (1 - t) + ((color2 >> 8) & 0xFF) * t);
  finalb += 1/5*Math.floor((color1 & 0xFF) * (1 - t) + (color2 & 0xFF) * t);
  pseudo = Math.abs(Math.sin((x) * 374761393 + (y+1) * 668265263)) * 43758.5453123;
  t = pseudo - Math.floor(pseudo);
  finalr += 1/5*Math.floor(((color1 >> 16) & 0xFF) * (1 - t) + ((color2 >> 16) & 0xFF) * t);
  finalg += 1/5*Math.floor(((color1 >> 8) & 0xFF) * (1 - t) + ((color2 >> 8) & 0xFF) * t);
  finalb += 1/5*Math.floor((color1 & 0xFF) * (1 - t) + (color2 & 0xFF) * t);
  const r = Math.min(255,Math.max(0,finalr));
  const g = Math.min(255,Math.max(0,finalg));
  const b = Math.min(255,Math.max(0,finalb));
  return [r, g, b];
}

export default function ProceduralTextFillStatic({
  text = "SUPAVATAR",
  font,
  fontSize = 140,
  dprMax = 1.5,
  resolutionScale = 0.6,
}: Props) {
  const maskId = useId(); // id stable (OK SSR)
  const svgRef = useRef<SVGSVGElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const drawOnce = () => {
    const svg = svgRef.current,
      cvs = canvasRef.current;
    if (!svg || !cvs) return;

    const css = svg.getBoundingClientRect();
    const dpr = Math.min(Math.max(window.devicePixelRatio || 1, 1), dprMax);
    const scale = Math.max(0.2, Math.min(resolutionScale, 1));
    const pxW = Math.max(1, Math.floor(css.width * dpr * scale));
    const pxH = Math.max(1, Math.floor(css.height * dpr * scale));

    if (cvs.width !== pxW || cvs.height !== pxH) {
      cvs.width = pxW;
      cvs.height = pxH;
      cvs.style.width = `${css.width}px`;
      cvs.style.height = `${css.height}px`;
    }

    const ctx = cvs.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    const img = ctx.createImageData(pxW, pxH);
    const data = img.data;
    let i = 0;
    for (let y = 0; y < pxH; y++) {
      for (let x = 0; x < pxW; x++) {
        const [r, g, b] = field(x, y);
        data[i++] = r;
        data[i++] = g;
        data[i++] = b;
        data[i++] = 255;
      }
    }
    ctx.putImageData(img, 0, 0);
  };

  useEffect(() => {
    // dessine une fois
    drawOnce();
    // redraw au resize (debounce simple)
    let to: number | null = null;
    const onResize = () => {
      if (to) cancelAnimationFrame(to);
      to = requestAnimationFrame(drawOnce);
    };
    window.addEventListener("resize", onResize, { passive: true });
    return () => {
      window.removeEventListener("resize", onResize);
      if (to) cancelAnimationFrame(to);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dprMax, resolutionScale, fontSize, text]);

  return (
    <div
      className="w-full"
      style={{ aspectRatio: "5 / 2", position: "relative" }}
    >
      <svg
        ref={svgRef}
        viewBox="0 0 1000 400"
        preserveAspectRatio="xMidYMid meet"
        className="w-full h-full"
      >
        <defs>
          <mask id={maskId} maskUnits="userSpaceOnUse">
            <rect x="0" y="0" width="1000" height="400" fill="black" />
            <text
              x="50%"
              y="50%"
              dominantBaseline="middle"
              textAnchor="middle"
              fontFamily={font}
              fontWeight={800}
              fontSize={fontSize}
              fill="white"
              letterSpacing="2"
            >
              {text}
            </text>
          </mask>
        </defs>

        <foreignObject
          x="0"
          y="0"
          width="1000"
          height="400"
          mask={`url(#${maskId})`}
        >
          <div
            xmlns="http://www.w3.org/1999/xhtml"
            style={{ width: "100%", height: "100%" }}
          >
            <canvas
              ref={canvasRef}
              style={{ display: "block", width: "100%", height: "100%" }}
            />
          </div>
        </foreignObject>

        {/* contour optionnel */}
        <text
          x="50%"
          y="50%"
          dominantBaseline="middle"
          textAnchor="middle"
          fontFamily="system-ui, Inter, Helvetica, Arial, sans-serif"
          fontWeight={800}
          fontSize={fontSize}
          fill="none"
          stroke="rgba(0,0,0,0)"
          strokeWidth={2}
          letterSpacing="2"
          pointerEvents="none"
        >
          {text}
        </text>
      </svg>
    </div>
  );
}

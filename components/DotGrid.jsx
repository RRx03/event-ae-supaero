"use client";

import { useEffect, useRef } from "react";

export default function DotGrid({
  dotSize = 2,      // en CSS px
  gap = 16,         // en CSS px
  baseColor = "#00bfff",
  opacity = 0.8,
  className = "",
  style = {},
}) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const draw = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const cssW = window.innerWidth;
      const cssH = window.innerHeight;

      const pxW = Math.floor(cssW * dpr);
      const pxH = Math.floor(cssH * dpr);

      canvas.style.width = `${cssW}px`;
      canvas.style.height = `${cssH}px`;
      canvas.width = pxW;
      canvas.height = pxH;

      // Safari: rendre tout explicite
      ctx.globalCompositeOperation = "source-over";
      ctx.imageSmoothingEnabled = false;

      // Clear en pixels device
      ctx.clearRect(0, 0, pxW, pxH);

      // léger voile pour vérifier visuellement que ça dessine
      ctx.fillStyle = "rgba(0,0,0,0.001)";
      ctx.fillRect(0, 0, pxW, pxH);

      ctx.globalAlpha = opacity;
      ctx.fillStyle = baseColor;

      // Convertit tailles CSS -> pixels device
      const s = Math.max(1, Math.round(dotSize * dpr));
      const cell = Math.max(1, Math.round((dotSize + gap) * dpr));

      // Snap pixel: sur Safari, le 0.5 est parfois contre-productif en fillRect
      const startX = cell / 2;
      const startY = cell / 2;

      for (let y = startY; y < pxH; y += cell) {
        for (let x = startX; x < pxW; x += cell) {
          ctx.fillRect(x, y, s, s);
        }
      }

      ctx.globalAlpha = 1;
    };

    draw();
    window.addEventListener("resize", draw);
    return () => window.removeEventListener("resize", draw);
  }, [dotSize, gap, baseColor, opacity]);

  return (
    <canvas
      ref={canvasRef}
      style={style}
      className={`fixed inset-0 pointer-events-none ${className}`}
    />
  );
}
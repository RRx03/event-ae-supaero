"use client";

import { useEffect, useRef } from "react";

export default function DotGrid({
  dotSize = 6,           // volontairement gros pour test
  gap = 24,
  baseColor = "#00bfff",
  opacity = 1,
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
      const dpr = window.devicePixelRatio || 1;
      const cssW = window.innerWidth;
      const cssH = window.innerHeight;

      const pxW = Math.floor(cssW * dpr);
      const pxH = Math.floor(cssH * dpr);

      canvas.style.width = `${cssW}px`;
      canvas.style.height = `${cssH}px`;
      canvas.width = pxW;
      canvas.height = pxH;

      // on dessine en coordonnées CSS (plus simple) en utilisant setTransform
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.globalCompositeOperation = "source-over";
      ctx.imageSmoothingEnabled = false;

      // VOILE VISIBLE (si tu vois ça, le canvas dessine)
      ctx.clearRect(0, 0, cssW, cssH);
      ctx.fillStyle = "rgba(255, 0, 0, 0.08)";
      ctx.fillRect(0, 0, cssW, cssH);

      // LIGNE + POINT GÉANT pour valider la couleur
      ctx.globalAlpha = 1;
      ctx.strokeStyle = "lime";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(cssW, cssH);
      ctx.stroke();

      ctx.fillStyle = baseColor;
      ctx.globalAlpha = opacity;
      ctx.fillRect(40, 40, 40, 40); // carré géant cyan -> doit être visible

      // DOT GRID
      const cell = dotSize + gap;
      for (let y = 0; y < cssH; y += cell) {
        for (let x = 0; x < cssW; x += cell) {
          ctx.fillRect(x, y, dotSize, dotSize);
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
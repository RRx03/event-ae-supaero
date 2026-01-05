"use client";

import { useEffect, useRef } from "react";

export default function DotGrid({
  dotSize = 2,
  gap = 16,
  baseColor = "#00bfff",
  className = "",
}) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const draw = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = window.innerWidth;
      const h = window.innerHeight;

      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      ctx.clearRect(0, 0, w, h);

      // voile léger -> le canvas n'est jamais "vide"
      ctx.fillStyle = "rgba(0,0,0,0.01)";
      ctx.fillRect(0, 0, w, h);

      ctx.fillStyle = baseColor;

      const cell = dotSize + gap;
      const cols = Math.ceil(w / cell) + 2;
      const rows = Math.ceil(h / cell) + 2;

      const startX = -cell;
      const startY = -cell;

      const snap = (v) => Math.round(v);

      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const cx = snap(startX + x * cell);
          const cy = snap(startY + y * cell);
          ctx.fillRect(cx, cy, dotSize, dotSize);
        }
      }
    };

    draw();
    window.addEventListener("resize", draw);
    return () => window.removeEventListener("resize", draw);
  }, [dotSize, gap, baseColor]);

  return (
    <canvas ref={canvasRef} className={`fixed inset-0 ${className}`} />
  );
}
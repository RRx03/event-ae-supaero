"use client";

import { useEffect, useMemo, useRef } from "react";

export default function DotGrid({
  dotSize = 2.2,
  gap = 16,
  baseColor = "#00bfff",
  opacity = 0.7,
  className = "",
  style = {},
}) {
  const canvasRef = useRef(null);

  const circlePath = useMemo(() => {
    if (typeof window === "undefined" || !window.Path2D) return null;
    const p = new Path2D();
    p.arc(0, 0, dotSize / 2, 0, Math.PI * 2);
    return p;
  }, [dotSize]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !circlePath) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let viewW = 0;
    let viewH = 0;

    const resizeCanvas = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      viewW = window.innerWidth;
      viewH = window.innerHeight;

      canvas.style.width = `${viewW}px`;
      canvas.style.height = `${viewH}px`;

      canvas.width = Math.floor(viewW * dpr);
      canvas.height = Math.floor(viewH * dpr);

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = () => {
      ctx.clearRect(0, 0, viewW, viewH);

      ctx.save();
      ctx.globalAlpha = opacity;
      ctx.fillStyle = baseColor;

      const cell = dotSize + gap;

      const cols = Math.ceil(viewW / cell);
      const rows = Math.ceil(viewH / cell);

      const gridW = cols * cell;
      const gridH = rows * cell;

      const startX = (viewW - gridW) / 2 + cell / 2;
      const startY = (viewH - gridH) / 2 + cell / 2;

      // Snap pour éviter les dots “flous” / invisibles à petite taille
      const snap = (v) => Math.round(v) + 0.5;

      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const cx = snap(startX + x * cell);
          const cy = snap(startY + y * cell);

          ctx.save();
          ctx.translate(cx, cy);
          ctx.fill(circlePath);
          ctx.restore();
        }
      }

      ctx.restore();
    };

    resizeCanvas();
    draw();

    const onResize = () => {
      resizeCanvas();
      draw();
    };

    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [circlePath, dotSize, gap, baseColor, opacity]);

  return (
    <canvas
      ref={canvasRef}
      style={style}
      className={`fixed inset-0 pointer-events-none ${className}`}
    />
  );
}
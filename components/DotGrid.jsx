"use client";

import { useEffect, useMemo, useRef } from "react";

export default function DotGrid({
  dotSize = 1.4,
  gap = 15,
  baseColor = "#00bfff",
  className = "",
  style = {},
}) {
  const canvasRef = useRef(null);

  // Path2D pour un cercle centré
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

      // coords en CSS pixels
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = () => {
      // clear en coords CSS
      ctx.clearRect(0, 0, viewW, viewH);

      // ⚠️ baseColor en 8 digits: OK mais si tu veux être 100% safe utilise rgba()
      ctx.fillStyle = baseColor;

      const cell = dotSize + gap;

      // On centre la grille
      const cols = Math.ceil(viewW / cell);
      const rows = Math.ceil(viewH / cell);
      const gridW = cols * cell;
      const gridH = rows * cell;
      const startX = (viewW - gridW) / 2 + cell / 2;
      const startY = (viewH - gridH) / 2 + cell / 2;

      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const cx = startX + x * cell;
          const cy = startY + y * cell;
          ctx.save();
          ctx.translate(cx, cy);
          ctx.fill(circlePath);
          ctx.restore();
        }
      }
    };

    resizeCanvas();
    draw();

    // Redraw au resize
    const onResize = () => {
      resizeCanvas();
      draw();
    };
    window.addEventListener("resize", onResize);

    return () => window.removeEventListener("resize", onResize);
  }, [circlePath, dotSize, gap, baseColor]);

  return (
    <canvas
      ref={canvasRef}
      style={style}
      className={`fixed inset-0 pointer-events-none ${className}`}
    />
  );
}
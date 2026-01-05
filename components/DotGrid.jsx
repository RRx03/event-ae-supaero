"use client";

import { useEffect, useMemo, useRef } from "react";

export default function DotGrid({
  dotSize = 2,
  gap = 16,
  baseColor = "#00bfff",
  opacity = 0.6,
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

    const draw = () => {
      const dpr = window.devicePixelRatio || 1;
      const w = window.innerWidth;
      const h = window.innerHeight;

      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      ctx.globalAlpha = opacity;
      ctx.fillStyle = baseColor;

      const cell = dotSize + gap;

      // petit snap pour éviter le flou
      const snap = (v) => Math.round(v) + 0.5;

      for (let y = 0; y < h + cell; y += cell) {
        for (let x = 0; x < w + cell; x += cell) {
          ctx.save();
          ctx.translate(snap(x), snap(y));
          ctx.fill(circlePath);
          ctx.restore();
        }
      }

      ctx.globalAlpha = 1;
    };

    draw();
    window.addEventListener("resize", draw);
    return () => window.removeEventListener("resize", draw);
  }, [circlePath, dotSize, gap, baseColor, opacity]);

  return (
    <canvas
      ref={canvasRef}
      style={style}
      className={`fixed inset-0 pointer-events-none ${className}`}
    />
  );
}
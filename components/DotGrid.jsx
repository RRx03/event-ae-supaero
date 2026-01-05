"use client";

import { useEffect, useRef } from "react";

export default function DotGrid({ className = "" }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const paint = () => {
      const dpr = window.devicePixelRatio || 1;
      const w = window.innerWidth;
      const h = window.innerHeight;

      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // DESSIN IMPOSSIBLE À RATER
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = "rgba(255,0,0,0.25)";
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "lime";
      ctx.fillRect(24, 24, 160, 160);
    };

    paint();
    window.addEventListener("resize", paint);
    return () => window.removeEventListener("resize", paint);
  }, []);

  return <canvas ref={canvasRef} className={`fixed inset-0 ${className}`} />;
}
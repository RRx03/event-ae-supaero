"use client";

import { useRef, useEffect, useCallback, useMemo } from "react";

function hexToRgb(hex) {
  const m = hex.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
  if (!m) return { r: 0, g: 0, b: 0 };
  return {
    r: parseInt(m[1], 16),
    g: parseInt(m[2], 16),
    b: parseInt(m[3], 16),
  };
}

export default function DotGrid({
  dotSize = 16,
  gap = 32,
  baseColor = "#5227FF",
  className = "",
  style = {},
}) {
  const wrapperRef = useRef(null);
  const canvasRef = useRef(null);
  const dotsRef = useRef([]);
  const pointerRef = useRef({ x: -99999, y: -99999 });

  const baseRgb = useMemo(() => hexToRgb(baseColor), [baseColor]);

  const circlePath = useMemo(() => {
    if (typeof window === "undefined" || !window.Path2D) return null;
    const p = new Path2D();
    p.arc(0, 0, dotSize / 2, 0, Math.PI * 2);
    return p;
  }, [dotSize]);

  const buildGrid = useCallback(() => {
    const wrap = wrapperRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;

    const rect = wrap.getBoundingClientRect();
    const width = Math.max(1, Math.floor(rect.width));
    const height = Math.max(1, Math.floor(rect.height));
    const dpr = window.devicePixelRatio || 1;

    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const ctx = canvas.getContext("2d");
    if (ctx) {
      // IMPORTANT: reset transform avant de rescale
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    }

    const cell = dotSize + gap;
    const cols = Math.max(1, Math.floor((width + gap) / cell));
    const rows = Math.max(1, Math.floor((height + gap) / cell));

    const gridW = cell * cols - gap;
    const gridH = cell * rows - gap;

    const startX = (width - gridW) / 2 + dotSize / 2;
    const startY = (height - gridH) / 2 + dotSize / 2;

    const dots = [];
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        dots.push({
          cx: startX + x * cell,
          cy: startY + y * cell,
          xOffset: 0,
          yOffset: 0,
        });
      }
    }
    dotsRef.current = dots;
  }, [dotSize, gap]);

  useEffect(() => {
    buildGrid();

    let ro;
    if ("ResizeObserver" in window) {
      ro = new ResizeObserver(() => buildGrid());
      if (wrapperRef.current) ro.observe(wrapperRef.current);
    } else {
      window.addEventListener("resize", buildGrid);
    }

    return () => {
      if (ro) ro.disconnect();
      else window.removeEventListener("resize", buildGrid);
    };
  }, [buildGrid]);

  useEffect(() => {
    if (!circlePath) return;

    let rafId;

    const draw = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // ctx est en coords CSS (car on a scale(dpr,dpr))
      const wrap = wrapperRef.current;
      const rect = wrap?.getBoundingClientRect();
      const w = rect ? rect.width : canvas.width;
      const h = rect ? rect.height : canvas.height;

      ctx.clearRect(0, 0, w, h);

      // Si tu veux juste une couleur fixe, on remplit direct.
      // (Tu pourras réintroduire une interaction plus tard.)
      ctx.fillStyle = baseColor;

      for (const dot of dotsRef.current) {
        const ox = dot.cx + dot.xOffset;
        const oy = dot.cy + dot.yOffset;

        ctx.save();
        ctx.translate(ox, oy);
        ctx.fill(circlePath);
        ctx.restore();
      }

      rafId = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(rafId);
  }, [baseColor, baseRgb, circlePath]);

  // IMPORTANT: wrapper pour mesurer, canvas fixed pour afficher
  return (
    <div
      ref={wrapperRef}
      className={`fixed inset-0 ${className}`}
      style={style}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
      />
    </div>
  );
}
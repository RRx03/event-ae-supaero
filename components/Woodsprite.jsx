"use client"; // Ensure this page is rendered as a Client Component (for useEffect, canvas, etc.)

import React, { useEffect, useRef } from "react";

export default function WoodSprite() {
  // Canvas reference
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let viewW = 0;
    let viewH = 0;

    // ==== Configuration Constants ====
    const framePaths = [
      "/woodsprite/1.png",
      "/woodsprite/2.png",
      "/woodsprite/3.png",
      "/woodsprite/4.png",
      "/woodsprite/5.png",
      "/woodsprite/6.png",
      "/woodsprite/7.png",
      "/woodsprite/8.png",
      "/woodsprite/9.png",
      "/woodsprite/10.png",
      "/woodsprite/11.png",

    ];
    const frameDelays = [100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 500]; // milliseconds per frame
    const pulseFrameIndex = 7; // which frame triggers a pulse
    const angleStdDev = Math.PI / 16; // ~22.5° standard deviation for random angle change
    const impulseSpeed = 100; // impulse velocity in px/second
    const frictionPerSec = 0.2; // fraction of velocity retained after 1 second (e.g., 0.5 = 50%)
    // ================================

    // Calculate a per-frame friction factor from frictionPerSec for the animation loop:
    // If frictionPerSec = 0.5, then per second velocity becomes 0.5 of original. For small dt:
    const frictionFactor = (dt) => Math.pow(frictionPerSec, dt / 1000);
    // This yields an exponential decay: after dt milliseconds, velocity is multiplied by frictionFactor(dt).

    // Load all sprite frame images
    const images = [];
    let imagesLoaded = 0;
    for (const path of framePaths) {
      const img = new Image();
      img.src = path;
      img.onload = () => {
        imagesLoaded++;
        // Once all images are loaded, we can start the animation
        if (imagesLoaded === framePaths.length) {
          requestAnimationFrame(loop);
        }
      };
      //scale down images
      images.push(img);
    }

    // Sprite state
    let currentFrame = 0;
    let posX = 0.5 * window.innerWidth + (randomNormal(0, 0.15) * window.innerWidth);
    let posY = 0.5 * window.innerHeight + (randomNormal(0, 0.15) * window.innerHeight);
    let angle = 0; // initial orientation (radians, 0 = upward)
    let targetAngle = 0;
    let angleStart = 0;
    let angleChangeStartTime = 0;
    let angleTransitionDuration = 0;
    let velX = 0;
    let velY = 0;

    // Utility: generate normal random for angle offset
    function randomNormal(mean = 0, stdDev = 1) {
      const u = 1 - Math.random();
      const v = 1 - Math.random();
      const randStdNorm =
        Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); // [oai_citation:4‡stackoverflow.com](https://stackoverflow.com/questions/25582882/javascript-math-random-normal-distribution-gaussian-bell-curve#:~:text=const%20normal%20%3D%20%28%29%20%3D,Math.random)
      return mean + stdDev * randStdNorm;
    }

    // Set canvas size to fill screen with DPR awareness
    const resizeCanvas = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2); // cap DPR if you want
      viewW = window.innerWidth;
      viewH = window.innerHeight;

      // CSS size
      canvas.style.width = viewW + "px";
      canvas.style.height = viewH + "px";

      // Backing store size in physical pixels
      canvas.width = Math.floor(viewW * dpr);
      canvas.height = Math.floor(viewH * dpr);

      // Map 1 canvas unit == 1 CSS px
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // High quality scaling
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Animation loop variables for frame timing
    let lastTimestamp = performance.now();
    let frameTimeAccum = 0; // time accumulated towards next frame change

    function loop(timestamp) {
      const dt = timestamp - lastTimestamp;
      lastTimestamp = timestamp;

      // Assert non-null once for use throughout this frame (avoids repeated null checks)
      const ctxNonNull = ctx;
      const canvasNonNull = canvas;

      // Clear the canvas for redraw (clear with transparency) using logical units
      ctxNonNull.clearRect(0, 0, viewW, viewH);

      // === Update Sprite Animation Frame ===
      frameTimeAccum += dt;
      if (frameTimeAccum >= frameDelays[currentFrame]) {
        // Move to next frame, accounting for possibly large dt (if loop was slowed)
        frameTimeAccum -= frameDelays[currentFrame];
        currentFrame = (currentFrame + 1) % images.length;
        // If multiple frames should be skipped (in case of extreme lag), loop accordingly:
        while (frameTimeAccum >= frameDelays[currentFrame]) {
          frameTimeAccum -= frameDelays[currentFrame];
          currentFrame = (currentFrame + 1) % images.length;
        }

        // Check for pulse event (if we just switched to the designated pulse frame)
        if (currentFrame === pulseFrameIndex) {
          // Trigger movement impulse
          // Compute orientation unit vector for current angle (remember: angle=0 is upward)
          const dirX = Math.sin(angle); // horizontal component
          const dirY = -Math.cos(angle); // vertical component (negative because canvas Y is downwards)
          // Apply impulse to velocity
          velX += dirX * impulseSpeed;
          velY += dirY * impulseSpeed;
          // Choose a new random target angle for the next pulse cycle
          angleStart = angle;
          const angleOffset = randomNormal(0, angleStdDev);
          targetAngle = angle + angleOffset;
          // Normalize targetAngle to keep it within [-π, π] range for shorter rotation
          if (targetAngle > Math.PI) targetAngle -= 2 * Math.PI;
          if (targetAngle < -Math.PI) targetAngle += 2 * Math.PI;
          // Set up eased rotation transition from current angle to targetAngle
          angleChangeStartTime = timestamp;
          angleTransitionDuration = frameDelays.reduce((a, b) => a + b, 0); // total duration of one cycle (sum of frameDelays)
        }
      }

      // === Update Orientation (ease towards targetAngle if in a transition) ===
      if (angle !== targetAngle) {
        // Calculate how far into the transition we are
        const t = angleTransitionDuration
          ? (timestamp - angleChangeStartTime) / angleTransitionDuration
          : 1;
        const progress = Math.min(t, 1);
        // Ease-in-out interpolation (using cosine formula for smooth acceleration/deceleration)
        const eased = -(Math.cos(Math.PI * progress) - 1) / 2; // easeInOutSine [oai_citation:5‡nicmulvaney.com](https://nicmulvaney.com/easing#:~:text=)
        angle = angleStart + eased * (targetAngle - angleStart);
        if (progress >= 1) {
          // Finished rotation
          angle = targetAngle;
        }
      }

      // === Update Position based on velocity ===
      // Convert dt to seconds for velocity integration
      const dtSec = dt / 1000;
      posX += velX * dtSec;
      posY += velY * dtSec;
      // Apply friction (damping) to velocity
      const f = frictionFactor(dt);
      velX *= f;
      velY *= f;
      const scale = 0.05;

      // Wrap around screen edges using logical units
      if (posX < 0) posX = viewW;
      else if (posX > viewW) posX = 0;
      if (posY < 0) posY = viewH;
      else if (posY > viewH) posY = 0;

      // === Draw the current frame of the sprite ===
      // To draw rotated, translate context to sprite center, rotate, draw image centered, then restore.
      ctxNonNull.save();
      ctxNonNull.translate(posX, posY);
      ctxNonNull.rotate(angle); // rotate clockwise by `angle` radians around the translated origin [oai_citation:6‡developer.mozilla.org](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/rotate#:~:text=angle) [oai_citation:7‡developer.mozilla.org](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/rotate#:~:text=Rotating%20a%20shape%20around%20its,center)
      const img = images[currentFrame];
      const w = img.width * scale;
      const h = img.height * scale;
      ctxNonNull.drawImage(img, -w / 2, -h / 2, w, h);
      ctxNonNull.restore();

      // Loop continuously
      requestAnimationFrame(loop);
    }

    return () => {
      // Cleanup on unmount
      window.removeEventListener("resize", resizeCanvas);
    };
  }, []); // end useEffect

  // The canvas element (fill the parent container which should be full-screen)
  return (
    <canvas
      ref={canvasRef}
      className={`fixed top-0 left-0 h-screen w-screen z-120 pointer-events-none`}
    />
  );
}

"use client"; // Ensure this page is rendered as a Client Component (for useEffect, canvas, etc.)

import React, { useEffect, useRef } from "react";

export default function WoodSprite({ numberOfSprites = 1 }) {
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
    const frameDelays = [60, 60, 60, 60, 60, 60, 60, 60, 60, 300, 500]; // milliseconds per frame
    const pulseFrameIndex = 7;
    const angleStdDev = Math.PI / 16;
    const impulseSpeed = 100; // impulse velocity in px/second
    const frictionPerSec = 0.2; // fraction of velocity retained after 1 second (e.g., 0.5 = 50%)

    const frictionFactor = (dt) => Math.pow(frictionPerSec, dt / 1000);

    const images = [];
    let imagesLoaded = 0;
    for (const path of framePaths) {
      const img = new Image();
      img.src = path;
      img.onload = () => {
        imagesLoaded++;
        if (imagesLoaded === framePaths.length) {
          requestAnimationFrame(loop);
        }
      };
      images.push(img);
    }

    let currentFrame = new Array(numberOfSprites);
    let posX = new Array(numberOfSprites);
    let posY = new Array(numberOfSprites);
    let angle = new Array(numberOfSprites);
    let targetAngle = new Array(numberOfSprites);
    let angleStart = new Array(numberOfSprites);
    let angleChangeStartTime = new Array(numberOfSprites);
    let angleTransitionDuration = new Array(numberOfSprites);
    let velX = new Array(numberOfSprites);
    let velY = new Array(numberOfSprites);
    for (let i = 0; i < numberOfSprites; i++) {
      currentFrame[i] = Math.floor(Math.random() * framePaths.length);
      posX[i] = 0.5 * window.innerWidth + randomNormal(0, 0.15) * window.innerWidth;
      posY[i] = 0.5 * window.innerHeight + randomNormal(0, 0.15) * window.innerHeight;
      angle[i] = 0;
      targetAngle[i] = 0;
      angleStart[i] = 0;
      angleChangeStartTime[i] = 0;
      angleTransitionDuration[i] = 0;
      velX[i] = 0;
      velY[i] = 0;
    }
    // let posX = 0.5 * window.innerWidth + (randomNormal(0, 0.15) * window.innerWidth);
    // let posY = 0.5 * window.innerHeight + (randomNormal(0, 0.15) * window.innerHeight);
    // let angle = 0; // initial orientation (radians, 0 = upward)
    // let targetAngle = 0;
    // let angleStart = 0;
    // let angleChangeStartTime = 0;
    // let angleTransitionDuration = 0;
    // let velX = 0;
    // let velY = 0;
    // Utility: generate normal random for angle offset

    function randomNormal(mean = 0, stdDev = 1) {
      const u = 1 - Math.random();
      const v = 1 - Math.random();
      const randStdNorm =
        Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
      return mean + stdDev * randStdNorm;
    }

    const resizeCanvas = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2); // cap DPR if you want
      viewW = window.innerWidth;
      viewH = window.innerHeight;

      canvas.style.width = viewW + "px";
      canvas.style.height = viewH + "px";

      canvas.width = Math.floor(viewW * dpr);
      canvas.height = Math.floor(viewH * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    let lastTimestamp = performance.now();
    let frameTimeAccum = new Array(numberOfSprites).fill(0);

    function loop(timestamp) {
      const dt = timestamp - lastTimestamp;
      lastTimestamp = timestamp;
      const ctxNonNull = ctx;

      ctxNonNull.clearRect(0, 0, viewW, viewH);

      for (let i = 0; i < numberOfSprites; i++) {
        frameTimeAccum[i] += dt;
        const randomTimeOffset = Math.floor(Math.random() * 20);
        if (frameTimeAccum[i] >= frameDelays[currentFrame[i]]+randomTimeOffset) {
          frameTimeAccum[i] -= frameDelays[currentFrame[i]]+randomTimeOffset;
          currentFrame[i] = (currentFrame[i] + 1) % images.length;
          while (frameTimeAccum[i] >= frameDelays[currentFrame[i]]) {
            frameTimeAccum[i] -= frameDelays[currentFrame[i]];
            currentFrame[i] = (currentFrame[i] + 1) % images.length;
          }

          if (currentFrame[i] === pulseFrameIndex) {
            const dirX = Math.sin(angle[i]); // horizontal component
            const dirY = -Math.cos(angle[i]); // vertical component (negative because canvas Y is downwards)
            // Apply impulse to velocity
            velX[i] += dirX * impulseSpeed;
            velY[i] += dirY * impulseSpeed;
            // Choose a new random target angle for the next pulse cycle
            angleStart[i] = angle[i];
            const angleOffset = randomNormal(0, angleStdDev);
            targetAngle[i] = angle[i] + angleOffset;
            // Normalize targetAngle to keep it within [-π, π] range for shorter rotation
            if (targetAngle[i] > Math.PI) targetAngle[i] -= 2 * Math.PI;
            if (targetAngle[i] < -Math.PI) targetAngle[i] += 2 * Math.PI;
            // Set up eased rotation transition from current angle to targetAngle
            angleChangeStartTime[i] = timestamp;
            angleTransitionDuration[i] = frameDelays
              .slice(currentFrame[i])
              .reduce((a, b) => a + b, 0); // sum of remaining frame delays in this cycle
          }
        }

        // === Update Orientation (ease towards targetAngle if in a transition) ===
        if (angle[i] !== targetAngle[i]) {
          // Calculate how far into the transition we are
          const t = angleTransitionDuration[i]
            ? (timestamp - angleChangeStartTime[i]) / angleTransitionDuration[i]
            : 1;
          const progress = Math.min(t, 1);
          // Ease-in-out interpolation (using cosine formula for smooth acceleration/deceleration)
          const eased = -(Math.cos(Math.PI * progress) - 1) / 2; // easeInOutSine [oai_citation:5‡nicmulvaney.com](https://nicmulvaney.com/easing#:~:text=)
          angle[i] = angleStart[i] + eased * (targetAngle[i] - angleStart[i]);
          if (progress >= 1) {
            // Finished rotation
            angle[i] = targetAngle[i];
          }
        }

        // === Update Position based on velocity ===
        // Convert dt to seconds for velocity integration
        const dtSec = dt / 1000;
        posX[i] += velX[i] * dtSec;
        posY[i] += velY[i] * dtSec;
        // Apply friction (damping) to velocity
        const f = frictionFactor(dt);
        velX[i] *= f;
        velY[i] *= f;
        const scale = 0.05;

        // Wrap around screen edges using logical units
        if (posX[i] < 0) posX[i] = viewW;
        else if (posX[i] > viewW) posX[i] = 0;
        if (posY[i] < 0) posY[i] = viewH;
        else if (posY[i] > viewH) posY[i] = 0;

        // === Draw the current frame of the sprite ===
        // To draw rotated, translate context to sprite center, rotate, draw image centered, then restore.
        ctxNonNull.save();
        ctxNonNull.translate(posX[i], posY[i]);
        ctxNonNull.rotate(angle[i]); // rotate clockwise by `angle` radians around the translated origin [oai_citation:6‡developer.mozilla.org](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/rotate#:~:text=angle) [oai_citation:7‡developer.mozilla.org](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/rotate#:~:text=Rotating%20a%20shape%20around%20its,center)
        const img = images[currentFrame[i]];
        const w = img.width * scale;
        const h = img.height * scale;
        ctxNonNull.drawImage(img, -w / 2, -h / 2, w, h);
        ctxNonNull.restore();
      }
      // After drawing all sprites, schedule the next frame once
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

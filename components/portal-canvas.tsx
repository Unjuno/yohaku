"use client";

import { useEffect, useRef } from "react";

type Point = { x: number; y: number };

export function PortalCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let width = 0;
    let height = 0;
    let frame = 0;
    let start = performance.now();
    let pointer: Point = { x: 0, y: 0 };
    let scrollOpen = 0;
    let documentVisible = !document.hidden;
    let inViewport = true;

    const resize = () => {
      const box = canvas.getBoundingClientRect();
      const ratio = Math.min(window.devicePixelRatio || 1, window.innerWidth < 700 ? 1.25 : 1.6);
      width = box.width;
      height = box.height;
      canvas.width = Math.max(1, Math.floor(width * ratio));
      canvas.height = Math.max(1, Math.floor(height * ratio));
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      draw(performance.now());
    };

    const drawPortal = (time: number, layer: number) => {
      const mobile = width < 720;
      const cx = width * (mobile ? .5 : .69) + pointer.x * (6 + layer * 2);
      const cy = height * (mobile ? .42 : .5) + pointer.y * (4 + layer);
      const baseW = Math.min(width * (mobile ? .47 : .28), 360);
      const baseH = Math.min(height * (mobile ? .44 : .62), 640);
      const breath = reducedMotion.matches ? 0 : Math.sin(time * .00032 + layer * .9) * (4 + layer * 1.4);
      const opened = scrollOpen * (20 + layer * 4);
      const halfW = baseW * (.34 + layer * .095) + breath + opened;
      const halfH = baseH * (.44 + layer * .07);
      const warp = reducedMotion.matches ? 0 : Math.sin(time * .00021 + layer * 1.7) * 9;

      context.beginPath();
      context.moveTo(cx - halfW * .8, cy - halfH);
      context.bezierCurveTo(cx - halfW - warp, cy - halfH * .55, cx - halfW * .74, cy - halfH * .1, cx - halfW, cy + halfH);
      context.bezierCurveTo(cx - halfW * .15, cy + halfH * .92, cx + halfW * .54, cy + halfH * 1.03, cx + halfW, cy + halfH * .84);
      context.bezierCurveTo(cx + halfW * .7, cy + halfH * .2, cx + halfW + warp, cy - halfH * .52, cx + halfW * .58, cy - halfH);
      context.bezierCurveTo(cx + halfW * .1, cy - halfH * .9, cx - halfW * .2, cy - halfH * 1.04, cx - halfW * .8, cy - halfH);
      context.closePath();

      const alpha = .12 - layer * .015;
      const fill = context.createLinearGradient(cx - halfW, cy, cx + halfW, cy);
      fill.addColorStop(0, `rgba(230, 222, 203, ${alpha * .35})`);
      fill.addColorStop(.48, `rgba(239, 213, 165, ${alpha})`);
      fill.addColorStop(.54, `rgba(91, 64, 30, ${alpha * .55})`);
      fill.addColorStop(1, `rgba(224, 211, 185, ${alpha * .2})`);
      context.fillStyle = fill;
      context.fill();
      context.strokeStyle = `rgba(233, 213, 177, ${.16 - layer * .018})`;
      context.lineWidth = .7;
      context.stroke();
    };

    const draw = (time: number) => {
      context.clearRect(0, 0, width, height);
      const mobile = width < 720;
      const cx = width * (mobile ? .5 : .69) + pointer.x * 10;
      const cy = height * (mobile ? .42 : .5) + pointer.y * 7;
      const glow = context.createRadialGradient(cx, cy, 0, cx, cy, Math.min(width, height) * .42);
      glow.addColorStop(0, "rgba(224, 166, 79, .22)");
      glow.addColorStop(.18, "rgba(149, 94, 32, .09)");
      glow.addColorStop(1, "rgba(0, 0, 0, 0)");
      context.fillStyle = glow;
      context.fillRect(0, 0, width, height);
      for (let layer = 5; layer >= 0; layer -= 1) drawPortal(time, layer);
    };

    const animate = (time: number) => {
      draw(time - start);
      if (documentVisible && inViewport && !reducedMotion.matches) frame = requestAnimationFrame(animate);
    };
    const onPointer = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      pointer = { x: event.clientX / window.innerWidth - .5, y: event.clientY / window.innerHeight - .5 };
    };
    const onScroll = () => {
      scrollOpen = Math.min(window.scrollY / Math.max(window.innerHeight * .65, 1), 1);
      if (reducedMotion.matches) draw(performance.now());
    };
    const onVisibility = () => {
      documentVisible = !document.hidden;
      cancelAnimationFrame(frame);
      if (documentVisible && inViewport && !reducedMotion.matches) { start = performance.now(); frame = requestAnimationFrame(animate); }
    };
    const onMotionChange = () => {
      cancelAnimationFrame(frame);
      if (reducedMotion.matches) draw(performance.now());
      else if (documentVisible && inViewport) { start = performance.now(); frame = requestAnimationFrame(animate); }
    };

    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    const viewportObserver = new IntersectionObserver(([entry]) => {
      inViewport = entry.isIntersecting;
      cancelAnimationFrame(frame);
      if (documentVisible && inViewport && !reducedMotion.matches) { start = performance.now(); frame = requestAnimationFrame(animate); }
    });
    viewportObserver.observe(canvas);
    window.addEventListener("pointermove", onPointer, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);
    reducedMotion.addEventListener("change", onMotionChange);
    resize();
    if (!reducedMotion.matches) frame = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      viewportObserver.disconnect();
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("visibilitychange", onVisibility);
      reducedMotion.removeEventListener("change", onMotionChange);
    };
  }, []);

  return <canvas ref={canvasRef} className="portal-canvas" aria-hidden="true" />;
}

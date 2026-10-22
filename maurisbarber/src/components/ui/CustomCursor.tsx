"use client";

import { useEffect, useRef } from "react";

// A small dot that tracks the mouse exactly, plus a trailing ring that eases
// toward it — the classic "studio site" cursor. Disabled entirely on touch
// devices (see the (hover: hover) and (pointer: fine) guard in globals.css,
// which also keeps this component from rendering anything visible there).
export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let ringX = mouseX;
    let ringY = mouseY;
    let hovering = false;
    let visible = false;

    function onMouseMove(e: MouseEvent) {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (!visible) {
        visible = true;
        dot!.style.opacity = "1";
        ring!.style.opacity = "1";
      }
      dot!.style.transform = `translate(${mouseX}px, ${mouseY}px)`;
    }

    function onMouseOver(e: MouseEvent) {
      const target = e.target as HTMLElement;
      hovering = Boolean(target.closest("a, button, [role='button'], input, textarea, select"));
      ring!.style.width = hovering ? "56px" : "32px";
      ring!.style.height = hovering ? "56px" : "32px";
    }

    function onMouseLeaveWindow() {
      visible = false;
      dot!.style.opacity = "0";
      ring!.style.opacity = "0";
    }

    let rafId: number;
    function tick() {
      ringX += (mouseX - ringX) * 0.18;
      ringY += (mouseY - ringY) * 0.18;
      ring!.style.transform = `translate(${ringX}px, ${ringY}px)`;
      rafId = requestAnimationFrame(tick);
    }

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseover", onMouseOver);
    document.documentElement.addEventListener("mouseleave", onMouseLeaveWindow);
    rafId = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseover", onMouseOver);
      document.documentElement.removeEventListener("mouseleave", onMouseLeaveWindow);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div className="custom-cursor pointer-events-none fixed inset-0 z-[9999] mix-blend-difference">
      <div
        ref={ringRef}
        className="absolute left-0 top-0 h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white opacity-0 transition-[width,height,opacity] duration-200 ease-out"
      />
      <div
        ref={dotRef}
        className="absolute left-0 top-0 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white opacity-0 transition-opacity duration-200"
      />
    </div>
  );
}

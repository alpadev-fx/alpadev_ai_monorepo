"use client";

import React, { useEffect, useRef, useLayoutEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Ensure GSAP plugin is registered
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface NuclearPropulsionProps {
  text?: string;
  className?: string;
}

/**
 * NuclearPropulsion (Refined High-End 2D Version)
 * - Aesthetics: "Cherenkov Radiation" (Cyan -> White -> Violet)
 * - Physics: Motion Blur (Stretching), Heavy Inertia Payload
 * - Performance: 120fps Canvas API
 */
export const NuclearPropulsion: React.FC<NuclearPropulsionProps> = ({
  text = "ANTIGRAVITY",
  className = "",
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<HTMLSpanElement>(null);
  const payloadRef = useRef<HTMLSpanElement>(null);

  const engineText = text.slice(0, 4);
  const payloadText = text.slice(4);

  // Mutable State for Animation Loop
  const state = useRef({
    intensity: 0, 
    vibration: 0,
    isIgniting: false,
    isLaunching: false,
    time: 0,
  });

  // --- PARTICLE ENGINE ---
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let particles: Particle[] = [];
    let animationFrameId: number;
    let lastTime = performance.now();

    const handleResize = () => {
      const rect = container.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
    };
    handleResize();
    window.addEventListener("resize", handleResize);

    // --- PARTICLE CLASS ---
    class Particle {
      x: number; y: number;
      vx: number; vy: number;
      life: number; maxLife: number;
      size: number;
      hue: number;
      speed: number;

      constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
        
        const intensity = state.current.intensity;
        const isLaunch = state.current.isLaunching;
        
        // Physics: High speed during launch, turbulent during ignition
        this.speed = (isLaunch ? 15 : 3) + Math.random() * (isLaunch ? 10 : 5) * intensity;
        
        // Cone: Tighter when fast (0.1), wider when idling (0.6)
        const spread = isLaunch ? 0.08 : 0.6; 
        const angle = Math.PI + (Math.random() - 0.5) * spread;
        
        this.vx = Math.cos(angle) * this.speed;
        this.vy = Math.sin(angle) * this.speed * 0.3;
        
        this.life = 0;
        this.maxLife = 30 + Math.random() * 30; // Shorter life for punchier feel
        this.size = (isLaunch ? 3 : 1.5) + Math.random() * 4 * intensity;
        
        // Aesthetics: Cherenkov Palette (Cyan 170 -> Violet 270)
        // Probability skew towards Cyan (180), with rare Violet sparks
        this.hue = Math.random() > 0.8 ? 260 + Math.random() * 30 : 170 + Math.random() * 40; 
      }

      update(dt: number) {
        // Time step normalization designed for 60fps baseline
        const t = dt * 60; 
        this.x += this.vx * t;
        this.y += this.vy * t;
        this.life += t;
        this.size *= 0.95; // Decay
      }

      draw(ctx: CanvasRenderingContext2D) {
        const progress = this.life / this.maxLife;
        const alpha = Math.max(0, 1 - progress);
        if (alpha <= 0) return;

        ctx.save();
        ctx.globalCompositeOperation = "lighter"; // Additive blending
        ctx.globalAlpha = alpha;

        // Visuals: White Hot Core -> Colored Edge
        const lightness = 60 + 40 * (1 - progress); 
        ctx.fillStyle = `hsl(${this.hue}, 100%, ${lightness}%)`;
        
        // Bloom Simulation (ShadowBlur)
        ctx.shadowBlur = this.size * 3; // Intense glow
        ctx.shadowColor = `hsl(${this.hue}, 100%, 50%)`;

        // Motion Blur: Stretch particle based on velocity
        const stretch = Math.max(1, this.speed * 0.15); 
        
        ctx.translate(this.x, this.y);
        ctx.scale(stretch, 1); // Stretch horizontally
        ctx.beginPath();
        ctx.arc(0, 0, this.size, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
      }
    }

    // --- LOOP ---
    const render = (time: number) => {
      const dt = Math.min((time - lastTime) / 1000, 0.05);
      lastTime = time;
      state.current.time += dt;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Emitter
      if (state.current.intensity > 0.01 && engineRef.current) {
        const engineRect = engineRef.current.getBoundingClientRect();
        const canvasRect = canvas.getBoundingClientRect();
        
        // Emission Point: Center-Left of Engine Text
        const emitX = (engineRect.left - canvasRect.left) + 15; 
        const emitY = (engineRect.top - canvasRect.top) + (engineRect.height / 2);

        // Density: Massive count during launch
        const count = Math.ceil(state.current.intensity * (state.current.isLaunching ? 20 : 4));
        for (let i = 0; i < count; i++) particles.push(new Particle(emitX, emitY));
      }

      // Update/Draw
      for (let i = particles.length - 1; i >= 0; i--) {
        particles[i].update(dt);
        particles[i].draw(ctx);
        if (particles[i].life >= particles[i].maxLife || particles[i].size < 0.1) {
          particles.splice(i, 1);
        }
      }

      // Vibration (DOM)
      if (engineRef.current) {
        const vibe = state.current.vibration;
        if (vibe > 0) {
          const rx = (Math.random() - 0.5) * 5 * vibe;
          const ry = (Math.random() - 0.5) * 5 * vibe;
          engineRef.current.style.transform = `translate(${rx}px, ${ry}px)`;
        } else {
          engineRef.current.style.transform = "none";
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };
    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // --- GSAP TIMELINE ---
  useLayoutEffect(() => {
    const container = containerRef.current;
    const payload = payloadRef.current;
    if (!container || !payload) return;

    // Initial Hide
    gsap.set(payload, { xPercent: -120, opacity: 0 });

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: container,
          start: "top top",
          end: "+=300%",
          pin: true,
          scrub: 1, // 1s scrub smoothing
        },
      });

      // 1. IGNITION (0-25%)
      tl.to(state.current, {
        intensity: 0.5,
        vibration: 1.0, 
        duration: 0.25,
        ease: "power2.in",
        onStart: () => { state.current.isIgniting = true; },
      }, 0);

      // 2. LAUNCH (25-100%)
      tl.to(state.current, {
        intensity: 1.0,
        vibration: 0.1, // Vibration smooths out at speed
        duration: 0.75,
        ease: "expo.out",
        onStart: () => { state.current.isIgniting = false; state.current.isLaunching = true; },
      }, 0.25);

      // Move Engine
      tl.to(engineRef.current, {
        x: "15vw",
        duration: 0.75,
        ease: "expo.out",
      }, 0.25);

      // 3. PAYLOAD REVEAL (35-100%)
      // Delayed start + heavier ease for 'weight'
      tl.to(payload, {
        xPercent: 0,
        opacity: 1,
        duration: 0.65,
        ease: "power4.out", // Heavy inertia
      }, 0.35);

      // Cleanup fade
      tl.to(state.current, { intensity: 0, duration: 0.1 }, 0.9);

    }, container);

    return () => ctx.revert();
  }, [text]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-screen bg-black overflow-hidden flex flex-col items-center justify-center ${className}`}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-0"
        style={{ mixBlendMode: "screen" }}
      />

      <div className="relative z-10 flex items-center justify-center select-none font-sans">
        <div className="flex text-7xl md:text-9xl font-black tracking-tighter text-white">
          
          {/* ENGINE */}
          <span
            ref={engineRef}
            className="relative z-20 block bg-black/40 backdrop-blur-md border border-white/10 px-6 py-2 rounded-2xl"
          >
            {engineText}
            {/* Subtle Core Glow */}
            <span className="absolute inset-0 bg-cyan-500/20 rounded-2xl blur-xl -z-10 animate-pulse"></span>
          </span>

          {/* PAYLOAD MASK */}
          <div className="relative overflow-hidden py-4 -ml-2 h-[1.5em] flex items-center">
            <span
              ref={payloadRef}
              className="block pl-10 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-white to-purple-500"
            >
              {payloadText}
            </span>
          </div>
        </div>
      </div>

      <div className="absolute bottom-12 animate-bounce text-cyan-500/40 text-[10px] tracking-[0.3em] font-medium uppercase">
        Scroll to Ignite
      </div>
    </div>
  );
};

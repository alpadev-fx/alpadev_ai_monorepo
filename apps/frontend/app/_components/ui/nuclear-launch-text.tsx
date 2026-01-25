"use client";

import React, { useEffect, useRef, useLayoutEffect, useMemo } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface NuclearLaunchTextProps {
  text: string;
  className?: string;
}

/**
 * NuclearLaunchText - A two-phase scroll-driven text reveal with nuclear propulsion.
 * Phase A (0-30%): Ignition - Text locked, engine revs up.
 * Phase B (30-100%): Liftoff - Payload slides out.
 */
export const NuclearLaunchText: React.FC<NuclearLaunchTextProps> = ({
  text,
  className = "",
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<HTMLSpanElement>(null);
  const payloadRef = useRef<HTMLSpanElement>(null);
  const payloadContainerRef = useRef<HTMLSpanElement>(null);

  // Split text: Engine = first 4 chars, Payload = rest
  const engineText = text.slice(0, 4);
  const payloadText = text.slice(4);

  // Particle System State (mutable ref for performance)
  const particleState = useRef({
    intensity: 0,        // 0-1: Controls emission rate and brightness
    isIgniting: false,   // Is Phase A active?
    isLaunching: false,  // Is Phase B active?
    turbulence: 0,       // Jitter amount
    brightness: 1,       // Bloom multiplier
    trailLength: 50,     // Particle lifespan
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Particle[] = [];
    let lastTime = 0;

    // Responsive Canvas
    const resizeObserver = new ResizeObserver(() => {
      const rect = container.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
    });
    resizeObserver.observe(container);

    // --- PARTICLE CLASS ---
    class Particle {
      x: number; y: number;
      vx: number; vy: number;
      life: number; maxLife: number;
      size: number;
      hue: number; // For color variation

      constructor(x: number, y: number, state: typeof particleState.current) {
        this.x = x;
        this.y = y;
        
        // Velocity based on phase
        const angle = Math.PI + (Math.random() - 0.5) * (0.5 + state.turbulence);
        const speed = (state.isLaunching ? 8 : 3) + Math.random() * 5 * state.intensity;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed * 0.2;
        
        this.life = 0;
        this.maxLife = state.trailLength + Math.random() * 20;
        this.size = (state.isLaunching ? 3 : 1.5) + Math.random() * 3 * state.intensity;
        
        // Cherenkov Palette: Cyan (180) -> Blue (210) -> Violet (270)
        this.hue = 180 + Math.random() * 90;
      }

      update(dt: number) {
        this.x += this.vx * dt;
        this.y += this.vy * dt;
        this.life += dt * 60; // Normalize to ~60fps base
        this.size *= 0.98;
      }

      draw(ctx: CanvasRenderingContext2D, brightness: number) {
        const alpha = Math.max(0, 1 - this.life / this.maxLife);
        const light = 50 + 50 * brightness;
        
        ctx.save();
        ctx.globalCompositeOperation = "lighter";
        ctx.globalAlpha = alpha;
        
        // Glow
        ctx.shadowBlur = 15 * brightness;
        ctx.shadowColor = `hsl(${this.hue}, 100%, ${light}%)`;
        
        ctx.fillStyle = `hsl(${this.hue}, 100%, ${light}%)`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    // Get emission point (behind engine)
    const getEmitPoint = (): { x: number; y: number } => {
      if (!engineRef.current) return { x: 0, y: canvas.height / 2 };
      const engineRect = engineRef.current.getBoundingClientRect();
      const canvasRect = canvas.getBoundingClientRect();
      return {
        x: engineRect.left - canvasRect.left, // Left edge of engine (back)
        y: engineRect.top - canvasRect.top + engineRect.height / 2,
      };
    };

    // --- RENDER LOOP (Delta Time for 120fps target) ---
    const render = (time: number) => {
      const dt = Math.min((time - lastTime) / 1000, 0.05); // Cap delta to prevent jumps
      lastTime = time;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const state = particleState.current;
      
      // Emit particles based on intensity
      if (state.intensity > 0.01) {
        const emitPoint = getEmitPoint();
        const count = Math.floor(state.intensity * (state.isLaunching ? 20 : 8));
        for (let i = 0; i < count; i++) {
          particles.push(new Particle(
            emitPoint.x + (Math.random() - 0.5) * 10,
            emitPoint.y + (Math.random() - 0.5) * 20 * state.turbulence,
            state
          ));
        }
      }

      // Update & Draw
      for (let i = particles.length - 1; i >= 0; i--) {
        particles[i].update(dt);
        particles[i].draw(ctx, state.brightness);
        if (particles[i].life >= particles[i].maxLife || particles[i].size < 0.5) {
          particles.splice(i, 1);
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };
    animationFrameId = requestAnimationFrame(render);

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
    };
  }, []);

  // --- GSAP SCROLL TIMELINE ---
  useLayoutEffect(() => {
    const container = containerRef.current;
    const payload = payloadRef.current;
    const payloadContainer = payloadContainerRef.current;
    if (!container || !payload || !payloadContainer) return;

    const payloadWidth = payload.offsetWidth;
    gsap.set(payload, { x: -payloadWidth }); // Hidden behind engine

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: container,
          start: "top center",
          end: "bottom center",
          scrub: true,
          pin: true,
          // markers: true,
        },
      });

      // PHASE A: IGNITION (0% -> 30%)
      // Text is locked, engine revs up
      tl.to(particleState.current, {
        intensity: 1,
        turbulence: 0.8,
        brightness: 1.5,
        trailLength: 80,
        duration: 0.3, // 30% of timeline
        ease: "power2.in",
        onStart: () => { particleState.current.isIgniting = true; },
        onUpdate: () => {
          // Keep payload locked during this phase
          gsap.set(payload, { x: -payloadWidth });
        }
      }, 0);

      // Placeholder to hold 0-30%
      tl.to({}, { duration: 0.3 }, 0);

      // PHASE B: LIFTOFF (30% -> 100%)
      // Release payload, max propulsion
      tl.to(particleState.current, {
        intensity: 1.2,
        turbulence: 0.3,
        brightness: 2,
        trailLength: 150,
        duration: 0.1,
        ease: "power1.in",
        onStart: () => {
          particleState.current.isIgniting = false;
          particleState.current.isLaunching = true;
        },
      }, 0.3);

      tl.to(payload, {
        x: 0,
        duration: 0.7, // 30% -> 100% = 70% of timeline
        ease: "power2.out",
      }, 0.3);

      // Cool down at end
      tl.to(particleState.current, {
        intensity: 0,
        brightness: 1,
        duration: 0.1,
        onComplete: () => { particleState.current.isLaunching = false; },
      }, 0.9);

    }, container);

    return () => ctx.revert();
  }, [text]);

  return (
    <div
      ref={containerRef}
      className={`relative inline-flex items-center text-7xl md:text-8xl lg:text-9xl font-black tracking-tighter text-white ${className}`}
      style={{ minHeight: "1.5em" }}
    >
      {/* Canvas Layer (Particle System) */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-20"
        style={{ mixBlendMode: "screen" }}
      />

      {/* Engine (First 4 Chars) - Static */}
      <span
        ref={engineRef}
        className="relative z-10 bg-gradient-to-r from-black/80 to-transparent pr-1"
      >
        {engineText}
      </span>

      {/* Payload Container (Mask) */}
      <span
        ref={payloadContainerRef}
        className="relative overflow-hidden z-0 flex items-center"
        style={{ height: "1.2em" }}
      >
        <span
          ref={payloadRef}
          className="inline-block whitespace-nowrap"
        >
          {payloadText}
        </span>
      </span>
    </div>
  );
};

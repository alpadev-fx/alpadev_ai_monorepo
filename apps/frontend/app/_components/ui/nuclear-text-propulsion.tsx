"use client";

import React, { useEffect, useRef, useLayoutEffect, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface NuclearTextPropulsionProps {
  text: string;
  className?: string;
}

export const NuclearTextPropulsion: React.FC<NuclearTextPropulsionProps> = ({
  text,
  className = "",
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<HTMLSpanElement>(null); // The static first 4 chars
  const payloadRef = useRef<HTMLSpanElement>(null); // The hidden text
  const payloadContainerRef = useRef<HTMLSpanElement>(null); // The mask container
  const emitterRef = useRef<HTMLSpanElement>(null); // Invisible marker for 1st char position

  // Split text
  const engineText = text.slice(0, 4);
  const payloadText = text.slice(4);
  const firstChar = text.slice(0, 1);
  const restEngine = text.slice(1, 4);

  useEffect(() => {
    // --- PARTICLE SYSTEM SETUP ---
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Particle[] = [];
    let width = canvas.width;
    let height = canvas.height;

    // Responsive Canvas
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width: w, height: h } = entry.contentRect;
        canvas.width = w;
        canvas.height = h;
        width = w;
        height = h;
      }
    });
    if (containerRef.current) resizeObserver.observe(containerRef.current);

    // Particle Class
    class Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      life: number;
      maxLife: number;
      size: number;
      color: string;
      alpha: number;

      constructor(x: number, y: number, velocityScale: number) {
        this.x = x;
        this.y = y;
        const angle = Math.PI + (Math.random() - 0.5) * 1.0; // Shoot leftish
        const speed = Math.random() * 5 * velocityScale + 2;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed * 0.3; // Less vertical spread
        this.life = 0;
        this.maxLife = Math.random() * 40 + 20;
        this.size = Math.random() * 4 + 1;
        this.alpha = 1;
        
        // Nuclear Palette
        const r = Math.random();
        if (r > 0.9) this.color = "#FFFFFF"; // Core White
        else if (r > 0.6) this.color = "#00FFFF"; // Cyan
        else if (r > 0.3) this.color = "#0088FF"; // Deep Blue
        else this.color = "#8A2BE2"; // Violet/Cherenkov
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;
        this.life++;
        this.alpha = 1 - this.life / this.maxLife;
        this.size *= 0.95; // Shrink
      }

      draw(ctx: CanvasRenderingContext2D) {
        ctx.save();
        ctx.globalCompositeOperation = "lighter";
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    // Animation Loop
    let emissionRate = 0; // Controlled by GSAP
    
    // Check if we can expose emissionRate to GSAP
    // We can use a proxy object
    const particleState = { emission: 0 };

    const render = () => {
        ctx.clearRect(0, 0, width, height);

        // Emission
        if (emitterRef.current) {
            const rect = emitterRef.current.getBoundingClientRect();
            const canvasRect = canvas.getBoundingClientRect();
            
            // Calculate relative position within canvas
            const ex = rect.left - canvasRect.left + rect.width / 2;
            const ey = rect.top - canvasRect.top + rect.height / 2;

            // Emit based on rate
            const count = Math.floor(particleState.emission);
            for(let i=0; i < count; i++) {
                particles.push(new Particle(ex, ey, Math.min(particleState.emission / 5, 2)));
            }
        }

        // Update & Draw
        for (let i = particles.length - 1; i >= 0; i--) {
            particles[i].update();
            particles[i].draw(ctx);
            if (particles[i].life >= particles[i].maxLife) {
                particles.splice(i, 1);
            }
        }

        animationFrameId = requestAnimationFrame(render);
    };
    render();

    // --- GSAP SCROLL LOGIC ---
    let ctxGsap: gsap.Context;
    
    // We delay slightly to ensure layout
    const timer = setTimeout(() => {
         ctxGsap = gsap.context(() => {
            if (!payloadContainerRef.current || !payloadRef.current || !containerRef.current) return;

            // We need to know the width of the payload to animate it correctly
            const payloadWidth = payloadRef.current.offsetWidth;
            
            // Set initial state
            gsap.set(payloadRef.current, { x: -payloadWidth }); // Hidden to the left (behind engine)

            // Timeline
            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: containerRef.current,
                    start: "top center", // Adjust as needed
                    end: "bottom center",
                    scrub: 1, // Smooth interaction
                    // markers: true, // For debugging
                }
            });

            // The Reveal Action
            tl.to(payloadRef.current, {
                x: 0,
                ease: "none", // Linear scrub
                duration: 1
            })
            // Increase emission during movement
            .to(particleState, {
                emission: 15, // High intensity
                ease: "power1.in",
                duration: 0.2
            }, 0)
            .to(particleState, {
                emission: 0, // Fade out
                ease: "power1.out",
                duration: 0.2
            }, 0.8);

        }, containerRef);
    }, 100);

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      if (ctxGsap) ctxGsap.revert();
      clearTimeout(timer);
    };
  }, [text]);

  return (
    <div 
        ref={containerRef} 
        className={`relative inline-flex items-center text-8xl font-black tracking-tighter text-white ${className}`}
        style={{ height: "1.2em" }} // Ensure height constraint
    >
      {/* Canvas Layer (Over everything for glow, or under depending on preference. User asked for overlay) */}
      <canvas 
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-20 mix-blend-screen"
      />

      {/* The Engine (First 4 Chars) */}
      <span ref={engineRef} className="relative z-10 bg-black/50 backdrop-blur-sm -mr-1"> 
        <span ref={emitterRef} className="inline-block">{firstChar}</span>{restEngine}
      </span>

      {/* The Payload (Hidden initially) */}
      <span 
        ref={payloadContainerRef} 
        className="relative overflow-hidden z-0 flex items-center h-full"
      >
        <span 
            ref={payloadRef} 
            className="inline-block whitespace-nowrap pl-1" // Add padding for visual separation
        >
            {payloadText}
        </span>
      </span>
    </div>
  );
};

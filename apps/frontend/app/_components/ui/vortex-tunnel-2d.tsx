"use client";

import React, { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface VortexTunnel2DProps {
  className?: string;
  particleCount?: number;
}

/**
 * VortexTunnel2D
 * A high-performance 2D Canvas simulation of a 3D tunnel.
 * Uses perspective projection math to simulate depth without WebGL.
 */
export const VortexTunnel2D: React.FC<VortexTunnel2DProps> = ({
  className,
  particleCount = 400,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Force body black to prevent white flashes
    document.body.style.backgroundColor = "black";
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let animationFrameId: number;
    let width = 0;
    let height = 0;
    let cx = 0;
    let cy = 0;

    // --- PHYSICS CONSTANTS ---
    const FOV = 300; // Field of View
    const SPEED_BASE = 8;
    const SPEED_SPRINT = 30; // Speed when "warping"
    let currentSpeed = SPEED_BASE;
    const Z_FAR = 2000; // Spawn distance
    const Z_NEAR = 10;  // Despawn distance

    // --- ENTITY ---
    class TunnelParticle {
      x: number;
      y: number;
      z: number;
      angle: number;
      radius: number;
      size: number;
      color: string;
      rotation: number;
      rotationSpeed: number;

      constructor(initZ?: number) {
        // Random placement in a cylindrical tunnel
        this.angle = Math.random() * Math.PI * 2;
        // Radius: How wide the tunnel is. 
        // We vary it slightly to make it organic.
        this.radius = 200 + Math.random() * 300; 
        
        this.x = Math.cos(this.angle) * this.radius;
        this.y = Math.sin(this.angle) * this.radius;
        
        // Z: Depth
        this.z = initZ ?? Math.random() * Z_FAR;
        
        // Visuals
        this.size = 10 + Math.random() * 40; // Base size of the plane
        // Random color palette (Cosmos-ish: Cyan, Purple, White)
        const colors = ["#00FFFF", "#8A2BE2", "#FFFFFF", "#4169E1"];
        this.color = colors[Math.floor(Math.random() * colors.length)];
        
        this.rotation = Math.random() * Math.PI;
        this.rotationSpeed = (Math.random() - 0.5) * 0.05;
      }

      update(dt: number) {
        this.z -= currentSpeed;
        
        // SPIRAL TWIST
        // We rotate the X/Y coordinates based on Z depth to create that "twisted tunnel" look
        const twist = 0.002 * currentSpeed; // Rotate faster when moving faster
        const ca = Math.cos(twist);
        const sa = Math.sin(twist);
        const nx = this.x * ca - this.y * sa;
        const ny = this.x * sa + this.y * ca;
        this.x = nx;
        this.y = ny;

        this.rotation += this.rotationSpeed;

        // Reset if passed camera
        if (this.z < Z_NEAR) {
          this.z = Z_FAR;
          // Reshuffle angle for variety
          this.angle = Math.random() * Math.PI * 2;
          this.radius = 200 + Math.random() * 300;
          this.x = Math.cos(this.angle) * this.radius;
          this.y = Math.sin(this.angle) * this.radius;
        }
      }

      draw(ctx: CanvasRenderingContext2D) {
        // PERPECTIVE PROJECTION
        // scale = fov / (fov + z) ?? Actually standard is fov / z
        // Let's use standard: scale = fov / z
        if (this.z <= 0) return; // Clip behind camera

        const scale = FOV / this.z;
        const x2d = cx + this.x * scale;
        const y2d = cy + this.y * scale;
        
        const size2d = this.size * scale;

        // Clip if too huge (prevents full screen flash when z is near 0)
        if (size2d > width) return;

        // Opacity based on depth (fog)
        // 0 at Z_FAR, 1 at 0
        const alpha = Math.max(0, Math.min(1, 1 - (this.z / Z_FAR)));
        
        ctx.globalAlpha = alpha;
        ctx.fillStyle = this.color;
        
        // DRAW ROTATED RECTANGLE (To look like a floating image/plane)
        ctx.save();
        ctx.translate(x2d, y2d);
        ctx.rotate(this.rotation);
        ctx.scale(scale, scale); // Scale the context ensures the rect shrinks correctly
        
        // Draw Plane
        ctx.beginPath();
        ctx.rect(-this.size/2, -this.size/2, this.size, this.size);
        ctx.fill();
        
        ctx.restore();
      }
    }

    // --- INIT ---
    const particles: TunnelParticle[] = [];
    for (let i = 0; i < particleCount; i++) {
        particles.push(new TunnelParticle());
    }

    // --- RESIZE ---
    const handleResize = () => {
        if(containerRef.current && canvas) {
            canvas.width = containerRef.current.clientWidth;
            canvas.height = containerRef.current.clientHeight;
            width = canvas.width;
            height = canvas.height;
            cx = width / 2;
            cy = height / 2;
        }
    };
    handleResize();
    window.addEventListener("resize", handleResize);

    // --- LOOP ---
    const render = () => {
        // Clear Background
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, width, height);

        // Update Speed (Momentum)
        // Simulate "Warp" on mouse down or just constant?
        // Let's keep constant for now, maybe oscillate
        // currentSpeed = SPEED_BASE; 

        particles.sort((a, b) => b.z - a.z); // Z-Sort (Painter's Algorithm) - draw far first

        // Draw
        ctx.globalCompositeOperation = "screen"; // Additive-ish blend for "glowing" look
        particles.forEach(p => {
            p.update(1); // dt is 1 frame
            p.draw(ctx);
        });

        animationFrameId = requestAnimationFrame(render);
    };
    render();

    return () => {
        cancelAnimationFrame(animationFrameId);
        window.removeEventListener("resize", handleResize);
    };
  }, [particleCount]);

  return (
    <div 
        ref={containerRef} 
        className={cn("relative w-full h-screen overflow-hidden", className)}
        style={{ backgroundColor: "black" }}
    >
        <canvas ref={canvasRef} className="block w-full h-full" />
        
        {/* TEXT OVERLAY */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <h1 className="text-white text-6xl md:text-8xl font-bold tracking-tighter select-none mix-blend-difference">
                ANTIGRAVITY
            </h1>
        </div>
        
        <div className="absolute bottom-12 w-full text-center text-cyan-500/50 text-xs tracking-[0.5em] animate-pulse">
            SYSTEM OPTIMIZED // 2D CORE
        </div>
    </div>
  );
};

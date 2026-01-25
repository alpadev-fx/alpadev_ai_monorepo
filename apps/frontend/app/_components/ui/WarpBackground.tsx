"use client";
import React, { useEffect, useRef } from "react";

interface WarpBackgroundProps {
  className?: string; // Additional classes for the canvas container
}

export const WarpBackground: React.FC<WarpBackgroundProps> = ({ className }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Star properties
    const stars: { x: number; y: number; z: number; o: number }[] = [];
    const STAR_COUNT = 800; // Density of stars
    const BASE_SPEED = 2; // Normal drift speed
    let warpSpeed = 0; // Dynamic speed added by scroll/animation (controlled via css variable/ref if needed, but for now we might simulate burst)
    
    // We will read a CSS variable or a global var to control speed if we want to sync perfectly with GSAP,
    // but a visual hack is to just have them moving fast, and use opacity to reveal them locally.
    // OR: We can just make them move very fast constantly, and the GSAP timeline fades the container in/out.
    // "Light speed" usually implies streaking.

    // Let's implement a "Streak" draw function.
    
    for (let i = 0; i < STAR_COUNT; i++) {
        stars.push({
            x: (Math.random() - 0.5) * width,
            y: (Math.random() - 0.5) * height,
            z: Math.random() * width,
            o: Math.random(), // random offset
        });
    }

    let animationFrameId: number;

    const draw = () => {
      // Create trailing effect
      ctx.fillStyle = "rgba(0, 0, 0, 0.3)"; // Fade out trails
      ctx.fillRect(0, 0, width, height);
      
      const cx = width / 2;
      const cy = height / 2;

      // Calculate speed based on... allow it to be fast.
      // We'll treat this as a constant "Hyperdrive" tunnel.
      // The parent component will check ScrollTrigger to fade this canvas in/out.
      const speed = 40; 

      stars.forEach((star) => {
        star.z -= speed;

        if (star.z <= 0) {
          star.z = width;
          star.x = (Math.random() - 0.5) * width;
          star.y = (Math.random() - 0.5) * height;
        }

        const x = (star.x / star.z) * width + cx;
        const y = (star.y / star.z) * height + cy;
        
        // Calculate size based on proximity
        const size = (1 - star.z / width) * 4; // Max size

        // Draw star/streak
        // To make it look like "light speed", we draw a line from previous position?
        // Simpler: Just elongated rects radiating from center?
        // Let's keep it as localized particles for "Starfield" transitioning to "Warp".
        // Actually user wants "Light Speed" -> Streaks.
        
        if (x >= 0 && x <= width && y >= 0 && y <= height) {
            const opacity = (1 - star.z / width);
            ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
            
            // Draw streak
            const prevX = (star.x / (star.z + speed * 0.5)) * width + cx;
            const prevY = (star.y / (star.z + speed * 0.5)) * height + cy;

            ctx.beginPath();
            ctx.strokeStyle = `rgba(255, 255, 255, ${opacity})`;
            ctx.lineWidth = size;
            ctx.moveTo(x, y);
            ctx.lineTo(prevX, prevY);
            ctx.stroke();
        }
      });

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", handleResize);
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return <canvas ref={canvasRef} className={className} />;
};

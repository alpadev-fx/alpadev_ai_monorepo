'use client';

import React, { useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { cn } from '@/lib/utils';

interface TiltCardProps {
  children?: React.ReactNode;
  className?: string;
  maxTilt?: number; // Maximum rotation in degrees (e.g., 20)
  perspective?: number; // CSS perspective value (e.g., 1000)
}

export const TiltCard = ({
  children,
  className,
  maxTilt = 15,
  perspective = 1000,
}: TiltCardProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [hovering, setHovering] = useState(false);

  // Motion Values for Mouse Position (relative to center 0,0)
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Smooth Physics (Spring)
  const springConfig = { damping: 20, stiffness: 300, mass: 0.5 };
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [maxTilt, -maxTilt]), springConfig);
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-maxTilt, maxTilt]), springConfig);

  // Scale effect on hover
  const scale = useSpring(hovering ? 1.05 : 1, springConfig);

  // Glare Position Logic
  // We want the glare to move opposite to the mouse? Or follow the light source?
  // Standard Apple TV effect: Glare appears on the side closest to the light/view?
  // Let's make a radial gradient that follows the mouse.
  const glareX = useTransform(x, [-0.5, 0.5], ['0%', '100%']);
  const glareY = useTransform(y, [-0.5, 0.5], ['0%', '100%']);
  const glareOpacity = useTransform(scale, [1, 1.05], [0, 0.4]); // Only show glare when hovered/scaled

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;

    const rect = ref.current.getBoundingClientRect();
    
    // Calculate normalized position (-0.5 to 0.5)
    // 0,0 is center
    const width = rect.width;
    const height = rect.height;
    
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const xPct = (mouseX / width) - 0.5;
    const yPct = (mouseY / height) - 0.5;

    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    setHovering(false);
    x.set(0);
    y.set(0);
  };

  const handleMouseEnter = () => {
    setHovering(true);
  };

  return (
    <motion.div
      ref={ref}
      style={{ perspective }} // Parent perspective
      className={cn("relative flex items-center justify-center", className)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={handleMouseEnter}
    >
      <motion.div
        style={{
          rotateX,
          rotateY,
          scale,
          transformStyle: "preserve-3d", // Essential for 3D effect
        }}
        className="relative h-full w-full rounded-xl bg-neutral-900 shadow-xl transition-shadow duration-300 ease-out hover:shadow-2xl"
      >
        {/* Content Layer (elevated slightly if needed) */}
        <div 
          className="relative z-10 h-full w-full overflow-hidden rounded-xl bg-neutral-950" 
          style={{ transform: "translateZ(20px)" }} // Push content forward for depth parallax inside
        >
          {children ? children : (
             // Default Dummy Content if no children provided
             <div className="flex h-[400px] w-[300px] flex-col items-center justify-center p-6 text-center">
                <div className="mb-4 h-32 w-32 rounded-full bg-indigo-600/20 p-6 shadow-[0_0_40px_rgba(99,102,241,0.3)]">
                     <img src="https://cdn-icons-png.flaticon.com/512/3612/3612457.png" alt="Icon" className="h-full w-full object-contain invert opacity-80" />
                </div>
                <h3 className="text-2xl font-bold text-white">3D Interaction</h3>
                <p className="mt-2 text-sm text-neutral-400">Hover over this card to see the physics-based tilt effect in action.</p>
             </div>
          )}
        </div>

        {/* Glare Overlay */}
        {/* Moves with the mouse to simulate reflection */}
        <motion.div
          style={{
            opacity: glareOpacity,
            background: `radial-gradient(circle at ${glareX} ${glareY}, rgba(255,255,255,0.3) 0%, transparent 80%)`,
            zIndex: 20,
          }}
          className="pointer-events-none absolute inset-0 rounded-xl mix-blend-overlay"
        />

        {/* Depth Shadow (Optional) - simulates the card lifting off the surface */}
        <motion.div 
            style={{ 
                opacity: hovering ? 1 : 0.5,
                transform: "translateZ(-20px) translateY(10px) scale(0.9)",
                filter: "blur(20px)"
            }}
            className="absolute inset-0 -z-10 rounded-xl bg-indigo-500/20 transition-opacity duration-300"
        />

      </motion.div>
    </motion.div>
  );
};

'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform, useMotionTemplate } from 'framer-motion';
import { cn } from '@/lib/utils';

interface XRayRevealProps {
  exteriorImage?: string;
  interiorImage?: string;
  title?: string;
  className?: string;
}

export const XRayReveal = ({
  exteriorImage = 'https://images.unsplash.com/photo-1592665227702-861c8c87102a?q=80&w=2070&auto=format&fit=crop', // A sleek car exterior or product
  interiorImage = 'https://images.unsplash.com/photo-1619661414440-2b15598858e8?q=80&w=2070&auto=format&fit=crop', // A mechanical/engine view
  title = 'Under the Hood',
  className,
}: XRayRevealProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Track scroll progress of the sticky container
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'], // Start when top of container hits top of viewport
  });

  // Calculate the clip-path percentage (0% to 100%)
  const clipProgress = useTransform(scrollYProgress, [0, 1], [0, 100]);
  
  // Construct the clip-path string: inset(0% 0% 0% 0%) -> inset(100% 0% 0% 0%)
  // This clips from the TOP down.
  const clipPath = useMotionTemplate`inset(${clipProgress}% 0% 0% 0%)`;

  // Calculate the position of the scanning line
  const lineTop = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);

  return (
    <section 
      ref={containerRef} 
      className={cn("relative h-[250vh]", className)} // Tall container for scroll space
    >
      <div className="sticky top-0 flex h-screen w-full flex-col items-center justify-center overflow-hidden bg-neutral-950">
        
        <h2 className="absolute top-12 z-20 text-4xl font-bold tracking-tighter text-white sm:text-6xl">
            {title}
        </h2>

        {/* Image Container */}
        <div className="relative aspect-video w-full max-w-6xl overflow-hidden rounded-xl shadow-2xl">
            
            {/* Bottom Layer (Interior / X-Ray) - Stays static */}
            <div className="absolute inset-0 z-0">
                <img 
                    src={interiorImage} 
                    alt="Interior View" 
                    className="h-full w-full object-cover"
                />
                 {/* Blue tint for X-Ray feel */}
                <div className="absolute inset-0 bg-indigo-900/30 mix-blend-overlay" />
            </div>

            {/* Top Layer (Exterior) - Gets Clipped */}
            <motion.div 
                style={{ clipPath }}
                className="absolute inset-0 z-10 bg-neutral-900" // Bg ensures no see-through if image loads late
            >
                <img 
                    src={exteriorImage} 
                    alt="Exterior View" 
                    className="h-full w-full object-cover"
                />
            </motion.div>

            {/* Scanning Line (The glowing edge) */}
            <motion.div
                style={{ top: lineTop }}
                className="absolute left-0 right-0 z-20 h-1 bg-indigo-500 shadow-[0_0_20px_4px_rgba(99,102,241,0.8)]"
            />
            
            {/* Optional: Label that follows the scan */}
            <motion.div
                style={{ top: lineTop }}
                className="absolute right-4 z-30 -translate-y-1/2 rounded bg-indigo-600 px-2 py-1 text-xs font-bold text-white shadow-lg"
            >
                SCANNING
            </motion.div>

        </div>
        
        <p className="absolute bottom-12 z-20 text-neutral-400">Scroll to Reveal</p>

      </div>
    </section>
  );
};

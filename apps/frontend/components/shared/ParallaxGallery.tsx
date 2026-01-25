'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring, MotionValue } from 'framer-motion';
import { cn } from '@/lib/utils';

// --- Dummy Data ---
const images = [
  'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1000&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1000&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1563986768609-322da13575f3?q=80&w=1000&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=1000&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=1000&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?q=80&w=1000&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1000&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?q=80&w=1000&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1531297461136-82lw8z0a9j1k?q=80&w=1000&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?q=80&w=1000&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=1000&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?q=80&w=1000&auto=format&fit=crop',
];

// Split images into columns
const col1 = images.slice(0, 4);
const col2 = images.slice(4, 8);
const col3 = images.slice(8, 12);

interface ParallaxColumnProps {
  images: string[];
  y: MotionValue<number>;
  className?: string;
}

const ParallaxColumn = ({ images, y, className }: ParallaxColumnProps) => {
  return (
    <motion.div 
      style={{ y }} 
      className={cn("flex flex-col gap-8", className)}
    >
      {images.map((src, i) => (
        <div key={i} className="relative h-[300px] w-full overflow-hidden rounded-xl shadow-lg sm:h-[400px]">
          <img
            src={src}
            alt={`Gallery Item ${i}`}
            className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
          />
        </div>
      ))}
    </motion.div>
  );
};

export const ParallaxGallery = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'], // Start when container enters viewport, end when it leaves
  });

  // Smooth physics
  const springScroll = useSpring(scrollYProgress, {
    stiffness: 50,
    damping: 20,
    restDelta: 0.001
  });

  // Define different movement speeds for each column
  // Negative values mean they move UP faster than scroll (or resist scroll)
  // Positive values mean they move DOWN with scroll
  const y1 = useTransform(springScroll, [0, 1], [0, -150]);
  const y2 = useTransform(springScroll, [0, 1], [0, -400]); // Moves fastest
  const y3 = useTransform(springScroll, [0, 1], [0, -200]);
  
  // Mobile: Just standard grid (disabled via CSS hidden/block)
  // Desktop: Parallax columns

  return (
    <section 
      ref={containerRef} 
      className="relative min-h-screen w-full overflow-hidden bg-white px-4 py-24 dark:bg-black sm:px-8"
    >
      <div className="mx-auto max-w-7xl">
        <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold tracking-tight text-neutral-900 dark:text-white sm:text-5xl">
                Visual <span className="text-indigo-600">Symphony</span>
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-neutral-600 dark:text-neutral-400">
                A scrolling experience that breaks the grid.
            </p>
        </div>

        {/* Desktop: 3 Column Parallax */}
        <div className="hidden grid-cols-1 gap-8 md:grid md:grid-cols-3">
          <ParallaxColumn images={col1} y={y1} />
          {/* Middle column starts shifted down slightly to allow for upward movement without gaps at top if needed, 
              or just let it flow. Here we just let useTransform handle the offset. 
              We might need 'mt' or negative margin to align starts if desired.
          */}
          <ParallaxColumn images={col2} y={y2} className="md:-mt-24" /> 
          <ParallaxColumn images={col3} y={y3} />
        </div>

        {/* Mobile: Simple Stack (Parallax disabled for performance/UX) */}
        <div className="grid grid-cols-1 gap-6 md:hidden">
            {images.map((src, i) => (
                <div key={i} className="relative h-[300px] w-full overflow-hidden rounded-xl shadow-lg">
                    <img src={src} alt="Gallery" className="h-full w-full object-cover" />
                </div>
            ))}
        </div>
      </div>
    </section>
  );
};

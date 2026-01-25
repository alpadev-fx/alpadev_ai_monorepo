'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { cn } from '@/lib/utils';

interface HeroZoomProps {
  videoUrl?: string;
  title?: string;
  subtitle?: string;
  className?: string;
}

export const HeroZoom = ({
  videoUrl = 'https://videos.pexels.com/video-files/855564/855564-hd_1920_1080_25fps.mp4',
  title = 'Antigravity Ecosystem',
  subtitle = 'Experience the future of property automation.',
  className,
}: HeroZoomProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // 1. Track scroll progress relative to this container
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'], // Start animation when container hits top, end when it leaves
  });

  // 2. Smooth out the scroll progress for a "weighty" feel
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  // 3. Map scroll progress to animation values
  // Scale: Starts at 1 (full screen), goes down to 0.85
  const scale = useTransform(smoothProgress, [0, 1], [1, 0.85]);
  
  // Border Radius: Starts at 0px, goes to 48px
  const borderRadius = useTransform(smoothProgress, [0, 1], ['0px', '48px']);
  
  // Content Opacity: Fades out quickly as you start scrolling
  const contentOpacity = useTransform(smoothProgress, [0, 0.3], [1, 0]);
  
  // Content Translate Y: Moves up slightly as it fades
  const contentY = useTransform(smoothProgress, [0, 0.3], [0, -50]);

  return (
    <section 
      ref={containerRef} 
      className={cn("relative h-[250vh]", className)} // Increased height for longer scroll throw
    >
      <div className="sticky top-0 h-screen w-full overflow-hidden bg-black">
        <motion.div
          style={{ 
            scale, 
            borderRadius,
          }}
          className="relative h-full w-full overflow-hidden shadow-2xl"
        >
          {/* Video Background */}
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 h-full w-full object-cover"
          >
            <source src={videoUrl} type="video/mp4" />
          </video>

          {/* Dark Overlay for text readability */}
          <div className="absolute inset-0 bg-black/30" />

          {/* Text Overlay */}
          <motion.div 
            style={{ 
              opacity: contentOpacity,
              y: contentY 
            }}
            className="absolute inset-0 flex flex-col items-center justify-center text-center text-white"
          >
            <h1 className="mb-6 max-w-4xl text-5xl font-extrabold tracking-tight sm:text-7xl md:text-8xl">
              {title}
            </h1>
            <p className="max-w-2xl text-xl font-medium text-white/80 sm:text-2xl">
              {subtitle}
            </p>
            
            {/* Scroll Indicator */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 1 }}
              className="absolute bottom-12 flex flex-col items-center gap-2"
            >
              <span className="text-sm font-medium uppercase tracking-widest text-white/60">Scroll to Explore</span>
              <div className="h-12 w-[1px] bg-gradient-to-b from-white to-transparent" />
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

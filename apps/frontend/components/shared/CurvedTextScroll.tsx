'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { cn } from '@/lib/utils';

interface CurvedTextScrollProps {
  text?: string;
  pathD?: string; // SVG path 'd' attribute for the curve
  className?: string;
  textId?: string; // Unique ID for the textPath's path reference
}

export const CurvedTextScroll = ({
  text = 'Alpadev // Engineering the Future of Intelligence',
  pathD = 'M0,100 Q150,0 300,100 T600,100', // A basic S-curve for a wider container
  className,
  textId = 'curvePath',
}: CurvedTextScrollProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'], // Start when container enters, end when it leaves
  });

  // Smooth out scroll progress
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 50,
    damping: 20,
    restDelta: 0.001,
  });

  // Map scroll progress to text startOffset
  // Text will move from left to right along the path
  const startOffset = useTransform(smoothProgress, [0, 1], ['100%', '-50%']); // Adjust values for desired movement range

  // Optional: Rotate the entire SVG slightly for added dynamism
  const rotate = useTransform(smoothProgress, [0, 1], [0, 10]); // Slight rotation
  const scale = useTransform(smoothProgress, [0, 1], [1, 1.1]); // Slight scale

  return (
    <section 
      ref={containerRef} 
      className={cn("relative h-[200vh] flex items-center justify-center bg-neutral-950 text-white overflow-hidden", className)}
    >
      <motion.div
        style={{ rotate, scale }}
        className="sticky top-1/2 -translate-y-1/2 flex items-center justify-center h-[500px] w-full max-w-4xl"
      >
        <svg 
          viewBox="0 0 600 200" 
          className="w-full h-full"
          preserveAspectRatio="xMidYMid meet"
        >
          <path 
            id={textId} 
            d={pathD} 
            fill="transparent" 
            stroke="rgba(255,255,255,0.1)" // Visible path for debugging/effect
            strokeWidth="1"
          />
          <motion.text 
            className="font-extrabold uppercase fill-white text-5xl md:text-7xl"
            style={{ 
              fontSize: '50px', // Fallback font size
              textAnchor: 'middle', // Center text on path
              dominantBaseline: 'hanging', // Align text baseline
            }}
          >
            <motion.textPath 
              xlinkHref={`#${textId}`} 
              startOffset={startOffset}
            >
              {text}
            </motion.textPath>
          </motion.text>
        </svg>
      </motion.div>
    </section>
  );
};

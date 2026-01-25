'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, useMotionValue, useTransform, useSpring, PanInfo } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Icon } from '@iconify/react'; // Assuming Iconify is available as per context, or I'll use simple svg

interface ComparisonSliderProps {
  imageOne?: string; // Left Image (e.g., Before / Sin Modo Noche)
  imageTwo?: string; // Right Image (e.g., After / Con Modo Noche)
  labelOne?: string;
  labelTwo?: string;
  className?: string;
}

export const ComparisonSlider = ({
  imageOne = 'https://images.unsplash.com/photo-1493246507139-91e8fad9978e?q=80&w=2070&auto=format&fit=crop', // A landscape (Standard)
  imageTwo = 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?q=80&w=2144&auto=format&fit=crop', // A night city (Dark Mode)
  labelOne = 'Legacy Monolith',
  labelTwo = 'Modern Microservices',
  className,
}: ComparisonSliderProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);

  // Measure container width on mount/resize for drag constraints
  useEffect(() => {
    if (!containerRef.current) return;
    
    const updateWidth = () => {
        if (containerRef.current) {
            setContainerWidth(containerRef.current.offsetWidth);
        }
    };

    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  // Motion Value for the slider position (pixel value)
  // Initialize at 50%
  const x = useMotionValue(0); 
  
  // Create a spring for smooth return if released (optional) or just smooth tracking
  // We actually want direct tracking usually for sliders, but a stiff spring prevents jitter
  const xSpring = useSpring(x, { stiffness: 700, damping: 50 });

  // Transform pixel x to percentage (0 to 100) for the clip-path
  // x goes from 0 to containerWidth. 
  // We need to map it. 
  // However, dragging motion div is relative to its start. 
  // Let's make x represent the *offset* from the center or left?
  // Easier approach: x represents the absolute position from left edge.
  
  // We'll use a slightly different pattern: 
  // Track drag percentage directly? No, framer motion tracks pixels.
  // We'll handle the drag logic manually via onPan or use a draggable div constrained to the parent.
  
  const handleX = useMotionValue(0); // This will be set dynamically via onLayout or initial render
  
  // We need to wait for containerWidth to be known to set initial position
  useEffect(() => {
    if (containerWidth > 0) {
        handleX.set(containerWidth / 2);
    }
  }, [containerWidth, handleX]);

  // Map handle position to percentage string for clip-path
  const clipPathLeft = useTransform(handleX, (value) => {
     // The left image is fully visible, we clip the RIGHT image? Or overlap?
     // Typical pattern: 
     // Image 1 (Left) is underneath.
     // Image 2 (Right) is on top, and we clip it from the left.
     // Wait, usually it's:
     // Bottom Layer: Image 2 (Right Side content)
     // Top Layer: Image 1 (Left Side content). We clip-path: inset(0 (100-percent)% 0 0);
     
     // Let's do:
     // Bottom: Right Image (Label Two)
     // Top: Left Image (Label One). Clip it based on slider.
     const percentage = (value / containerWidth) * 100;
     return `inset(0 ${100 - percentage}% 0 0)`;
  });

  // Handle Drag
  const handleDrag = (event: any, info: PanInfo) => {
    const newX = handleX.get() + info.delta.x;
    if (newX >= 0 && newX <= containerWidth) {
        handleX.set(newX);
    }
  };
  
  // Opacity for labels based on slider position
  // Left label visible when slider is towards right (>50%)
  // Right label visible when slider is towards left (<50%)
  const labelOneOpacity = useTransform(handleX, (value) => value > containerWidth * 0.1 ? 1 : 0);
  const labelTwoOpacity = useTransform(handleX, (value) => value < containerWidth * 0.9 ? 1 : 0);


  return (
    <div 
        ref={containerRef}
        className={cn("relative h-[400px] w-full max-w-5xl overflow-hidden rounded-2xl shadow-2xl select-none cursor-ew-resize", className)}
    >
      {/* Background Image (Right / After / LabelTwo) */}
      <div className="absolute inset-0 h-full w-full">
        <img 
            src={imageTwo} 
            alt="After" 
            className="h-full w-full object-cover" 
            draggable={false}
        />
        {/* Label for Background Layer (Right Side) */}
        <motion.div 
            style={{ opacity: labelTwoOpacity }}
            className="absolute bottom-4 right-4 rounded-lg border border-white/10 bg-black/40 px-3 py-1 text-sm font-medium text-white backdrop-blur-md"
        >
            {labelTwo}
        </motion.div>
      </div>

      {/* Foreground Image (Left / Before / LabelOne) - Clipped */}
      <motion.div 
        className="absolute inset-0 h-full w-full overflow-hidden"
        style={{ clipPath: clipPathLeft }}
      >
        <img 
            src={imageOne} 
            alt="Before" 
            className="h-full w-full object-cover" 
            draggable={false}
        />
         {/* Label for Foreground Layer (Left Side) */}
         <motion.div 
            style={{ opacity: labelOneOpacity }}
            className="absolute bottom-4 left-4 rounded-lg border border-white/10 bg-black/40 px-3 py-1 text-sm font-medium text-white backdrop-blur-md"
        >
            {labelOne}
        </motion.div>
      </motion.div>

      {/* The Handle */}
      {/* We overlay a transparent drag area or just a line */}
      <motion.div
        className="absolute inset-y-0 z-30 flex w-1 touch-none items-center justify-center bg-white shadow-[0_0_10px_rgba(0,0,0,0.5)]"
        style={{ x: handleX }}
        drag="x"
        dragConstraints={containerRef}
        dragElastic={0}
        dragMomentum={false}
        onDrag={(e, info) => {
            // Framer motion's 'x' prop automatically updates with drag. 
            // We linked 'x' to handleX directly via style={{x: handleX}}? 
            // No, 'drag' updates the component's transform. 
            // But we need the value for clipPath.
            // Best practice: Use onDrag to update a motionValue if we need it elsewhere, 
            // OR use useMotionValue connected to style.x.
            
            // Wait, if we use drag="x", Framer Motion manages the x transform internally on the element.
            // We need to EXTRACT that x value to drive the clip path.
            // The 'style={{ x: handleX }}' allows two-way binding roughly.
            
            // Actually, simpler way:
            // Let drag update 'handleX' directly.
        }}
        // Better pattern for strictly controlled drag driving other values:
        // Don't use standard dragConstraints if we want to drive a clipPath on a sibling.
        // We'll use a custom drag handler on a transparent overlay or just use standard Framer drag 
        // and use 'useMotionValueEvent' or onChange to update state? 
        // No, 'useTransform' works with the motion value passed to style.x.
      >
        {/* Grabber Icon */}
        <div className="absolute flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-lg backdrop-blur-sm">
             <svg 
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24" 
                strokeWidth={2} 
                stroke="currentColor" 
                className="h-6 w-6 text-neutral-800"
            >
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 15L12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9" className="rotate-90 origin-center" />
                {/* Horizontal arrows path manually constructed or rotated vertical arrows */}
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" className="hidden"/> 
                {/* Simple double chevron */}
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" transform="rotate(180 12 12) translate(4 0)" />
                 <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" transform="translate(-4 0)" />
            </svg>
        </div>
      </motion.div>

    </div>
  );
};

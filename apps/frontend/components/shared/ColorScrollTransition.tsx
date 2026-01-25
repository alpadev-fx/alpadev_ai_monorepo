"use client";

import React, { useRef, ReactNode } from "react";
import { motion, useScroll, useTransform, MotionValue } from "framer-motion";
import { cn } from "@/lib/utils";

export interface Scene {
  /** Background color for this scene (e.g., "#000000", "rgb(0,0,0)") */
  backgroundColor: string;
  /** Text color for this scene, for contrast (e.g., "text-white", "text-black") */
  textColor: string;
  /** Content to display */
  content: ReactNode;
}

interface ColorScrollTransitionProps {
  scenes: Scene[];
  className?: string;
  /** Total height of the scrollable area, e.g., "400vh" */
  height?: string;
}

export const ColorScrollTransition = ({
  scenes,
  className,
  height = "400vh",
}: ColorScrollTransitionProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // 1. Create array of scroll ranges [0, 0.33, 0.66, 1] based on number of scenes
  const numScenes = scenes.length;
  // Create evenly spaced checkpoints. e.g. for 3 scenes: [0, 0.5, 1] or better [0, 0.33, 0.66] + last segment
  // Actually, we want to map scroll 0->1 to the sequence of colors.
  // If we have N scenes, we have N checkpoints.
  const scrollPoints = scenes.map((_, i) => i / (numScenes - 1 || 1));
  const backgroundColors = scenes.map((s) => s.backgroundColor);

  // Smoothly interpolate background color
  const backgroundColor = useTransform(scrollYProgress, scrollPoints, backgroundColors);

  return (
    <motion.section
      ref={containerRef}
      style={{ backgroundColor }}
      className={cn("relative w-full", className)}
      // Set height dynamically
      initial={{ minHeight: height }}
      animate={{ minHeight: height }}
    >
      <div className="sticky top-0 flex h-screen w-full items-center justify-center overflow-hidden">
        {scenes.map((scene, index) => (
          <SceneContent
            key={index}
            index={index}
            numScenes={numScenes}
            scrollYProgress={scrollYProgress}
            textColor={scene.textColor}
          >
            {scene.content}
          </SceneContent>
        ))}
      </div>
    </motion.section>
  );
};

interface SceneContentProps {
  index: number;
  numScenes: number;
  scrollYProgress: MotionValue<number>;
  textColor: string;
  children: ReactNode;
}

const SceneContent = ({
  index,
  numScenes,
  scrollYProgress,
  textColor,
  children,
}: SceneContentProps) => {
  // Logic to crossfade content
  // Each scene 'active' at exactly index/(numScenes-1).
  // We want it to be visible around that point.
  // Example for 3 scenes: 0, 0.5, 1.
  // Scene 0: visible 0 -> 0.25 (fade out)
  // Scene 1: fade in 0.25 -> 0.5 -> fabe out 0.75
  // Scene 2: fade in 0.75 -> 1

  const step = 1 / (numScenes - 1 || 1);
  const center = index * step;
  
  // Define a small range around the center where opacity is 1
  // We'll fade in from (center - step/2) to center
  // And fade out from center to (center + step/2)
  const fadeInStart = center - step / 1.5;
  const fadeOutEnd = center + step / 1.5;

  // Ensure first and last items stay visible at the edges
  const opacity = useTransform(
    scrollYProgress,
    [fadeInStart, center, fadeOutEnd],
    [0, 1, 0]
  );
  
  // Custom transform for the "active" text color class to apply smoothly? 
  // Text color is discrete, but we can wrap content in a div that applies it.
  
  // Position absolutely to overlap
  return (
    <motion.div
      style={{ opacity }}
      className={cn(
        "absolute inset-0 flex h-full w-full items-center justify-center p-8 transition-colors duration-500",
        textColor
      )}
    >
      {children}
    </motion.div>
  );
};

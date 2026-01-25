"use client"

import React, { useRef } from "react"
import { motion, useScroll, useTransform, useSpring, useMotionTemplate, MotionValue } from "framer-motion"

/**
 * Configuration props for the scroll transition behavior.
 */
export interface ScrollTransitionProps {
  /**
   * The content to be shown in the first section (Section A).
   * This content will fade out and scale down.
   */
  childrenA: React.ReactNode

  /**
   * The content to be shown in the second section (Section B).
   * This content will fade in and scale up.
   */
  childrenB: React.ReactNode

  /**
   * The background color for Section A (initial state).
   * @default "#000000"
   */
  colorA?: string

  /**
   * The background color for Section B (final state).
   * @default "#F5F5F7"
   */
  colorB?: string

  /**
   * The total height of the scrollable area relative to the viewport height.
   * A value of 300 means the transition area is 300vh tall.
   * @default 300
   */
  scrollDistance?: string | number
  /**
   * The background color for the exit phase (transition to next component).
   * @default undefined (stays at colorB)
   */
  colorExit?: string
}

const PHYSICS_CONFIG = {
  stiffness: 100,
  damping: 30,
  restDelta: 0.001
}

export const ScrollTransition = ({
  childrenA,
  childrenB,
  colorA = "#000000",
  colorB = "#F5F5F7",
  colorExit,
  scrollDistance = "300vh",
}: ScrollTransitionProps) => {
  const containerRef = useRef<HTMLDivElement>(null)

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  })

  const smoothProgress = useSpring(scrollYProgress, PHYSICS_CONFIG)

  // --- Interpolations ---

  // 1. Background Color Transition
  // If colorExit is provided, transition to it in the last 15% of scroll
  const bgRange = colorExit ? [0, 0.4, 0.85, 1] : [0, 1]
  const bgOutput = colorExit ? [colorA, colorB, colorB, colorExit] : [colorA, colorB]
  const backgroundColor = useTransform(smoothProgress, bgRange, bgOutput)

  // 2. Section A Animations (Exiting)
  const opacityA = useTransform(smoothProgress, [0.2, 0.5], [1, 0])
  const scaleA = useTransform(smoothProgress, [0.2, 0.5], [1, 0.9])
  
  const pointerEventsA = useTransform(opacityA, (v) => (v < 0.1 ? "none" : "auto"))

  // 3. Section B Animations (Entering and potentially Exiting)
  // Enter: 0.4 -> 0.7
  // Exit: 0.85 -> 1.0 (if needed)
  
  const opacityB = useTransform(smoothProgress, [0.4, 0.7, 0.9, 1], [0, 1, 1, 0]) 
  const scaleB = useTransform(smoothProgress, [0.4, 0.7, 0.9, 1], [1.1, 1, 1, 0.9])

  const pointerEventsB = useTransform(opacityB, (v) => (v < 0.1 ? "none" : "auto"))

  return (
    <section
      ref={containerRef}
      className="relative w-full py-12 md:py-32"
      style={{ height: scrollDistance }}
    >
      <motion.div
        className="sticky top-0 h-screen w-full overflow-hidden flex items-center justify-center will-change-[background-color]"
        style={{ backgroundColor }}
      >
        {/* Section A Container */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center w-full h-full will-change-transform"
          style={{
            opacity: opacityA,
            scale: scaleA,
            pointerEvents: pointerEventsA,
          }}
        >
          {childrenA}
        </motion.div>

        {/* Section B Container */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center w-full h-full will-change-transform"
          style={{
            opacity: opacityB,
            scale: scaleB,
            pointerEvents: pointerEventsB,
          }}
        >
          {childrenB}
        </motion.div>
      </motion.div>
    </section>
  )
}


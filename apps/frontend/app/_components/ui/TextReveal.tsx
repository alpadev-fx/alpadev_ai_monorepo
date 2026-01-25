"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, MotionValue } from "framer-motion";
import { cn } from "@/lib/utils";

interface TextRevealProps {
  text: string;
  className?: string;
  textClassName?: string;
  boxClassName?: string;
}

export const TextReveal = ({ text, className, textClassName, boxClassName }: TextRevealProps) => {
  const targetRef = useRef<HTMLDivElement>(null);

  // Map scroll progress to the text reveal
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start end", "end start"],
  });

  const words = text.split(" ");

  return (
    <div ref={targetRef} className={cn("relative z-20 min-h-[60vh]", className)}>
      <div className={cn("sticky top-0 mx-auto flex h-[50%] max-w-5xl items-center bg-transparent px-[1rem] py-[5rem]", boxClassName)}>
        <p
          className={cn(
            "flex flex-wrap p-5 text-3xl font-bold text-white/20 md:p-8 md:text-5xl lg:p-10 lg:text-6xl xl:text-7xl",
            textClassName
          )}
        >
          {words.map((word, i) => {
            const start = i / words.length;
            const end = start + 1 / words.length;
            return (
              <Word key={i} progress={scrollYProgress} range={[start, end]}>
                {word}
              </Word>
            );
          })}
        </p>
      </div>
    </div>
  );
};

interface WordProps {
  children: string;
  progress: MotionValue<number>;
  range: [number, number];
}

const Word = ({ children, progress, range }: WordProps) => {
  const opacity = useTransform(progress, range, [0, 1]);
  return (
    <span className="relative mx-1 lg:mx-2.5">
      <span className="absolute opacity-30">{children}</span>
      <motion.span style={{ opacity: opacity }} className="text-white">
        {children}
      </motion.span>
    </span>
  );
};

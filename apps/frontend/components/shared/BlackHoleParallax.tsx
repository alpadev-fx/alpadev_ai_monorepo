"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { SingularityShaders } from "@/app/_components/ui/SingularityShaders";
import { TextGenerateEffect } from "@/app/_components/ui/text-generate-effect";
import { useLanguage } from "@/contexts/LanguageContext";

/**
 * BlackHoleParallax - Apple-style scroll-driven parallax with TextGenerateEffect.
 */
export const BlackHoleParallax = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  // --- TRANSFORMS ---
  const shaderOpacity = useTransform(scrollYProgress, [0, 0.3, 0.6, 0.9], [0.8, 1, 1, 0]); // Fades out at end
  const shaderY = useTransform(scrollYProgress, [0, 1], [0, -300]);

  // Hero Text (Section 1): Fades out
  const heroOpacity = useTransform(scrollYProgress, [0, 0.25], [1, 0]);
  const heroY = useTransform(scrollYProgress, [0, 0.25], [0, -100]);

  // Secondary Text (Section 2): Fades in then out
  const secondaryOpacity = useTransform(scrollYProgress, [0.3, 0.5, 0.8], [0, 1, 0]);
  const secondaryY = useTransform(scrollYProgress, [0.3, 0.5], [60, 0]);

  return (
    <section ref={containerRef} className="relative h-[200vh] bg-black">
      
      {/* --- BLACK HOLE (Fades out at end of section) --- */}
      <motion.div 
        style={{ opacity: shaderOpacity, y: shaderY }}
        className="fixed inset-0 z-0 will-change-[opacity,transform] flex items-center justify-center pointer-events-none"
      >
        <div className="w-full h-full max-w-[1200px] max-h-[1200px] relative">
          <SingularityShaders
            color1="#FED8B1"
            color2="#000000"
            speed={1.0}
            intensity={1.5}
            size={1.0}
            waveStrength={1.0}
            className="w-full h-full"
          />
        </div>
      </motion.div>

      {/* --- STICKY TEXT CONTAINER --- */}
      <div className="sticky top-0 h-screen w-full overflow-hidden flex items-center justify-center z-10">
        
        {/* Hero Text with TextGenerateEffect */}
        <motion.div
          style={{ opacity: heroOpacity, y: heroY }}
          className="absolute text-center px-6 max-w-4xl will-change-[opacity,transform]"
        >
          {/* Branding subtitle for Google OAuth */}
          <p className="text-sm md:text-base text-cyan-400 font-medium tracking-widest uppercase mb-4">
            Alpadev - AI Software Development
          </p>
          <TextGenerateEffect 
            words={t("section.title")}
            className="text-5xl md:text-8xl tracking-tighter leading-[1.05] mb-6"
            duration={2}
            delay={0.15}
          />
          <p className="text-lg md:text-xl text-neutral-400 max-w-xl mx-auto">
            {t("hero.description")}
          </p>
        </motion.div>

        {/* Secondary Text with TextGenerateEffect */}
        <motion.div
          style={{ opacity: secondaryOpacity, y: secondaryY }}
          className="absolute text-center px-6 max-w-3xl will-change-[opacity,transform]"
        >
          <TextGenerateEffect 
            words={t("features.title")}
            className="text-4xl md:text-7xl tracking-tighter mb-6"
            duration={2}
            delay={0.12}
          />
          <p className="text-lg md:text-xl text-neutral-400 max-w-xl mx-auto">
            {t("features.subtitle")}
          </p>
        </motion.div>

        {/* Privacy/Terms Links for Google OAuth */}
        <div className="absolute bottom-8 left-0 right-0 text-center z-30">
          <div className="flex justify-center gap-4 text-xs text-neutral-500">
            <a href="/privacy" className="hover:text-white transition-colors">Privacy Policy</a>
            <span>|</span>
            <a href="/terms" className="hover:text-white transition-colors">Terms of Service</a>
          </div>
        </div>

      </div>
      
      {/* Gradient Connector */}
      <div className="absolute bottom-0 w-full h-40 bg-gradient-to-t from-black to-transparent z-20 pointer-events-none" />
    </section>
  );
};

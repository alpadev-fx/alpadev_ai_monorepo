"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { SingularityShaders } from "@/app/_components/ui/SingularityShaders";
import { TextGenerateEffect } from "@/app/_components/ui/text-generate-effect";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button, useDisclosure } from "@heroui/react";
import Modal from "@/app/_components/ui/Modal";
import CalendarBooking from "@/components/booking/calendar-booking";

/**
 * BlackHoleParallax - Apple-style scroll-driven parallax with TextGenerateEffect.
 */
export const BlackHoleParallax = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();
  const {isOpen, onOpen, onClose} = useDisclosure();

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
  const heroPointerEvents = useTransform(scrollYProgress, (v) => v < 0.25 ? "auto" : "none");

  // Secondary Text (Section 2): Fades in then out
  const secondaryOpacity = useTransform(scrollYProgress, [0.3, 0.5, 0.8], [0, 1, 0]);
  const secondaryY = useTransform(scrollYProgress, [0.3, 0.5], [60, 0]);
  const secondaryPointerEvents = useTransform(scrollYProgress, (v) => v > 0.25 && v < 0.85 ? "auto" : "none");

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
          style={{ opacity: heroOpacity, y: heroY, pointerEvents: heroPointerEvents as any }}
          className="absolute text-center px-6 max-w-4xl will-change-[opacity,transform]"
        >
          <TextGenerateEffect 
            words={t("section.title")}
            className="text-5xl md:text-8xl tracking-tighter leading-[1.05] mb-6"
            duration={2}
            delay={0.15}
          />
          <p className="text-lg md:text-xl text-white max-w-xl mx-auto">
            {t("hero.description")}
          </p>
          <br />
           <Button
            onClick={onOpen}
            className="mt-8 px-8 py-8 bg-transparent border border-white/30 rounded-full font-medium text-lg text-white transition-all duration-700 hover:scale-105 hover:border-transparent hover:bg-gradient-to-r hover:from-indigo-500 hover:via-fuchsia-500 hover:via-blue-500 hover:to-teal-500 bg-[length:200%_auto] bg-left hover:bg-right hover:shadow-[0_0_40px_rgba(79,70,229,0.5)]"
            variant="solid"
          >
            {t("hero.cta.primary")}
          </Button>
        </motion.div>

        {/* Secondary Text with TextGenerateEffect */}
        <motion.div
          style={{ opacity: secondaryOpacity, y: secondaryY, pointerEvents: secondaryPointerEvents as any }}
          className="absolute text-center px-6 max-w-3xl will-change-[opacity,transform]"
        >
          <TextGenerateEffect 
            words={t("features.title")}
            className="text-4xl md:text-7xl  tracking-tighter mb-6"
            duration={2}
            delay={0.12}
          />
          <p className="text-lg  md:text-xl text-white max-w-xl mx-auto">
            {t("features.subtitle")}
          </p>
          <br />
          <Button
            onClick={onOpen}
            className="mt-8 px-8 py-6 bg-transparent border border-white/30 rounded-full font-medium text-lg text-white transition-all duration-700 hover:scale-105 hover:border-transparent hover:bg-gradient-to-r hover:from-indigo-500 hover:via-fuchsia-500 hover:via-blue-500 hover:to-teal-500 bg-[length:200%_auto] bg-left hover:bg-right hover:shadow-[0_0_40px_rgba(79,70,229,0.5)]"
            variant="solid"
          >
            {t("hero.cta.secondary")}
          </Button>


        </motion.div>

        {/* Privacy/Terms Links - More Visible for Google OAuth */}
        <div className="absolute bottom-8 left-0 right-0 text-center z-30">
          <div className="flex justify-center gap-6 text-sm text-neutral-400">
            <a href="/privacy" className="underline hover:text-white transition-colors">Privacy Policy</a>
            <span>•</span>
            <a href="/terms" className="underline hover:text-white transition-colors">Terms of Service</a>
          </div>
        </div>

      </div>
      
      {/* Gradient Connector */}
      <div className="absolute bottom-0 w-full h-40 bg-gradient-to-t from-black to-transparent z-20 pointer-events-none" />

      <Modal
        open={isOpen}
        onClose={onClose}
        size="auto"
        isTransparent
        hideCloseButton={true}
      >
        <CalendarBooking onClose={onClose} />
      </Modal>
    </section>
  );
};

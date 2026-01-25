"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import { motion } from "framer-motion";

/**
 * HeroOverlayContent - The text layer that floats above the Black Hole.
 * Uses the new "Executive Presence" copy from LanguageContext.
 */
export const HeroOverlayContent = () => {
  const { t } = useLanguage();

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1, ease: "easeOut", delay: 0.5 }}
      className="text-center px-6 max-w-4xl mx-auto"
    >
      {/* Badge */}
      <div className="mb-8 inline-flex items-center rounded-full border border-white/10 bg-white/5 px-4 py-1.5 backdrop-blur-sm">
        <span className="text-sm font-mono text-lime-400 tracking-wide">
          {t("hero.badge")}
        </span>
      </div>

      {/* H1 */}
      <h1 className="text-5xl md:text-8xl font-bold tracking-tighter text-white mb-8 leading-[1.1]">
        <span className="bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-neutral-400">
          {t("section.title")}
        </span>
      </h1>

      {/* Sub-headline */}
      <p className="text-lg md:text-xl text-neutral-400 max-w-2xl mx-auto mb-10 leading-relaxed">
        {t("hero.description")}
      </p>

      {/* CTAs */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <button className="px-8 py-3 rounded-full bg-lime-400 text-black font-semibold transition-all hover:bg-lime-300 hover:scale-105">
          {t("hero.cta.primary")}
        </button>
        <button className="text-sm font-medium text-white/80 hover:text-white transition-colors">
          {t("hero.cta.secondary")} <span aria-hidden="true">→</span>
        </button>
      </div>
    </motion.div>
  );
};

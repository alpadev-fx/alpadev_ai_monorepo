"use client";

import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";

/**
 * FloatingCards - Glassmorphic cards that float above the Black Hole.
 * These represent key service pillars and use the "Quiet Luxury" aesthetic.
 */
export const FloatingCards = () => {
  const { t } = useLanguage();

  const cards = [
    {
      id: 1,
      title: t("features.software.title"),
      description: t("features.software.description"),
    },
    {
      id: 2,
      title: t("features.ai.title"),
      description: t("features.ai.description"),
    },
    {
      id: 3,
      title: t("features.cloud.title"),
      description: t("features.cloud.description"),
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1, ease: "easeOut", delay: 1 }}
      className="mt-16 flex flex-wrap justify-center gap-6 px-6"
    >
      {cards.map((card, index) => (
        <motion.div
          key={card.id}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.2 + index * 0.15 }}
          className="group relative w-full max-w-xs p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-lg shadow-2xl transition-all hover:border-lime-400/50 hover:bg-white/10"
        >
          {/* Title */}
          <h3 className="text-lg font-semibold text-white mb-2 tracking-tight">
            {card.title}
          </h3>
          {/* Description */}
          <p className="text-sm text-neutral-400 leading-relaxed line-clamp-3">
            {card.description}
          </p>
          
          {/* Hover Glow */}
          <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-lime-400/5 blur-xl pointer-events-none" />
        </motion.div>
      ))}
    </motion.div>
  );
};

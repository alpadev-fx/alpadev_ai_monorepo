'use client';

import { useRef, useMemo } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { getAssetUrl } from '@/lib/r2';

export const StickyShowcase = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();

  const features = useMemo(() => [
    {
      id: 1,
      title: t("work.case1.industry"),
      description: t("work.case1.challenge"),
      outcome: t("work.case1.outcome"),
      imageUrl: getAssetUrl('data_center.jpg'), // Fintech visual
      color: '#050505',
    },
    {
      id: 2,
      title: t("work.case2.industry"),
      description: t("work.case2.challenge"),
      outcome: t("work.case2.outcome"),
      imageUrl: getAssetUrl('supply_chain.jpg'), // Logistics
      color: '#121212',
    },
    {
      id: 3,
      title: t("work.case3.industry"),
      description: t("work.case3.challenge"),
      outcome: t("work.case3.outcome"),
      imageUrl: getAssetUrl('fintech.jpg'), // Fintech / Infrastructure visual
      color: '#1a1a1a',
    },
  ], [t]);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  const numItems = features.length;
  const step = 1 / numItems;

  return (
    <section ref={containerRef} className="relative bg-black text-white font-sans">
      <div className="flex w-full flex-col lg:flex-row">
        
        {/* LEFT COLUMN: Sticky Images */}
        <div className="sticky top-0 flex h-[50vh] w-full items-center justify-center overflow-hidden bg-neutral-950 lg:h-screen lg:w-1/2">
          <div className="relative h-4/5 w-4/5">
             {features.map((item, index) => {
                const start = index * step;
                const end = (index + 1) * step;
                const fade = step * 0.3; 
                
                // eslint-disable-next-line react-hooks/rules-of-hooks
                const opacity = useTransform(
                    scrollYProgress,
                    [Math.max(0, start - fade), start + fade, end - fade, Math.min(1, end + fade)],
                    index === 0 ? [1, 1, 1, 0] : index === numItems - 1 ? [0, 1, 1, 1] : [0, 1, 1, 0]
                );
                
                // eslint-disable-next-line react-hooks/rules-of-hooks
                const scale = useTransform(scrollYProgress, [start, end], [0.98, 1.02]);

                return (
                   <motion.div
                     key={item.id}
                     style={{ opacity, scale }}
                     className="absolute inset-0 z-10 flex items-center justify-center"
                   >
                     <img 
                        src={item.imageUrl} 
                        alt={item.title} 
                        className="h-full w-full object-cover opacity-90 hover:opacity-100 transition-opacity duration-500"
                     />
                   </motion.div>
                );
             })}
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/50 opacity-70" />
        </div>

        {/* RIGHT COLUMN: Scrollable Text Content */}
        <div className="flex w-full flex-col lg:w-1/2">
           {features.map((item, index) => {
               const start = index * step;
               const end = (index + 1) * step;
               const mid = start + (step / 2);
               
               // eslint-disable-next-line react-hooks/rules-of-hooks
               const textOpacity = useTransform(scrollYProgress, [start, mid, end], [0.2, 1, 0.2]);

               return (
                  <motion.div 
                    key={item.id}
                    className="flex h-screen items-center justify-center px-8 lg:px-24"
                    style={{ opacity: textOpacity }}
                  >
                     <div className="max-w-xl">
                        {/* Accent line - blue-to-indigo gradient */}
                        <span className="mb-6 block h-[1px] w-20 bg-gradient-to-r from-blue-500 to-indigo-500" />
                        
                        {/* Industry Label */}
                        <h2 className="mb-4 text-sm font-mono uppercase tracking-widest text-neutral-400">
                            {item.title}
                        </h2>
                        
                        {/* Challenge - Original bold style */}
                        <h3 className="mb-8 text-3xl font-bold tracking-tighter text-white lg:text-5xl leading-tight">
                            {item.description}
                        </h3>
                        
                        {/* Outcome */}
                        <div className="pl-6 border-l border-neutral-800">
                            <p className="font-mono text-sm tracking-wide mb-2 bg-gradient-to-r from-blue-500 to-indigo-500 bg-clip-text text-transparent">OUTCOME</p>
                            <p className="text-xl text-neutral-300 font-medium">
                                {item.outcome}
                            </p>
                        </div>
                     </div>
                  </motion.div>
               );
           })}
        </div>

      </div>
    </section>
  );
};

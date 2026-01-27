'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Icon } from '@iconify/react';

interface LayerProps {
  id: number;
  icon: string;
  title: string;
  description: string;
  zIndex: number;
  color: string;
}

const layers: LayerProps[] = [
  {
    id: 1,
    icon: "logos:nextjs-icon",
    title: "Frontend Apps",
    description: "Next.js 15 • TypeScript • Tailwind",
    zIndex: 40,
    color: "bg-white/5 border-white/20",
  },
  {
    id: 2,
    icon: "logos:typescript-icon",
    title: "API Layer",
    description: "tRPC • End-to-End Type Safety",
    zIndex: 30,
    color: "bg-blue-500/10 border-blue-500/30",
  },
  {
    id: 3,
    icon: "simple-icons:openai",
    title: "AI Services",
    description: "LLM Agents • RAG • Embeddings",
    zIndex: 20,
    color: "bg-purple-500/10 border-purple-500/30",
  },
  {
    id: 4,
    icon: "simple-icons:prisma",
    title: "Data Layer",
    description: "Prisma • MongoDB • Redis",
    zIndex: 10,
    color: "bg-emerald-500/10 border-emerald-500/30",
  },
  {
    id: 5,
    icon: "logos:docker-icon",
    title: "Infrastructure",
    description: "Docker • CI/CD • IaaS",
    zIndex: 5,
    color: "bg-red-500/10 border-red-500/30",
  },
];

export const ExplodedView = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  const rotateX = useTransform(scrollYProgress, [0, 1], [55, 35]);
  const rotateY = useTransform(scrollYProgress, [0, 1], [0, -15]);
  const rotateZ = useTransform(scrollYProgress, [0, 1], [-35, 0]);
  const labelOpacity = useTransform(scrollYProgress, [0.4, 0.7], [0, 1]);

  // Exit animation - Apple style fade out, blur, scale down
  // Delayed to start at 88% scroll progress so main content is fully visible first
  const exitOpacity = useTransform(scrollYProgress, [0.85, 0.98], [1, 0]);
  const exitScale = useTransform(scrollYProgress, [0.85, 0.98], [1, 0.9]);
  const exitBlur = useTransform(scrollYProgress, [0.85, 0.98], [0, 20]);

  return (
    <section 
      ref={containerRef} 
      className="relative h-[300vh] bg-black text-white"
    >
      <motion.div 
        className="sticky top-0 h-screen w-full overflow-hidden perspective-[1200px] flex flex-col"
        style={{ 
          opacity: exitOpacity, 
          scale: exitScale,
          filter: useTransform(exitBlur, (v) => `blur(${v}px)`)
        }}
      >
        
        {/* --- TITLE (Top section) --- */}
        <div className="flex-shrink-0 pt-20 md:pt-24 pb-8 text-center z-20 px-4">
          <h2 className="text-3xl md:text-6xl font-bold tracking-tighter text-white leading-tight">
            AI Native <span className="text-transparent bg-clip-text bg-gradient-to-r from-lime-400 via-cyan-400 to-purple-500">Monorepo</span>
          </h2>
          <p className="text-sm md:text-base text-neutral-500 mt-2">TurboRepo • pnpm • Zero Config</p>
        </div>

        {/* --- 3D ANIMATION (Lower section, using more space) --- */}
        <div className="flex-1 relative flex items-end justify-center pb-0">
          <motion.div
            style={{ 
              rotateX, 
              rotateY,
              rotateZ,
              transformStyle: "preserve-3d",
              transition: "transform 0.05s ease-out" 
            }}
            className="relative flex h-[300px] w-[300px] md:h-[400px] md:w-[400px] items-center justify-center will-change-transform translate-y-40"
          >
            {layers.map((layer, index) => {
              const zTarget = (layers.length - 1 - index) * 120;
              // eslint-disable-next-line react-hooks/rules-of-hooks
              const z = useTransform(scrollYProgress, [0, 1], [0, zTarget]);
              // eslint-disable-next-line react-hooks/rules-of-hooks
              const y = useTransform(scrollYProgress, [0, 1], [0, index * -40]);

              return (
                <motion.div
                  key={layer.id}
                  style={{ z, y, zIndex: layer.zIndex }}
                  className="absolute inset-0 flex items-center justify-center transform-gpu will-change-transform"
                >
                  <motion.div 
                    className={cn(
                      "relative flex h-full w-full flex-col items-center justify-center rounded-2xl border backdrop-blur-xl",
                      layer.color
                    )}
                  >
                    <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/10" />
                    <div className="relative z-10 p-4 md:p-5 rounded-full bg-black/40 backdrop-blur-md border border-white/10">
                      <Icon icon={layer.icon} width="56" height="56" className="text-white" />
                    </div>
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/5 via-transparent to-transparent pointer-events-none" />
                  </motion.div>

                  {/* Labels (closer to cards) */}
                  <motion.div
                    style={{ opacity: labelOpacity }}
                    className={cn(
                      "absolute w-[180px] md:w-[220px] pointer-events-none flex flex-col justify-center",
                      index % 2 === 0 
                        ? "-right-[160px] md:-right-[260px] items-start text-left" 
                        : "-left-[160px] md:-left-[260px] items-end text-right"
                    )}
                  >
                    <h3 className="text-sm md:text-xl font-bold text-white mb-0.5">{layer.title}</h3>
                    <p className="text-[10px] md:text-sm text-neutral-400 leading-tight">{layer.description}</p>
                    
                    <div className={cn(
                      "absolute top-1/2 -translate-y-1/2 h-[1px] w-8 md:w-16",
                      index % 2 === 0 
                        ? "-left-10 md:-left-20 bg-gradient-to-r from-white/40 to-transparent" 
                        : "-right-10 md:-right-20 bg-gradient-to-l from-white/40 to-transparent"
                    )} />
                    
                    <div className={cn(
                      "absolute top-1/2 -translate-y-1/2 w-1 md:w-1.5 h-1 md:h-1.5 rounded-full bg-white shadow-[0_0_8px_white]",
                      index % 2 === 0 ? "-left-10 md:-left-20" : "-right-10 md:-right-20"
                    )} />
                  </motion.div>

                </motion.div>
              );
            })}
          </motion.div>
        </div>
        
        <div className="flex-shrink-0 pb-6 text-center">
          <p className="text-neutral-600 text-xs tracking-widest uppercase">Shared Packages</p>
        </div>

      </motion.div>
    </section>
  );
};
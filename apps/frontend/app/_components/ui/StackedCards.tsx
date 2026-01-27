"use client"

import { useRef, useMemo } from "react"
import { motion, useScroll, useTransform, MotionValue } from "framer-motion"
import { useLanguage } from "@/contexts/LanguageContext"
import { cn } from "@/lib/utils"
import { getAssetUrl } from "@/lib/r2"

export interface CardData {
  id: number
  title: string
  description: string
  color: string
  link: string
  image?: string // Restored for sites that block iframes
}

interface StackedCardsProps {
  items?: CardData[]
}

const Card = ({
  i,
  title,
  description,
  color,
  link,
  image,
  progress,
  range,
  targetScale,
}: {
  i: number
  title: string
  description: string
  color: string
  link: string
  image?: string
  progress: MotionValue<number>
  range: [number, number]
  targetScale: number
}) => {
  const container = useRef(null)
  const { scrollYProgress } = useScroll({
    target: container,
    offset: ["start end", "start start"],
  })

  const imageScale = useTransform(scrollYProgress, [0, 1], [2, 1])
  
  // Scale down as the NEXT card comes up
  const scale = useTransform(progress, range, [1, targetScale])

  return (
    <div ref={container} className="h-screen flex items-center justify-center sticky top-0 font-sans">
      <motion.div
        style={{
          scale,
          backgroundColor: color, // Dynamic background color
          top: `calc(-5% + ${i * 25}px)`, 
        }}
        className="flex flex-col relative -top-[25%] h-[500px] w-full max-w-[1000px] rounded-3xl p-8 md:p-12 origin-top border border-white/5 shadow-2xl overflow-hidden group"
      >
        {/* Apple-style Gradient Glow */}
        <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />

        <div className="flex flex-col md:flex-row h-full gap-8 md:gap-12 relative z-10">
            <div className="w-full md:w-[40%] flex flex-col justify-center">
                <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 tracking-tight leading-tight">
                    {title}
                </h2>
                <p className="text-lg text-neutral-400 font-medium leading-relaxed">
                    {description}
                </p>
                <div className="mt-auto pt-8 border-t border-white/10">
                    <a 
                      href={link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm font-semibold tracking-widest uppercase text-white/50 hover:text-white transition-colors duration-300"
                    >
                      <span className="w-2 h-2 rounded-full bg-white/80" />
                      Visit Project
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-up-right"><path d="M7 7h10v10"/><path d="M7 17 17 7"/></svg>
                   </a>
                </div>
            </div>

            <div className="w-full md:w-[60%] h-full rounded-2xl bg-black/40 overflow-hidden relative border border-white/5 shadow-inner group-hover:shadow-2xl transition-all duration-500">
                <motion.div
                    className="w-full h-full relative overflow-hidden"
                    style={{ scale: imageScale }}
                >
                    {/* Abstract Visual Pattern Overlay (optional, reduced opacity) */}
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent opacity-30 z-10 pointer-events-none" />
                    
                    {/* Project Content: Use Image if provided (fallback), otherwise Iframe */}
                    {image ? (
                       <img 
                        src={image} 
                        alt={title} 
                        className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                      />
                    ) : (
                      <iframe 
                        src={link} 
                        title={title}
                        className="w-full h-full border-0 bg-white/5"
                        loading="lazy"
                        style={{ pointerEvents: 'none' }} // Prevent interaction to allow scrolling
                      />
                    )}
                </motion.div>
            </div>
        </div>
      </motion.div>
    </div>
  )
}

export const StackedCards = () => {
  const container = useRef(null)
  const { t } = useLanguage()
  
  const { scrollYProgress } = useScroll({
    target: container,
    offset: ["start start", "end end"],
  })

  // Dynamic Content with Translations
  const items: CardData[] = useMemo(() => [
      {
        id: 1,
        title: "PowerFeud",
        description: "High-performance gaming server infrastructure enabling real-time multiplayer battles with zero latency.",
        color: "#171717", // Neutral 900
        link: "https://powerfeud-server.vercel.app/",
        // No image -> Iframe
      },
       {
        id: 2,
        title: "OnShapers",
        description: "A cutting-edge corporate platform leveraging AI to deliver scalable tech solutions for modern enterprises.",
        color: "#111111", // Very Dark Grey
        link: "https://onshapers.com/",
        image: getAssetUrl("onShapers_page.jpg") // Fallback because onshapers blocks iframes (X-Frame-Options)
      },
      {
        id: 3,
        title: "Adminia",
        description: "The ultimate SaaS command center for visualized analytics, user management, and revenue tracking.",
        color: "#1c1c1c", // Slightly lighter
        link: "https://adminia.online/",
        // No image -> Iframe
      },
  ], [t])
  
  return (
    <div ref={container} className="relative mt-32 py-24 bg-black">
        <div className="max-w-7xl mx-auto px-6 mb-24 text-center md:text-left">
             <h2 className="text-5xl md:text-6xl font-bold text-white mb-6 tracking-tight">
                 {t("stacked.title")}
             </h2>
             <p className="text-xl md:text-2xl text-neutral-400 max-w-2xl leading-relaxed">
                 {t("stacked.subtitle")}
             </p>
        </div>

        {items.map((item, i) => {
             const targetScale = 1 - ( (items.length - i) * 0.05)
             return (
                <Card
                    key={item.id}
                    i={i}
                    {...item}
                    progress={scrollYProgress}
                    range={[i * 0.25, 1]}
                    targetScale={targetScale}
                 />
             )
        })}
    </div>
  )
}

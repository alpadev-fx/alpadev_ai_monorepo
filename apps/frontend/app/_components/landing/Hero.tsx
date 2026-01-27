"use client"

import { useEffect, useRef, useState, useLayoutEffect } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { useLanguage } from "@/contexts/LanguageContext"
import { Particles } from "@/registry/magicui/particles"
import { useTheme } from "next-themes"
import { WarpBackground } from "@/app/_components/ui/WarpBackground"
import { TextHoverEffect } from "@/app/_components/ui/text-hover-effect"

const useContactModal = () => ({ openContactModal: () => console.log("Open Contact Modal") });

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger)
}

export default function Hero() {
  const { openContactModal } = useContactModal()
  const { t } = useLanguage()
  const { resolvedTheme } = useTheme()
  const [color, setColor] = useState("#ffffff")

  useEffect(() => {
    setColor(resolvedTheme === "dark" ? "#ffffff" : "#000000") 
  }, [resolvedTheme])

  const containerRef = useRef<HTMLDivElement>(null)
  const warpRef = useRef<HTMLDivElement>(null)
  const textRefs = useRef<(HTMLDivElement | null)[]>([])
  
  const heroContentRef = useRef<HTMLDivElement>(null)
  const badgeRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const paragraphRef = useRef<HTMLDivElement>(null)
  const buttonsRef = useRef<HTMLDivElement>(null)

  const texts = [
    { 
      text: "AI Architect", 
      id: "gradient-blue",
      colors: ["#3b82f6", "#06b6d4", "#22d3ee", "#60a5fa", "#93c5fd"], 
      fireValid: "from-blue-500 via-indigo-600",
      fireTrail: "from-cyan-400 via-blue-500",
      fireTip: "from-white via-cyan-200"
    },
    { 
      text: "Cloud Native", 
      id: "gradient-purple",
      colors: ["#a855f7", "#d946ef", "#ec4899", "#8b5cf6", "#c084fc"], 
      fireValid: "from-purple-600 via-fuchsia-600",
      fireTrail: "from-fuchsia-400 via-purple-500",
      fireTip: "from-white via-fuchsia-200"
    },
    { 
      text: "Global Engineer", 
      id: "gradient-orange",
      colors: ["#f97316", "#ef4444", "#eab308", "#f59e0b", "#fbbf24"], 
      fireValid: "from-orange-600 via-red-600",
      fireTrail: "from-amber-400 via-orange-500",
      fireTip: "from-white via-amber-200"
    }
  ]

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      if (!containerRef.current || !heroContentRef.current) return;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "+=700%", 
          scrub: 0.5,     
          pin: true,
        },
      });

      // --- INITIAL SETUP ---
      gsap.set(heroContentRef.current, { opacity: 0, scale: 0.8, pointerEvents: "none", display: "none" });
      const targets = [badgeRef.current, titleRef.current, paragraphRef.current, buttonsRef.current].filter(Boolean);
      if (targets.length > 0) gsap.set(targets, { opacity: 1, y: 0 });
      
      textRefs.current.forEach((el, index) => {
          if (el) {
              const startX = index === 0 ? 0 : (index % 2 !== 0 ? "100vw" : "-100vw");
              gsap.set(el, { opacity: 0, x: startX, scale: 1, pointerEvents: "none" }); 
          }
      });

      // 1. Warp In
      if (warpRef.current) {
         tl.fromTo(warpRef.current, { opacity: 0 }, { opacity: 1, duration: 0.5 }, 0);
      }

      // 3. Text Cycle
      let startTime = 0.8;
      let lastTextExitTime = 0;

      textRefs.current.forEach((el, index) => {
          if (!el) return;
          const fire = el.querySelectorAll(".fire-trail-container"); 
          const isLaunchRight = index % 2 === 0;
          const launchDest = isLaunchRight ? "150vw" : "-150vw";
          const rotateDest = isLaunchRight ? 5 : -5;
          const traverseDest = isLaunchRight ? "100%" : "-100%";

          if (index === 0) tl.to(el, { opacity: 1, scale: 1, duration: 0.5 }, startTime);
          else tl.to(el, { x: 0, opacity: 1, duration: 1.0 }, startTime);
          
          const launchTime = startTime + 1.2;
          if (fire.length > 0) tl.to(fire, { opacity: 1, scaleX: 1, duration: 0.2 }, launchTime);
          
          tl.to(el, { x: launchDest, rotate: rotateDest, scale: 0.8, duration: 1.2, ease: "power3.in" }, launchTime + 0.1);
          if (fire.length > 0) {
              tl.to(fire, { x: traverseDest, duration: 1.0, ease: "power1.inOut" }, launchTime + 0.1);
              tl.to(fire, { scaleX: 3, duration: 1 }, "<");
          }
          
          // Calculate when this text finishes its exit
          lastTextExitTime = launchTime + 0.1 + 1.2; // Launch start + duration
          
          startTime += 1.4; 
      });

      // --- CRITICAL TIMING FIX ---
      // The Nebula Start Time is strictly after the last text ("Freelancer") exits.
      // We use 'lastTextExitTime' calculated above.
      const nebulaStart = lastTextExitTime - 0.5; // Slight overlap for smooth transition

      // 4. Warp Fade Out
      if (warpRef.current) {
          tl.to(warpRef.current, { opacity: 0, duration: 0.8 }, nebulaStart);
      }

    }, containerRef);

    return () => ctx.revert();
  }, []); 

  return (
    <div ref={containerRef} className="h-screen w-full bg-black overflow-hidden relative isolate flex items-center justify-center font-sans">
      
      {/* Background Particles (Subtle) */}
      <Particles className="absolute inset-0 z-0 h-full w-full opacity-40 blur-[1px]" quantity={600} ease={100} color={color} refresh />
      
      <div ref={warpRef} className="absolute inset-0 z-10 opacity-0 pointer-events-none mix-blend-screen">
            <WarpBackground className="w-full h-full" />
      </div>

      <style jsx global>{`
        /* Cinematic styles */
      `}</style>
      
      {texts.map((item, i) => {
         const isLaunchRight = i % 2 === 0;
         return (
         <div key={item.text} ref={(el) => { textRefs.current[i] = el }} className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none opacity-0">
            <div className="relative w-full max-w-5xl h-[200px] flex items-center justify-center">
                 <div className="w-full h-full">
                     <TextHoverEffect text={item.text} id={item.id} colors={item.colors} />
                 </div>
                 <div className={`absolute top-1/2 -translate-y-1/2 z-0 flex items-center opacity-0 fire-trail-container mix-blend-screen pointer-events-none transition-all ${isLaunchRight ? "right-full translate-x-4 justify-end origin-right" : "left-full -translate-x-4 justify-start origin-left rotate-180" }`}>
                    <div className={`w-[400px] h-24 bg-gradient-to-l ${item.fireValid} to-transparent rounded-l-[100%] blur-3xl opacity-60`} />
                    <div className={`absolute right-0 w-[250px] h-12 bg-gradient-to-l ${item.fireTrail} to-transparent rounded-l-full blur-xl opacity-90`} />
                 </div>
            </div>
         </div>
         )
      })}



      <div ref={heroContentRef} className="absolute inset-0 z-40 flex items-center justify-center px-6 lg:px-8 w-full opacity-0 scale-90">
        <div className="mx-auto max-w-4xl text-center">
           <div ref={badgeRef} className="hidden sm:mb-8 sm:flex sm:justify-center">
             <div className="relative rounded-full px-3 py-1 text-sm leading-6 text-gray-400 ring-1 ring-white/10 hover:ring-white/20">
               {t("hero.badge")}
             </div>
           </div>
           
           <h1 ref={titleRef} className="text-5xl md:text-7xl font-bold tracking-tighter leading-[1.1] text-white mb-8">
              <span className="bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-neutral-400">
                {t("section.title")}
              </span>
           </h1>

           <p ref={paragraphRef} className="mt-4 text-lg leading-8 text-gray-400 md:text-xl max-w-2xl mx-auto mb-8">
             {t("hero.description")}
           </p>

           <div ref={buttonsRef} className="mt-8 flex items-center justify-center gap-x-6">
             <button onClick={openContactModal} className="bg-white text-white px-8 py-3 rounded-full font-medium hover:bg-neutral-200 transition-colors">
               {t("hero.cta.primary")}
             </button>
             <button className="text-sm font-semibold leading-6 text-white hover:text-gray-300 transition-colors">
               {t("hero.cta.secondary")} <span aria-hidden="true">→</span>
             </button>
           </div>
        </div>
      </div>
    </div>
  )
}
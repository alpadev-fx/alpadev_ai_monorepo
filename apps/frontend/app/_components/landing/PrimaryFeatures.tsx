"use client"

import React, { useEffect, useRef } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

import { useLanguage } from "@/contexts/LanguageContext"

export default function PrimaryFeatures() {
  const containerRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const { t, language } = useLanguage()

  const features = React.useMemo(
    () => [
      {
        title: t("features.software.title"),
        description: t("features.software.description"),
        gradient: "from-[alpadev-dark-blue]/40 via-indigo-950/30 to-black",
        id: "01",
      },
      {
        title: t("features.ai.title"),
        description: t("features.ai.description"),
        gradient: "from-[alpadev-light-blue]/40 via-sky-950/30 to-black",
        id: "02",
      },
      {
        title: t("features.cloud.title"),
        description: t("features.cloud.description"),
        gradient: "from-[alpadev-lime]/20 via-yellow-950/20 to-black",
        id: "03",
      },
      {
        title: t("features.blockchain.title"),
        description: t("features.blockchain.description"),
        gradient: "from-[alpadev-orange]/40 via-orange-950/30 to-black",
        id: "04",
      }
    ],
    [t]
  ) 

  const cardsRef = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)
    
    const ctx = gsap.context(() => {
      const container = containerRef.current
      const track = trackRef.current

      if (!container || !track) return

      const getScrollDistance = () => {
        const w = track.scrollWidth
        const v = window.innerWidth
        return -(w - v)
      }

      const scrollTween = gsap.to(track, {
        x: getScrollDistance,
        ease: "none",
        scrollTrigger: {
          trigger: container,
          start: "top top",
          end: "bottom bottom",
          scrub: 1,
          invalidateOnRefresh: true,
        },
      })

      // Title Animation
      gsap.fromTo(".powering-title",
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: ".powering-title",
            start: "top 80%",
            toggleActions: "play none none reverse"
          }
        }
      )

      // Illumination/Focus Effect for each card
      cardsRef.current.forEach((card, i) => {
        if (!card) return

        gsap.fromTo(
          card, 
          { 
             scale: 0.9, 
             opacity: 0.4, 
             filter: "grayscale(100%)" 
          },
          {
            scale: 1,
            opacity: 1,
            filter: "grayscale(0%)",
            duration: 0.5,
            ease: "power2.out",
            scrollTrigger: {
              trigger: card,
              containerAnimation: scrollTween,
              start: "center 85%", // Focus starts as it enters right side
              end: "center 15%",   // Focus ends as it leaves left side
              toggleActions: "play reverse play reverse",
              // scrub: false, // DEFAULT is false, needed for toggleActions to work as 'play/reverse'
            }
          }
        )
      })

    })

    return () => ctx.revert()
  }, [features])

  return (
    <div ref={containerRef} className="relative h-[300vh] bg-black" id="features">
      {/* Sticky Container - Flex Column for Vertical Stacking */}
      <div className="sticky top-0 h-screen overflow-hidden flex flex-col">
        
        {/* Ambient Background */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
            <div className="absolute top-[20%] left-[10%] w-[500px] h-[500px] bg-[alpadev-dark-blue]/20 rounded-full blur-[120px] mix-blend-screen" />
            <div className="absolute bottom-[20%] right-[10%] w-[600px] h-[600px] bg-[alpadev-light-blue]/20 rounded-full blur-[120px] mix-blend-screen" />
        </div>

        {/* Header Content - Relative (Part of flow) */}
        <div className="relative z-10 w-full pt-20 pl-6 md:pl-24 pr-6 flex-none">
            <h2 className="text-xs font-semibold text-[alpadev-light-blue] tracking-widest uppercase mb-2">
              {t("bento.title")}
            </h2>
            <h3 className="text-[40px] text-justify md:text-5xl font-bold text-white tracking-tight drop-shadow-xl powering-title opacity-0 leading-tight">
              {t("features.title")}
            </h3>
        </div>

        {/* Scroll Track - Flexible Height to Fill Remaining Space */}
        <div 
            ref={trackRef} 
            className="flex-1 w-max flex items-center gap-6 md:gap-10 pl-6 sm:pl-[50vw] pr-[50vw]" 
        >
          {features.map((feature, index) => (
            <div
              key={feature.id}
              ref={(el) => { cardsRef.current[index] = el }}
              // Initial state handled by GSAP, removed specific hover effects that might conflict
              className="relative w-[85vw] sm:w-[380px] h-[420px] md:h-[580px] flex-shrink-0 group rounded-[2rem] md:rounded-[2.5rem] overflow-hidden border border-white/10 bg-white/5 backdrop-blur-2xl shadow-[0_8px_32px_0_rgba(0,0,0,0.36)] transform-gpu will-change-transform"
            >
              {/* Card Background */}
              <div className="absolute inset-0 z-0 h-full w-full">
                 <div className={`absolute inset-0 h-full w-full bg-gradient-to-br ${feature.gradient} opacity-80`} />
                 <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              </div>

              {/* Glass Reflection Shine */}
              <div className="absolute inset-0 z-[1] bg-gradient-to-tr from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

              {/* Content */}
              <div className="absolute inset-0 z-10 flex flex-col justify-between p-6 md:p-8">
                 <div className="flex justify-between items-start">
                     <span className="text-lg md:text-xl font-medium text-white/40 group-hover:text-white transition-colors">
                         {feature.id}
                     </span>
                     <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-500">
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M1 13L13 1M13 1V13M13 1H1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                     </div>
                 </div>

                 <div className="transform transition-transform duration-500 group-hover:-translate-y-2">
                     <h4 className={`text-[40px] md:text-3xl font-bold text-white mb-2 md:mb-3 tracking-tight ${feature.id === "03" && language === "es" ? "break-words hyphens-auto" : ""}`}>
                         {feature.title}
                     </h4>
                     <p className="text-sm md:text-base text-gray-300 leading-relaxed font-light opacity-80 group-hover:opacity-100">
                         {feature.description}
                     </p>
                 </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

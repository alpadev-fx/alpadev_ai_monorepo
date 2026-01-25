"use client"

import React, { useRef, useEffect } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { useLanguage } from "@/contexts/LanguageContext"

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger)
}

export default function VisionRestructuring() {
  const { t } = useLanguage()
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
        
        // Parallax for Background
        gsap.to(".parallax-bg-vision", {
            yPercent: 20,
            ease: "none",
            scrollTrigger: {
                trigger: containerRef.current,
                start: "top bottom",
                end: "bottom top",
                scrub: true
            }
        })

        // Reveal Animation
        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: ".vision-grid",
                start: "top 80%",
                toggleActions: "play none none reverse"
            }
        })

        tl.fromTo(".vision-item",
            { y: 100, opacity: 0 },
            { y: 0, opacity: 1, duration: 1, stagger: 0.2, ease: "power3.out" }
        )

    }, containerRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={containerRef} className="relative py-32 bg-black text-white overflow-hidden">
        
        {/* Background Elements */}
        <div className="absolute top-0 left-0 w-full h-[500px] bg-black pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[800px] h-[800px] bg-blue-900/10 rounded-full blur-[120px] pointer-events-none parallax-bg-vision" />

        <div className="relative z-10 max-w-7xl mx-auto px-6">
            


            {/* Massive Grid */}
            <div className="vision-grid grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 h-auto md:h-[800px]">
                
                {/* Item 1: Technology (Large Vertical) */}
                <div className="vision-item md:col-span-5 relative group overflow-hidden rounded-[40px] bg-[#161617] h-[500px] md:h-full">
                     <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 to-black z-0" />
                     {/* Image Placeholder */}
                     <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-40 group-hover:scale-105 transition-transform duration-1000" />
                     
                     <div className="absolute bottom-0 left-0 p-8 md:p-10 z-10">
                         <span className="block text-blue-400 font-semibold tracking-wider uppercase mb-2 text-xs md:text-sm">Pillar 01</span>
                         <h3 className="text-3xl md:text-4xl font-bold tracking-tight leading-none text-white">{t("vision.restructure.tech")}</h3>
                     </div>
                </div>

                <div className="md:col-span-7 flex flex-col gap-6 md:gap-8 h-full">
                    
                    {/* Item 2: Creative Strategy (Horizontal) */}
                    <div className="vision-item relative group overflow-hidden rounded-[40px] bg-[#161617] flex-1 min-h-[350px]">
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 to-black z-0" />
                        {/* Image Placeholder */}
                        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-40 group-hover:scale-105 transition-transform duration-1000" />

                         <div className="absolute bottom-0 left-0 p-8 md:p-10 z-10">
                            <span className="block text-purple-400 font-semibold tracking-wider uppercase mb-2 text-xs md:text-sm">Pillar 02</span>
                            <h3 className="text-3xl md:text-4xl font-bold tracking-tight leading-none text-white">{t("vision.restructure.creative")}</h3>
                         </div>
                    </div>

                    {/* Item 3: Sales Operations (Horizontal) */}
                    <div className="vision-item relative group overflow-hidden rounded-[40px] bg-[#161617] flex-1 min-h-[300px]">
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/20 to-black z-0" />
                        {/* Image Placeholder */}
                        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2015&auto=format&fit=crop')] bg-cover bg-center opacity-40 group-hover:scale-105 transition-transform duration-1000" />

                         <div className="absolute bottom-0 left-0 p-8 md:p-10 z-10">
                             <span className="block text-emerald-400 font-semibold tracking-wider uppercase mb-2 text-xs md:text-sm">Pillar 03</span>
                            <h3 className="text-3xl md:text-4xl font-bold tracking-tight leading-none text-white">{t("vision.restructure.sales")}</h3>
                         </div>
                    </div>

                </div>

            </div>
        </div>
    </section>
  )
}

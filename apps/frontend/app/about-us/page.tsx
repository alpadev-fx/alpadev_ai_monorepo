"use client"

import React, { useRef, useEffect } from "react"
import { useLanguage } from "@/contexts/LanguageContext"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { VisionRestructuring } from "../_components/landing"
import { getAssetUrl } from "@/lib/r2"

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger)
}

export default function AboutUsPage() {
  const { t } = useLanguage()
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
        // 1. Hero Text Reveal
        const heroTimeline = gsap.timeline()
        heroTimeline.fromTo(".hero-element", 
            { y: 30, opacity: 0, filter: "blur(10px)" },
            { y: 0, opacity: 1, filter: "blur(0px)", duration: 1.0, ease: "power3.out", stagger: 0.1 }
        )

        // 2. Standard Reveal for Sections
        const sections = gsap.utils.toArray<HTMLElement>(".reveal-section");
        sections.forEach((section) => {
             gsap.fromTo(section.querySelectorAll(".reveal-child"),
                { y: 30, opacity: 0 },
                {
                    y: 0,
                    opacity: 1,
                    duration: 0.8,
                    stagger: 0.1,
                    ease: "power2.out",
                    scrollTrigger: {
                        trigger: section,
                        start: "top 85%",
                        toggleActions: "play none none reverse"
                    }
                }
             )
        });

    }, containerRef)

    return () => ctx.revert()
  }, [])

  return (
    <main ref={containerRef} className="min-h-screen bg-[#000000] text-gray-100 font-sans selection:bg-blue-500/30 overflow-hidden">
      
      {/* --- HERO SECTION --- */}
      <section className="relative min-h-[50vh] pt-32 pb-24 flex flex-col justify-center items-center text-center px-6 border-b border-white/5">
        {/* Ambient Moving Orbs */}
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] -z-10 animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] -z-10 animate-pulse delay-1000" />
        
        {/* Badge */}
        <div className="hero-element mb-8">
            <span className="px-4 py-1.5 rounded-full border border-white/10 bg-white/5 text-xs font-medium tracking-wide uppercase backdrop-blur-md text-gray-300">
                About On Shapers
            </span>
        </div>

        <h1 className="hero-element text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white mb-6">
            {t("vision.story.title")}
        </h1>
        
        <p className="hero-element text-lg md:text-xl text-gray-400 font-light max-w-3xl mx-auto leading-relaxed">
            {t("vision.story.description")}
        </p>
      </section>


      {/* --- VISION & RESTRUCTURING (Scroll Reveal) --- */}
      <VisionRestructuring />


      {/* --- MISSION (Standard Layout with Bento Grid) --- */}
      <section className="reveal-section py-24 px-6 max-w-7xl mx-auto">
          <div className="text-center mb-16 reveal-child">
               <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white mb-4">Our North Star</h2>
               <p className="text-lg text-gray-400">Guiding principles that drive our innovation.</p>
          </div>

         <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             
             {/* Mission Card (Bento) */}
             <div className="reveal-child p-10 md:p-12 rounded-[2.5rem] bg-[#161617] border border-white/5 relative overflow-hidden group hover:border-white/10 transition-colors">
                 <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-blue-500/10 rounded-full blur-[80px] -z-10 translate-x-1/2 -translate-y-1/2" />
                 <h3 className="text-2xl md:text-3xl font-bold text-white mb-6 tracking-tight">{t("about.mission.title")}</h3>
                 <p className="text-lg text-gray-300 leading-relaxed font-light">{t("about.mission.desc")}</p>
             </div>

             {/* Vision Card (Bento) */}
             <div className="reveal-child p-10 md:p-12 rounded-[2.5rem] bg-[#161617] border border-white/5 relative overflow-hidden group hover:border-white/10 transition-colors">
                 <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-purple-500/10 rounded-full blur-[80px] -z-10 -translate-x-1/2 translate-y-1/2" />
                 <h3 className="text-2xl md:text-3xl font-bold text-white mb-6 tracking-tight">{t("about.vision.title")}</h3>
                 <p className="text-lg text-gray-300 leading-relaxed font-light">{t("about.vision.desc")}</p>
             </div>

         </div>
      </section>


      {/* --- TEAM SECTION (Apple Grid) --- */}
      <section className="reveal-section py-24 bg-black border-t border-white/5">
          <div className="max-w-7xl mx-auto px-6">
              <div className="mb-16 reveal-child">
                   <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white mb-4">
                      {t("about.team.title")}
                  </h2>
                  <p className="text-lg text-gray-400 max-w-2xl">{t("about.team.subtitle")}</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                  {[
                      { 
                         name: "Rafael González", 
                         role: t("about.team.rafael.role"),
                         image: getAssetUrl("founder.jpg")
                      },
                      { 
                         name: "Juan Betancur", 
                         role: t("about.team.juan.role"),
                         image: getAssetUrl("Founder2.jpg")
                      }
                  ].map((member, idx) => (
                      <div key={idx} className="reveal-child group relative overflow-hidden rounded-[2.5rem] bg-[#161617] aspect-[3/4] md:aspect-[4/5] border border-white/5">
                          {/* Image Placeholder */}
                          <div className="absolute inset-0 bg-cover bg-center opacity-60 group-hover:opacity-80 group-hover:scale-105 transition-all duration-700" 
                               style={{ backgroundImage: `url(${member.image})` }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-90" />
                          
                          <div className="absolute bottom-0 left-0 p-8 md:p-12 w-full">
                               <div className="inline-block px-3 py-1 mb-4 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-xs font-semibold uppercase tracking-wider text-white">
                                   Management
                               </div>
                               <h3 className="text-2xl md:text-4xl font-bold text-white mb-2 tracking-tight">{member.name}</h3>
                               <p className="text-base md:text-lg text-gray-300 font-medium">{member.role}</p>
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      </section>

      {/* --- NICHES --- */}
      <section className="reveal-section py-24 bg-black border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-16 tracking-tight text-center reveal-child">
                {t("vision.niches.title")}
            </h2>
             <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                {[
                    { key: "tech", label: t("vision.niche.tech"), image: getAssetUrl("software.jpg") },
                    { key: "realestate", label: t("vision.niche.realestate"), image: getAssetUrl("realstate.jpg") },
                    { key: "consulting", label: t("vision.niche.consulting"), image: getAssetUrl("briefacse.jpg") },
                    { key: "healthcare", label: t("vision.niche.healthcare"), image: getAssetUrl("wellness.jpg") }
                ].map((item, idx) => (
                    <div key={idx} className="reveal-child group relative p-8 rounded-[2rem] bg-[#161617] hover:bg-[#1c1c1e] border border-white/5 transition-colors flex flex-col justify-between min-h-[180px] md:min-h-[240px] items-center text-center">
                        <div className="w-20 h-20 md:w-24 md:h-24 relative mb-4">
                            <img 
                                src={item.image} 
                                alt={item.label}
                                className="w-full h-full object-contain filter grayscale group-hover:grayscale-0 transition-all duration-300"
                            />
                        </div>
                        <h3 className="text-base md:text-xl font-medium text-gray-300 group-hover:text-white transition-colors">{item.label}</h3>
                    </div>
                ))}
            </div>
        </div>
      </section>

    </main>
  )
}

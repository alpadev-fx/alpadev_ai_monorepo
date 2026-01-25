"use client"

import React, { useEffect, useRef } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { useLanguage } from "@/contexts/LanguageContext"

export default function Stats() {
  const { t, language } = useLanguage()
  const containerRef = useRef<HTMLDivElement>(null)
  const statsRef = useRef<HTMLDivElement>(null)

  const stats = React.useMemo(
    () => [
      { id: 1, name: t("stats.years"), value: "+5" },
      { id: 2, name: t("stats.countries"), value: "5" },
      { id: 3, name: t("stats.projects"), value: "+10" },
      { id: 4, name: t("stats.satisfaction"), value: "98%" },
    ],
    [language, t]
  )

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)
    const ctx = gsap.context(() => {
        // Timeline for Title
        const titleTl = gsap.timeline({
            scrollTrigger: {
                trigger: containerRef.current,
                start: "top bottom", // Starts when top of container hits bottom of viewport
                end: "bottom top",   // Ends when bottom of container hits top of viewport
                scrub: 1
            }
        })

        titleTl
            .fromTo(".stats-title", 
                { y: 50, opacity: 0, filter: "blur(10px)" },
                { y: 0, opacity: 1, filter: "blur(0px)", duration: 0.2, ease: "power2.out" }
            )
            .to(".stats-title", 
                { y: -50, opacity: 0, filter: "blur(10px)", duration: 0.2, ease: "power2.in" }, 
                0.8 // Start fading out at 80% of the scroll distance
            )

        // Timeline for Cards
        const cardsTl = gsap.timeline({
            scrollTrigger: {
                trigger: statsRef.current,
                start: "top bottom",
                end: "bottom top",
                scrub: 1
            }
        })

        cardsTl
            .fromTo(".stat-card",
                { y: 100, opacity: 0, filter: "blur(10px)", scale: 0.9 },
                { y: 0, opacity: 1, filter: "blur(0px)", scale: 1, duration: 0.25, stagger: 0.05, ease: "power2.out" }
            )
            .to(".stat-card",
                { y: -100, opacity: 0, filter: "blur(10px)", scale: 0.9, duration: 0.25, stagger: 0.05, ease: "power2.in" },
                0.75 // Start fading out earlier
            )
            
    }, containerRef)

    return () => ctx.revert()
  }, [])

  return (
    <div
      ref={containerRef}
      className="bg-black relative w-full h-[80vh] py-12 md:py-32 overflow-hidden justify-center items-center flex"
      id="servicios"
    >
        {/* Apple-style minimalist ambient background */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-500/10 via-purple-500/5 to-transparent blur-3xl -z-10 pointer-events-none" />

      <div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-10">
        <div className="mx-auto max-w-2xl lg:max-w-none">
          <div className="text-center stats-title mb-10 md:mb-16 px-4">
            <h2 className="text-3xl md:text-5xl font-bold text-white bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60 drop-shadow-sm mb-4 md:mb-6 !leading-none">
              {t("stats.title")}
            </h2>
            <p className="text-base md:text-lg text-gray-400 font-normal leading-relaxed max-w-2xl mx-auto">
              {t("stats.subtitle")}
            </p>
          </div>

          <div 
            ref={statsRef}
            className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
          >
            {stats.map((stat) => (
              <div
                key={stat.id}
                className="stat-card group relative overflow-hidden rounded-3xl bg-white/5 p-8 backdrop-blur-2xl border border-white/10 shadow-2xl transition-all duration-500 hover:bg-white/10 hover:border-white/20 hover:scale-[1.02] hover:shadow-indigo-500/20"
              >
                 {/* Specular shine effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                
                <dt className="text-sm font-medium text-white/60 group-hover:text-white/90 transition-colors uppercase tracking-wider">
                  {stat.name}
                </dt>
                <dd className="mt-4 text-4xl font-bold tracking-tight text-white group-hover:text-white transition-colors bg-clip-text text-transparent bg-gradient-to-r from-white to-white/80">
                  {stat.value}
                </dd>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

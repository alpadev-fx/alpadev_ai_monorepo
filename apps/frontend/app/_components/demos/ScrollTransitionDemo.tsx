"use client"

import React from "react"
import { ScrollTransition } from "@/app/_components/ui/ScrollTransition"
import { useLanguage } from "@/contexts/LanguageContext"

export const ScrollTransitionDemo = () => {
  const { t } = useLanguage()
  
  return (
    <ScrollTransition
      colorA="#0a0a0a" // Deep dark gray/black
      colorB="#ffffff" // Pure white
      colorExit="#000000" // Fade back to black for IntegrationSection
      scrollDistance="250vh" // Scroll distance control
      childrenA={
        <div className="text-center px-4">
          <h2 className="text-5xl md:text-8xl font-bold tracking-tighter text-white mb-6">
            {t("scroll.transition.titleA")}
          </h2>
          <p className="text-lg md:text-2xl text-white leading-none max-w-2xl mx-auto font-medium">
             {t("scroll.transition.descA")}
          </p>
        </div>
      }
      childrenB={
        <div className="text-center px-4">
          <h2 className="text-5xl md:text-8xl font-bold tracking-tighter text-black mb-6">
             {t("scroll.transition.titleB")}
          </h2>
          <p className="text-lg md:text-2xl text-neutral-600 leading-none max-w-2xl mx-auto font-medium">
             {t("scroll.transition.descB")}
          </p>
          <button className="mt-8 px-8 py-3 bg-black text-white rounded-full font-semibold hover:scale-105 transition-transform">
             {t("scroll.transition.cta")}
          </button>
        </div>
      }
    />
  )
}

"use client"
import React, { useRef, useEffect, useState } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import Modal from "../ui/Modal"
import SimpleForm from "../forms/SimpleForm"
import { useLanguage } from "@/contexts/LanguageContext"
import { getAssetUrl } from "@/lib/r2"
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger)
}
export default function Cta() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formType, setFormType] = useState<"contact" | "trial">("trial")
  const { t } = useLanguage()
  const containerRef = useRef<HTMLDivElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const ctx = gsap.context(() => {
        // Bi-directional Scrub Animation
        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: containerRef.current,
                start: "top bottom", 
                end: "bottom top", 
                scrub: 1
            }
        })
        // Card Entrance/Exit Scale & Fade
        tl.fromTo(cardRef.current,
            { scale: 0.95, opacity: 0.5, y: 50 },
            { scale: 1, opacity: 1, y: 0, duration: 0.3, ease: "power2.out" }
        )
        .to(cardRef.current,
            { scale: 0.95, opacity: 0.5, y: -50, duration: 0.3, ease: "power2.in" },
            0.7
        )
        // Parallax effect for image
        tl.fromTo(imageRef.current,
            { scale: 1.1 },
            { scale: 1, ease: "none" },
            0
        )
        // Animate Top Headline
        tl.fromTo(".cta-headline",
            { y: 50, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.3, ease: "power2.out" },
            0.2 // Start earlier since it's at the top
        )
            
    }, containerRef)
    return () => ctx.revert()
  }, [])
  return (
    <div ref={containerRef} className="relative w-full overflow-hidden">
      
      {/* Block 1: Headline */}
      <div className="w-full py-24 md:py-32 flex items-center justify-center px-4 md:px-8 opacity-0 cta-headline">
        <h2 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-7xl text-center md:text-left max-w-[90rem]">
            Why Alpadev AI is the best <br className="hidden lg:block" />
            place to build your future.
        </h2>
      </div>

      {/* Block 2: Full Viewport Card */}
      <div className="w-full h-[600px] lg:h-[700px] px-2 md:px-4 pb-4">
        <div 
            ref={cardRef}
            className="group relative overflow-hidden rounded-[40px] bg-zinc-900 border border-white/10 shadow-2xl w-full h-full flex items-center text-left"
        >
            {/* Background Image */}
            <div className="absolute inset-0">
                <div className="absolute inset-0 bg-black/20 z-10" /> 
                <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent z-10" />
                <img 
                    ref={imageRef}
                    src={getAssetUrl("07.jpg")} 
                    alt="CTA Visual" 
                    className="w-full h-full object-cover object-[center_25%] scale-105"
                />
            </div>

            {/* Content Overlay */}
            <div ref={contentRef} className="relative z-20 px-8 py-12 md:px-16 lg:px-24 w-full lg:w-1/2 flex flex-col items-start justify-center h-full">
                 <h2 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl mb-8 drop-shadow-lg">
                    {t("cta2.title")}
                </h2>
                <p className="text-xl text-gray-200 font-medium leading-relaxed mb-10 max-w-xl drop-shadow-md">
                    {t("cta2.subtitle")}
                </p>
                <div>
                    <button
                        className="rounded-full bg-white px-8 py-4 text-lg font-medium text-black transition-transform hover:scale-105 active:scale-95 shadow-xl"
                        onClick={() => {
                            setFormType("trial")
                            setIsModalOpen(true)
                        }}
                    >
                        {t("cta2.primary")}
                    </button>
                </div>
            </div>
        </div>
      </div>

      <Modal
        open={isModalOpen}
        size="xl"
        title={
          formType === "contact" ? t("nav.contact") : t("hero.cta.primary")
        }
        onClose={() => setIsModalOpen(false)}
      >
        <SimpleForm onSuccess={() => setIsModalOpen(false)} />
      </Modal>
    </div>
  )
}
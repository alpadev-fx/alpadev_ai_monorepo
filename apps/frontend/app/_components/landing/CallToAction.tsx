"use client"

import React, { useState, useEffect, useRef } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

import Modal from "../ui/Modal"
import SimpleForm from "../forms/SimpleForm"

import { useLanguage } from "@/contexts/LanguageContext"

export default function CallToAction() {
  const { t, language } = useLanguage()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger) 
    
    const ctx = gsap.context(() => {
        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: containerRef.current,
                start: "top 80%",
                toggleActions: "play none none reverse"
            }
        })

        tl.fromTo(".cta-content", 
            { y: 30, opacity: 0, filter: "blur(10px)" },
            { y: 0, opacity: 1, filter: "blur(0px)", duration: 0.8, ease: "power2.out", stagger: 0.2 }
        )

    }, containerRef)

    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={containerRef}
      className="relative w-full py-32 sm:py-40 overflow-hidden bg-black flex items-center justify-center"
      id="download-app"
    >
      {/* Apple-style Radial Gradient Blur */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-900/20 via-black to-black blur-[100px] -z-10 pointer-events-none" />

      <div className="relative z-10 mx-auto max-w-2xl px-6 text-center">
        <h2 className="cta-content text-5xl md:text-8xl font-bold tracking-tighter text-white mb-8 !leading-none">
           {t("cta.title")}
        </h2>
        <p className="cta-content text-lg text-gray-400 font-normal leading-relaxed mb-10 max-w-lg mx-auto">
           {t("cta.subtitle")}
        </p>
        
        <div className="cta-content">
            <button
              className="inline-flex items-center justify-center rounded-full bg-white px-8 py-4 text-base font-semibold text-black transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)]"
              onClick={() => setIsModalOpen(true)}
            >
              {t("cta.button")}
            </button>
        </div>
      </div>

      {/* Modal for Form */}
      <Modal
        open={isModalOpen}
        size="xl"
        title={t("cta.button")}
        onClose={() => setIsModalOpen(false)}
      >
        <SimpleForm onSuccess={() => setIsModalOpen(false)} />
      </Modal>
    </section>
  )
}

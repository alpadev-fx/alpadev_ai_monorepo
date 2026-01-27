"use client"

import React, { useEffect, useRef, useState } from "react"
import { Icon } from "@iconify/react/dist/iconify.js"
import dynamic from "next/dynamic"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { Modal, ModalContent, ModalHeader, ModalBody, useDisclosure } from "@heroui/react"

import { useLanguage } from "@/contexts/LanguageContext"

import CalendarBooking from "@/components/booking/calendar-booking"

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger)
}

type Plan = {
  cta: string
  description: string
  discount?: number
  features: string[]
  highlight?: boolean
  subtext: string
  title: string
}

export default function Pricing() {
  const [isYearly, setIsYearly] = useState(true)
  const containerRef = useRef<HTMLDivElement>(null)
  const cardsRef = useRef<HTMLDivElement>(null)
  const { t, language } = useLanguage()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [selectedPlan, setSelectedPlan] = useState<string>("")

  const plans: Plan[] = React.useMemo(
    () => [
      {
        cta: t("pricing.parttime.cta"),
        description: t("pricing.parttime.description"),
        discount: 0,
        features: [
          t("pricing.feature1.pt"),
          t("pricing.feature2.pt"),
          t("pricing.feature3.pt"),
          t("pricing.feature4.pt"),
          t("pricing.feature5.pt"),
          t("pricing.feature6.pt"),
          t("pricing.feature7.pt"),
        ],
        subtext: t("pricing.perMonth"),
        title: t("pricing.parttime.title"),
      },
      {
        cta: t("pricing.fulltime.cta"),
        description: t("pricing.fulltime.description"),
        discount: 0,
        features: [
          t("pricing.feature1.ft"),
          t("pricing.feature2.ft"),
          t("pricing.feature3.ft"),
          t("pricing.feature4.ft"),
          t("pricing.feature5.ft"),
          t("pricing.feature6.ft"),
          t("pricing.feature7.ft"),
        ],
        highlight: true,
        subtext: t("pricing.perMonth"),
        title: t("pricing.fulltime.title"),
      },
      {
        cta: t("pricing.consulting.cta"),
        description: t("pricing.consulting.description"),
        features: [
          t("pricing.feature1.cs"),
          t("pricing.feature2.cs"),
          t("pricing.feature3.cs"),
          t("pricing.feature4.cs"),
          t("pricing.feature5.cs"),
          t("pricing.feature6.cs"),
          t("pricing.feature7.cs"),
        ],
        subtext: t("pricing.perMonth"),
        title: t("pricing.consulting.title"),
      },
    ],
    [t]
  )

  useEffect(() => {
    const ctx = gsap.context(() => {
        // Title Animation
        const titleTl = gsap.timeline({
            scrollTrigger: {
                trigger: containerRef.current,
                start: "top bottom",
                end: "bottom top",
                scrub: 1
            }
        })

        titleTl.fromTo(".pricing-title",
            { y: 50, opacity: 0, filter: "blur(10px)" },
            { y: 0, opacity: 1, filter: "blur(0px)", duration: 0.2, ease: "power2.out" }
        )
        .to(".pricing-title",
            { y: -50, opacity: 0, filter: "blur(10px)", duration: 0.2, ease: "power2.in" },
            0.8
        )

        // Cards Animation
        const cardsTl = gsap.timeline({
            scrollTrigger: {
                trigger: cardsRef.current,
                start: "top bottom",
                end: "bottom top",
                scrub: 1
            }
        })

        cardsTl.fromTo(".pricing-card",
            { y: 100, opacity: 0, scale: 0.9, filter: "blur(10px)" },
            { y: 0, opacity: 1, scale: 1, filter: "blur(0px)", duration: 0.25, stagger: 0.1, ease: "power2.out" }
        )
        .to(".pricing-card",
            { y: -100, opacity: 0, scale: 0.9, filter: "blur(10px)", duration: 0.25, stagger: 0.1, ease: "power2.in" },
            0.7
        )

    }, containerRef)

    return () => ctx.revert()
  }, [])

  const toggleBilling = (yearly: boolean) => {
    setIsYearly(yearly)
  }

  const handlePlanClick = (planTitle: string) => {
    setSelectedPlan(planTitle)
    onOpen()
  }

  const avgDiscount = Math.round(
    plans.reduce((acc, plan) => acc + (plan.discount || 0), 0) /
      plans.filter((p) => p.discount).length
  )

  return (
    <section
      ref={containerRef}
      className="relative w-full py-12 md:py-32 overflow-hidden bg-black"
      id="pricing"
    >
      {/* Background Decor - Minimalist */}
       <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zinc-900/20 via-black to-black blur-3xl -z-10 pointer-events-none" />

      <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mb-10 md:mb-20 text-center pricing-title">
          <h1 className="text-5xl md:text-8xl font-bold tracking-tighter text-white mb-6 md:mb-8 leading-[1.1] md:leading-none text-balance">
            {t("pricing.program.title")}
          </h1>
          <p className="text-base md:text-lg text-gray-400 font-normal leading-relaxed max-w-2xl mx-auto">
             {t("pricing.program.subtitle")}
          </p>
        </div>

        {/* Cards Grid - Apple One Style */}
        <div ref={cardsRef} className="grid grid-cols-1 gap-6 md:gap-8 lg:grid-cols-3 items-start">
            
            {/* Plan 1: Start Scaling */}
            <div className="pricing-card group relative flex flex-col overflow-hidden rounded-[2rem] md:rounded-[2.5rem] bg-[#1c1c1e] p-6 md:p-10 transition-transform duration-500 hover:scale-[1.02] border border-white/5 hover:border-white/10">
                <h2 className="text-xl md:text-2xl font-semibold text-white mb-2 !leading-none">{plans[0].title}</h2>
                <div className="mb-4">
                    {/* Price removed */}
                </div>
                <p className="text-sm text-gray-400 mb-6 md:mb-8 leading-relaxed">
                   {plans[0].description}
                </p>
                
                <div className="w-full h-px bg-white/10 mb-6 md:mb-8" />
                
                <ul className="flex-1 space-y-4 mb-8 md:mb-10">
                    {plans[0].features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-3 text-sm font-medium text-gray-300">
                            <span className="mt-0.5 text-indigo-400 text-lg">•</span>
                            {feature}
                        </li>
                     ))}
                </ul>

                <button 
                    onClick={() => handlePlanClick(plans[0].title)}
                    className="w-full rounded-full border border-white/20 py-3 text-sm font-medium text-white transition-colors hover:bg-white hover:text-black hover:border-transparent"
                >
                    {plans[0].cta}
                </button>
            </div>

            {/* Plan 2: Medium Scaling (Highlighted) */}
            <div className="pricing-card group relative flex flex-col overflow-hidden rounded-[2rem] md:rounded-[2.5rem] bg-[#1c1c1e] p-6 md:p-10 transition-transform duration-500 hover:scale-[1.02] ring-1 ring-cyan-500/50 shadow-[0_0_50px_-12px_rgba(6,182,212,0.3)]">
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-cyan-500 to-blue-600 opacity-100" />
                
                <h2 className="text-xl md:text-2xl font-semibold text-white mb-2 !leading-none">{plans[1].title}</h2>
                <div className="mb-4">
                    {/* Price removed */}
                </div>
                 <p className="text-sm text-gray-400 mb-6 md:mb-8 leading-relaxed">
                   {plans[1].description}
                </p>

                <div className="w-full h-px bg-white/10 mb-6 md:mb-8" />

                <ul className="flex-1 space-y-4 mb-8 md:mb-10">
                    {plans[1].features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-3 text-sm font-medium text-gray-300">
                             <span className="mt-0.5 text-cyan-400 text-lg">•</span>
                            {feature}
                        </li>
                     ))}
                </ul>

                <button 
                    onClick={() => handlePlanClick(plans[1].title)}
                    className="w-full rounded-full bg-white py-3 text-sm font-medium text-black transition-transform hover:scale-105 active:scale-95"
                >
                    {plans[1].cta}
                </button>
            </div>

             {/* Plan 3: Advanced Scaling */}
             <div className="pricing-card group relative flex flex-col overflow-hidden rounded-[2rem] md:rounded-[2.5rem] bg-[#1c1c1e] p-6 md:p-10 transition-transform duration-500 hover:scale-[1.02] border border-white/5 hover:border-white/10">
                <h2 className="text-xl md:text-2xl font-semibold text-white mb-2 !leading-none">{plans[2].title}</h2>
                <div className="mb-4">
                     {/* Price removed */}
                </div>
                 <p className="text-sm text-gray-400 mb-6 md:mb-8 leading-relaxed">
                   {plans[2].description}
                </p>

                <div className="w-full h-px bg-white/10 mb-6 md:mb-8" />

                <ul className="flex-1 space-y-4 mb-8 md:mb-10">
                    {plans[2].features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-3 text-sm font-medium text-gray-300">
                             <span className="mt-0.5 text-purple-400 text-lg">•</span>
                            {feature}
                        </li>
                     ))}
                </ul>

                <button 
                    onClick={() => handlePlanClick(plans[2].title)}
                    className="w-full rounded-full border border-white/20 py-3 text-sm font-medium text-white transition-colors hover:bg-white hover:text-black hover:border-transparent"
                >
                    {plans[2].cta}
                </button>
            </div>

        </div>

        <div className="mt-20 text-center pricing-title">
          <p className="text-gray-500 text-sm font-medium">
            {t("pricing.custom")}{" "}
            <a
              className="text-white hover:underline transition-all"
              href="https://wa.link/n2uk0s"
              rel="noopener noreferrer"
              target="_blank"
            >
              {t("pricing.customLink")}
            </a>
          </p>
        </div>
      </div>

      <Modal
        isOpen={isOpen}
        onClose={onClose}
        size="5xl"
        backdrop="blur"
        isTransparent
        hideCloseButton
        classNames={{
            base: "bg-transparent shadow-none flex justify-center items-center", // Added center alignment
            header: "hidden",
            body: "p-0 flex justify-center items-center",
            backdrop: "bg-black/80 backdrop-blur-xl",
            closeButton: "hidden"
        }}
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1 text-xl font-semibold">
            {t("pricing.cta")} - {selectedPlan}
          </ModalHeader>
          <ModalBody className="p-0 flex justify-center items-center">
            <CalendarBooking onClose={onClose} />
          </ModalBody>
        </ModalContent>
      </Modal>
    </section>
  )
}

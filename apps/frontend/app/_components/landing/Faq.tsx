"use client"

import React, { useRef, useEffect } from "react"
import { Accordion, AccordionItem, Button } from "@heroui/react"
import { Icon } from "@iconify/react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

import { COMPONENT_CONFIGS, useGSAPAutoAnimate } from "@/hooks"
import { useLanguage } from "@/contexts/LanguageContext"

// Register ScrollTrigger plugin
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger)
}

export default function Faq() {
  const { t, language } = useLanguage()

  const faqs = React.useMemo(
    () => [
      {
        title: t("faq.q1.title"),
        content: t("faq.q1.content"),
      },
      {
        title: t("faq.q2.title"),
        content: t("faq.q2.content"),
      },
      {
        title: t("faq.q3.title"),
        content: t("faq.q3.content"),
      },
      {
        title: t("faq.q4.title"),
        content: t("faq.q4.content"),
      },
      {
        title: t("faq.q5.title"),
        content: t("faq.q5.content"),
      },
      {
        title: t("faq.q6.title"),
        content: t("faq.q6.content"),
      },
      {
        title: t("faq.q7.title"),
        content: t("faq.q7.content"),
      },
      {
        title: t("faq.q8.title"),
        content: t("faq.q8.content"),
      },
    ],
    [language, t]
  )

  const sectionContainerRef = useRef<HTMLDivElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  
  // Refined Animation: Smooth Fade Up for Header
  useEffect(() => {
    const ctx = gsap.context(() => {
        gsap.fromTo(headerRef.current, 
            { opacity: 0, y: 30 },
            {
                opacity: 1,
                y: 0,
                duration: 1.2,
                ease: "power2.out",
                scrollTrigger: {
                    trigger: headerRef.current,
                    start: "top 85%",
                    toggleActions: "play none none reverse"
                }
            }
        )
    }, sectionContainerRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionContainerRef} className="relative w-full py-24 sm:py-32 overflow-hidden bg-black" id="faq">
      
      {/* Apple-style Ambient Background */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[800px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/10 via-black to-black blur-3xl pointer-events-none -z-10" />

      <div className="mx-auto flex w-full max-w-4xl flex-col items-center gap-12 px-6 lg:px-8 relative z-10">
        
        {/* Header Section */}
        <div ref={headerRef} className="text-center max-w-3xl mx-auto">
            <h2 className="text-5xl md:text-8xl font-bold tracking-tighter text-white mb-8 !leading-none">
                {t("faq.title")}{" "}
                <span className="text-white opacity-50">
                    {t("faq.titleHighlight")}
                </span>
            </h2>
            <p className="text-lg text-gray-400 font-normal leading-relaxed mb-8 max-w-xl mx-auto">
                {t("faq.subtitle")}
            </p>
            
            <Button
                as="a"
                href="https://wa.link/n2uk0s"
                target="_blank"
                className="rounded-full bg-white/10 hover:bg-white/20 border border-white/10 text-white px-8 py-6 font-medium backdrop-blur-md transition-all duration-300 group"
                endContent={<Icon icon="lucide:arrow-right" className="group-hover:translate-x-1 transition-transform" width={20} />}
            >
                {t("faq.cta")}
            </Button>
        </div>

        {/* Accordion Section */}
        <div className="w-full mt-8">
            <Accordion
            fullWidth
            keepContentMounted
            itemClasses={{
                base: "group border-b border-white/5 py-4",
                title: "text-lg font-medium text-white/90 group-hover:text-white transition-colors duration-300",
                trigger: "py-4 data-[hover=true]:bg-transparent outline-none",
                content: "pb-6 text-base text-gray-400 leading-relaxed",
                indicator: "text-white/50 group-hover:text-white transition-colors rotate-90 data-[open=true]:-rotate-90",
            }}
            items={faqs}
            selectionMode="multiple"
            variant="light"
            >
            {faqs.map((item, i) => (
                <AccordionItem
                key={i}
                aria-label={item.title}
                title={item.title}
                >
                {item.content}
                </AccordionItem>
            ))}
            </Accordion>
        </div>

      </div>
    </section>
  )
}

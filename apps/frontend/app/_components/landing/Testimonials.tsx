"use client"

import React from "react"
import { useMediaQuery } from "usehooks-ts"
import { Icon } from "@iconify/react"
import Image from "next/image"

import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

import ScrollingBanner from "../shared/scrolling-banner"
import { useLanguage } from "@/contexts/LanguageContext"
import { getAssetUrl } from "@/lib/r2"

type Testimonial = {
  id: string
  author: string
  countryCode: string
  location: string
  photoSrc: string
  quote: string
}

// Data moved inside component for translation
const TestimonialCard = ({ testimonial }: { testimonial: Testimonial }) => {
  return (
    <div className="group relative overflow-hidden rounded-3xl bg-[#1c1c1e] p-8 transition-colors hover:bg-[#2c2c2e]">
      {/* Subtle Border */}
      <div className="absolute inset-0 rounded-3xl ring-1 ring-white/10 group-hover:ring-white/20 transition-all duration-500 pointer-events-none" />
      
      <div className="relative z-10 flex flex-col gap-6">
          <div className="flex items-center gap-4">
              <div className="relative h-12 w-12 overflow-hidden rounded-full ring-2 ring-white/10 shrink-0">
                  <Image src={testimonial.photoSrc} alt={testimonial.author} width={48} height={48} className="h-full w-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                  <h3 className="text-base font-semibold text-white tracking-tight">{testimonial.author}</h3>
                  <div className="flex items-center gap-1.5 text-xs font-medium text-gray-400">
                      <Icon icon={`flag:${testimonial.countryCode}-4x3`} width={16} className="opacity-80" />
                      <span>{testimonial.location}</span>
                  </div>
              </div>
          </div>
          
          <blockquote className="text-[15px] leading-relaxed text-gray-300 font-normal tracking-wide">
              "{testimonial.quote}"
          </blockquote>
      </div>
    </div>
  )
}

export default function Testimonials() {
  const { t, language } = useLanguage()
  const containerRef = React.useRef<HTMLDivElement>(null)

  const testimonialsData = React.useMemo(() => [
    {
      id: "miguel",
      author: "Miguel Isaza",
      countryCode: "es",
      location: t("testimonial.miguel.location"),
      photoSrc: getAssetUrl("miguel.jpg"),
      quote: t("testimonial.miguel.quote"),
    },
    {
      id: "sofia",
      author: "Sofía Orjuela",
      countryCode: "co",
      location: t("testimonial.sofia.location"),
      photoSrc: getAssetUrl("sofia.jpg"),
      quote: t("testimonial.sofia.quote"),
    },
    {
      id: "camila",
      author: "Camila Herrera",
      countryCode: "ar",
      location: t("testimonial.camila.location"),
      photoSrc: getAssetUrl("camila.jpg"),
      quote: t("testimonial.camila.quote"),
    },
    {
      id: "cindy",
      author: "Cindy Ferrer",
      countryCode: "co",
      location: t("testimonial.cindy.location"),
      photoSrc: getAssetUrl("cindy.jpg"),
      quote: t("testimonial.cindy.quote"),
    },
    {
      id: "daniela",
      author: "Daniela Otero",
      countryCode: "us",
      location: t("testimonial.daniela.location"),
      photoSrc: getAssetUrl("daniela.jpg"),
      quote: t("testimonial.daniela.quote"),
    },
    {
      id: "yassine",
      author: "Yassine Bouzagou",
      countryCode: "fr",
      location: t("testimonial.yassine.location"),
      photoSrc: getAssetUrl("yassine.jpg"),
      quote: t("testimonial.yassine.quote"),
    },
    {
      id: "andres",
      author: "Andres Mondol",
      countryCode: "es",
      location: t("testimonial.andres.location"),
      photoSrc: getAssetUrl("mondol.jpg"),
      quote: t("testimonial.andres.quote"),
    },
    {
      id: "edvard",
      author: "Edvard Tångeras",
      countryCode: "no",
      location: t("testimonial.edvard.location"),
      photoSrc: getAssetUrl("edvard.jpg"),
      quote: t("testimonial.edvard.quote"),
    },
    {
      id: "gabriel",
      author: "Gabriel Landinez",
      countryCode: "co",
      location: t("testimonial.gabriel.location"),
      photoSrc: getAssetUrl("gabriel.jpg"),
      quote: t("testimonial.gabriel.quote"),
    },
  ], [t])

  const testimonials1 = [testimonialsData[0], testimonialsData[1], testimonialsData[2]]
  const testimonials2 = [testimonialsData[3], testimonialsData[4], testimonialsData[5]]
  const testimonials3 = [testimonialsData[6], testimonialsData[7], testimonialsData[8]]

  const [isMounted, setIsMounted] = React.useState(false)
  const isMobile = useMediaQuery("(max-width: 768px)")

  React.useEffect(() => {
    setIsMounted(true)
    gsap.registerPlugin(ScrollTrigger)
    
    const ctx = gsap.context(() => {
        gsap.fromTo(".testimonials-title",
            { y: 50, opacity: 0 },
            { 
                y: 0, 
                opacity: 1, 
                duration: 1, 
                ease: "power2.out",
                scrollTrigger: {
                    trigger: ".testimonials-title",
                    start: "top 80%",
                    toggleActions: "play none none reverse"
                }
            }
        )
    }, containerRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={containerRef} className="relative bg-black py-32 overflow-hidden" id="testimonios">
      {/* Background Decor - Matches Apple Pricing/Stats Style */}
      <div className="absolute w-[150%] h-[150%] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zinc-800/20 via-black to-black blur-3xl -z-10 pointer-events-none" />

      <div className="mx-auto max-w-7xl px-6 lg:px-8 mb-20 text-center">
          <h2 className="text-5xl md:text-8xl font-bold tracking-tighter text-white mb-8 testimonials-title opacity-0 !leading-none text-balance">
            {t("testimonials.title")}
          </h2>
          <p className="text-lg text-gray-400 font-normal leading-relaxed max-w-2xl mx-auto">
            {t("testimonials.subtitle")}
          </p>
      </div>

      <div className="relative mx-auto mt-10 max-w-[90rem] px-6 lg:px-8">
        <div className="relative max-h-[800px] overflow-hidden">
             
          {/* Enhanced Fade Gradient Overlays for Seamless Vertical Scroll */}
          <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-black via-black/80 to-transparent z-20 pointer-events-none" />
          <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-black via-black/80 to-transparent z-20 pointer-events-none" />

          <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
             {/* Column 1 */}
            <ScrollingBanner
              isVertical
              duration={isMounted && isMobile ? 120 : 80}
              shouldPauseOnHover={true}
              className="[--gap:1.5rem]"
            >
              {testimonials1.map((testimonial, index) => (
                <TestimonialCard key={`${testimonial.author}-${index}`} testimonial={testimonial} />
              ))}
            </ScrollingBanner>

            {/* Column 2 */}
            <ScrollingBanner
              isVertical
              className="hidden sm:flex [--gap:1.5rem]"
              duration={100}
              shouldPauseOnHover={true}
            >
              {testimonials2.map((testimonial, index) => (
                <TestimonialCard key={`${testimonial.author}-${index}`} testimonial={testimonial} />
              ))}
            </ScrollingBanner>

            {/* Column 3 */}
            <ScrollingBanner
              isVertical
              className="hidden lg:flex [--gap:1.5rem]"
              duration={120}
              shouldPauseOnHover={true}
            >
              {testimonials3.map((testimonial, index) => (
                <TestimonialCard key={`${testimonial.author}-${index}`} testimonial={testimonial} />
              ))}
            </ScrollingBanner>
          </div>
        </div>
      </div>
    </section>
  )
}

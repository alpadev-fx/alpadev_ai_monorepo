"use client"

import { useRef } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { useGSAPAutoAnimate } from "@/hooks/useGSAPAutoAnimate"

// Register ScrollTrigger
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger)
}

const niches = [
  {
    title: "Real Estate",
    description: "Captación de leads cualificados para desarrollos y corretaje.",
    icon: (
      <svg className="w-6 h-6 text-[alpadev-light-blue]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    )
  },
  {
    title: "Sector Automotriz",
    description: "Sistemas de agendamiento para concesionarios y servicios.",
    icon: (
      <svg className="w-6 h-6 text-[alpadev-light-blue]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
      </svg>
    )
  },
  {
    title: "Home Services",
    description: "Roofing, HVAC, Plumbing. Generación de citas listas para cierre.",
    icon: (
      <svg className="w-6 h-6 text-[alpadev-light-blue]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    )
  },
  {
    title: "Law Firms",
    description: "Injury, Immigration. Gestión de casos y clientes potenciales.",
    icon: (
      <svg className="w-6 h-6 text-[alpadev-light-blue]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
      </svg>
    )
  }
]

export default function Vision() {
  const containerAnimation = useGSAPAutoAnimate<HTMLDivElement, HTMLDivElement>({
    from: { opacity: 0, y: 50 },
    to: { opacity: 1, y: 0, duration: 1, ease: "power3.out" },
    scrollTrigger: { start: "top 80%" }
  })

  return (
    <section className="relative py-24 sm:py-32 overflow-hidden bg-black">
      {/* Background Decor */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[500px] h-[500px] bg-[alpadev-dark-blue]/20 rounded-full blur-[100px] -z-10" />
      
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div ref={containerAnimation.containerRef} className="mx-auto max-w-3xl text-center">
          <h2 ref={containerAnimation.contentRef} className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl leading-tight mb-6">
            Más que un BPO.<br/>
            <span className="text-[alpadev-light-blue]">Socios de Crecimiento Integral.</span>
          </h2>
          <p className="mt-6 text-lg leading-8 text-gray-400">
            Dejamos de ser un BPO tradicional para convertirnos en una firma de crecimiento.
            Somos expertos en crear sistemas que convierten el interés en oportunidades reales y las oportunidades en ventas cerradas.
          </p>
        </div>

        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <div className="grid grid-cols-1 gap-x-8 gap-y-16 lg:grid-cols-2">
            
            {/* Mission / Brand Story */}
            <div className="flex flex-col justify-center p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl">
              <h3 className="text-2xl font-bold text-white mb-4">Nuestra Filosofía</h3>
              <p className="text-gray-400 mb-6">
                 "El nombre ALPADEV AI se basa en dos conceptos clave: 'ALPADEV' representa el impulso tecnológico alpha... y 'AI' simboliza nuestra inteligencia artificial avanzada."
              </p>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[alpadev-dark-blue]/30 border border-[alpadev-light-blue]/20">
                        <span className="text-[alpadev-light-blue] font-bold">1</span>
                    </div>
                    <div>
                        <h4 className="font-semibold text-white">Narrativa de Autoridad</h4>
                        <p className="text-sm text-gray-500">Posicionamiento experto en el mercado.</p>
                    </div>
                </div>
                 <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[alpadev-dark-blue]/30 border border-[alpadev-light-blue]/20">
                        <span className="text-[alpadev-light-blue] font-bold">2</span>
                    </div>
                    <div>
                        <h4 className="font-semibold text-white">Optimización Digital</h4>
                        <p className="text-sm text-gray-500">Captura de demanda calificada.</p>
                    </div>
                </div>
                 <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[alpadev-dark-blue]/30 border border-[alpadev-light-blue]/20">
                        <span className="text-[alpadev-light-blue] font-bold">3</span>
                    </div>
                    <div>
                        <h4 className="font-semibold text-white">Sistemas Inteligentes</h4>
                        <p className="text-sm text-gray-500">Automatización de seguimiento y cierre.</p>
                    </div>
                </div>
              </div>
            </div>

            {/* Niches */}
            <div className="flex flex-col justify-center">
               <h3 className="text-2xl font-bold text-white mb-6 pl-4 border-l-4 border-[alpadev-light-blue]">Nichos Estratégicos</h3>
               <p className="text-gray-400 mb-8 pl-4">
                 Sectores seleccionados por su alto margen, demanda constante y oportunidad de digitalización.
               </p>
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {niches.map((niche) => (
                    <div key={niche.title} className="group relative rounded-2xl bg-white/5 p-6 hover:bg-white/10 transition-colors border border-white/5 hover:border-white/10">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[alpadev-dark-blue] mb-4 group-hover:scale-110 transition-transform">
                        {niche.icon}
                      </div>
                      <h4 className="text-lg font-semibold text-white">{niche.title}</h4>
                      <p className="mt-2 text-sm text-gray-400">{niche.description}</p>
                    </div>
                  ))}
               </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  )
}

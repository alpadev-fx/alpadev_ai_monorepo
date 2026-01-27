"use client"

import React, { useMemo, useRef } from "react"
import { useLanguage } from "@/contexts/LanguageContext"
import { OrbitSystem } from "@/components/animate-ui/components/community/radial-intro"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { useEffect, useState } from "react"
import { CodeBlock } from "@/components/ui/code-block"
import { getAssetUrl } from "@/lib/r2"

export function CodeBlockDemo() {
  const code = (
    <>
      <span className="text-pink-500">import</span> <span className="text-white">{"{"}</span> <span className="text-blue-400">publicProcedure</span><span className="text-white">,</span> <span className="text-blue-400">router</span> <span className="text-white">{"}"}</span> <span className="text-pink-500">from</span> <span className="text-teal-400">'../trpc'</span><span className="text-white">;</span>
      {"\n"}
      <span className="text-pink-500">import</span> <span className="text-white">{"{"}</span> <span className="text-white">z</span> <span className="text-white">{"}"}</span> <span className="text-pink-500">from</span> <span className="text-teal-400">'zod'</span><span className="text-white">;</span>
      {"\n\n"}
      <span className="text-pink-500">export const</span> <span className="text-white">postRouter</span> <span className="text-white">=</span> <span className="text-blue-400">router</span><span className="text-white">({"{"}</span>
      {"\n"}
      {"  "}<span className="text-white">hello</span><span className="text-white">:</span> <span className="text-blue-400">publicProcedure</span>
      {"\n"}
      {"    "}.<span className="text-blue-400">input</span><span className="text-white">(</span><span className="text-white">z</span>.<span className="text-blue-400">object</span><span className="text-white">({"{"}</span> <span className="text-white">text</span><span className="text-white">:</span> <span className="text-white">z</span>.<span className="text-blue-400">string</span><span className="text-white">()</span> <span className="text-white">{"}"})</span><span className="text-white">)</span>
      {"\n"}
      {"    "}.<span className="text-blue-400">query</span><span className="text-white">(</span><span className="text-white">(</span><span className="text-white">{"{"}</span> <span className="text-white">input</span> <span className="text-white">{"}"}</span><span className="text-white">)</span> <span className="text-white">{"=>"}</span> <span className="text-white">{"{"}</span>
      {"\n"}
      {"      "}<span className="text-pink-500">return</span> <span className="text-white">{"{"}</span>
      {"\n"}
      {"        "}<span className="text-white">greeting</span><span className="text-white">:</span> <span className="text-teal-400">'Hello from Alpadev AI!'</span><span className="text-white">,</span>
      {"\n"}
      {"      "}<span className="text-white">{"}"}</span><span className="text-white">;</span>
      {"\n"}
      {"    "}<span className="text-white">{"}"}</span><span className="text-white">)</span><span className="text-white">,</span>
      {"\n"}
      {"  "}<span className="text-white">create</span><span className="text-white">:</span> <span className="text-blue-400">publicProcedure</span>
      {"\n"}
      {"    "}.<span className="text-blue-400">input</span><span className="text-white">(</span><span className="text-white">z</span>.<span className="text-blue-400">object</span><span className="text-white">({"{"}</span> <span className="text-white">text</span><span className="text-white">:</span> <span className="text-white">z</span>.<span className="text-blue-400">string</span><span className="text-white">()</span> <span className="text-white">{"}"})</span><span className="text-white">)</span>
      {"\n"}
      {"    "}.<span className="text-blue-400">mutation</span><span className="text-white">(</span><span className="text-white">(</span><span className="text-white">{"{"}</span> <span className="text-white">input</span> <span className="text-white">{"}"}</span><span className="text-white">)</span> <span className="text-white">{"=>"}</span> <span className="text-white">{"{"}</span>
      {"\n"}
      {"      "}<span className="text-white">{"// Logic to create a post"}</span>
      {"\n"}
      {"      "}<span className="text-pink-500">return</span> <span className="text-white">{"{"}</span>
      {"\n"}
      {"        "}<span className="text-white">id</span><span className="text-white">:</span> <span className="text-fuchsia-500">123</span><span className="text-white">,</span>
      {"\n"}
      {"        "}<span className="text-white">text</span><span className="text-white">:</span> <span className="text-white">input</span>.<span className="text-white">text</span><span className="text-white">,</span>
      {"\n"}
      {"      "}<span className="text-white">{"}"}</span><span className="text-white">;</span>
      {"\n"}
      {"    "}<span className="text-white">{"}"}</span><span className="text-white">)</span><span className="text-white">,</span>
      {"\n"}
      <span className="text-white">{"}"}</span><span className="text-white">)</span><span className="text-white">;</span>
    </>
  );

  return (
    <div className="max-w-3xl mx-auto w-full">
      <CodeBlock
        language="typescript"
        filename="router.ts"
        highlightLines={[]} 
        code={code}
      />
    </div>
  );
}

export default function IntegrationSection() {
  const { t } = useLanguage()
  const scrollRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const [stageSize, setStageSize] = useState(450)
  const [imageSize, setImageSize] = useState(80)

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setStageSize(320)
        setImageSize(50)
      } else {
        setStageSize(450)
        setImageSize(80)
      }
    }
    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const items = useMemo(() => [
    { id: 1, name: t("integration.orbit.revenue"), src: getAssetUrl("bitcoin.jpg") },
    { id: 2, name: t("integration.orbit.finance"), src: getAssetUrl("dashboard.jpg") },
    { id: 3, name: t("integration.orbit.marketing"), src: getAssetUrl("analytics.jpg") },
    { id: 4, name: t("integration.orbit.ai"), src: getAssetUrl("ai.jpg") },
    { id: 5, name: t("integration.orbit.blockchain"), src: getAssetUrl("code.jpg") },
    { id: 6, name: t("integration.orbit.service"), src: getAssetUrl("metrics.jpg") },
  ], [t])
  
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)
    
    const ctx = gsap.context(() => {
        // Entrance Animation
        gsap.from(contentRef.current, {
            y: 100,
            opacity: 0,
            duration: 1.2,
            ease: "power3.out",
            scrollTrigger: {
                trigger: scrollRef.current,
                start: "top 75%",
                toggleActions: "play none none reverse"
            }
        })
    }, scrollRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={scrollRef} className="relative py-24 sm:py-32 bg-black overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[800px] h-[800px] bg-indigo-900/20 rounded-full blur-[100px] pointer-events-none" />

      <div ref={contentRef} className="mx-auto max-w-7xl px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-20">
            <h2 className="text-sm font-semibold text-blue-400 tracking-widest uppercase mb-3">
                {t("integration.subtitle")}
            </h2>
            <h3 className="text-3xl md:text-5xl font-bold text-white tracking-tight mb-6">
                {t("integration.title")}
            </h3>
            <p className="text-lg text-gray-400 font-normal leading-relaxed mb-8">
                {t("integration.description")}
            </p>
            <div className="flex items-center justify-center gap-4">
                <button className="px-6 py-2.5 rounded-full border border-white/20 text-white font-medium hover:bg-white/5 transition-colors">
                    {t("integration.button.call")}
                </button>
            </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            {/* Left: Dummy Component */}
            <div className="h-full min-h-[400px] flex flex-col justify-center items-center">
                <CodeBlockDemo />
            </div>

            {/* Right: Radial Intro Orbit System */}
            <div className="relative h-[450px] lg:h-[600px] flex items-center justify-center">
                 {/* Background Glow */}
                 <div className="absolute inset-0 bg-blue-500/5 rounded-full blur-3xl" />
                 
                 <OrbitSystem 
                    orbitItems={items} 
                    stageSize={stageSize} 
                    imageSize={imageSize} 
                  
                 />
            </div>
        </div>
      </div>
    </section>
  )
}
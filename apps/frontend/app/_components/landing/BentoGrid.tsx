"use client"

import React from "react"
import Image from "next/image"
import Lottie from "lottie-react"

import { useGSAPAutoAnimate, COMPONENT_CONFIGS } from "@/hooks"
import { useLanguage } from "@/contexts/LanguageContext"
import secureAnimation from "@/public/secure.json"
import { getAssetUrl } from "@/lib/r2"

export default function BentoGrid() {
  const { t, language } = useLanguage()
  const { containerRef, contentRef } = useGSAPAutoAnimate<
    HTMLDivElement,
    HTMLDivElement
  >(COMPONENT_CONFIGS.AUTO_FADE)

  return (
    <div ref={containerRef} className="bg-black py-24 sm:py-32">
      <div
        ref={contentRef}
        className="lg:max-w-7xl lg:px-8 max-w-2xl mx-auto px-6"
      >
        <h2 className="font-semibold text-base/7 text-center text-indigo-400">
          {t("bento.title")}
        </h2>
        <p className="font-bold max-w-3xl mt-2 mx-auto !text-2xl leading-none sm:!text-3xl text-balance text-center text-white tracking-tight">
          {t("bento.subtitle")}
        </p>
        <div className="gap-6 grid lg:grid-cols-3 lg:grid-rows-2 mt-10 sm:mt-16">
          <div className="group lg:row-span-2 relative">
            <div className="absolute backdrop-blur-sm bg-white/5 border border-white/10 group-hover:backdrop-blur-md group-hover:bg-white/10 group-hover:border-indigo-500/30 group-hover:shadow-[0_0_15px_rgba(79,70,229,0.15)] inset-px lg:rounded-l-4xl rounded-lg transition-all duration-300" />
            <div className="flex flex-col h-full lg:rounded-l-[calc(2rem+1px)] overflow-hidden relative rounded-[calc(var(--radius-lg)+1px)]">
              <div className="pb-3 px-8 pt-8 sm:pb-0 sm:px-10 sm:pt-10">
                <div className="bg-gradient-to-br flex from-indigo-600 group-hover:scale-105 group-hover:shadow-indigo-500/20 h-12 items-center justify-center mb-4 rounded-lg shadow-lg to-blue-500 transition-all duration-300 w-12">
                  <MobileIcon />
                </div>
                <p className="font-medium max-lg:text-center mt-2 text-lg text-white tracking-tight">
                  {t("bento.mobile.title")}
                </p>
                <p className="group-hover:text-gray-300 max-lg:text-center max-w-lg mt-2 text-gray-400 text-lg/relaxed transition-colors duration-300">
                  {t("bento.mobile.description")}
                </p>
              </div>
              <div className="@container grow max-lg:max-w-sm max-lg:mx-auto min-h-120 relative w-full">
                <div className="absolute bottom-0 inset-x-10 overflow-hidden top-10 flex items-center justify-center">
                  <Image
                    fill
                    alt="iPhone mockup"
                    className="object-contain w-full h-full"
                    src={getAssetUrl("iphone.jpg")}
                  />
                </div>
              </div>
            </div>
            <div className="absolute inset-px lg:rounded-l-4xl outline outline-white/10 pointer-events-none rounded-lg shadow-sm" />
          </div>
          <div className="group max-lg:row-start-1 relative">
            <div className="absolute backdrop-blur-sm bg-white/5 border border-white/10 group-hover:backdrop-blur-md group-hover:bg-white/10 group-hover:border-purple-500/30 group-hover:shadow-[0_0_15px_rgba(168,85,247,0.15)] inset-px max-lg:rounded-t-4xl rounded-lg transition-all duration-300" />
            <div className="flex flex-col h-full max-lg:rounded-t-[calc(2rem+1px)] overflow-hidden relative rounded-[calc(var(--radius-lg)+1px)]">
              <div className="px-8 pt-8 sm:px-10 sm:pt-10">
                <div className="bg-gradient-to-br flex from-purple-600 group-hover:scale-105 group-hover:shadow-purple-500/20 h-12 items-center justify-center mb-4 rounded-lg shadow-lg to-pink-500 transition-all duration-300 w-12">
                  <PerformanceIcon />
                </div>
                <p className="font-medium max-lg:text-center mt-2 text-lg text-white tracking-tight">
                  {t("bento.performance.title")}
                </p>
                <p className="group-hover:text-gray-300 max-lg:text-center max-w-lg mt-2 text-gray-400 text-lg/relaxed transition-colors duration-300">
                  {t("bento.performance.description")}
                </p>
              </div>
              <div className="flex flex-1 items-center justify-center lg:pb-2 max-lg:pb-12 max-lg:pt-10 px-8 sm:px-10">
                <img
                  alt=""
                  className="max-lg:max-w-xs w-full"
                  src="https://tailwindcss.com/plus-assets/img/component-images/bento-03-performance.png"
                />
              </div>
            </div>
            <div className="absolute inset-px max-lg:rounded-t-4xl outline outline-white/10 pointer-events-none rounded-lg shadow-sm" />
          </div>
          <div className="group lg:col-start-2 lg:row-start-2 max-lg:row-start-3 relative">
            <div className="absolute backdrop-blur-sm bg-white/5 border border-white/10 group-hover:backdrop-blur-md group-hover:bg-white/10 group-hover:border-green-500/30 group-hover:shadow-[0_0_15px_rgba(34,197,94,0.15)] inset-px rounded-lg transition-all duration-300" />
            <div className="flex flex-col h-full overflow-hidden relative rounded-[calc(var(--radius-lg)+1px)]">
              <div className="px-8 pt-8 sm:px-10 sm:pt-10">
                <div className="bg-gradient-to-br flex from-green-600 group-hover:scale-105 group-hover:shadow-green-500/20 h-12 items-center justify-center mb-4 rounded-lg shadow-lg to-emerald-500 transition-all duration-300 w-12">
                  <SecurityIcon />
                </div>
                <p className="font-medium max-lg:text-center mt-2 text-lg text-white tracking-tight">
                  {t("bento.security.title")}
                </p>
                <p className="group-hover:text-gray-300 max-lg:text-center max-w-lg mt-2 text-gray-400 text-lg/relaxed transition-colors duration-300">
                  {t("bento.security.description")}
                </p>
              </div>
              <div className="@container flex flex-1 items-center justify-center lg:pb-2 max-lg:py-6">
                <div className="w-full max-w-[200px]">
                  <Lottie
                    animationData={secureAnimation}
                    autoplay={true}
                    loop={true}
                  />
                </div>
              </div>
            </div>
            <div className="absolute inset-px outline outline-white/10 pointer-events-none rounded-lg shadow-sm" />
          </div>
          <div className="group lg:row-span-2 relative">
            <div className="absolute backdrop-blur-sm bg-white/5 border border-white/10 group-hover:backdrop-blur-md group-hover:bg-white/10 group-hover:border-amber-500/30 group-hover:shadow-[0_0_15px_rgba(245,158,11,0.15)] inset-px lg:rounded-r-4xl max-lg:rounded-b-4xl rounded-lg transition-all duration-300" />
            <div className="flex flex-col h-full lg:rounded-r-[calc(2rem+1px)] max-lg:rounded-b-[calc(2rem+1px)] overflow-hidden relative rounded-[calc(var(--radius-lg)+1px)]">
              <div className="pb-3 px-8 pt-8 sm:pb-0 sm:px-10 sm:pt-10">
                <div className="bg-gradient-to-br flex from-amber-500 group-hover:scale-105 group-hover:shadow-amber-500/20 h-12 items-center justify-center mb-4 rounded-lg shadow-lg to-orange-600 transition-all duration-300 w-12">
                  <ApiIcon />
                </div>
                <p className="font-medium max-lg:text-center mt-2 text-lg text-white tracking-tight">
                  {t("bento.apis.title")}
                </p>
                <p className="group-hover:text-gray-300 max-lg:text-center max-w-lg mt-2 text-gray-400 text-lg/relaxed transition-colors duration-300">
                  {t("bento.apis.description")}
                </p>
              </div>
              <div className="grow min-h-120 relative w-full">
                <div className="absolute bg-gray-950 bottom-0 group-hover:outline-amber-500/20 left-10 outline outline-white/10 overflow-hidden right-0 rounded-tl-xl shadow-2xl top-10 transition-all duration-300">
                  <CodeTabs />
                  <CodeExample />
                </div>
              </div>
            </div>
            <div className="absolute inset-px lg:rounded-r-4xl max-lg:rounded-b-4xl outline outline-white/10 pointer-events-none rounded-lg shadow-sm" />
          </div>
        </div>
      </div>
    </div>
  )
}

// Componentes de iconos
function MobileIcon() {
  return (
    <svg
      className="h-6 w-6 text-white"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
      />
    </svg>
  )
}

function PerformanceIcon() {
  return (
    <svg
      className="h-6 w-6 text-white"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M13 10V3L4 14h7v7l9-11h-7z"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
      />
    </svg>
  )
}

function SecurityIcon() {
  return (
    <svg
      className="h-6 w-6 text-white"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
      />
    </svg>
  )
}

function ApiIcon() {
  return (
    <svg
      className="h-6 w-6 text-white"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
      />
    </svg>
  )
}

// Componente extraído para los tabs
function CodeTabs() {
  return (
    <div className="bg-gray-900 flex outline outline-white/5">
      <div className="-mb-px flex font-medium text-gray-400 text-sm/6">
        <div className="bg-gray-950 border-b border-b-indigo-500/40 border-r border-r-white/10 px-4 py-2 text-indigo-100">
          main.go
        </div>
        <div className="border-gray-700/30 border-r hover:text-white px-4 py-2 transition-colors">
          api.go
        </div>
      </div>
    </div>
  )
}

// Componente extraído para el ejemplo de código
function CodeExample() {
  return (
    <div className="bg-gray-950 font-mono pb-14 pt-6 px-6 text-sm/6">
      <div className="space-y-1">
        <code className="font-medium">
          <span className="text-indigo-400">package</span>{" "}
          <span className="text-blue-300">main</span>
        </code>
        <br />
        <br />
        <code className="font-medium">
          <span className="text-indigo-400">import</span>{" "}
          <span className="text-gray-400">(</span>
        </code>
        <br />
        <code className="font-medium pl-4">
          <span className="text-green-400">&quot;fmt&quot;</span>
        </code>
        <br />
        <code className="font-medium pl-4">
          <span className="text-green-400">&quot;sync&quot;</span>
        </code>
        <br />
        <code className="font-medium">
          <span className="text-gray-400">)</span>
        </code>
        <br />
        <br />
        <code className="font-medium">
          <span className="text-indigo-400">func</span>{" "}
          <span className="text-purple-300">saludar</span>
          <span className="text-gray-400">(</span>
          <span className="text-blue-300">wg</span>{" "}
          <span className="text-gray-400">*</span>
          <span className="text-blue-300">sync</span>
          <span className="text-gray-400">.</span>
          <span className="text-blue-300">WaitGroup</span>
          <span className="text-gray-400">,</span>{" "}
          <span className="text-blue-300">nombre</span>{" "}
          <span className="text-indigo-400">string</span>
          <span className="text-gray-400">)</span>{" "}
          <span className="text-gray-400">&#123;</span>
        </code>
        <br />
        <code className="font-medium pl-4">
          <span className="text-indigo-400">defer</span>{" "}
          <span className="text-blue-300">wg</span>
          <span className="text-gray-400">.</span>
          <span className="text-purple-300">Done</span>
          <span className="text-gray-400">()</span>
        </code>
        <br />
        <code className="font-medium pl-4">
          <span className="text-blue-300">fmt</span>.
          <span className="text-purple-300">Printf</span>
          <span className="text-gray-400">(</span>
          <span className="text-green-400">&quot;¡Hola %s!\n&quot;</span>
          <span className="text-gray-400">,</span>{" "}
          <span className="text-blue-300">nombre</span>
          <span className="text-gray-400">)</span>
        </code>
        <br />
        <code className="font-medium">
          <span className="text-gray-400">&#125;</span>
        </code>
        <br />
        <br />
        <code className="font-medium">
          <span className="text-indigo-400">func</span>{" "}
          <span className="text-purple-300">main</span>
          <span className="text-gray-400">()</span>{" "}
          <span className="text-gray-400">&#123;</span>
        </code>
        <br />
        <code className="font-medium pl-4">
          <span className="text-indigo-400">var</span>{" "}
          <span className="text-blue-300">wg</span>{" "}
          <span className="text-blue-300">sync</span>
          <span className="text-gray-400">.</span>
          <span className="text-blue-300">WaitGroup</span>
        </code>
        <br />
        <code className="font-medium pl-4">
          <span className="text-blue-300">wg</span>
          <span className="text-gray-400">.</span>
          <span className="text-purple-300">Add</span>
          <span className="text-gray-400">(</span>
          <span className="text-orange-400">1</span>
          <span className="text-gray-400">)</span>
        </code>
        <br />
        <code className="font-medium pl-4">
          <span className="text-indigo-400">go</span>{" "}
          <span className="text-purple-300">saludar</span>
          <span className="text-gray-400">(&amp;</span>
          <span className="text-blue-300">wg</span>
          <span className="text-gray-400">,</span>{" "}
          <span className="text-green-400">&quot;Mundo&quot;</span>
          <span className="text-gray-400">)</span>
        </code>
        <br />
        <code className="font-medium pl-4">
          <span className="text-blue-300">wg</span>
          <span className="text-gray-400">.</span>
          <span className="text-purple-300">Wait</span>
          <span className="text-gray-400">()</span>{" "}
        </code>
        <br />
        <code className="font-medium">
          <span className="text-gray-400">&#125;</span>
        </code>
      </div>
    </div>
  )
}

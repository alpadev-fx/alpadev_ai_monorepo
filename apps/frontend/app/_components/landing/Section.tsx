"use client"

import React from "react"

import { useGSAPAutoAnimate, COMPONENT_CONFIGS } from "@/hooks"
import { useLanguage } from "@/contexts/LanguageContext"

export default function Section() {
  const { t, language } = useLanguage()
  const { containerRef, contentRef } = useGSAPAutoAnimate<
    HTMLDivElement,
    HTMLDivElement
  >(COMPONENT_CONFIGS.AUTO_FADE)

  const features = React.useMemo(
    () => [
      {
        name: t("section.feature1.title"),
        description: t("section.feature1.description"),
        href: "#",
      },
      {
        name: t("section.feature2.title"),
        description: t("section.feature2.description"),
        href: "#",
      },
      {
        name: t("section.feature3.title"),
        description: t("section.feature3.description"),
        href: "#",
      },
    ],
    [language, t]
  )

  return (
    <div ref={containerRef} className="bg-black py-24 sm:py-32 w-full">
      <div ref={contentRef} className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="font-semibold text-center text-base/8 text-indigo-400">
            {t("section.subtitle")}
          </h2>
          <p className="font-bold mt-2 !text-2xl leading-none sm:!text-3xl text-pretty tracking-tight text-white text-center">
            {t("section.title")}
          </p>
          <p className="mt-8 text-gray-300 text-lg/8">
            {t("section.description")}
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.name}
                className="group relative flex flex-col rounded-xl backdrop-blur-lg bg-gray-900 border border-gray-700 p-6 shadow-xl hover:bg-gray-800 hover:shadow-white/5 transition-all duration-300 hover:scale-[1.02] overflow-hidden"
              >
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-all duration-1000 bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent z-0" />
                <dt className="relative z-10 flex font-semibold items-center gap-x-3 text-base/7 text-white">
                  {feature.name}
                </dt>
                <dd className="relative z-10 flex flex-auto flex-col mt-4 text-base/7 text-gray-300">
                  <p className="flex-auto">{feature.description}</p>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  )
}

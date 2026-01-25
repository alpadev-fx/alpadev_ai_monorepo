"use client"

import { TextReveal } from "@/app/_components/ui/TextReveal"
import { useLanguage } from "@/contexts/LanguageContext"

export const TextRevealDemo = () => {
  const { t } = useLanguage()

  return (
    <div className="relative min-h-[120vh] bg-black">
      <div className="flex flex-col items-center justify-center w-full">
        <TextReveal
          text={t("textReveal.content")}
          className="flex items-center"
          textClassName="text-4xl md:text-6xl lg:text-8xl font-bold text-white tracking-tighter leading-none justify-center"
          boxClassName="py-0 h-fit"
        />
      </div>
    </div>
  )
}

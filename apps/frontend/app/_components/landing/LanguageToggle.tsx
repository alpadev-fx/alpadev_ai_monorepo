"use client"

import React from "react"

import { useLanguage } from "@/contexts/LanguageContext"

export default function LanguageToggle() {
  const { language, setLanguage } = useLanguage()

  return (
    <div className="flex items-center gap-2 bg-gray-900/60 border border-gray-700/20 rounded-full p-1">
      <button
        className={`flex items-center justify-center w-9 h-9 rounded-full transition-all duration-200 ${
          language === "en"
            ? "bg-gradient-to-b from-gray-100 to-gray-300 text-black shadow-sm font-semibold"
            : "text-gray-400 hover:text-white font-medium"
        }`}
        title="English"
        onClick={() => setLanguage("en")}
      >
        <span className="text-xs">EN</span>
      </button>
      <button
        className={`flex items-center justify-center w-9 h-9 rounded-full transition-all duration-200 ${
          language === "es"
            ? "bg-gradient-to-b from-gray-100 to-gray-300 text-black shadow-sm font-semibold"
            : "text-gray-400 hover:text-white font-medium"
        }`}
        title="Español"
        onClick={() => setLanguage("es")}
      >
        <span className="text-xs">ES</span>
      </button>
    </div>
  )
}

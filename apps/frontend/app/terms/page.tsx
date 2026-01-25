"use client"

import React from "react"
import { useLanguage } from "@/contexts/LanguageContext"

export default function TermsAndConditionsPage() {
  const { t } = useLanguage()

  return (
    <main className="min-h-screen bg-black text-gray-300 font-sans selection:bg-blue-500/30 pt-32 pb-24">
      <div className="max-w-4xl mx-auto px-6 lg:px-8">
        
        {/* Header */}
        <header className="mb-16 border-b border-white/10 pb-8 ">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-4 !leading-none">
                {t("terms.title")}
            </h1>
            <p className="text-sm text-gray-500 uppercase tracking-widest font-semibold">
                {t("terms.lastUpdated")}
            </p>
        </header>

        {/* Content */}
        <article className="prose prose-invert prose-lg max-w-none">
            
            {/* Intro with HTML rendering logic for bold tags */}
            <p className="lead text-xl text-gray-400 mb-12 font-light" dangerouslySetInnerHTML={{ __html: t("terms.intro") }} />

            <section className="mb-12">
                <h2 className="text-2xl font-semibold text-white mb-6">{t("terms.warranty.title")}</h2>
                <p className="mb-4">{t("terms.warranty.intro")}</p>
                <ul className="list-disc pl-5 text-gray-400">
                    <li>{t("terms.warranty.item1")}</li>
                    <li>{t("terms.warranty.item2")}</li>
                    <li>{t("terms.warranty.item3")}</li>
                </ul>
            </section>

            <section className="mb-12">
                <h2 className="text-2xl font-semibold text-white mb-6">{t("terms.liability.title")}</h2>
                <p className="mb-4">{t("terms.liability.intro")}</p>
                <ul className="list-disc pl-5 space-y-2 text-gray-400">
                    <li>{t("terms.liability.item1")}</li>
                    <li>{t("terms.liability.item2")}</li>
                    <li>{t("terms.liability.item3")}</li>
                </ul>
            </section>

            <section className="mb-12">
                <h2 className="text-2xl font-semibold text-white mb-6">{t("terms.service.title")}</h2>
                
                <div className="space-y-8">
                    <div>
                        <h3 className="text-xl font-medium text-white mb-3">{t("terms.service.acceptable.title")}</h3>
                        <p className="mb-2 text-gray-400">{t("terms.service.acceptable.intro")}</p>
                        <ul className="list-disc pl-5 text-gray-400">
                            <li>{t("terms.service.acceptable.item1")}</li>
                            <li>{t("terms.service.acceptable.item2")}</li>
                            <li>{t("terms.service.acceptable.item3")}</li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-xl font-medium text-white mb-3">{t("terms.service.ip.title")}</h3>
                        <p className="text-gray-400">{t("terms.service.ip.desc")}</p>
                    </div>

                    <div>
                        <h3 className="text-xl font-medium text-white mb-3">{t("terms.service.mod.title")}</h3>
                        <p className="text-gray-400">{t("terms.service.mod.desc")}</p>
                    </div>
                </div>
            </section>

            <section className="mb-12">
                <h2 className="text-2xl font-semibold text-white mb-6">{t("terms.jurisdiction.title")}</h2>
                <p>{t("terms.jurisdiction.desc")}</p>
            </section>

            <section className="mb-12">
                <h2 className="text-2xl font-semibold text-white mb-6">{t("terms.contact.title")}</h2>
                <p>{t("terms.contact.desc")} <a href="mailto:founder@alpadev.xyz" className="text-white underline decoration-white/30 hover:decoration-white">founder@alpadev.xyz</a></p>
            </section>

            <section className="mb-12 pt-12 border-t border-white/10">
                <h2 className="text-2xl font-semibold text-white mb-6">{t("terms.agreement.title")}</h2>
                <div className="p-6 rounded-2xl bg-[#161617] border border-white/5">
                    <p className="text-lg font-medium text-white mb-2">{t("terms.agreement.sub")}</p>
                    <p className="text-gray-400">{t("terms.agreement.desc")}</p>
                </div>
            </section>

        </article>
      </div>
    </main>
  )
}

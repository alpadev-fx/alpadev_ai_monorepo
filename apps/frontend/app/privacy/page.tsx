"use client"

import React from "react"
import { useLanguage } from "@/contexts/LanguageContext"

export default function PrivacyPolicyPage() {
  const { t } = useLanguage()

  return (
    <main className="min-h-screen bg-black text-gray-300 font-sans selection:bg-blue-500/30 pt-32 pb-24">
      <div className="max-w-4xl mx-auto px-6 lg:px-8">
        
        {/* Header */}
        <header className="mb-16 border-b border-white/10 pb-8">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-4 !leading-none">
                {t("privacy.title")}
            </h1>
            <p className="text-sm text-gray-500 uppercase tracking-widest font-semibold">
                {t("privacy.lastUpdated")}
            </p>
        </header>

        {/* Content */}
        <article className="prose prose-invert prose-lg max-w-none">
            <p className="lead text-xl text-gray-400 mb-12 font-light">
                {t("privacy.intro")}
            </p>

            <section className="mb-12">
                <h2 className="text-2xl font-semibold text-white mb-6">{t("privacy.collect.title")}</h2>
                <p>{t("privacy.collect.intro")}</p>
                
                <div className="mt-6 space-y-6">
                    <div className="bg-[#161617] p-6 rounded-2xl border border-white/5">
                        <h3 className="text-lg font-medium text-white mb-3">{t("privacy.collect.contact.title")}</h3>
                        <ul className="list-disc pl-5 space-y-2 text-gray-400">
                            <li>{t("privacy.collect.contact.item1")}</li>
                            <li>{t("privacy.collect.contact.item2")}</li>
                            <li>{t("privacy.collect.contact.item3")}</li>
                            <li>{t("privacy.collect.contact.item4")}</li>
                        </ul>
                        <p className="text-sm text-gray-500 mt-3 italic">{t("privacy.collect.contact.note")}</p>
                    </div>

                    <div className="bg-[#161617] p-6 rounded-2xl border border-white/5">
                        <h3 className="text-lg font-medium text-white mb-3">{t("privacy.collect.professional.title")}</h3>
                        <ul className="list-disc pl-5 space-y-2 text-gray-400">
                            <li>{t("privacy.collect.professional.item1")}</li>
                            <li>{t("privacy.collect.professional.item2")}</li>
                            <li>{t("privacy.collect.professional.item3")}</li>
                        </ul>
                    </div>

                    <div className="bg-[#161617] p-6 rounded-2xl border border-white/5">
                        <h3 className="text-lg font-medium text-white mb-3">{t("privacy.collect.technical.title")}</h3>
                        <ul className="list-disc pl-5 space-y-2 text-gray-400">
                            <li>{t("privacy.collect.technical.item1")}</li>
                            <li>{t("privacy.collect.technical.item2")}</li>
                            <li>{t("privacy.collect.technical.item3")}</li>
                            <li>{t("privacy.collect.technical.item4")}</li>
                        </ul>
                        <p className="text-sm text-gray-500 mt-3 italic">{t("privacy.collect.technical.note")}</p>
                    </div>

                    <div className="bg-[#161617] p-6 rounded-2xl border border-white/5">
                        <h3 className="text-lg font-medium text-white mb-3">{t("privacy.collect.financial.title")}</h3>
                         <ul className="list-disc pl-5 space-y-2 text-gray-400">
                            <li>{t("privacy.collect.financial.item1")}</li>
                            <li>{t("privacy.collect.financial.item2")}</li>
                        </ul>
                    </div>
                </div>
            </section>

            <section className="mb-12">
                <h2 className="text-2xl font-semibold text-white mb-6">{t("privacy.usage.title")}</h2>
                <p className="mb-4">{t("privacy.usage.intro")}</p>
                <ul className="space-y-4">
                    <li className="flex gap-4">
                        <span className="text-white font-semibold min-w-[150px]">{t("privacy.usage.service.title")}</span>
                        <span>{t("privacy.usage.service.desc")}</span>
                    </li>
                    <li className="flex gap-4">
                        <span className="text-white font-semibold min-w-[150px]">{t("privacy.usage.communication.title")}</span>
                        <div className="flex flex-col">
                            <span>{t("privacy.usage.communication.desc1")}</span>
                            <span>{t("privacy.usage.communication.desc2")}</span>
                        </div>
                    </li>
                     <li className="flex gap-4">
                        <span className="text-white font-semibold min-w-[150px]">{t("privacy.usage.technical.title")}</span>
                        <span>{t("privacy.usage.technical.desc")}</span>
                    </li>
                     <li className="flex gap-4">
                        <span className="text-white font-semibold min-w-[150px]">{t("privacy.usage.legal.title")}</span>
                        <span>{t("privacy.usage.legal.desc")}</span>
                    </li>
                </ul>
            </section>

             <section className="mb-12">
                <h2 className="text-2xl font-semibold text-white mb-6">{t("privacy.share.title")}</h2>
                <p className="mb-4">{t("privacy.share.intro")}</p>
                <ul className="list-disc pl-5 mb-6 text-gray-400">
                    <li>{t("privacy.share.item1")}</li>
                    <li>{t("privacy.share.item2")}</li>
                    <li>{t("privacy.share.item3")}</li>
                    <li>{t("privacy.share.item4")}</li>
                </ul>
                <div className="p-4 bg-blue-900/10 border border-blue-500/20 rounded-lg">
                    <p className="text-sm text-blue-200">
                        {t("privacy.share.note")}
                        <br/><br/>
                        <strong>{t("privacy.share.warning")}</strong>
                    </p>
                </div>
            </section>

            <section className="mb-12">
                <h2 className="text-2xl font-semibold text-white mb-6">{t("privacy.transfer.title")}</h2>
                <p>{t("privacy.transfer.desc")}</p>
            </section>

            <section className="mb-12">
                <h2 className="text-2xl font-semibold text-white mb-6">{t("privacy.minors.title")}</h2>
                <p>{t("privacy.minors.desc")} <a href="mailto:founder@alpadev.xyz" className="text-white underline decoration-white/30 hover:decoration-white">founder@alpadev.xyz</a>.</p>
            </section>

             <section className="mb-12">
                <h2 className="text-2xl font-semibold text-white mb-6">{t("privacy.security.title")}</h2>
                <p className="mb-4">{t("privacy.security.intro")}</p>
                <ul className="list-disc pl-5 text-gray-400">
                    <li>{t("privacy.security.item1")}</li>
                    <li>{t("privacy.security.item2")}</li>
                    <li>{t("privacy.security.item3")}</li>
                    <li>{t("privacy.security.item4")}</li>
                </ul>
            </section>

             <section className="mb-12">
                <h2 className="text-2xl font-semibold text-white mb-6">{t("privacy.rights.title")}</h2>
                <p className="mb-4">{t("privacy.rights.intro")}</p>
                 <ul className="list-disc pl-5 mb-4 text-gray-400">
                    <li>{t("privacy.rights.item1")}</li>
                    <li>{t("privacy.rights.item2")}</li>
                    <li>{t("privacy.rights.item3")}</li>
                </ul>
                 <p>{t("privacy.rights.contact")} <a href="mailto:founder@alpadev.xyz" className="text-white underline decoration-white/30 hover:decoration-white">founder@alpadev.xyz</a>.</p>
            </section>

             <section className="mb-12">
                <h2 className="text-2xl font-semibold text-white mb-6">{t("privacy.compliance.title")}</h2>
                <p>{t("privacy.compliance.desc")}</p>
            </section>

            <section className="mb-12">
                <h2 className="text-2xl font-semibold text-white mb-6">{t("privacy.update.title")}</h2>
                <p>{t("privacy.update.desc")}</p>
            </section>

             <section className="mb-12 pt-12 border-t border-white/10">
                <h2 className="text-2xl font-semibold text-white mb-6">{t("privacy.contact.title")}</h2>
                <p>{t("privacy.contact.desc")} <a href="mailto:founder@alpadev.xyz" className="text-white underline decoration-white/30 hover:decoration-white">founder@alpadev.xyz</a></p>
            </section>

        </article>
      </div>
    </main>
  )
}

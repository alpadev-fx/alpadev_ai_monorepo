"use client"

// --- HERO: Single Black Hole Parallax ---
import { useLanguage } from "@/contexts/LanguageContext"
import { BlackHoleParallax } from "@/components/shared/BlackHoleParallax"

// --- SCROLL SECTIONS ---
import Stats from "./_components/landing/Stats"
import PrimaryFeatures from "@/app/_components/landing/PrimaryFeatures"
import IntegrationSection from "./_components/landing/IntegrationSection"
import Testimonials from "./_components/landing/Testimonials"
import CallToAction from "./_components/landing/CallToAction"
import Pricing from "./_components/landing/Pricing"
import Faq from "./_components/landing/Faq"

// --- INTERACTIVE VISUALS ---
import { TextRevealDemo } from "./_components/demos/TextRevealDemo"
import { HorizontalScrollSection } from "@/components/shared/HorizontalScrollSection"
import { StickyShowcase } from "@/components/shared/StickyShowcase"
import { ExplodedView } from "@/components/shared/ExplodedView"
import { StackedCards } from "./_components/ui/StackedCards"
import { Hero } from "./_components"
import Galaxy from "@/components/shared/Galaxy"
import { ColorScrollTransition } from "@/components/shared/ColorScrollTransition"

export default function Home() {
  const { t } = useLanguage()

  return (
    <main className="bg-black min-h-screen selection:bg-white/20 selection:text-white">
      {/* --- HERO: Apple-Style Black Hole Parallax --- */}
      <BlackHoleParallax />

      {/* --- REST OF THE PAGE --- */}
      <div className="relative z-10 bg-black">
        <Stats />
        <TextRevealDemo /> 
        {/* salida zoom in para Hero */}
        <Hero />

        <PrimaryFeatures />
        <ExplodedView />
        <ColorScrollTransition 
          scenes={[
            {
              backgroundColor: "#000000",
              textColor: "text-white",
              content: (
                <div className="text-center max-w-4xl mx-auto px-6">
                  <h2 className="text-5xl md:text-7xl font-bold mb-6 tracking-tighter">
                    {t("phase1.title")}
                  </h2>
                  <p className="text-xl md:text-2xl text-white/70 max-w-2xl mx-auto leading-none">
                    {t("phase1.desc")}
                  </p>
                </div>
              ),
            },
            {
              backgroundColor: "#FFFFFF",
              textColor: "text-black",
              content: (
                <div className="text-center max-w-4xl mx-auto px-6">
                  <h2 className="text-5xl md:text-7xl font-bold mb-6 tracking-tighter text-black">
                    {t("phase2.title")}
                  </h2>
                  <p className="text-xl md:text-2xl text-black/70 max-w-2xl mx-auto leading-none">
                    {t("phase2.desc")}
                  </p>
                </div>
              ),
            },
            {
              backgroundColor: "#000000",
              textColor: "text-white",
              content: (
                <div className="text-center max-w-4xl mx-auto px-6">
                  <h2 className="text-5xl md:text-7xl font-bold mb-6 tracking-tighter text-white">
                    {t("phase3.title")}
                  </h2>
                  <p className="text-xl md:text-2xl text-white/70 max-w-2xl mx-auto leading-none">
                    {t("phase3.desc")}
                  </p>
                </div>
              ),
            },
          ]} 
        />
        
        <Galaxy />  
        {/* salida interpolation para StickyShowcase*/}
        <IntegrationSection />
        <Pricing />
        <StickyShowcase />
        {/* Hyperspeed Background Section */}

        
        <HorizontalScrollSection />

        <Testimonials />

        
        <StackedCards />
        <Faq />
        <CallToAction />
      </div>
    </main>
  )
}

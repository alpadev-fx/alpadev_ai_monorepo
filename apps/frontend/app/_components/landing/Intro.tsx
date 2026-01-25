"use client"

import { useState, useEffect } from "react"
import { SingularityShaders } from "@/app/_components/ui/SingularityShaders"
import { TextGenerateEffect } from "@/app/_components/ui/text-generate-effect"

export const Intro = ({ onComplete }: { onComplete?: () => void }) => {
    const [isMounted, setIsMounted] = useState(false)
    const [isVisible, setIsVisible] = useState(true)

    useEffect(() => {
        setIsMounted(true)
        
        // Duration logic: 
        // TextGenerateEffect: words(2) * delay(0.5) + duration(4) = ~4.5s
        // Add buffer for reading: +1.5s = 6s
        const timer = setTimeout(() => {
            setIsVisible(false)
            
            // Wait for exit transition (1000ms) to finish
            setTimeout(() => {
                onComplete?.()
            }, 1000)
        }, 6000)

        return () => clearTimeout(timer)
    }, [onComplete])

    return (
        <div className="fixed inset-0 z-[100] pointer-events-none">
            <div className={`absolute inset-0 w-full h-full bg-black flex items-center justify-center transition-opacity duration-1000 ${isVisible ? 'opacity-100 pointer-events-auto' : 'opacity-0'}`}>
                {/* Background Shader - Always Mounted to prevent hydration/context loss */}
                <div className="absolute inset-0 z-0 opacity-100 pointer-events-none">
                    {isMounted && (
                        <SingularityShaders 
                            rotation={315} 
                            color1="#FEE8D6"
                            color2="#000"
                            speed={1}
                            size={1}
                            visible={isVisible}
                        />
                    )}
                </div>

                {/* Intro Text Overlay - Controlled by CSS opacity for stability */}
                <div className={`absolute inset-0 z-50 flex items-center justify-center pointer-events-none transition-opacity duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
                    <div className="text-center">
                        <div className="text-white text-sm font-medium tracking-[0.2em] uppercase mb-4 opacity-80">
                            Alpadev Core Online
                        </div>
                        <TextGenerateEffect words="Initializing Future" className="text-center !text-white" duration={4} delay={0.5} />
                        <div className="mt-8 text-white/60 text-xs tracking-widest animate-pulse">
                            ESTABLISHING UPLINK...
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}



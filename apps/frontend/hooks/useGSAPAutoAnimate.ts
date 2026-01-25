"use client"

import { useEffect, useRef } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

// Registrar plugins de GSAP
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger)
}

export interface AnimationConfig {
  from?: gsap.TweenVars
  to?: gsap.TweenVars
  scrollTrigger?: ScrollTrigger.Vars
  duration?: number
  ease?: string
  threshold?: number
}

export const COMPONENT_CONFIGS = {
  AUTO_FADE: {
    from: {
      opacity: 0,
      y: 50,
    },
    to: {
      opacity: 1,
      y: 0,
      duration: 1,
      ease: "power3.out",
    },
    scrollTrigger: {
      start: "top 80%",
      end: "bottom 20%",
      toggleActions: "play none none reverse",
    },
  },
  FADE_IN: {
    from: {
      opacity: 0,
    },
    to: {
      opacity: 1,
      duration: 1,
      ease: "power2.out",
    },
    scrollTrigger: {
      start: "top 80%",
      toggleActions: "play none none reverse",
    },
  },
  SLIDE_UP: {
    from: {
      opacity: 0,
      y: 100,
    },
    to: {
      opacity: 1,
      y: 0,
      duration: 1.2,
      ease: "power3.out",
    },
    scrollTrigger: {
      start: "top 80%",
      toggleActions: "play none none reverse",
    },
  },
}

export function useGSAPAutoAnimate<
  TContainer extends HTMLElement,
  TContent extends HTMLElement
>(config: AnimationConfig = COMPONENT_CONFIGS.AUTO_FADE) {
  const containerRef = useRef<TContainer>(null)
  const contentRef = useRef<TContent>(null)

  useEffect(() => {
    if (
      typeof window === "undefined" ||
      !containerRef.current ||
      !contentRef.current
    )
      return

    const ctx = gsap.context(() => {
      if (!contentRef.current) return

      gsap.fromTo(
        contentRef.current,
        config.from || {},
        {
          ...(config.to || {}),
          duration: config.duration || (config.to as any)?.duration || 1,
          ease: config.ease || (config.to as any)?.ease || "power2.out",
          scrollTrigger: {
            trigger: containerRef.current,
            ...(config.scrollTrigger || {}),
          },
        }
      )
    }, containerRef)

    return () => ctx.revert()
  }, [config])

  return { containerRef, contentRef }
}

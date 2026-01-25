import type { RefObject } from "react"

// Base options that all GSAP hooks share
export interface BaseGSAPOptions {
  duration?: number
  ease?: string
  threshold?: number
  rootMargin?: string
  enableIntersectionObserver?: boolean
  runOncePerSession?: boolean // Si true, la animación se ejecuta solo una vez por sesión de visita
}

// Options for useGSAPHover hook
export interface UseGSAPHoverOptions extends BaseGSAPOptions {
  initialY?: number
  runOnce?: boolean
}

// Options for useGSAPFade hook
export interface UseGSAPFadeOptions extends BaseGSAPOptions {
  initialOpacity?: number
}

// Return type for GSAP hooks
export interface GSAPHookReturn<
  T extends HTMLElement = HTMLElement,
  U extends HTMLElement = HTMLElement,
> {
  containerRef: RefObject<T | null>
  contentRef: RefObject<U | null>
  isVisible: boolean
  isHovered: boolean
}

// Extended return type for fade hook
export interface GSAPFadeHookReturn<
  T extends HTMLElement = HTMLElement,
  U extends HTMLElement = HTMLElement,
> extends GSAPHookReturn<T, U> {
  fadeIn: () => void
  fadeOut: () => void
}

// Preset configurations for common use cases
export const GSAP_PRESETS = {
  // Fast and responsive hover effect
  FAST_HOVER: {
    duration: 0.15,
    ease: "power2.out",
    initialY: 30,
  },

  // Standard hover effect (default)
  STANDARD_HOVER: {
    duration: 0.25,
    ease: "power3.out",
    initialY: 60,
  },

  // Smooth and elegant hover effect
  SMOOTH_HOVER: {
    duration: 0.35,
    ease: "power2.out",
    initialY: 80,
  },

  // Quick fade effect
  QUICK_FADE: {
    duration: 0.3,
    ease: "power2.out",
    initialOpacity: 0,
  },

  // Standard fade effect
  STANDARD_FADE: {
    duration: 0.6,
    ease: "power2.out",
    initialOpacity: 0,
  },

  // Slow fade effect
  SLOW_FADE: {
    duration: 1.0,
    ease: "power1.out",
    initialOpacity: 0,
  },
} as const

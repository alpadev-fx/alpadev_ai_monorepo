"use client"

import { useRef, useEffect, useCallback } from 'react'
import { UseGSAPHoverOptions, GSAPHookReturn } from './types'
import { useAnimationState } from './gsapAnimationState'
import { useGSAPAnimationHelpers } from './gsapAnimationHelpers'

/**
 * Hook para animaciones automáticas de hover al entrar en viewport
 * Se ejecuta una vez por sesión cuando el componente se detecta
 */
export const useGSAPAutoHover = <T extends HTMLElement = HTMLElement, U extends HTMLElement = HTMLElement>(
  options: UseGSAPHoverOptions = {}
): GSAPHookReturn<T, U> => {
  const {
    initialY = 60,
    duration = 0.3,
    ease = "power2.out",
    threshold = 0.2,
    rootMargin = "0px 0px -100px 0px",
    enableIntersectionObserver = true,
    runOncePerSession = true, // Por defecto true para auto-animaciones
  } = options

  const containerRef = useRef<T>(null)
  const contentRef = useRef<U>(null)
  const intersectionObserverRef = useRef<IntersectionObserver | null>(null)

  // Use clean state management
  const {
    getIsVisible,
    setVisible,
    markAsAnimatedInSession,
    resetAnimationSession,
    shouldAnimate,
  } = useAnimationState()

  // Use clean animation helpers
  const {
    createHoverInAnimation,
    setInitialHoverState,
    killCurrentAnimation,
    cleanupPerformanceProperties,
  } = useGSAPAnimationHelpers()

  // Auto animate when element enters viewport
  const autoAnimate = useCallback(() => {
    if (!contentRef.current) return

    const canAnimate = shouldAnimate(runOncePerSession, getIsVisible(), enableIntersectionObserver)
    if (!canAnimate) return

    createHoverInAnimation(contentRef.current, duration, ease)
    
    if (runOncePerSession) {
      markAsAnimatedInSession()
    }
  }, [duration, ease, runOncePerSession, enableIntersectionObserver, shouldAnimate, getIsVisible, createHoverInAnimation, markAsAnimatedInSession])

  // Handle intersection changes with automatic animation
  const handleIntersection = useCallback((entries: IntersectionObserverEntry[]) => {
    entries.forEach((entry) => {
      const wasVisible = getIsVisible()
      setVisible(entry.isIntersecting)

      // Auto animate when element enters viewport
      if (entry.isIntersecting && !wasVisible) {
        resetAnimationSession()
        autoAnimate()
      }
    })
  }, [getIsVisible, setVisible, resetAnimationSession, autoAnimate])

  useEffect(() => {
    const containerElement = containerRef.current
    const contentElement = contentRef.current

    if (!containerElement || !contentElement) return

    // Set initial state with clean helper
    setInitialHoverState(contentElement, initialY)

    // Set up intersection observer if enabled
    if (enableIntersectionObserver && 'IntersectionObserver' in window) {
      intersectionObserverRef.current = new IntersectionObserver(handleIntersection, {
        threshold,
        rootMargin,
      })
      intersectionObserverRef.current.observe(containerElement)
    } else {
      // Fallback: assume always visible and auto animate
      setVisible(true)
      autoAnimate()
    }

    // Cleanup function with single responsibility
    return () => {
      killCurrentAnimation()
      
      if (intersectionObserverRef.current) {
        intersectionObserverRef.current.disconnect()
        intersectionObserverRef.current = null
      }

      if (contentElement) {
        cleanupPerformanceProperties(contentElement)
      }
    }
  }, [
    initialY,
    threshold,
    rootMargin,
    enableIntersectionObserver,
    handleIntersection,
    setInitialHoverState,
    setVisible,
    autoAnimate,
    killCurrentAnimation,
    cleanupPerformanceProperties
  ])

  return {
    containerRef,
    contentRef,
    isVisible: getIsVisible(),
    isHovered: false, // No hover interaction
  }
} 
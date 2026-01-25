"use client"

import { useRef, useEffect, useCallback } from 'react'
import { UseGSAPFadeOptions, GSAPFadeHookReturn } from './types'
import { useAnimationState } from './gsapAnimationState'
import { useGSAPAnimationHelpers } from './gsapAnimationHelpers'

export const useGSAPFade = <T extends HTMLElement = HTMLElement, U extends HTMLElement = HTMLElement>(
  options: UseGSAPFadeOptions = {}
): GSAPFadeHookReturn<T, U> => {
  const {
    duration = 0.6,
    ease = "power2.out",
    threshold = 0.3,
    rootMargin = "0px 0px -100px 0px",
    enableIntersectionObserver = true,
    initialOpacity = 0,
    runOncePerSession = false,
  } = options

  const containerRef = useRef<T>(null)
  const contentRef = useRef<U>(null)
  const intersectionObserverRef = useRef<IntersectionObserver | null>(null)

  // Use clean state management
  const {
    getIsVisible,
    getIsHovered,
    setVisible,
    setHovered,
    markAsAnimatedInSession,
    resetAnimationSession,
    shouldAnimate,
  } = useAnimationState()

  // Use clean animation helpers
  const {
    createFadeInAnimation,
    createFadeOutAnimation,
    setInitialFadeState,
    killCurrentAnimation,
    cleanupPerformanceProperties,
  } = useGSAPAnimationHelpers()

  // Fade in animation with session control
  const fadeIn = useCallback(() => {
    if (!contentRef.current) return

    const canAnimate = shouldAnimate(runOncePerSession, getIsVisible(), enableIntersectionObserver)
    if (!canAnimate) return

    createFadeInAnimation(contentRef.current, duration, ease)
    
    if (runOncePerSession) {
      markAsAnimatedInSession()
    }
  }, [duration, ease, runOncePerSession, enableIntersectionObserver, shouldAnimate, getIsVisible, createFadeInAnimation, markAsAnimatedInSession])

  // Fade out animation
  const fadeOut = useCallback(() => {
    if (!contentRef.current) return
    createFadeOutAnimation(contentRef.current, initialOpacity, duration, ease)
  }, [initialOpacity, duration, ease, createFadeOutAnimation])

  // Handle intersection changes with session reset
  const handleIntersection = useCallback((entries: IntersectionObserverEntry[]) => {
    entries.forEach((entry) => {
      const wasVisible = getIsVisible()
      setVisible(entry.isIntersecting)

      // Reset animation session when element becomes visible again
      if (entry.isIntersecting && !wasVisible) {
        resetAnimationSession()
        if (getIsHovered()) {
          fadeIn()
        }
      }
      // Fade out when element becomes invisible
      else if (!entry.isIntersecting && wasVisible) {
        fadeOut()
      }
    })
  }, [getIsVisible, getIsHovered, setVisible, resetAnimationSession, fadeIn, fadeOut])

  // Handle mouse enter
  const handleMouseEnter = useCallback(() => {
    setHovered(true)
    fadeIn()
  }, [setHovered, fadeIn])

  // Handle mouse leave
  const handleMouseLeave = useCallback(() => {
    setHovered(false)
    fadeOut()
  }, [setHovered, fadeOut])

  useEffect(() => {
    const containerElement = containerRef.current
    const contentElement = contentRef.current

    if (!containerElement || !contentElement) return

    // Set initial state with clean helper
    setInitialFadeState(contentElement, initialOpacity)

    // Set up intersection observer if enabled
    if (enableIntersectionObserver && 'IntersectionObserver' in window) {
      intersectionObserverRef.current = new IntersectionObserver(handleIntersection, {
        threshold,
        rootMargin,
      })
      intersectionObserverRef.current.observe(containerElement)
    } else {
      // Fallback: assume always visible
      setVisible(true)
    }

    // Add event listeners with maximum performance
    containerElement.addEventListener('mouseenter', handleMouseEnter, { 
      passive: true,
      capture: false 
    })
    containerElement.addEventListener('mouseleave', handleMouseLeave, { 
      passive: true,
      capture: false 
    })

    // Cleanup function with single responsibility
    return () => {
      killCurrentAnimation()
      
      if (intersectionObserverRef.current) {
        intersectionObserverRef.current.disconnect()
        intersectionObserverRef.current = null
      }

      if (containerElement) {
        containerElement.removeEventListener('mouseenter', handleMouseEnter)
        containerElement.removeEventListener('mouseleave', handleMouseLeave)
      }

      if (contentElement) {
        cleanupPerformanceProperties(contentElement)
      }
    }
  }, [
    initialOpacity,
    threshold,
    rootMargin,
    enableIntersectionObserver,
    handleIntersection,
    handleMouseEnter,
    handleMouseLeave,
    setInitialFadeState,
    setVisible,
    killCurrentAnimation,
    cleanupPerformanceProperties
  ])

  return {
    containerRef,
    contentRef,
    isVisible: getIsVisible(),
    isHovered: getIsHovered(),
    fadeIn,
    fadeOut,
  }
} 
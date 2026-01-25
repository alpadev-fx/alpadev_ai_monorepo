"use client"

import { useRef, useEffect, useCallback } from 'react'
import gsap from 'gsap'
import { UseGSAPHoverOptions, GSAPHookReturn } from './types'

export const useGSAPHover = <T extends HTMLElement = HTMLElement, U extends HTMLElement = HTMLElement>(options: UseGSAPHoverOptions = {}): GSAPHookReturn<T, U> => {
  const {
    initialY = 100,
    duration = 0.25,
    ease = "power3.out",
    threshold = 0.1,
    rootMargin = "0px 0px -50px 0px",
    enableIntersectionObserver = true,
    runOnce = false,
  } = options

  const containerRef = useRef<T>(null)
  const contentRef = useRef<U>(null)
  const isVisible = useRef(false)
  const isHovered = useRef(false)
  const hasAnimated = useRef(false) // Track if animation has run once
  const animationRef = useRef<gsap.core.Tween | null>(null)
  const intersectionObserverRef = useRef<IntersectionObserver | null>(null)

  // Kill any existing animation
  const killAnimation = useCallback(() => {
    if (animationRef.current) {
      animationRef.current.kill()
      animationRef.current = null
    }
  }, [])

  // Animate to visible state
  const animateIn = useCallback(() => {
    if (!contentRef.current) return

    killAnimation()
    
    animationRef.current = gsap.to(contentRef.current, {
      y: 0,
      opacity: 1,
      duration,
      ease,
      overwrite: true,
      force3D: true,
      // 60fps optimizations
      rotationZ: 0.01,
      transformOrigin: 'center center',
      onComplete: () => {
        animationRef.current = null
      }
    })
  }, [duration, ease, killAnimation])

  // Animate to hidden state
  const animateOut = useCallback(() => {
    if (!contentRef.current) return

    killAnimation()
    
    animationRef.current = gsap.to(contentRef.current, {
      y: initialY,
      opacity: 0,
      duration: duration * 0.8, // Slightly faster exit
      ease: ease.replace('out', 'in'),
      overwrite: true,
      force3D: true,
      // 60fps optimizations
      rotationZ: 0.01,
      transformOrigin: 'center center',
      onComplete: () => {
        animationRef.current = null
      }
    })
  }, [initialY, duration, ease, killAnimation])

  // Handle intersection changes
  const handleIntersection = useCallback((entries: IntersectionObserverEntry[]) => {
    entries.forEach((entry) => {
      const wasVisible = isVisible.current
      isVisible.current = entry.isIntersecting

      // If element becomes visible and is hovered, animate in
      if (entry.isIntersecting && !wasVisible && isHovered.current) {
        animateIn()
      }
      // If element becomes invisible, animate out
      else if (!entry.isIntersecting && wasVisible) {
        animateOut()
      }
    })
  }, [animateIn, animateOut])

  // Handle mouse enter
  const handleMouseEnter = useCallback(() => {
    isHovered.current = true
    
    // Only animate if element is visible (or if intersection observer is disabled)
    // And if runOnce is false or animation hasn't run yet
    if ((isVisible.current || !enableIntersectionObserver) && (!runOnce || !hasAnimated.current)) {
      animateIn()
      if (runOnce) {
        hasAnimated.current = true
      }
    }
  }, [animateIn, enableIntersectionObserver, runOnce])

  // Handle mouse leave
  const handleMouseLeave = useCallback(() => {
    isHovered.current = false
    animateOut()
  }, [animateOut])

  useEffect(() => {
    const containerElement = containerRef.current
    const contentElement = contentRef.current

    if (!containerElement || !contentElement) return

    // Set initial state with maximum 60fps performance
    gsap.set(contentElement, {
      y: initialY,
      opacity: 0,
      force3D: true,
      willChange: 'transform, opacity',
      backfaceVisibility: 'hidden',
      perspective: 1000,
      transformStyle: 'preserve-3d',
      // Optimize for 60fps
      rotationZ: 0.01, // Force layer creation
      transformOrigin: 'center center'
    })

    // Set up intersection observer if enabled
    if (enableIntersectionObserver && 'IntersectionObserver' in window) {
      intersectionObserverRef.current = new IntersectionObserver(handleIntersection, {
        threshold,
        rootMargin,
      })
      intersectionObserverRef.current.observe(containerElement)
    } else {
      // Fallback: assume always visible
      isVisible.current = true
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

    // Cleanup
    return () => {
      killAnimation()
      
      if (intersectionObserverRef.current) {
        intersectionObserverRef.current.disconnect()
        intersectionObserverRef.current = null
      }

      if (containerElement) {
        containerElement.removeEventListener('mouseenter', handleMouseEnter)
        containerElement.removeEventListener('mouseleave', handleMouseLeave)
      }

      // Reset performance properties
      if (contentElement) {
        gsap.set(contentElement, { 
          willChange: 'auto',
          backfaceVisibility: 'visible',
          perspective: 'none',
          transformStyle: 'flat',
          rotationZ: 0
        })
      }
    }
  }, [
    initialY,
    threshold,
    rootMargin,
    enableIntersectionObserver,
    handleIntersection,
    handleMouseEnter,
    handleMouseLeave,
    killAnimation
  ])

  return {
    containerRef,
    contentRef,
    isVisible: isVisible.current,
    isHovered: isHovered.current,
  }
} 
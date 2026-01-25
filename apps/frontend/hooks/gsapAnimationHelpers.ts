"use client"

import { useRef, useCallback } from 'react'
import gsap from 'gsap'

/**
 * Hook para manejar las animaciones GSAP con funciones de una sola responsabilidad
 */
export const useGSAPAnimationHelpers = () => {
  const animationRef = useRef<gsap.core.Tween | null>(null)

  // Función para limpiar animaciones existentes
  const killCurrentAnimation = useCallback(() => {
    if (animationRef.current) {
      animationRef.current.kill()
      animationRef.current = null
    }
  }, [])

  // Función para crear animación de entrada (hover)
  const createHoverInAnimation = useCallback((
    element: HTMLElement,
    duration: number,
    ease: string
  ) => {
    killCurrentAnimation()
    
    animationRef.current = gsap.to(element, {
      y: 0,
      opacity: 1,
      duration,
      ease,
      overwrite: true,
      force3D: true,
      rotationZ: 0.01,
      transformOrigin: 'center center',
      onComplete: () => {
        animationRef.current = null
      }
    })
  }, [killCurrentAnimation])

  // Función para crear animación de salida (hover out)
  const createHoverOutAnimation = useCallback((
    element: HTMLElement,
    initialY: number,
    duration: number,
    ease: string
  ) => {
    killCurrentAnimation()
    
    animationRef.current = gsap.to(element, {
      y: initialY,
      opacity: 0,
      duration: duration * 0.8,
      ease: ease.replace('out', 'in'),
      overwrite: true,
      force3D: true,
      rotationZ: 0.01,
      transformOrigin: 'center center',
      onComplete: () => {
        animationRef.current = null
      }
    })
  }, [killCurrentAnimation])

  // Función para crear animación de fade in
  const createFadeInAnimation = useCallback((
    element: HTMLElement,
    duration: number,
    ease: string
  ) => {
    killCurrentAnimation()
    
    animationRef.current = gsap.to(element, {
      opacity: 1,
      duration,
      ease,
      overwrite: true,
      force3D: true,
      onComplete: () => {
        animationRef.current = null
      }
    })
  }, [killCurrentAnimation])

  // Función para crear animación de fade out
  const createFadeOutAnimation = useCallback((
    element: HTMLElement,
    initialOpacity: number,
    duration: number,
    ease: string
  ) => {
    killCurrentAnimation()
    
    animationRef.current = gsap.to(element, {
      opacity: initialOpacity,
      duration: duration * 0.7,
      ease: ease.replace('out', 'in'),
      overwrite: true,
      force3D: true,
      onComplete: () => {
        animationRef.current = null
      }
    })
  }, [killCurrentAnimation])

  // Función para configurar el estado inicial de hover
  const setInitialHoverState = useCallback((
    element: HTMLElement,
    initialY: number
  ) => {
    gsap.set(element, {
      y: initialY,
      opacity: 0,
      force3D: true,
      willChange: 'transform, opacity',
      backfaceVisibility: 'hidden',
      perspective: 1000,
      transformStyle: 'preserve-3d',
      rotationZ: 0.01,
      transformOrigin: 'center center'
    })
  }, [])

  // Función para configurar el estado inicial de fade
  const setInitialFadeState = useCallback((
    element: HTMLElement,
    initialOpacity: number
  ) => {
    gsap.set(element, {
      opacity: initialOpacity,
      force3D: true,
      willChange: 'opacity',
      backfaceVisibility: 'hidden',
      perspective: 1000,
      transformStyle: 'preserve-3d'
    })
  }, [])

  // Función para limpiar propiedades de performance
  const cleanupPerformanceProperties = useCallback((element: HTMLElement) => {
    gsap.set(element, {
      willChange: 'auto',
      backfaceVisibility: 'visible',
      perspective: 'none',
      transformStyle: 'flat',
      rotationZ: 0
    })
  }, [])

  return {
    // Animation creators
    createHoverInAnimation,
    createHoverOutAnimation,
    createFadeInAnimation,
    createFadeOutAnimation,
    
    // State setters
    setInitialHoverState,
    setInitialFadeState,
    
    // Cleanup
    killCurrentAnimation,
    cleanupPerformanceProperties,
  }
} 
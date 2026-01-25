"use client"

import { useRef, useCallback } from 'react'

/**
 * Hook para manejar el estado de animación con funciones de una sola responsabilidad
 */
export const useAnimationState = () => {
  const isVisible = useRef(false)
  const isHovered = useRef(false)
  const hasAnimatedInSession = useRef(false)

  // Función para verificar si el elemento está visible
  const getIsVisible = useCallback(() => isVisible.current, [])

  // Función para verificar si el elemento está siendo hovered
  const getIsHovered = useCallback(() => isHovered.current, [])

  // Función para verificar si ya se animó en esta sesión
  const getHasAnimatedInSession = useCallback(() => hasAnimatedInSession.current, [])

  // Función para marcar el elemento como visible
  const setVisible = useCallback((visible: boolean) => {
    isVisible.current = visible
  }, [])

  // Función para marcar el elemento como hovered
  const setHovered = useCallback((hovered: boolean) => {
    isHovered.current = hovered
  }, [])

  // Función para marcar que la animación ya se ejecutó en esta sesión
  const markAsAnimatedInSession = useCallback(() => {
    hasAnimatedInSession.current = true
  }, [])

  // Función para resetear el estado de animación (cuando se sale del componente)
  const resetAnimationSession = useCallback(() => {
    hasAnimatedInSession.current = false
  }, [])

  // Función para verificar si se debe ejecutar la animación
  const shouldAnimate = useCallback((runOncePerSession: boolean, isVisible: boolean, enableIntersectionObserver: boolean) => {
    const isElementVisible = isVisible || !enableIntersectionObserver
    const canAnimateInSession = !runOncePerSession || !hasAnimatedInSession.current
    
    return isElementVisible && canAnimateInSession
  }, [])

  return {
    // Getters
    getIsVisible,
    getIsHovered,
    getHasAnimatedInSession,
    
    // Setters
    setVisible,
    setHovered,
    markAsAnimatedInSession,
    resetAnimationSession,
    
    // Logic
    shouldAnimate,
  }
} 
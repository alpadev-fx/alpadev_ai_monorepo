import { UseGSAPHoverOptions, UseGSAPFadeOptions, GSAP_PRESETS } from './types'

/**
 * Creates a custom GSAP hover configuration by merging presets with custom options
 * @param preset - Base preset to use
 * @param customOptions - Custom options to override preset values
 * @returns Combined configuration object
 */
export const createHoverConfig = (
  preset: keyof typeof GSAP_PRESETS,
  customOptions: Partial<UseGSAPHoverOptions> = {}
): UseGSAPHoverOptions => {
  const baseConfig = GSAP_PRESETS[preset]
  return {
    ...baseConfig,
    ...customOptions,
  }
}

/**
 * Creates a custom GSAP fade configuration by merging presets with custom options
 * @param preset - Base preset to use
 * @param customOptions - Custom options to override preset values
 * @returns Combined configuration object
 */
export const createFadeConfig = (
  preset: keyof typeof GSAP_PRESETS,
  customOptions: Partial<UseGSAPFadeOptions> = {}
): UseGSAPFadeOptions => {
  const baseConfig = GSAP_PRESETS[preset]
  return {
    ...baseConfig,
    ...customOptions,
  }
}

/**
 * Common GSAP configurations for specific component types
 */
export const COMPONENT_CONFIGS = {
  // Auto-animation configurations (no hover required)
  AUTO_FADE: createFadeConfig('STANDARD_FADE', {
    duration: 1.5,
    ease: "power2.in",
    runOncePerSession: true,
  }),
} as const

/**
 * Validates GSAP configuration options
 * @param config - Configuration object to validate
 * @returns Boolean indicating if configuration is valid
 */
export const validateGSAPConfig = (config: UseGSAPHoverOptions | UseGSAPFadeOptions): boolean => {
  if (config.duration && (config.duration < 0 || config.duration > 5)) {
    console.warn('GSAP: Duration should be between 0 and 5 seconds')
    return false
  }
  
  if (config.threshold && (config.threshold < 0 || config.threshold > 1)) {
    console.warn('GSAP: Threshold should be between 0 and 1')
    return false
  }
  
  return true
}

/**
 * Performance optimization settings for GSAP animations
 */
export const PERFORMANCE_CONFIG = {
  // High performance settings (60fps target)
  HIGH_PERFORMANCE: {
    force3D: true,
    willChange: 'transform, opacity',
    backfaceVisibility: 'hidden' as const,
    perspective: 1000,
    transformStyle: 'preserve-3d' as const,
    rotationZ: 0.01, // Force layer creation
    transformOrigin: 'center center' as const,
  },
  
  // Standard performance settings
  STANDARD_PERFORMANCE: {
    force3D: true,
    willChange: 'transform, opacity',
    backfaceVisibility: 'hidden' as const,
  },
  
  // Low performance settings (for older devices)
  LOW_PERFORMANCE: {
    force3D: false,
    willChange: 'auto',
  },
} as const 
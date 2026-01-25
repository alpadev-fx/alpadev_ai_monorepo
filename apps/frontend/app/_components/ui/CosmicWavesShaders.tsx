"use client"

import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { useMemo, useRef, useEffect, useState } from "react"
import * as THREE from "three"
import { cn } from "@/lib/utils"

export const title = "React Cosmic Waves Shaders"

export interface CosmicWavesShadersProps extends React.HTMLAttributes<HTMLDivElement> {
  speed?: number
  amplitude?: number
  frequency?: number
  starDensity?: number
  colorShift?: number
}

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const fragmentShader = `
  uniform float u_time;
  uniform vec2 u_resolution;
  uniform float u_speed;
  uniform float u_amplitude;
  uniform float u_frequency;
  uniform float u_starDensity;
  uniform float u_colorShift;

  // Hash function for pseudo-random values
  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

  // Smooth noise function
  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);

    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));

    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
  }

  // Fractal noise
  float fbm(vec2 p) {
    float value = 0.0;
    float amplitude = 0.5;
    for(int i = 0; i < 4; i++) {
      value += amplitude * noise(p);
      p *= 2.0;
      amplitude *= 0.5;
    }
    return value;
  }

  // Star field generation
  float stars(vec2 p, float density) {
    vec2 grid = floor(p * density);
    vec2 local = fract(p * density);

    float h = hash(grid);
    if(h > 0.95) {
      float d = length(local - 0.5);
      float star = exp(-d * 20.0);
      return star * (0.5 + 0.5 * sin(u_time * 2.0 + h * 10.0));
    }
    return 0.0;
  }

  void main() {
    vec2 fragCoord = gl_FragCoord.xy;
    vec2 uv = fragCoord.xy / u_resolution.xy;
    vec2 p = uv * 2.0 - 1.0;
    p.x *= u_resolution.x / u_resolution.y;

    float time = u_time * u_speed;

    // Create flowing wave patterns
    vec2 wavePos = p * u_frequency;
    wavePos.y += time * 0.3;

    // Multiple wave layers
    float wave1 = sin(wavePos.x + cos(wavePos.y + time) * 0.5) * u_amplitude;
    float wave2 = sin(wavePos.x * 1.3 - wavePos.y * 0.7 + time * 1.2) * u_amplitude * 0.7;
    float wave3 = sin(wavePos.x * 0.8 + wavePos.y * 1.1 - time * 0.8) * u_amplitude * 0.5;

    // Combine waves
    float waves = (wave1 + wave2 + wave3) * 0.3;

    // Add fractal noise for organic texture
    vec2 noisePos = p * 1.5 + vec2(time * 0.1, time * 0.05);
    float noiseValue = fbm(noisePos) * 0.4;

    // Combine waves and noise
    float pattern = waves + noiseValue;

    // Create flowing cosmic gradient
    float gradient = length(p) * 0.8;
    gradient += pattern;

    // Color cycling through cosmic spectrum
    vec3 color1 = vec3(0.1, 0.2, 0.8); // Deep blue
    vec3 color2 = vec3(0.6, 0.1, 0.9); // Purple
    vec3 color3 = vec3(0.1, 0.8, 0.9); // Cyan
    vec3 color4 = vec3(0.9, 0.3, 0.6); // Pink

    // Color interpolation based on pattern and time
    float colorTime = time * u_colorShift + pattern * 2.0;
    vec3 finalColor;

    float t = fract(colorTime * 0.2);
    if(t < 0.25) {
      finalColor = mix(color1, color2, t * 4.0);
    } else if(t < 0.5) {
      finalColor = mix(color2, color3, (t - 0.25) * 4.0);
    } else if(t < 0.75) {
      finalColor = mix(color3, color4, (t - 0.5) * 4.0);
    } else {
      finalColor = mix(color4, color1, (t - 0.75) * 4.0);
    }

    // Apply wave intensity
    finalColor *= (0.5 + pattern * 0.8);

    // Add star field
    float starField = stars(p + vec2(time * 0.02, time * 0.01), u_starDensity * 15.0);
    starField += stars(p * 1.5 + vec2(-time * 0.015, time * 0.008), u_starDensity * 12.0);

    finalColor += vec3(starField * 0.8);

    // Add subtle glow effect
    float glow = exp(-length(p) * 0.5) * 0.3;
    finalColor += glow * vec3(0.2, 0.4, 0.8);

    // Vignette effect
    float vignette = 1.0 - length(uv - 0.5) * 1.2;
    vignette = smoothstep(0.0, 1.0, vignette);

    finalColor *= vignette;

    gl_FragColor = vec4(finalColor, 1.0);
  }
`

const InnerShader = ({ speed, amplitude, frequency, starDensity, colorShift }: CosmicWavesShadersProps) => {
    const meshRef = useRef<THREE.Mesh>(null)
    const { size: dimensions, viewport } = useThree()
    
    const uniforms = useMemo(
      () => ({
        u_time: { value: 0 },
        u_resolution: { value: new THREE.Vector2() },
        u_speed: { value: speed },
        u_amplitude: { value: amplitude },
        u_frequency: { value: frequency },
        u_starDensity: { value: starDensity },
        u_colorShift: { value: colorShift },
      }),
      [] 
    )
    
    useEffect(() => {
        uniforms.u_speed.value = speed || 1.0
        uniforms.u_amplitude.value = amplitude || 1.0
        uniforms.u_frequency.value = frequency || 1.0
        uniforms.u_starDensity.value = starDensity || 1.0
        uniforms.u_colorShift.value = colorShift || 1.0
    }, [speed, amplitude, frequency, starDensity, colorShift, uniforms])
  
    const runDpr = typeof window !== 'undefined' ? Math.min(window.devicePixelRatio, 2) : 1

    useFrame((state) => {
      if (meshRef.current) {
        uniforms.u_time.value = state.clock.getElapsedTime()
        uniforms.u_resolution.value.set(runDpr * dimensions.width, runDpr * dimensions.height) 
      }
    })
  
    return (
      <mesh ref={meshRef} scale={[viewport.width, viewport.height, 1]}>
        <planeGeometry args={[1, 1]} />
        <shaderMaterial
          fragmentShader={fragmentShader}
          vertexShader={vertexShader}
          uniforms={uniforms}
          transparent={true}
        />
      </mesh>
    )
}

export const CosmicWavesShaders = ({
  className,
  speed = 1.3,
  amplitude = 1.0,
  frequency = 3.0,
  starDensity = 0.0,
  colorShift = 0.0,
  ...props
}: CosmicWavesShadersProps) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  
  useEffect(() => {
      const observer = new IntersectionObserver(
          ([entry]) => {
              setVisible(entry.isIntersecting)
          },
          { threshold: 0.1 }
      )
      
      if (containerRef.current) {
          observer.observe(containerRef.current)
      }
      
      return () => observer.disconnect()
  }, [])

  return (
    <div ref={containerRef} className={cn("w-full h-full relative", className)} {...props}>
      <Canvas 
        frameloop={visible ? "always" : "never"}
        dpr={[1, 1.5]}
        gl={{ alpha: true, antialias: false, powerPreference: "high-performance" }}
        camera={{ position: [0, 0, 1], fov: 75 }}
      >
        <InnerShader 
            speed={speed} 
            amplitude={amplitude} 
            frequency={frequency} 
            starDensity={starDensity} 
            colorShift={colorShift} 
        />
      </Canvas>
    </div>
  )
}

CosmicWavesShaders.displayName = "CosmicWavesShaders"

export default CosmicWavesShaders

"use client"

import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { useMemo, useRef, useEffect, useState } from "react"
import * as THREE from "three"
import { cn } from "@/lib/utils"

export interface NebulaShadersProps extends React.HTMLAttributes<HTMLDivElement> {
  speed?: number
  density?: number
  stars?: number
  temperature?: number
  turbulence?: number
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
  uniform float u_density;
  uniform float u_stars;
  uniform float u_temperature;
  uniform float u_turbulence;
  
  varying vec2 vUv;

  // Noise function for procedural textures
  float hash(vec2 p) {
      return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

  float noise(vec2 p) {
      vec2 i = floor(p);
      vec2 f = fract(p);

      float a = hash(i);
      float b = hash(i + vec2(1.0, 0.0));
      float c = hash(i + vec2(0.0, 1.0));
      float d = hash(i + vec2(1.0, 1.0));

      vec2 u = f * f * (3.0 - 2.0 * f);
      return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
  }

  // Fractal Brownian Motion for complex cloud structures
  float fbm(vec2 p) {
      float value = 0.0;
      float amplitude = 0.5;
      float frequency = 1.0;

      for(int i = 0; i < 6; i++) {
          value += amplitude * noise(p * frequency);
          amplitude *= 0.5;
          frequency *= 2.0;
      }

      return value;
  }

  // Generate star field
  float stars(vec2 p) {
      vec2 grid = floor(p * 200.0);
      vec2 cell = fract(p * 200.0);

      float starHash = hash(grid);

      // Only create stars in some cells
      if(starHash < 0.95) return 0.0;

      // Create star position within cell
      vec2 starPos = vec2(hash(grid + vec2(1.0)), hash(grid + vec2(2.0)));
      float dist = length(cell - starPos);

      // Create twinkling effect
      float twinkle = sin(u_time * 3.0 + starHash * 10.0) * 0.5 + 0.5;

      // Sharp star with distance falloff
      return smoothstep(0.1, 0.0, dist) * twinkle;
  }

  void main() {
      vec2 fragCoord = vUv * u_resolution;
      
      // Normalize coordinates
      vec2 uv = (2.0*fragCoord - u_resolution.xy) / u_resolution.y;

      // Time with speed control
      float time = u_time * u_speed * 0.1;

      // Create slowly drifting coordinates for nebula clouds
      vec2 cloudUV = uv + vec2(time * 0.3, time * 0.2);

      // Generate multiple noise layers for complex cloud structure
      float cloud1 = fbm(cloudUV * 2.0 * u_turbulence);
      float cloud2 = fbm(cloudUV * 4.0 * u_turbulence + vec2(1000.0));
      float cloud3 = fbm(cloudUV * 8.0 * u_turbulence + vec2(2000.0));

      // Combine clouds with different weights
      float clouds = cloud1 * 0.5 + cloud2 * 0.3 + cloud3 * 0.2;

      // Apply density control
      clouds = pow(clouds, 2.0 - u_density);

      // Create color temperature gradient
      vec3 coolColor = vec3(0.4, 0.6, 1.0);  // Blue
      vec3 warmColor = vec3(1.0, 0.4, 0.2);  // Orange-red
      vec3 nebulaColor = mix(coolColor, warmColor, u_temperature);

      // Add depth variation with different colors
      vec3 deepColor = nebulaColor * 0.3;
      vec3 brightColor = nebulaColor * 1.2;

      // Create color variation based on cloud density
      vec3 finalNebulaColor = mix(deepColor, brightColor, clouds);

      // Add subtle purple/pink highlights in dense areas
      vec3 highlight = vec3(0.8, 0.3, 0.7);
      finalNebulaColor = mix(finalNebulaColor, highlight, clouds * clouds * 0.3);

      // Generate star field
      float starField = stars(uv) * u_stars;

      // Add brighter stars with different sizes
      float bigStars = stars(uv * 0.5) * 0.8 * u_stars;
      starField += bigStars;

      // Combine nebula and stars
      vec3 finalColor = finalNebulaColor * clouds;
      finalColor += vec3(1.0, 0.9, 0.8) * starField;

      // Add distant background glow
      float centerGlow = exp(-length(uv) * 0.8) * 0.1;
      finalColor += nebulaColor * centerGlow;

      // Create subtle animation of brightness
      float breathe = sin(time * 0.5) * 0.1 + 0.9;
      finalColor *= breathe;

      // Enhance contrast for more dramatic space effect
      finalColor = pow(finalColor, vec3(0.8));

      // Ensure colors stay in valid range
      finalColor = clamp(finalColor, 0.0, 1.0);

      gl_FragColor = vec4(finalColor, 1.0);
  }
`

export const NebulaShaders = ({
  className,
  speed = 1.0,
  density = 0.5,
  stars = 1.0,
  temperature = 0.5,
  turbulence = 0.5,
  ...props
}: NebulaShadersProps) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: 0.1 }
    )
    if (containerRef.current) observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={containerRef} className={cn("w-full h-full relative", className)} {...props}>
      <Canvas
        frameloop={visible ? "always" : "never"}
        camera={{ position: [0, 0, 1], fov: 75 }}
        dpr={[1, 2]}
        gl={{ alpha: true, antialias: true }}
      >
        <InnerShader
            speed={speed}
            density={density}
            stars={stars}
            temperature={temperature}
            turbulence={turbulence}
        />
      </Canvas>
    </div>
  )
}

const InnerShader = ({ speed, density, stars, temperature, turbulence }: NebulaShadersProps) => {
    const meshRef = useRef<THREE.Mesh>(null)
    const { size: dimensions, viewport } = useThree()
    
    const uniforms = useMemo(
      () => ({
        u_time: { value: 0 },
        u_resolution: { value: new THREE.Vector2() },
        u_speed: { value: speed },
        u_density: { value: density },
        u_stars: { value: stars },
        u_temperature: { value: temperature },
        u_turbulence: { value: turbulence },
      }),
      [] 
    )
    
    useEffect(() => {
        uniforms.u_speed.value = speed || 1.0
        uniforms.u_density.value = density || 1.0
        uniforms.u_stars.value = stars || 1.0
        uniforms.u_temperature.value = temperature || 0.5
        uniforms.u_turbulence.value = turbulence || 1.0
    }, [speed, density, stars, temperature, turbulence, uniforms])
  
    useFrame((state) => {
      if (meshRef.current) {
        uniforms.u_time.value = state.clock.getElapsedTime()
        uniforms.u_resolution.value.set(dimensions.width * 2, dimensions.height * 2) 
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

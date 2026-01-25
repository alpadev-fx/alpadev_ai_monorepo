"use client"

import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { useMemo, useRef, useEffect, useState } from "react"
import * as THREE from "three"
import { cn } from "@/lib/utils"

export const title = "React Accretion Shaders"

export interface AccretionShadersProps extends React.HTMLAttributes<HTMLDivElement> {
  speed?: number
  turbulence?: number
  depth?: number
  brightness?: number
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
  uniform float u_turbulence;
  uniform float u_depth;
  uniform float u_brightness;
  uniform float u_colorShift;

  // Tanh approximation for tone mapping
  vec4 tanhApprox(vec4 x) {
      vec4 x2 = x * x;
      return x * (3.0 + x2) / (3.0 + 3.0 * x2);
  }

  void main() {
    vec2 fragCoord = gl_FragCoord.xy;
    vec2 I = fragCoord;
    vec2 iResolution = u_resolution;
    float iTime = u_time;

    vec4 O = vec4(0.0);
    float z = 0.0, d, i = 0.0;

    // Loop iteration
    for(int iter = 0; iter < 8; iter++) {
        i = float(iter);

        // Sample point from ray direction
        vec3 p = z * normalize(vec3(I + I, 0.0) - iResolution.xyx) + 0.1 * u_depth;

        // Polar coordinates and transformations
        p = vec3(atan(p.y / 0.2, p.x) * 2.0, p.z / 3.0, length(p.xy) - 5.0 - z * 0.2);

        // Apply turbulence and refraction effect
        for(int turb = 0; turb < 4; turb++) {
             float t_val = float(turb);
            p += sin(p.yzx * (t_val + 1.0) + iTime * u_speed + 0.3 * i * u_turbulence) / (t_val + 1.0);
        }

        // Distance to cylinder and waves with refraction
        d = length(vec4(0.4 * cos(p) - 0.4, p.z));
        z += d;

        // Coloring and brightness - Indigo, Teal, Fuchsia, DarkBlue, LightBlue range
        // Phase shifts adjusted for cool spectrum
        vec4 color = (1.5 + cos(p.x + i * 0.4 + z + vec4(2.0, 1.0, 5.0, 0.0) * u_colorShift)) / d;
        O += color * u_brightness * 0.5;
    }

    // Tanh tonemap
    O = tanhApprox(O * O / 400.0);
    gl_FragColor = O;
  }
`

const InnerShader = ({ speed, turbulence, depth, brightness, colorShift }: AccretionShadersProps) => {
    const meshRef = useRef<THREE.Mesh>(null)
    const { size: dimensions, viewport } = useThree()
    
    const uniforms = useMemo(
      () => ({
        u_time: { value: 0 },
        u_resolution: { value: new THREE.Vector2() },
        u_speed: { value: speed },
        u_turbulence: { value: turbulence },
        u_depth: { value: depth },
        u_brightness: { value: brightness },
        u_colorShift: { value: colorShift },
      }),
      [] 
    )
    
    useEffect(() => {
        uniforms.u_speed.value = speed || 1.0
        uniforms.u_turbulence.value = turbulence || 1.0
        uniforms.u_depth.value = depth || 1.0
        uniforms.u_brightness.value = brightness || 1.0
        uniforms.u_colorShift.value = colorShift || 1.0
    }, [speed, turbulence, depth, brightness, colorShift, uniforms])
  
    // Check for window to safely handle SSR
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

export const AccretionShaders = ({
  className,
  speed = 1.0,
  turbulence = 1.0,
  depth = 1.0,
  brightness = 1.0,
  colorShift = 1.0,
  ...props
}: AccretionShadersProps) => {
  const containerRef = useRef<HTMLDivElement>(null)
  
  // Use a simple IntersectionObserver logic to toggle visibility
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
            turbulence={turbulence} 
            depth={depth} 
            brightness={brightness} 
            colorShift={colorShift} 
        />
      </Canvas>
    </div>
  )
}

AccretionShaders.displayName = "AccretionShaders"

export default AccretionShaders

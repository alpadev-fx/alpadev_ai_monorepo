"use client"

import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { useMemo, useRef, useEffect } from "react"
import * as THREE from "three"
import { cn } from "@/lib/utils"

// ... imports ...

export interface SingularityShadersProps extends React.HTMLAttributes<HTMLDivElement> {
  speed?: number
  intensity?: number
  size?: number
  waveStrength?: number
  colorShift?: number
  color1?: string
  color2?: string
  rotation?: number
  visible?: boolean
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
  uniform float u_intensity;
  uniform float u_size;
  uniform float u_waveStrength;
  uniform float u_colorShift;
  uniform vec3 u_color1;
  uniform vec3 u_color2;
  uniform float u_rotation;
  
  varying vec2 vUv;

  void main() {
    vec2 fragCoord = vUv * u_resolution;
    float i = .2 * u_speed;
    float a = 0.0;
    
    vec2 r = u_resolution.xy;
    vec2 p = (fragCoord + fragCoord - r) / r.y / (.7 * u_size);

    // Apply rotation
    float s = sin(u_rotation);
    float c = cos(u_rotation);
    mat2 rot = mat2(c, -s, s, c);
    p = rot * p;

    vec2 d = vec2(-1.0, 1.0);
    vec2 b = p - i * d;
    
    vec2 c_val = p * mat2(1.0, 1.0, d / (.1 + i / dot(b,b)));
    
    float dot_c = dot(c_val, c_val);
    a = dot_c;
    
    vec2 v = c_val * mat2(cos(.5 * log(a) + u_time * i * u_speed + vec4(0.0, 33.0, 11.0, 0.0))) / i;
    vec2 w = vec2(0.0);

    for(float j = 0.0; j < 9.0; j++) {
        i += 1.0;
        w += 1.0 + sin(v * u_waveStrength);
        v += .7 * sin(v.yx * i + u_time * u_speed) / i + .5;
    }

    i = length(sin(v / .3) * .4 + c_val * (3.0 + d));

    // Monochrome structure vector to generate the intensity mask
    // Using (0.5, 0.5, 0.5) to capture a balanced field
    vec4 colorGrad = vec4(0.5, 0.5, 0.5, 0.0) * u_colorShift;
    
    float val = -exp(c_val.x * colorGrad.x) / w.x / (2.0 + i*i/4.0 - i) / (.5 + 1.0/a) / (.03 + abs(length(p)-.7)) * u_intensity;
    
    // Calculate intensity 0..1
    float mask = 1.0 - exp(val);
    mask = clamp(mask, 0.0, 1.0);
    
    // Mix between the two user colors based on the intensity mask
    vec3 finalColor = mix(u_color2, u_color1, mask);
    
    gl_FragColor = vec4(finalColor, 1.0);
  }
`

export const SingularityShaders = ({
  className,
  speed = 1.5,
  intensity = 1,
  size = 1,
  waveStrength = 1,
  colorShift = 1,
  color1 = "#FED8B1",
  color2 = "#000",
  rotation = 0,
  visible = true,
  ...props
}: SingularityShadersProps) => {

  return (
    <div className={cn("w-full h-full relative", className)} {...props}>
      <Canvas 
        frameloop={visible ? "always" : "never"}
        camera={{ position: [0, 0, 1], fov: 75 }} 
        dpr={1}  // Fixed DPR = 1 for stable FPS
        gl={{ alpha: true, antialias: false, powerPreference: "high-performance" }}
      >
        <InnerShader 
            speed={speed} 
            intensity={intensity} 
            size={size} 
            waveStrength={waveStrength} 
            colorShift={colorShift} 
            color1={color1}
            color2={color2}
            rotation={rotation}
        />
      </Canvas>
    </div>
  )
}

// Inner component to handle uniform updates
const InnerShader = ({ speed, intensity, size, waveStrength, colorShift, color1, color2, rotation }: SingularityShadersProps) => {
    const meshRef = useRef<THREE.Mesh>(null)
    const { size: dimensions, viewport } = useThree()
    
    const uniforms = useMemo(
      () => ({
        u_time: { value: 0 },
        u_resolution: { value: new THREE.Vector2() },
        u_speed: { value: speed },
        u_intensity: { value: intensity },
        u_size: { value: size },
        u_waveStrength: { value: waveStrength },
        u_colorShift: { value: colorShift },
        u_color1: { value: new THREE.Vector3() },
        u_color2: { value: new THREE.Vector3() },
        u_rotation: { value: 0 }
      }),
      [] 
    )
    
    useEffect(() => {
        uniforms.u_speed.value = speed || 1.0
        uniforms.u_intensity.value = intensity || 1.0
        uniforms.u_size.value = size || 1.0
        uniforms.u_waveStrength.value = waveStrength || 1.0
        uniforms.u_colorShift.value = colorShift || 1.0
        
        const c1 = new THREE.Color(color1 || "#f97316");
        uniforms.u_color1.value.set(c1.r, c1.g, c1.b);

        const c2 = new THREE.Color(color2 || "#000");
        uniforms.u_color2.value.set(c2.r, c2.g, c2.b);

        uniforms.u_rotation.value = (rotation || 0) * (Math.PI / 180);

    }, [speed, intensity, size, waveStrength, colorShift, color1, color2, rotation, uniforms])
  
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

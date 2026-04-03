"use client"
import { cn } from "@package/utils"
import React, { useEffect, useRef, useState } from "react"
import { createNoise3D } from "simplex-noise"

export const WavyBackground = ({
  children,
  className,
  containerClassName,
  colors,
  waveWidth,
  backgroundFill,
  blur = 10,
  speed = "fast",
  waveOpacity = 0.5,
  ...props
}: {
  children?: any
  className?: string
  containerClassName?: string
  colors?: string[]
  waveWidth?: number
  backgroundFill?: string
  blur?: number
  speed?: "slow" | "fast"
  waveOpacity?: number
  [key: string]: any
}) => {
  const noiseRef = useRef(createNoise3D())
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null)
  const animationIdRef = useRef<number>(0)
  const stateRef = useRef({ w: 0, h: 0, nt: 0 })
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const getSpeed = () => {
    switch (speed) {
      case "slow":
        return 0.001
      case "fast":
        return 0.002
      default:
        return 0.001
    }
  }

  const init = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    ctxRef.current = canvas.getContext("2d")
    const ctx = ctxRef.current
    if (!ctx) return
    stateRef.current.w = ctx.canvas.width = window.innerWidth
    stateRef.current.h = ctx.canvas.height = window.innerHeight
    ctx.filter = `blur(${blur}px)`
    stateRef.current.nt = 0
    const onResize = () => {
      if (!ctxRef.current) return
      stateRef.current.w = ctxRef.current.canvas.width = window.innerWidth
      stateRef.current.h = ctxRef.current.canvas.height = window.innerHeight
      ctxRef.current.filter = `blur(${blur}px)`
    }
    window.addEventListener('resize', onResize)
    render()
    return onResize
  }

  const waveColors = colors ?? ["#fff", "#000"]
  const drawWave = (n: number) => {
    const ctx = ctxRef.current
    if (!ctx) return
    stateRef.current.nt += getSpeed()
    for (let i = 0; i < n; i++) {
      ctx.beginPath()
      ctx.lineWidth = waveWidth || 50
      ctx.strokeStyle = waveColors[i % waveColors.length]
      for (let x = 0; x < stateRef.current.w; x += 5) {
        const y = noiseRef.current(x / 800, 0.3 * i, stateRef.current.nt) * 100
        ctx.lineTo(x, y + stateRef.current.h * 0.5) // adjust for height, currently at 50% of the container
      }
      ctx.stroke()
      ctx.closePath()
    }
  }

  const render = () => {
    const ctx = ctxRef.current
    if (!ctx) return
    ctx.fillStyle = backgroundFill || "black"
    ctx.globalAlpha = waveOpacity || 0.5
    ctx.fillRect(0, 0, stateRef.current.w, stateRef.current.h)
    drawWave(5)
    animationIdRef.current = requestAnimationFrame(render)
  }

  useEffect(() => {
    const cleanupResize = init()
    return () => {
      cancelAnimationFrame(animationIdRef.current)
      if (cleanupResize) window.removeEventListener('resize', cleanupResize)
    }
  }, [])

  const [isSafari, setIsSafari] = useState(false)
  useEffect(() => {
    // I'm sorry but i have got to support it on safari.
    setIsSafari(
      typeof window !== "undefined" &&
        navigator.userAgent.includes("Safari") &&
        !navigator.userAgent.includes("Chrome")
    )
  }, [])

  return (
    <div
      className={cn(
        "h-screen flex flex-col items-center justify-center",
        containerClassName
      )}
    >
      <canvas
        className="absolute inset-0 z-0"
        ref={canvasRef}
        id="canvas"
        style={{
          ...(isSafari ? { filter: `blur(${blur}px)` } : {}),
        }}
      ></canvas>
      <div className={cn("relative z-10", className)} {...props}>
        {children}
      </div>
    </div>
  )
}

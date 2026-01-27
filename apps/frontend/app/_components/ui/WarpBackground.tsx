"use client";
import React, { useEffect, useRef } from "react";

interface WarpBackgroundProps {
  className?: string; // Additional classes for the canvas container
}

export const WarpBackground: React.FC<WarpBackgroundProps> = ({ className }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // --- CONFIGURACIÓN DE RENDIMIENTO ---
    // Determinamos si es móvil (menor a 768px) para reducir la carga de partículas.
    const isMobile = window.innerWidth < 768;
    const STAR_COUNT = isMobile ? 250 : 800; 

    const stars: { x: number; y: number; z: number; o: number }[] = [];
    
    // Inicialización de estrellas
    for (let i = 0; i < STAR_COUNT; i++) {
        stars.push({
            x: (Math.random() - 0.5) * width,
            y: (Math.random() - 0.5) * height,
            z: Math.random() * width,
            o: Math.random(), // random offset
        });
    }

    let animationFrameId: number;

    const draw = () => {
      // Create trailing effect (fondo con opacidad para dejar estela)
      ctx.fillStyle = "rgba(0, 0, 0, 0.3)"; 
      ctx.fillRect(0, 0, width, height);
      
      const cx = width / 2;
      const cy = height / 2;

      const speed = 40; // Velocidad del efecto warp

      stars.forEach((star) => {
        // Mover la estrella hacia el espectador
        star.z -= speed;

        // Resetear estrella si pasa la pantalla
        if (star.z <= 0) {
          star.z = width;
          star.x = (Math.random() - 0.5) * width;
          star.y = (Math.random() - 0.5) * height;
        }

        // Proyección 3D
        const x = (star.x / star.z) * width + cx;
        const y = (star.y / star.z) * height + cy;
        
        // Tamaño basado en proximidad
        const size = (1 - star.z / width) * 2;

        // Dibujar solo si está dentro de los límites visibles
        if (x >= 0 && x <= width && y >= 0 && y <= height) {
            const opacity = (1 - star.z / width);
            
            // Posición anterior para dibujar la línea (streak)
            const prevX = (star.x / (star.z + speed * 0.5)) * width + cx;
            const prevY = (star.y / (star.z + speed * 0.5)) * height + cy;

            ctx.beginPath();
            ctx.strokeStyle = `rgba(255, 255, 255, ${opacity})`;
            ctx.lineWidth = size;
            ctx.moveTo(x, y);
            ctx.lineTo(prevX, prevY);
            ctx.stroke();
        }
      });

      animationFrameId = requestAnimationFrame(draw);
    };

    // Iniciar animación
    draw();

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      // Nota: No reinicializamos el array 'stars' en resize para evitar 
      // saltos bruscos en la animación, solo ajustamos el canvas.
    };

    window.addEventListener("resize", handleResize);
    
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return <canvas ref={canvasRef} className={className} />;
};
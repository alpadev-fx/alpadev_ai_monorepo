"use client";

import React, { useRef } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useMotionTemplate,
} from "framer-motion";

export const HolographicChip = () => {
  const ref = useRef<HTMLDivElement>(null);

  // 1. Configuración del movimiento del mouse
  // Rango: -0.5 (izquierda/arriba) a 0.5 (derecha/abajo)
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // 2. Físicas de resorte (Spring Physics)
  // Esto hace que el chip tenga "peso" y no se mueva robóticamente
  const springConfig = { stiffness: 300, damping: 25 };
  const mouseX = useSpring(x, springConfig);
  const mouseY = useSpring(y, springConfig);

  // 3. Transformaciones para el TILT 3D
  // Invertimos los valores para que parezca que empujamos el chip
  const rotateX = useTransform(mouseY, [-0.5, 0.5], ["15deg", "-15deg"]);
  const rotateY = useTransform(mouseX, [-0.5, 0.5], ["-15deg", "15deg"]);

  // 4. Transformaciones para el BRILLO HOLOGRÁFICO
  // El brillo se mueve con el mouse para simular reflejo de luz
  const sheenX = useTransform(mouseX, [-0.5, 0.5], ["0%", "100%"]);
  const sheenY = useTransform(mouseY, [-0.5, 0.5], ["0%", "100%"]);

  // 5. Manejadores de eventos
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;

    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    // Calcular posición relativa del mouse dentro del elemento
    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;

    // Normalizar entre -0.5 y 0.5
    const xPct = clientX / width - 0.5;
    const yPct = clientY / height - 0.5;

    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    // Al salir, el chip vuelve suavemente al centro
    x.set(0);
    y.set(0);
  };

  // Plantilla dinámica para el gradiente (Mejora de rendimiento vs actualizar estados)
  const holographicGradient = useMotionTemplate`radial-gradient(
    circle at ${sheenX} ${sheenY}, 
    rgba(0, 255, 255, 0.7), 
    rgba(255, 0, 255, 0.6), 
    rgba(255, 255, 0, 0.5), 
    transparent 50%
  )`;

  return (
    <div className="flex items-center justify-center py-20 bg-neutral-100 dark:bg-black perspective-1000">
      {/* Contenedor con perspectiva para el efecto 3D */}
      <div style={{ perspective: "1000px" }}>
        <motion.div
          ref={ref}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={{
            rotateX,
            rotateY,
            transformStyle: "preserve-3d",
          }}
          className="relative w-72 h-72 bg-neutral-900 rounded-[2.5rem] shadow-2xl cursor-pointer group"
        >
          {/* --- CAPA 1: TEXTURA DE CIRCUITO (SVG) --- */}
          <div
            className="absolute inset-0 opacity-30 pointer-events-none rounded-[2.5rem]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.15' fill-rule='evenodd'%3E%3Ccircle cx='3' cy='3' r='1'/%3E%3Ccircle cx='13' cy='13' r='1'/%3E%3C/g%3E%3C/svg%3E")`,
              backgroundSize: "12px 12px",
            }}
          />

          {/* --- CAPA 2: LOGO CENTRAL (GRABADO) --- */}
          <div 
            className="absolute inset-0 flex flex-col items-center justify-center z-20 pointer-events-none transform-gpu"
            style={{ transform: "translateZ(30px)" }} // Levanta el logo en 3D
          >
            {/* Caja del Logo */}
            <div className="w-24 h-24 bg-gradient-to-br from-neutral-800 to-neutral-900 rounded-3xl flex items-center justify-center shadow-[inset_0_2px_4px_rgba(0,0,0,0.8),0_1px_0_rgba(255,255,255,0.1)] border border-white/5 mb-3">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-14 h-14 text-neutral-300 drop-shadow-md">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.27-2.15 3.76.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1m-1-2.5c.82 0 1.58.33 2.12.88.54.55.88 1.3.88 2.12 0 1.66-1.34 3-3 3-1.66 0-3-1.34-3-3 0-.82.33-1.58.88-2.12C10.42 1.33 11.18 1 12 1z"/>
              </svg>
            </div>
            
            {/* Texto M3 Ultra */}
            <h3 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-white to-neutral-500 tracking-tighter filter drop-shadow-lg">
              M3 <span className="font-light text-neutral-400">Ultra</span>
            </h3>
          </div>

          {/* --- CAPA 3: BRILLO HOLOGRÁFICO (MOUSE) --- */}
          {/* opacity-0 por defecto, opacity-100 en hover */}
          <motion.div
            className="absolute inset-0 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-[2.5rem]"
            style={{
              background: holographicGradient,
              mixBlendMode: "color-dodge", // CRUCIAL: Esto crea el efecto iridiscente sobre negro
            }}
          />

          {/* --- CAPA 4: REFLEJO DE CRISTAL (Overlay) --- */}
          <div className="absolute inset-0 z-30 rounded-[2.5rem] bg-gradient-to-tr from-white/10 via-transparent to-transparent opacity-50 pointer-events-none" />
          
          {/* Borde sutil */}
          <div className="absolute inset-0 border border-white/10 rounded-[2.5rem] pointer-events-none" />

        </motion.div>
      </div>
    </div>
  );
};
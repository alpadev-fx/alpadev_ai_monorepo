"use client";

import { SingularityShaders } from "@/app/_components/ui/SingularityShaders";
import { useInView } from "framer-motion";
import { useRef } from "react";

interface ShaderCardProps {
  title: string;
  subtitle: string;
  color1?: string;
  color2?: string;
  speed?: number;
}

export const ShaderCard = ({ 
  title, 
  subtitle, 
  color1 = "#ffaa00", 
  color2 = "#000000",
  speed = 2 
}: ShaderCardProps) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { margin: "100px" });

  return (
    <div ref={ref} className="relative w-full h-full rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-black group">
      
      {/* 1. EL FONDO (SHADER) - Siempre visible */}
      <div className="absolute inset-0 z-0">
        {isInView && (
           <SingularityShaders
             color1={color1}
             color2={color2}
             speed={speed}
             intensity={1.2}
             size={0.8}
             className="opacity-60 transition-opacity duration-500 group-hover:opacity-100" 
           />
        )}
      </div>

      {/* 2. EL TEXTO - Oculto por defecto, aparece en Hover */}
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-6 text-center transition-all duration-500">
        
        {/* Contenedor del texto con opacidad controlada */}
        <div className="translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 ease-out">
          <h3 className="text-3xl font-bold text-white mb-2 tracking-tight">
            {title}
          </h3>
          <p className="text-sm font-medium text-white/70 uppercase tracking-widest">
            {subtitle}
          </p>
        </div>

      </div>

      {/* Overlay oscuro para leer mejor el texto (solo en hover) */}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-500 pointer-events-none z-0" />
      
    </div>
  );
};

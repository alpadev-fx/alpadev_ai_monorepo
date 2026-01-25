"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform, useSpring, MotionValue } from "framer-motion";
import { ShaderCard } from "./ShaderCard"; 

export const HeroParallax = () => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  const springConfig = { stiffness: 300, damping: 30, bounce: 100 };
  const smoothProgress = useSpring(scrollYProgress, springConfig);

  const translateX = useTransform(smoothProgress, [0, 1], [0, 1000]);
  const translateXReverse = useTransform(smoothProgress, [0, 1], [0, -1000]);
  const rotateX = useTransform(smoothProgress, [0, 0.2], [15, 0]);
  const opacity = useTransform(smoothProgress, [0, 0.2], [0.2, 1]);
  const rotateZ = useTransform(smoothProgress, [0, 0.2], [20, 0]);
  const translateY = useTransform(smoothProgress, [0, 0.2], [-700, 500]);

  return (
    <div
      ref={ref}
      className="h-[300vh] py-40 overflow-hidden antialiased relative flex flex-col self-auto [perspective:1000px] [transform-style:preserve-3d] bg-black"
    >
      <Header />

      <motion.div
        style={{ rotateX, rotateZ, translateY, opacity }}
        className=""
      >
        {/* FILA 1 */}
        <motion.div className="flex flex-row-reverse space-x-reverse space-x-20 mb-20">
          <ParallaxItem translate={translateX}>
            <ShaderCard title="Core I" subtitle="Singularity" color1="#ff4400" color2="#000" />
          </ParallaxItem>
          <ParallaxItem translate={translateX}>
            <ShaderCard title="Nebula" subtitle="Expansion" color1="#00ccff" color2="#110033" />
          </ParallaxItem>
          <ParallaxItem translate={translateX}>
             <ShaderCard title="Void" subtitle="Deep Space" color1="#8800ff" color2="#000" />
          </ParallaxItem>
        </motion.div>
        
        {/* FILA 2 */}
        <motion.div className="flex flex-row mb-20 space-x-20">
           <ParallaxItem translate={translateXReverse}>
              <ShaderCard title="Matrix" subtitle="Simulation" color1="#00ff44" color2="#002200" speed={3} />
           </ParallaxItem>
           <ParallaxItem translate={translateXReverse}>
              <ShaderCard title="Solar" subtitle="Flare" color1="#ffaa00" color2="#440000" />
           </ParallaxItem>
           <ParallaxItem translate={translateXReverse}>
              <ShaderCard title="Cyber" subtitle="Punk" color1="#ff0088" color2="#220044" />
           </ParallaxItem>
        </motion.div>
        
        {/* FILA 3 */}
        <motion.div className="flex flex-row-reverse space-x-reverse space-x-20">
           <ParallaxItem translate={translateX}>
              <ShaderCard title="Aqua" subtitle="Flow" color1="#00ffff" color2="#004444" speed={1.5} />
           </ParallaxItem>
           <ParallaxItem translate={translateX}>
              <ShaderCard title="Royal" subtitle="Gold" color1="#ffd700" color2="#332200" />
           </ParallaxItem>
           <ParallaxItem translate={translateX}>
              <ShaderCard title="Phantom" subtitle="Mist" color1="#ffffff" color2="#444444" />
           </ParallaxItem>
        </motion.div>

      </motion.div>
    </div>
  );
};

// Componente auxiliar para envolver las tarjetas
const ParallaxItem = ({
  children,
  translate,
}: {
  children: React.ReactNode;
  translate: MotionValue<number>;
}) => {
  return (
    <motion.div
      style={{ x: translate }}
      whileHover={{ y: -20 }}
      className="group h-96 w-[30rem] relative flex-shrink-0"
    >
      <div className="block w-full h-full">
        {children}
      </div>
    </motion.div>
  );
};

const Header = () => {
  return (
    <div className="max-w-7xl relative mx-auto py-20 md:py-40 px-4 w-full left-0 top-0 text-white z-50">
      <h1 className="text-2xl md:text-7xl font-bold">
        El multiverso de <br /> shaders.
      </h1>
      <p className="max-w-2xl text-base md:text-xl mt-8 text-neutral-400">
        Cada tarjeta contiene una singularidad única renderizada en tiempo real.
      </p>
    </div>
  );
};

"use client";
import React, { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { cn } from "@package/utils";
import { WarpBackground } from "./WarpBackground";
import { getAssetUrl } from "@/lib/r2";

// Register Plugin
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export const ScrollLogoReveal = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const iconRef = useRef<HTMLDivElement>(null);
  const warpRef = useRef<HTMLDivElement>(null);
  const launchContainerRef = useRef<HTMLDivElement>(null); // Groups Text + Fire
  
  useLayoutEffect(() => {
    const ctx = gsap.context((self) => {
      if (!iconRef.current || !launchContainerRef.current || !warpRef.current) return;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "+=250%", 
          scrub: 1,
          pin: true,
        },
      });

      // PHASE 1: Fly through the logo
      tl.to(iconRef.current, {
        scale: 50, 
        opacity: 0,
        filter: "blur(20px)",
        duration: 1,
        ease: "power2.in", 
      });

      // PHASE 2: Warp Speed Burst 
      tl.fromTo(
        warpRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.5, ease: "power1.in" },
        "<" 
      );
      
      tl.to(warpRef.current, {
        opacity: 0,
        duration: 0.5,
        ease: "power1.out",
      }, ">-0.2"); 

      // PHASE 3: Text Arrival
      tl.fromTo(
        launchContainerRef.current,
        {
          opacity: 0,
          scale: 5,
          z: 100,
        },
        {
          opacity: 1,
          scale: 1,
          z: 0,
          duration: 0.8,
          ease: "expo.out",
        },
        "-=0.6"
      );

      // PHASE 4: Nuclear Fire Launch
      
        // 4a. Ignite Fire! 
        const fire = launchContainerRef.current.querySelectorAll(".fire-trail");
        if(fire.length > 0) {
             tl.to(fire, { opacity: 1, scaleX: 1.5, duration: 0.2 }, "+=0.2");
        }
        
        // 4b. LAUNCH TEXT
        tl.to(launchContainerRef.current, {
            x: "150vw", // Fly off screen to the right
            rotate: 5, // Slight tilt
            scale: 0.8, // Slightly smaller as it flies away
            duration: 1.2,
            ease: "power3.in", 
        }, "<+=0.1"); // Start moving just as fire grows

         // 4c. Max fire during flight
        if(fire.length > 0) {
             tl.to(fire, 
                { scaleX: 4, duration: 1, ease: "none" },
                "<" 
             );
        }

    }, containerRef);

    return () => ctx.revert();
  }, []);

  const brandName = "I'm Alpadev";

  return (
    <div ref={containerRef} className="h-screen w-full bg-black overflow-hidden relative">
        {/* WARP BACKGROUND LAYER */}
        <div ref={warpRef} className="absolute inset-0 z-10 opacity-0 pointer-events-none">
            <WarpBackground className="w-full h-full" />
        </div>

        <div className="relative flex items-center justify-center w-full h-full z-20">
          
          {/* LOGO ICON */}
          <div
            ref={iconRef}
            className="absolute inset-0 flex items-center justify-center origin-center will-change-transform"
          >
            <div className="h-80 w-80">
              <img
                src={getAssetUrl("logo.jpg")}
                alt="Alpadev AI Logo"
                className="h-full w-full object-contain" 
              />
            </div>
          </div>

          {/* LAUNCH CONTAINER (Text + Fire) */}
          <div
            ref={launchContainerRef}
            className="flex items-center justify-center opacity-0 will-change-transform relative"
          >
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-tight  bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-neutral-400 text-center relative z-20">
              {brandName}
            </h1>

             {/* Nuclear Fission Fire Trails */}
             <div className="absolute right-full top-1/2 -translate-y-1/2 translate-x-10 z-0 flex items-center justify-end opacity-0 fire-trail mix-blend-screen pointer-events-none">
                {/* 1. Main Plasma Beam (Long, Blue/Violet tail) */}
                <div className="w-[400px] h-24 bg-gradient-to-l from-blue-500 via-indigo-600 to-transparent rounded-l-[100%] blur-3xl opacity-60 origin-right" />
                
                {/* 2. Inner Ionic Stream (Cyan, Bright) */}
                <div className="absolute right-0 w-[250px] h-12 bg-gradient-to-l from-cyan-400 via-blue-500 to-transparent rounded-l-full blur-xl opacity-90 origin-right" />
                
                {/* 3. Core Fusion (White Hot, Intense) */}
                <div className="absolute right-[-10px] w-[120px] h-6 bg-gradient-to-l from-white via-cyan-200 to-transparent rounded-l-full blur-md opacity-100 shadow-[0_0_50px_rgba(255,255,255,0.8)] origin-right" />

                {/* 4. Shockwave Rings (Simulated with distinct gradients) */}
                <div className="absolute right-[40px] w-2 h-16 bg-white/30 blur-sm rounded-full transform skew-x-12" />
                <div className="absolute right-[80px] w-2 h-20 bg-white/20 blur-sm rounded-full transform skew-x-12" />
                <div className="absolute right-[120px] w-3 h-24 bg-white/10 blur-md rounded-full transform skew-x-12" />
             </div>
          </div>
        </div>
      
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white/30 animate-bounce z-30">
        Scroll Down
      </div>
    </div>
  );
};

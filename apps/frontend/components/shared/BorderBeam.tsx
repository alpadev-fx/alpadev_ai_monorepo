'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface BorderBeamProps {
  children: React.ReactNode;
  className?: string;
  duration?: number; // Animation duration in seconds
  borderWidth?: number; // Width of the glowing border
  colorFrom?: string; // Gradient Start (transparent usually, or a specific hue)
  colorTo?: string; // Gradient Peak (the beam color)
}

export const BorderBeamCard = ({
  children,
  className,
  duration = 8,
  borderWidth = 1.5,
  colorFrom = '#6366f1', // Indigo-500
  colorTo = '#a855f7', // Purple-500
}: BorderBeamProps) => {
  return (
    <div 
      className={cn(
        "relative overflow-hidden rounded-xl bg-neutral-900", // Default bg matches inner content usually
        className
      )}
    >
      {/* 
        The Spinning Gradient Layer 
        Positioned to be larger than the container so corners are covered during rotation.
        We center it absolutely.
      */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
            animate={{ rotate: 360 }}
            transition={{
                duration: duration,
                ease: "linear",
                repeat: Infinity,
            }}
            style={{
                width: '200%', // Ensure it covers the diagonal
                height: '200%',
                background: `conic-gradient(from 0deg at 50% 50%, transparent 0deg, transparent 60deg, ${colorFrom} 120deg, ${colorTo} 180deg, transparent 240deg, transparent 360deg)`,
            }}
            className="absolute z-0 opacity-60 blur-md" // Blur for the glow effect
        />
        {/* Sharp version for the actual line */}
         <motion.div
            animate={{ rotate: 360 }}
            transition={{
                duration: duration,
                ease: "linear",
                repeat: Infinity,
            }}
            style={{
                width: '200%', 
                height: '200%',
                background: `conic-gradient(from 0deg at 50% 50%, transparent 0deg, transparent 70deg, ${colorFrom} 100deg, ${colorTo} 180deg, transparent 220deg, transparent 360deg)`,
            }}
            className="absolute z-0" 
        />
      </div>

      {/* 
        Inner Content Mask 
        Sits on top of the gradient. 
        We use margin/inset to create the "border width".
      */}
      <div 
        className="relative z-10 h-full w-full rounded-xl bg-neutral-950"
        style={{ margin: borderWidth }} 
      >
        <div className="h-full w-full rounded-xl overflow-hidden">
             {children}
        </div>
      </div>
      
    </div>
  );
};

// --- Example Usage Component ---

export const PricingCardExample = () => {
    return (
        <div className="flex min-h-[400px] items-center justify-center bg-black p-8">
            <BorderBeamCard className="w-full max-w-sm">
                <div className="flex flex-col items-center p-8 text-center text-white">
                    <span className="mb-2 rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-medium text-indigo-400">
                        Most Popular
                    </span>
                    <h3 className="mb-2 text-3xl font-bold">Pro Plan</h3>
                    <div className="mb-6 text-5xl font-extrabold tracking-tight">
                        $29<span className="text-xl font-normal text-neutral-400">/mo</span>
                    </div>
                    
                    <ul className="mb-8 w-full space-y-3 text-left text-sm text-neutral-400">
                        <li className="flex items-center gap-2">
                            <span className="text-indigo-500">✓</span> Unlimited Projects
                        </li>
                        <li className="flex items-center gap-2">
                            <span className="text-indigo-500">✓</span> Analytics Dashboard
                        </li>
                        <li className="flex items-center gap-2">
                            <span className="text-indigo-500">✓</span> 24/7 Priority Support
                        </li>
                         <li className="flex items-center gap-2">
                            <span className="text-indigo-500">✓</span> AI Assistant Integration
                        </li>
                    </ul>

                    <button className="w-full rounded-lg bg-indigo-600 py-3 font-semibold text-white hover:bg-indigo-500 transition-colors">
                        Get Started
                    </button>
                </div>
            </BorderBeamCard>
        </div>
    );
}

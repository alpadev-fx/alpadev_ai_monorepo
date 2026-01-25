"use client";

import { SingularityShaders } from "@/app/_components/ui/SingularityShaders";
import { cn } from "@/lib/utils";

interface BlackHoleBackgroundProps {
  className?: string;
}

/**
 * BlackHoleBackground - The single, fixed "Golden Singularity" visual.
 * This component renders the SingularityShaders with a gold/orange color scheme
 * designed to be the sole background visual for the Hero section.
 */
export const BlackHoleBackground = ({ className }: BlackHoleBackgroundProps) => {
  return (
    <div className={cn("w-full h-full", className)}>
      <SingularityShaders
        color1="#FED8B1" // Gold / Peach accent
        color2="#000000" // Void Black
        speed={1.2}
        intensity={1.5}
        size={0.9}
        waveStrength={1.2}
        colorShift={1.0}
        rotation={0}
        className="w-full h-full"
      />
    </div>
  );
};

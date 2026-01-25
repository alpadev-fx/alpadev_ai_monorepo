"use client";

import React from "react";
import { cn } from "@heroui/theme";

export const LiveGradient = ({ className }: { className?: string }) => {
  return (
    <div className={cn("fixed inset-0 -z-50 overflow-hidden", className)}>
      <div className="absolute inset-0 bg-black" />
      <div
        className="absolute -top-[50%] -left-[50%] h-[200%] w-[200%] animate-spin-slow opacity-30 blur-[100px]"
        style={{
          background:
            "conic-gradient(from 0deg at 50% 50%, #FF0080 0deg, #7928CA 120deg, #FF0080 360deg)",
        }}
      />
      <div
        className="absolute top-[20%] left-[20%] h-[60%] w-[60%] animate-pulse-slow opacity-20 blur-[120px]"
        style={{
          background: "radial-gradient(circle, #0070F3 0%, transparent 70%)",
        }}
      />
      <div className="absolute inset-0 bg-noise opacity-[0.03]" />
    </div>
  );
};

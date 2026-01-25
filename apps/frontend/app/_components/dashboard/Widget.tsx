"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@heroui/theme";

interface WidgetProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

export const Widget = ({ title, children, className, delay = 0 }: WidgetProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-3xl border border-white/5 bg-white/5 p-6 backdrop-blur-2xl transition-all hover:bg-white/10",
        className
      )}
    >
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-medium text-zinc-400">{title}</h3>
      </div>
      <div className="relative z-10">{children}</div>
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
    </motion.div>
  );
};

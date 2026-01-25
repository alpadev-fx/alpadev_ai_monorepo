"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface CodeBlockProps {
  code: React.ReactNode;
  language?: string;
  filename?: string;
  highlightLines?: number[];
  className?: string;
}

export function CodeBlock({
  code,
  language,
  filename,
  highlightLines, // Ignoring for simplified version
  className,
}: CodeBlockProps) {
  return (
    <div
      className={cn(
        "relative rounded-md bg-[#15141b] font-mono text-sm shadow-[0_0_20px_rgba(162,119,255,0.1)]",
        className
      )}
    >
      {filename && (
        <div className="flex items-center justify-between px-4 py-2 text-xs text-[#edecee]/60">
          <span>{filename}</span>
          <span className="text-[#a277ff]">{language}</span>
        </div>
      )}
      <div className="p-4">
        <pre className="text-[#edecee] whitespace-pre-wrap">
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
}
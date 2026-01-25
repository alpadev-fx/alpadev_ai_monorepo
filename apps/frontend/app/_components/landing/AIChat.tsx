import React, { useState } from "react";

import ExperienceCards from "./ExperienceCards";
import PromptInputWithActions from "./PromptInputWithActions";

export default function AIChat() {
  const [navigatingTo, setNavigatingTo] = useState<string | null>(null);

  const handleSelection = (key: string) => {
    setNavigatingTo(key);
    // Simulate navigation
    setTimeout(() => {
        console.log(`Navigating to ${key}...`);
        // alert(`Initiating ${key} protocol...`); // Removed alert to avoid blocking
        setNavigatingTo(null);
    }, 1500);
  };

  const handlePromptSubmit = (prompt: string) => {
    const text = prompt.toLowerCase();
    
    if (text.includes("marketing") || text.includes("social") || text.includes("seo")) {
        handleSelection("marketing");
    } else if (text.includes("finance") || text.includes("finanzas") || text.includes("money") || text.includes("invert")) {
        handleSelection("finance");
    } else if (text.includes("software") || text.includes("code") || text.includes("app") || text.includes("web") || text.includes("development")) {
        handleSelection("software");
    } else {
        handleSelection("general");
    }
  };

  if (navigatingTo) {
      return (
          <div className="flex flex-col items-center justify-center gap-4 h-full animate-fade-in-bottom">
              <div className="w-16 h-16 border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
              <h2 className="text-2xl text-white font-medium">
                  Building {navigatingTo.charAt(0).toUpperCase() + navigatingTo.slice(1)} Experience...
              </h2>
          </div>
      );
  }

  return (
    <div className="flex w-full h-full max-w-full flex-col items-center justify-center gap-8 py-10 animate-fade-in-bottom">
      <div className="flex w-full flex-col items-center justify-center gap-4">
        <div className="flex flex-col items-center gap-2">
          <h1 className="text-white text-2xl md:text-3xl font-medium mt-2">How can I help you today?</h1>
        </div>
      </div>
      
      <ExperienceCards onSelection={handleSelection} />
      
      <div className="flex flex-col gap-2 w-full items-center px-4">
        <PromptInputWithActions onSubmit={handlePromptSubmit} />
        <p className="text-tiny text-white/40 px-2 text-center">
          On Shapers AI can make mistakes. Consider checking important information.
        </p>
      </div>
    </div>
  );
}

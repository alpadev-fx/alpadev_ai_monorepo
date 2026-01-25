"use client";

import React from "react";
import {Icon} from "@iconify/react";
import ExperienceCard from "./ExperienceCard";

const featuresCategories = [
  {
    key: "marketing",
    title: "Marketing",
    icon: <Icon icon="solar:megaphone-linear" width={40} className="text-white" />,
    descriptions: [
      "Digital Strategy & SEO",
      "Social Media Management",
      "Content Creation & AI",
    ],
  },
  {
    key: "finance",
    title: "Finance",
    icon: <Icon icon="solar:chart-2-linear" width={40} className="text-white" />,
    descriptions: [
      "Financial Planning",
      "Investment Strategies",
      "Risk Management",
    ],
  },
  {
    key: "software",
    title: "Software Development",
    icon: <Icon icon="solar:code-circle-linear" width={40} className="text-white" />,
    descriptions: [
      "Custom AI Solutions",
      "Web & Mobile Apps",
      "Cloud Infrastructure",
    ],
  },
  {
    key: "general",
    title: "General",
    icon: <Icon icon="solar:globus-linear" width={40} className="text-white" />,
    descriptions: [
      "Explore All Services",
      "Contact Support",
      "About On Shapers",
    ],
  },
];

export default function ExperienceCards({ onSelection }: { onSelection?: (key: string) => void }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 w-full max-w-6xl">
      {featuresCategories.map((category) => (
        <ExperienceCard
          key={category.key}
          descriptions={category.descriptions}
          icon={category.icon}
          title={category.title}
          onClick={() => onSelection?.(category.key)}
        />
      ))}
    </div>
  );
}

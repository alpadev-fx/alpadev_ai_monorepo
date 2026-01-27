"use client";

import type {CardProps} from "@heroui/react";

import React from "react";
import {Card as NextUICard, CardBody as NextUICardBody, CardHeader as NextUICardHeader} from "@heroui/react";

const Card = NextUICard as any;
const CardBody = NextUICardBody as any;
const CardHeader = NextUICardHeader as any;

export type ExperienceCardProps = CardProps & {
  title: string;
  descriptions: string[];
  icon: React.ReactNode;
  onClick?: () => void;
};

const ExperienceCard = React.forwardRef<HTMLDivElement, ExperienceCardProps>(
  ({title, descriptions = [], icon, onClick, ...props}, ref) => {
    return (
      <Card 
        ref={ref} 
        isPressable 
        onClick={onClick}
        className="bg-content2/50 backdrop-blur-md border border-white/10 h-full" 
        shadow="sm" 
        {...props}
      >
        <CardHeader className="flex flex-col gap-2 px-4 pt-6 pb-4 items-center text-center">
          {icon}
          <p className="text-medium text-white font-semibold">{title}</p>
        </CardHeader>
        <CardBody className="flex flex-col gap-2">
          {descriptions.map((description, index) => (
            <div
              key={index}
              className="rounded-medium bg-white/5 text-white/90 flex min-h-[50px] px-3 py-2 items-center justify-center text-center hover:bg-white/10 transition-colors cursor-pointer"
            >
              <p className="text-small">{description}</p>
            </div>
          ))}
        </CardBody>
      </Card>
    );
  },
);

ExperienceCard.displayName = "ExperienceCard";

export default ExperienceCard;

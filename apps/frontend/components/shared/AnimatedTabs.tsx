'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface TabItem {
  id: string;
  label: string;
}

interface AnimatedTabsProps {
  tabs: TabItem[];
  activeTabId: string;
  onTabChange: (id: string) => void;
  className?: string;
  layoutIdPrefix?: string; // To avoid conflicts if multiple tab groups exist on one page
}

export const AnimatedTabs = ({
  tabs,
  activeTabId,
  onTabChange,
  className,
  layoutIdPrefix = 'tabs',
}: AnimatedTabsProps) => {
  return (
    <div
      className={cn(
        "flex flex-row items-center justify-center rounded-full bg-neutral-100 p-1 dark:bg-neutral-900",
        className
      )}
    >
      {tabs.map((tab) => {
        const isActive = activeTabId === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "relative flex items-center justify-center rounded-full px-6 py-2 text-sm font-medium transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500",
              isActive ? "text-neutral-900 dark:text-white" : "text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
            )}
            style={{
                WebkitTapHighlightColor: "transparent",
            }}
          >
            {/* The Gliding Pill */}
            {isActive && (
              <motion.div
                layoutId={`${layoutIdPrefix}-pill`}
                className="absolute inset-0 z-0 rounded-full bg-white shadow-sm dark:bg-neutral-800"
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 30,
                }}
              />
            )}
            
            {/* Text Label (z-index higher than pill) */}
            <span className="relative z-10">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
};

// --- Usage Example: Pricing Toggle ---

export const PricingToggleExample = () => {
    const [billingCycle, setBillingCycle] = useState('monthly');

    const tabs = [
        { id: 'monthly', label: 'Monthly' },
        { id: 'yearly', label: 'Yearly (-20%)' },
    ];

    return (
        <div className="flex flex-col items-center justify-center space-y-8 bg-neutral-50 p-12 dark:bg-black">
            <h3 className="text-xl font-bold dark:text-white">Choose your plan</h3>
            
            <AnimatedTabs 
                tabs={tabs} 
                activeTabId={billingCycle} 
                onTabChange={setBillingCycle} 
            />

            <div className="text-center text-neutral-500">
                Selected: <span className="font-mono font-bold text-indigo-500">{billingCycle.toUpperCase()}</span>
            </div>
        </div>
    );
}

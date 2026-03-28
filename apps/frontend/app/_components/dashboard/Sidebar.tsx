"use client";

import React from "react";
import { cn } from "@heroui/theme";
import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HomeIcon,
  CreditCardIcon,
  DocumentTextIcon,
  BanknotesIcon,
  UserGroupIcon,
  ChatBubbleLeftRightIcon,
  ClipboardDocumentListIcon,
} from "@heroicons/react/24/outline";

const NAV_ITEMS = [
  { name: "Overview", href: "/dashboard", icon: HomeIcon },
  { name: "Prospects", href: "/dashboard/prospects", icon: ClipboardDocumentListIcon },
  { name: "Transactions", href: "/dashboard/transactions", icon: BanknotesIcon },
  { name: "Bills", href: "/dashboard/bills", icon: CreditCardIcon },
  { name: "Invoices", href: "/dashboard/invoices", icon: DocumentTextIcon },
  { name: "Team", href: "/dashboard/team", icon: UserGroupIcon },
  { name: "Live Chat", href: "/dashboard/chat", icon: ChatBubbleLeftRightIcon },
];

export const Sidebar = () => {
  const pathname = usePathname();

  return (
    <motion.aside 
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="fixed left-6 top-6 bottom-6 w-64 rounded-3xl border border-white/10 bg-black/20 backdrop-blur-xl"
      >
        <div className="flex h-full flex-col p-6">
          <div className="mb-10 flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-pink-500 to-violet-500" />
            <span className="text-xl font-bold tracking-tight">Open Manager</span>
          </div>

          <nav className="flex-1 space-y-2">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all",
                    isActive 
                      ? "bg-white/10 text-white" 
                      : "text-zinc-400 hover:bg-white/5 hover:text-white"
                  )}
                >
                  <Icon className={cn("h-5 w-5", isActive ? "text-pink-500" : "text-zinc-500 group-hover:text-pink-400")} />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto">
             <div className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/5 p-3">
                <div className="h-8 w-8 rounded-full bg-zinc-800" />
                <div className="flex flex-col">
                  <span className="text-sm font-medium">User</span>
                  <span className="text-xs text-zinc-500">Admin</span>
                </div>
             </div>
          </div>
        </div>
      </motion.aside>
  );
};

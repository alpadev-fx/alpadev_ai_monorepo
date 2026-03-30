"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import { motion } from "framer-motion"
import {
  ChartBarIcon,
  ClipboardDocumentListIcon,
  ServerStackIcon,
  ChevronLeftIcon,
  ArrowRightStartOnRectangleIcon,
} from "@heroicons/react/24/outline"

const NAV_ITEMS = [
  { name: "Metrics", href: "/dashboard", icon: ChartBarIcon },
  {
    name: "Prospects",
    href: "/dashboard/prospects",
    icon: ClipboardDocumentListIcon,
  },
  {
    name: "Infrastructure",
    href: "/dashboard/infrastructure",
    icon: ServerStackIcon,
  },
]

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
}

export const Sidebar = ({ collapsed, onToggle }: SidebarProps) => {
  const pathname = usePathname()
  const { data: session } = useSession()
  const user = session?.user

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard"
    return pathname?.startsWith(href)
  }

  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 280 }}
      transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
      className="fixed left-0 top-0 bottom-0 z-40 flex flex-col bg-[#1b1b1b] overflow-hidden"
    >
      {/* Logo */}
      <Link
        href="/"
        className="flex items-center gap-3 px-5 py-5 group"
      >
        <Image
          src="https://assets.alpadev.xyz/assets/logo.jpg"
          alt="Alpadev"
          width={36}
          height={36}
          className="shrink-0 rounded-xl"
          sizes="36px"
          priority
        />
        {!collapsed && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-lg font-bold tracking-tight text-white"
          >
            Alpadev
          </motion.span>
        )}
      </Link>

      {/* Navigation */}
      <nav className="flex-1 px-3 mt-2 space-y-1">
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.href)
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-200 ${
                active
                  ? "bg-white/[0.06] text-white"
                  : "text-zinc-500 hover:bg-white/[0.04] hover:text-zinc-300"
              } ${collapsed ? "justify-center" : ""}`}
              title={collapsed ? item.name : undefined}
            >
              <Icon
                className={`h-5 w-5 shrink-0 ${
                  active ? "text-[#ffb0cd]" : "text-zinc-600"
                }`}
              />
              {!collapsed && (
                <span className="text-sm font-medium">{item.name}</span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* User section */}
      <div className="px-3 pb-3 space-y-2">
        {/* User info */}
        <div
          className={`rounded-xl bg-white/[0.03] p-3 ${
            collapsed ? "flex justify-center" : ""
          }`}
        >
          <div className={`flex items-center gap-3 ${collapsed ? "" : ""}`}>
            {/* Avatar */}
            <div className="h-8 w-8 shrink-0 rounded-lg bg-gradient-to-br from-[#f751a1] to-[#8B5CF6] flex items-center justify-center">
              <span className="text-xs font-bold text-white">
                {user?.name?.[0]?.toUpperCase() || "U"}
              </span>
            </div>
            {!collapsed && (
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-white truncate">
                  {user?.name || "User"}
                </p>
                <p className="text-[11px] text-zinc-600 truncate">
                  {user?.email || ""}
                </p>
              </div>
            )}
          </div>
          {!collapsed && (
            <div className="mt-2.5 flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-wider font-medium bg-[#8B5CF6]/20 text-[#d0bcff] rounded-full px-2 py-0.5">
                {(user as { role?: string })?.role || "USER"}
              </span>
              <button
                className="flex items-center gap-1 text-[11px] text-zinc-600 hover:text-rose-400 transition-colors"
                onClick={() => signOut({ callbackUrl: "/login" })}
              >
                <ArrowRightStartOnRectangleIcon className="h-3.5 w-3.5" />
                Sign Out
              </button>
            </div>
          )}
        </div>

        {/* Collapse toggle */}
        <button
          className="w-full flex items-center justify-center rounded-xl py-2 text-zinc-600 hover:text-zinc-400 hover:bg-white/[0.04] transition-all"
          onClick={onToggle}
        >
          <ChevronLeftIcon
            className={`h-4 w-4 transition-transform duration-300 ${
              collapsed ? "rotate-180" : ""
            }`}
          />
        </button>
      </div>
    </motion.aside>
  )
}

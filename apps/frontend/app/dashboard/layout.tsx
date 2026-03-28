"use client"

import { useState } from "react"
import { Sidebar } from "@/app/_components/dashboard/Sidebar"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className="flex min-h-screen bg-[#0e0e0e] isolate">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      <main
        className={`flex-1 transition-all duration-300 ease-out p-8 ${
          collapsed ? "ml-[72px]" : "ml-[280px]"
        }`}
      >
        {children}
      </main>
    </div>
  )
}

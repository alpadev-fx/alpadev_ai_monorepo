"use client"

import { useEffect, useState } from "react"
import { Sidebar } from "@/app/_components/dashboard/Sidebar"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => {
    const small = window.matchMedia("(max-width: 767px)")
    const update = () => setCollapsed(small.matches)
    update()
    small.addEventListener("change", update)
    return () => small.removeEventListener("change", update)
  }, [])

  return (
    <div className="flex min-h-screen bg-[#131313] isolate">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      <main
        className={`flex-1 transition-all duration-300 ease-out ml-[72px] p-4 md:p-8 overflow-hidden h-screen ${
          collapsed ? "md:ml-[72px]" : "md:ml-[280px]"
        }`}
      >
        {children}
      </main>
    </div>
  )
}

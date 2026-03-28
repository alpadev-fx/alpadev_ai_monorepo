"use client"

import { usePathname } from "next/navigation"
import Navbar from "./landing/Navbar"
import Footer from "./landing/Footer"
import ChatWidget from "@/components/chat/ChatWidget"

export function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isDashboard = pathname?.startsWith("/dashboard") || pathname?.startsWith("/login")

  if (isDashboard) return <>{children}</>

  return (
    <>
      <Navbar />
      <main className="w-full flex-grow">{children}</main>
      <ChatWidget />
      <Footer />
    </>
  )
}

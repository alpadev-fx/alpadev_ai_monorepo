import React from "react";
import { LiveGradient } from "../_components/ui/LiveGradient";
import { Sidebar } from "../_components/dashboard/Sidebar";

export const metadata = {
  title: "Open Manager | Dashboard",
  description: "Antigravity Open Manager Platform",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen font-sans text-white selection:bg-pink-500/30">
      <LiveGradient className="opacity-80" />
      
      <Sidebar />

      {/* Main Content */}
      <main className="pl-80 pr-8 pt-8 pb-8">
        {children}
      </main>
    </div>
  );
}

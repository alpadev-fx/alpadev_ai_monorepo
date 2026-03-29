"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { ServerIcon, AdjustmentsHorizontalIcon, CalculatorIcon, BellAlertIcon } from "@heroicons/react/24/outline"
import { MetricsOverview } from "./_components/MetricsOverview"
import { ScalingControls } from "./_components/ScalingControls"
import { CostSimulator } from "./_components/CostSimulator"
import { AlertsBudget } from "./_components/AlertsBudget"

const TABS = [
  { id: "overview" as const, label: "Metrics", icon: ServerIcon },
  { id: "scaling" as const, label: "Scaling", icon: AdjustmentsHorizontalIcon },
  { id: "simulator" as const, label: "Cost Simulator", icon: CalculatorIcon },
  { id: "alerts" as const, label: "Alerts", icon: BellAlertIcon },
]

type TabId = (typeof TABS)[number]["id"]

export default function InfrastructurePage() {
  const [tab, setTab] = useState<TabId>("overview")

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 h-full overflow-y-auto"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            GCP Infrastructure
          </h1>
          <p className="mt-0.5 text-xs text-zinc-500">
            alpadev-ai-prod &middot; us-central1
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-xl bg-[#161616] p-1 w-fit">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
              tab === t.id
                ? "bg-white/[0.08] text-white"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            <t.icon className="h-4 w-4" />
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {tab === "overview" && <MetricsOverview />}
      {tab === "scaling" && <ScalingControls />}
      {tab === "simulator" && <CostSimulator />}
      {tab === "alerts" && <AlertsBudget />}
    </motion.div>
  )
}

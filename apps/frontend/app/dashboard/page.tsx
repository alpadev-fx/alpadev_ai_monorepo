"use client"

import { api } from "@/lib/trpc/react"
import { motion } from "framer-motion"
import {
  UsersIcon,
  ChartBarIcon,
  CheckBadgeIcon,
  GlobeAltIcon,
} from "@heroicons/react/24/outline"

export default function DashboardPage() {
  const { data, isLoading } = api.prospect.getAll.useQuery({
    page: 1,
    pageSize: 50000,
    sortBy: "createdAt",
    sortOrder: "desc",
  })

  const prospects = data?.items ?? []
  const total = data?.pagination.total ?? 0

  const avgScore =
    prospects.length > 0
      ? (prospects.reduce((sum, p) => sum + p.score, 0) / prospects.length).toFixed(1)
      : "0"
  const verified = prospects.filter((p) => p.verified).length
  const withWebsite = prospects.filter((p) => p.sitioWeb).length

  // Niche distribution (top 10)
  const nicheCount: Record<string, number> = {}
  prospects.forEach((p) => {
    nicheCount[p.nicho] = (nicheCount[p.nicho] || 0) + 1
  })
  const topNiches = Object.entries(nicheCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
  const maxNicheCount = topNiches[0]?.[1] || 1

  // Score distribution
  const scoreDistribution = Array.from({ length: 11 }, (_, i) => ({
    score: i,
    count: prospects.filter((p) => p.score === i).length,
  }))

  // Web status distribution
  const webStatusCount = {
    none: prospects.filter((p) => p.webStatus === "none").length,
    basic: prospects.filter((p) => p.webStatus === "basic").length,
    poor: prospects.filter((p) => p.webStatus === "poor").length,
  }

  // Top cities
  const cityCount: Record<string, number> = {}
  prospects.forEach((p) => {
    cityCount[p.ciudad] = (cityCount[p.ciudad] || 0) + 1
  })
  const topCities = Object.entries(cityCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)

  const recent = prospects.slice(0, 5)

  const kpis = [
    { label: "Total Prospects", value: total.toLocaleString(), icon: UsersIcon, color: "text-[#ffb0cd]", bg: "bg-[#ffb0cd]/10" },
    { label: "Avg Score", value: avgScore, icon: ChartBarIcon, color: "text-[#d0bcff]", bg: "bg-[#d0bcff]/10" },
    { label: "Verified", value: verified.toLocaleString(), icon: CheckBadgeIcon, color: "text-emerald-400", bg: "bg-emerald-400/10" },
    { label: "With Website", value: withWebsite.toLocaleString(), icon: GlobeAltIcon, color: "text-amber-400", bg: "bg-amber-400/10" },
  ]

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="h-9 w-48 rounded-lg bg-white/[0.04] animate-pulse" />
        <div className="grid grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 rounded-2xl bg-white/[0.03] animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-2 gap-6">
          <div className="h-80 rounded-2xl bg-white/[0.03] animate-pulse" />
          <div className="h-80 rounded-2xl bg-white/[0.03] animate-pulse" />
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-8"
    >
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">Dashboard</h1>
        <p className="mt-1 text-sm text-zinc-500">Overview of your business prospects</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, i) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.08 }}
            className="rounded-2xl bg-white/[0.03] backdrop-blur-md p-6 hover:bg-white/[0.05] transition-colors"
          >
            <div className={`rounded-xl ${kpi.bg} p-2.5 w-fit mb-4`}>
              <kpi.icon className={`h-5 w-5 ${kpi.color}`} />
            </div>
            <p className="text-3xl font-bold tracking-tight text-white">{kpi.value}</p>
            <p className="mt-1 text-sm text-zinc-500">{kpi.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Niche bar chart */}
        <div className="rounded-2xl bg-white/[0.03] backdrop-blur-md p-6">
          <h3 className="text-sm font-medium text-zinc-400 mb-6">Prospects by Niche</h3>
          <div className="space-y-3">
            {topNiches.map(([niche, count]) => (
              <div key={niche} className="flex items-center gap-3">
                <span className="text-xs text-zinc-500 w-32 truncate text-right">{niche}</span>
                <div className="flex-1 h-5 rounded-full bg-white/[0.03] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#f751a1] to-[#ffb0cd]"
                    style={{ width: `${(count / maxNicheCount) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-zinc-600 w-10 text-right">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Score distribution */}
        <div className="rounded-2xl bg-white/[0.03] backdrop-blur-md p-6">
          <h3 className="text-sm font-medium text-zinc-400 mb-6">Score Distribution</h3>
          <div className="flex items-end justify-between gap-1.5 h-48">
            {scoreDistribution.map(({ score, count }) => {
              const maxCount = Math.max(...scoreDistribution.map((s) => s.count), 1)
              const height = (count / maxCount) * 100
              const color =
                score >= 8
                  ? "from-emerald-500 to-emerald-400"
                  : score >= 6
                    ? "from-amber-500 to-amber-400"
                    : "from-rose-500 to-rose-400"
              return (
                <div key={score} className="flex-1 flex flex-col items-center gap-1.5">
                  <span className="text-[10px] text-zinc-600">{count || ""}</span>
                  <div className="w-full relative" style={{ height: "100%" }}>
                    <div
                      className={`absolute bottom-0 w-full rounded-t-lg bg-gradient-to-t ${color}`}
                      style={{ height: `${Math.max(height, 2)}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-zinc-500">{score}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Web Status */}
        <div className="rounded-2xl bg-white/[0.03] backdrop-blur-md p-6">
          <h3 className="text-sm font-medium text-zinc-400 mb-4">Web Status</h3>
          <div className="space-y-4">
            {Object.entries(webStatusCount).map(([status, count]) => {
              const pct = total > 0 ? ((count / total) * 100).toFixed(0) : 0
              const colors: Record<string, string> = {
                none: "from-rose-500 to-rose-400",
                basic: "from-amber-500 to-amber-400",
                poor: "from-orange-500 to-orange-400",
              }
              return (
                <div key={status}>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-zinc-400 capitalize">{status}</span>
                    <span className="text-zinc-600">{count} ({pct}%)</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-white/[0.03]">
                    <div className={`h-full rounded-full bg-gradient-to-r ${colors[status]}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Top Cities */}
        <div className="rounded-2xl bg-white/[0.03] backdrop-blur-md p-6">
          <h3 className="text-sm font-medium text-zinc-400 mb-4">Top Cities</h3>
          <div className="space-y-2.5">
            {topCities.map(([city, count], i) => (
              <div key={city} className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="text-[10px] text-zinc-600 w-4">{i + 1}</span>
                  <span className="text-sm text-zinc-300">{city}</span>
                </div>
                <span className="text-xs text-zinc-600">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent */}
        <div className="rounded-2xl bg-white/[0.03] backdrop-blur-md p-6">
          <h3 className="text-sm font-medium text-zinc-400 mb-4">Recent Prospects</h3>
          <div className="space-y-3">
            {recent.map((p) => (
              <div key={p.id} className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-white truncate">{p.nombre}</p>
                  <p className="text-[11px] text-zinc-600">{p.nicho}</p>
                </div>
                <span
                  className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    p.score >= 8
                      ? "bg-emerald-500/20 text-emerald-400"
                      : p.score >= 6
                        ? "bg-amber-500/20 text-amber-400"
                        : "bg-rose-500/20 text-rose-400"
                  }`}
                >
                  {p.score}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

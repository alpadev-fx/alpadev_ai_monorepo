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
  const { data, isLoading } = api.prospect.metrics.useQuery(undefined, {
    staleTime: 2 * 60_000,
    refetchOnWindowFocus: false,
  })

  if (isLoading || !data) {
    return (
      <div className="space-y-8">
        <div className="h-8 w-48 rounded-lg bg-white/[0.04] animate-pulse" />
        <div className="grid grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 rounded-2xl bg-[#161616] animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-2 gap-6">
          <div className="h-72 rounded-2xl bg-[#161616] animate-pulse" />
          <div className="h-72 rounded-2xl bg-[#161616] animate-pulse" />
        </div>
      </div>
    )
  }

  const maxNiche = data.topNiches[0]?.count || 1
  const maxScore = Math.max(...data.scoreDistribution.map((s) => s.count), 1)

  const kpis = [
    { label: "Total Prospects", value: data.total.toLocaleString(), icon: UsersIcon, color: "text-[#ffb0cd]", bg: "bg-[#ffb0cd]/10" },
    { label: "Avg Score", value: data.avgScore.toFixed(1), icon: ChartBarIcon, color: "text-[#d0bcff]", bg: "bg-[#d0bcff]/10" },
    { label: "Verified", value: data.verified.toLocaleString(), icon: CheckBadgeIcon, color: "text-emerald-400", bg: "bg-emerald-400/10" },
    { label: "With Website", value: data.withWebsite.toLocaleString(), icon: GlobeAltIcon, color: "text-amber-400", bg: "bg-amber-400/10" },
  ]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-8"
    >
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Dashboard</h1>
        <p className="mt-0.5 text-xs text-zinc-500">Overview of your business prospects</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        {kpis.map((kpi, i) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: i * 0.06 }}
            className="rounded-2xl bg-[#161616] p-5 hover:bg-[#1a1a1a] transition-colors"
          >
            <div className={`rounded-xl ${kpi.bg} p-2 w-fit mb-3`}>
              <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
            </div>
            <p className="text-2xl font-bold tracking-tight text-white">{kpi.value}</p>
            <p className="mt-0.5 text-xs text-zinc-500">{kpi.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Niche bar chart */}
        <div className="rounded-2xl bg-[#161616] p-5">
          <h3 className="text-xs font-medium text-zinc-400 mb-5 uppercase tracking-wider">Prospects by Niche</h3>
          <div className="space-y-2.5">
            {data.topNiches.map(({ nicho, count }) => (
              <div key={nicho} className="flex items-center gap-3">
                <span className="text-[11px] text-zinc-500 w-28 truncate text-right">{nicho}</span>
                <div className="flex-1 h-5 rounded-full bg-white/[0.03] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#f751a1] to-[#ffb0cd]"
                    style={{ width: `${(count / maxNiche) * 100}%` }}
                  />
                </div>
                <span className="text-[11px] text-zinc-600 w-8 text-right">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Score Distribution — premium horizontal bars */}
        <div className="rounded-2xl bg-[#161616] p-5">
          <h3 className="text-xs font-medium text-zinc-400 mb-5 uppercase tracking-wider">Score Distribution</h3>
          <div className="space-y-2">
            {data.scoreDistribution
              .filter((s) => s.count > 0)
              .map(({ score, count }) => {
                const pct = (count / maxScore) * 100
                const gradient =
                  score >= 8
                    ? "from-emerald-600 to-emerald-400"
                    : score >= 6
                      ? "from-amber-600 to-amber-400"
                      : "from-rose-600 to-rose-400"
                const glow =
                  score >= 8
                    ? "shadow-emerald-500/20"
                    : score >= 6
                      ? "shadow-amber-500/20"
                      : "shadow-rose-500/20"
                return (
                  <div key={score} className="flex items-center gap-3">
                    <span className="text-sm font-bold text-zinc-300 w-5 text-right">{score}</span>
                    <div className="flex-1 h-6 rounded-full bg-white/[0.03] overflow-hidden">
                      <div
                        className={`h-full rounded-full bg-gradient-to-r ${gradient} shadow-lg ${glow}`}
                        style={{ width: `${Math.max(pct, 3)}%` }}
                      />
                    </div>
                    <span className="text-[11px] text-zinc-500 w-12 text-right">{count.toLocaleString()}</span>
                  </div>
                )
              })}
          </div>
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Web Status */}
        <div className="rounded-2xl bg-[#161616] p-5">
          <h3 className="text-xs font-medium text-zinc-400 mb-4 uppercase tracking-wider">Web Status</h3>
          <div className="space-y-3">
            {data.webStatus.map(({ status, count }) => {
              const pct = data.total > 0 ? ((count / data.total) * 100).toFixed(0) : 0
              const colors: Record<string, string> = {
                none: "from-rose-600 to-rose-400",
                basic: "from-amber-600 to-amber-400",
                poor: "from-orange-600 to-orange-400",
              }
              return (
                <div key={status}>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-zinc-400 capitalize">{status}</span>
                    <span className="text-zinc-600">{count.toLocaleString()} ({pct}%)</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-white/[0.03]">
                    <div className={`h-full rounded-full bg-gradient-to-r ${colors[status] || colors.none}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Top Cities */}
        <div className="rounded-2xl bg-[#161616] p-5">
          <h3 className="text-xs font-medium text-zinc-400 mb-4 uppercase tracking-wider">Top Cities</h3>
          <div className="space-y-2">
            {data.topCities.map(({ city, count }, i) => (
              <div key={city} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-zinc-700 w-3">{i + 1}</span>
                  <span className="text-[13px] text-zinc-300">{city}</span>
                </div>
                <span className="text-[11px] text-zinc-600">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent */}
        <div className="rounded-2xl bg-[#161616] p-5">
          <h3 className="text-xs font-medium text-zinc-400 mb-4 uppercase tracking-wider">Recent Prospects</h3>
          <div className="space-y-2.5">
            {data.recent.map((p) => (
              <div key={p.id} className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] text-white truncate">{p.nombre}</p>
                  <p className="text-[10px] text-zinc-600">{p.nicho}</p>
                </div>
                <span
                  className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
                    p.score >= 8
                      ? "bg-emerald-500/15 text-emerald-400"
                      : p.score >= 6
                        ? "bg-amber-500/15 text-amber-400"
                        : "bg-rose-500/15 text-rose-400"
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

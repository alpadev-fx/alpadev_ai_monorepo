"use client"

import { useState } from "react"
import { api } from "@/lib/trpc/react"
import { motion, AnimatePresence } from "framer-motion"
import {
  ClockIcon,
  UsersIcon,
  BoltIcon,
  TrophyIcon,
  ArrowTrendingUpIcon,
  EyeIcon,
} from "@heroicons/react/24/outline"

const LEAD_STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  NEW: { bg: "bg-zinc-500/15", text: "text-zinc-400" },
  CONTACTED: { bg: "bg-blue-500/15", text: "text-blue-400" },
  QUALIFIED: { bg: "bg-cyan-500/15", text: "text-cyan-400" },
  PROPOSAL: { bg: "bg-amber-500/15", text: "text-amber-400" },
  NEGOTIATION: { bg: "bg-orange-500/15", text: "text-orange-400" },
  WON: { bg: "bg-emerald-500/15", text: "text-emerald-400" },
  LOST: { bg: "bg-rose-500/15", text: "text-rose-400" },
}

const METHOD_COLORS: Record<string, string> = {
  query: "bg-blue-500/15 text-blue-400",
  mutation: "bg-amber-500/15 text-amber-400",
}

function timeAgo(date: Date | string) {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  if (seconds < 60) return `${seconds}s ago`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

type TabType = "performance" | "activity"

export default function ActivityPage() {
  const [tab, setTab] = useState<TabType>("performance")
  const [selectedVendor, setSelectedVendor] = useState<string>("")
  const [resourceFilter, setResourceFilter] = useState<string>("")
  const [page, setPage] = useState(1)
  const [expandedVendor, setExpandedVendor] = useState<string | null>(null)

  const { data: vendors } = api.activity.listVendors.useQuery(undefined, { retry: false })
  const users = vendors ?? []

  const { data: performance, isLoading: perfLoading } = api.activity.vendorPerformance.useQuery(
    { userId: selectedVendor || undefined },
    { refetchInterval: 30_000 }
  )

  const { data: dashboard } = api.activity.dashboard.useQuery(undefined, { refetchInterval: 30_000 })

  const { data: feed, isLoading: feedLoading } = api.activity.getAll.useQuery(
    { resource: resourceFilter || undefined, userId: selectedVendor || undefined, page, pageSize: 25 },
    { enabled: tab === "activity", refetchInterval: 15_000 }
  )

  const pipelineTotal = performance?.pipeline.reduce((sum, p) => sum + p.count, 0) ?? 0
  const wonCount = performance?.pipeline.find((p) => p.status === "WON")?.count ?? 0
  const conversionRate = pipelineTotal > 0 ? ((wonCount / pipelineTotal) * 100).toFixed(1) : "0.0"

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 h-full overflow-y-auto"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Vendor Tracking</h1>
          <p className="mt-0.5 text-xs text-zinc-500">Lead pipeline, recruitment metrics, and full activity log</p>
        </div>
        <select
          value={selectedVendor}
          onChange={(e) => { setSelectedVendor(e.target.value); setPage(1) }}
          className="rounded-xl bg-[#161616] border border-white/[0.06] px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#f751a1]"
        >
          <option value="">All vendors</option>
          {users.map((u: { id: string; name: string }) => (
            <option key={u.id} value={u.id}>{u.name}</option>
          ))}
        </select>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          { label: "Total Leads", value: pipelineTotal, icon: UsersIcon, color: "text-[#ffb0cd]", bg: "bg-[#ffb0cd]/10" },
          { label: "Won", value: wonCount, icon: TrophyIcon, color: "text-emerald-400", bg: "bg-emerald-400/10" },
          { label: "Conversion Rate", value: `${conversionRate}%`, icon: ArrowTrendingUpIcon, color: "text-[#d0bcff]", bg: "bg-[#d0bcff]/10" },
          { label: "Actions Today", value: dashboard?.actionsToday ?? 0, icon: BoltIcon, color: "text-amber-400", bg: "bg-amber-400/10" },
        ].map((kpi, i) => (
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

      {/* Tabs */}
      <div className="flex gap-1 bg-[#161616] rounded-xl p-1 w-fit">
        {(["performance", "activity"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-lg px-4 py-1.5 text-xs font-medium transition-all ${
              tab === t ? "bg-white/[0.08] text-white" : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            {t === "performance" ? "Performance" : "Activity Log"}
          </button>
        ))}
      </div>

      {/* PERFORMANCE TAB */}
      {tab === "performance" && (
        <div className="space-y-6">
          {/* Lead Pipeline */}
          <div className="rounded-2xl bg-[#161616] p-5">
            <h3 className="text-xs font-medium text-zinc-400 mb-4 uppercase tracking-wider">Lead Pipeline</h3>
            <div className="flex gap-2">
              {(["NEW", "CONTACTED", "QUALIFIED", "PROPOSAL", "NEGOTIATION", "WON", "LOST"] as const).map((status) => {
                const count = performance?.pipeline.find((p) => p.status === status)?.count ?? 0
                const colors = LEAD_STATUS_COLORS[status]
                const pct = pipelineTotal > 0 ? (count / pipelineTotal) * 100 : 0
                return (
                  <div key={status} className="flex-1 text-center">
                    <div className={`rounded-xl ${colors.bg} p-3 mb-2`}>
                      <p className={`text-xl font-bold ${colors.text}`}>{count}</p>
                    </div>
                    <p className="text-[10px] text-zinc-500 uppercase">{status}</p>
                    <p className="text-[9px] text-zinc-700">{pct.toFixed(0)}%</p>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Activity Trend */}
          {performance?.dailyTrend && (
            <div className="rounded-2xl bg-[#161616] p-5">
              <h3 className="text-xs font-medium text-zinc-400 mb-4 uppercase tracking-wider">Activity Trend (7 days)</h3>
              <div className="flex items-end gap-2 h-24">
                {performance.dailyTrend.map((day) => {
                  const maxCount = Math.max(...performance.dailyTrend.map((d) => d.count), 1)
                  const height = (day.count / maxCount) * 100
                  return (
                    <div key={day.date} className="flex-1 flex flex-col items-center gap-1">
                      <span className="text-[10px] text-zinc-500">{day.count}</span>
                      <div className="w-full rounded-t-md bg-gradient-to-t from-[#f751a1] to-[#ffb0cd]" style={{ height: `${Math.max(height, 4)}%` }} />
                      <span className="text-[9px] text-zinc-700">{day.date.slice(5)}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Vendor Cards */}
          <div className="space-y-3">
            <h3 className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Vendor Breakdown</h3>
            {perfLoading ? (
              <div className="space-y-3">
                {[1, 2].map((i) => <div key={i} className="h-24 rounded-2xl bg-[#161616] animate-pulse" />)}
              </div>
            ) : !performance?.vendors.length ? (
              <div className="rounded-2xl bg-[#161616] p-8 text-center">
                <UsersIcon className="h-8 w-8 text-zinc-700 mx-auto mb-2" />
                <p className="text-sm text-zinc-500">No vendors with assigned leads</p>
              </div>
            ) : (
              performance.vendors.map((v, i) => (
                <motion.div
                  key={v.vendor.id}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="rounded-2xl bg-[#161616] overflow-hidden"
                >
                  <button
                    onClick={() => setExpandedVendor(expandedVendor === v.vendor.id ? null : v.vendor.id)}
                    className="w-full px-5 py-4 flex items-center justify-between hover:bg-[#1a1a1a] transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-[#f751a1] to-[#8B5CF6] flex items-center justify-center shrink-0">
                        <span className="text-xs font-bold text-white">{v.vendor.name[0]}</span>
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-medium text-white">{v.vendor.name}</p>
                        <p className="text-[10px] text-zinc-600">{v.vendor.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right"><p className="text-xs text-zinc-500">Leads</p><p className="text-sm font-bold text-white">{v.total}</p></div>
                      <div className="text-right"><p className="text-xs text-zinc-500">Won</p><p className="text-sm font-bold text-emerald-400">{v.won}</p></div>
                      <div className="text-right"><p className="text-xs text-zinc-500">Lost</p><p className="text-sm font-bold text-rose-400">{v.lost}</p></div>
                      <div className="text-right"><p className="text-xs text-zinc-500">Rate</p><p className={`text-sm font-bold ${v.conversionRate >= 30 ? "text-emerald-400" : v.conversionRate >= 15 ? "text-amber-400" : "text-rose-400"}`}>{v.conversionRate}%</p></div>
                      <EyeIcon className="h-4 w-4 text-zinc-600" />
                    </div>
                  </button>

                  <AnimatePresence>
                    {expandedVendor === v.vendor.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t border-white/[0.04] overflow-hidden"
                      >
                        <div className="px-5 py-4 space-y-4">
                          {/* Mini pipeline */}
                          <div className="flex gap-2">
                            {(["NEW", "CONTACTED", "QUALIFIED", "PROPOSAL", "NEGOTIATION", "WON", "LOST"] as const).map((status) => {
                              const count = v.pipeline.find((p) => p.status === status)?.count ?? 0
                              const colors = LEAD_STATUS_COLORS[status]
                              return (
                                <div key={status} className="flex-1 text-center">
                                  <span className={`text-sm font-bold ${colors.text}`}>{count}</span>
                                  <p className="text-[9px] text-zinc-600 uppercase">{status}</p>
                                </div>
                              )
                            })}
                          </div>

                          {/* Full metadata activity */}
                          <div>
                            <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-2">Recent Activity (full metadata)</p>
                            <div className="space-y-1.5">
                              {v.recentActivity.map((act, j) => (
                                <div key={j} className="rounded-lg bg-white/[0.02] px-3 py-2 space-y-1">
                                  <div className="flex items-center gap-2 text-[11px]">
                                    <span className="text-zinc-600 w-14 shrink-0">{timeAgo(act.createdAt)}</span>
                                    <span className="text-[#ffb0cd] font-medium">{act.action}</span>
                                    {act.duration != null && <span className="text-zinc-700">{act.duration}ms</span>}
                                    {!act.success && <span className="text-rose-400 font-medium">FAILED</span>}
                                  </div>
                                  <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-[10px] text-zinc-700 ml-[60px]">
                                    {act.ipAddress && <span>IP: {act.ipAddress}</span>}
                                    {act.userAgent && <span className="truncate max-w-[300px]" title={act.userAgent}>UA: {act.userAgent}</span>}
                                    {act.details && typeof act.details === "object" && Object.keys(act.details as object).length > 0 && (
                                      <span className="text-zinc-600 break-all">Input: {JSON.stringify(act.details)}</span>
                                    )}
                                  </div>
                                </div>
                              ))}
                              {!v.recentActivity.length && <p className="text-zinc-600 text-xs">No recent activity</p>}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ACTIVITY LOG TAB */}
      {tab === "activity" && (
        <div className="space-y-4">
          <select
            value={resourceFilter}
            onChange={(e) => { setResourceFilter(e.target.value); setPage(1) }}
            className="rounded-xl bg-[#161616] border border-white/[0.06] px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#f751a1]"
          >
            <option value="">All resources</option>
            {["prospect", "invoice", "booking", "bill", "transaction"].map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>

          <div className="rounded-2xl bg-[#161616] overflow-hidden">
            <div className="px-5 py-4 border-b border-white/[0.04]">
              <h3 className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
                Full Activity Log ({feed?.pagination.total ?? 0} events)
              </h3>
            </div>
            {feedLoading ? (
              <div className="p-8 text-center"><div className="h-6 w-6 border-2 border-[#f751a1] border-t-transparent rounded-full animate-spin mx-auto" /></div>
            ) : !feed?.items.length ? (
              <div className="px-5 py-12 text-center">
                <ClockIcon className="h-8 w-8 text-zinc-700 mx-auto mb-2" />
                <p className="text-sm text-zinc-500">No activity recorded</p>
              </div>
            ) : (
              <>
                <div className="divide-y divide-white/[0.04]">
                  {feed.items.map((entry, i) => (
                    <motion.div key={entry.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }} className="px-5 py-3 hover:bg-white/[0.02] transition-colors">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="text-[10px] text-zinc-600 w-14 shrink-0">{timeAgo(entry.createdAt)}</span>
                        <span className="text-xs text-white font-medium">{entry.user.name}</span>
                        <span className={`text-[10px] font-medium rounded-md px-2 py-0.5 ${METHOD_COLORS[entry.method] ?? "bg-zinc-800 text-zinc-400"}`}>{entry.method}</span>
                        <span className="text-xs text-[#ffb0cd]">{entry.action}</span>
                        {!entry.success && <span className="text-[10px] bg-rose-500/15 text-rose-400 rounded-md px-2 py-0.5">failed</span>}
                        {entry.duration != null && <span className="text-[10px] text-zinc-700">{entry.duration}ms</span>}
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-0.5 ml-[68px] text-[10px] text-zinc-700">
                        {entry.resourceId && <span>ID: {entry.resourceId}</span>}
                        {entry.ipAddress && <span>IP: {entry.ipAddress}</span>}
                        {entry.userAgent && <span className="truncate max-w-[250px]">UA: {entry.userAgent}</span>}
                        {entry.details && typeof entry.details === "object" && Object.keys(entry.details as object).length > 0 && (
                          <span className="text-zinc-600 break-all max-w-[500px]">Input: {JSON.stringify(entry.details)}</span>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
                {feed.pagination.totalPages > 1 && (
                  <div className="px-5 py-3 border-t border-white/[0.04] flex items-center justify-between">
                    <span className="text-[11px] text-zinc-600">Page {feed.pagination.page} of {feed.pagination.totalPages}</span>
                    <div className="flex gap-2">
                      <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1} className="rounded-lg px-3 py-1 text-xs text-zinc-400 hover:text-white hover:bg-white/[0.04] disabled:opacity-30 transition-colors">Previous</button>
                      <button onClick={() => setPage((p) => Math.min(feed.pagination.totalPages, p + 1))} disabled={page >= feed.pagination.totalPages} className="rounded-lg px-3 py-1 text-xs text-zinc-400 hover:text-white hover:bg-white/[0.04] disabled:opacity-30 transition-colors">Next</button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </motion.div>
  )
}

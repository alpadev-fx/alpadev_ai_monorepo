"use client"

import { useState } from "react"
import { api } from "@/lib/trpc/react"
import { motion } from "framer-motion"
import {
  ClockIcon,
  UsersIcon,
  BoltIcon,
  ChartBarIcon,
  FunnelIcon,
} from "@heroicons/react/24/outline"

const RESOURCES = ["prospect", "invoice", "booking", "bill", "transaction"] as const

const METHOD_COLORS: Record<string, string> = {
  query: "bg-blue-500/15 text-blue-400",
  mutation: "bg-amber-500/15 text-amber-400",
}

const RESOURCE_COLORS: Record<string, string> = {
  prospect: "bg-[#ffb0cd]/15 text-[#ffb0cd]",
  invoice: "bg-[#d0bcff]/15 text-[#d0bcff]",
  booking: "bg-emerald-500/15 text-emerald-400",
  bill: "bg-amber-500/15 text-amber-400",
  transaction: "bg-cyan-500/15 text-cyan-400",
}

function timeAgo(date: Date) {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  if (seconds < 60) return `${seconds}s ago`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

export default function ActivityPage() {
  const [resourceFilter, setResourceFilter] = useState<string>("")
  const [selectedVendor, setSelectedVendor] = useState<string>("")
  const [page, setPage] = useState(1)

  const { data: dashboard, isLoading: dashLoading } = api.activity.dashboard.useQuery(undefined, {
    refetchInterval: 30_000,
  })

  const { data: feed, isLoading: feedLoading } = api.activity.getAll.useQuery({
    resource: resourceFilter || undefined,
    userId: selectedVendor || undefined,
    page,
    pageSize: 25,
  }, {
    refetchInterval: 15_000,
  })

  const { data: usersData } = api.admin.users.list.useQuery({ page: 1, limit: 100 }, { retry: false })
  const users = usersData?.users ?? []

  const vendorStats = api.activity.vendorStats.useQuery(
    { userId: selectedVendor },
    { enabled: !!selectedVendor }
  )

  if (dashLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 rounded-lg bg-white/[0.04] animate-pulse" />
        <div className="grid grid-cols-4 gap-5">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 rounded-2xl bg-[#161616] animate-pulse" />
          ))}
        </div>
        <div className="h-96 rounded-2xl bg-[#161616] animate-pulse" />
      </div>
    )
  }

  const kpis = [
    { label: "Actions Today", value: dashboard?.actionsToday ?? 0, icon: BoltIcon, color: "text-[#ffb0cd]", bg: "bg-[#ffb0cd]/10" },
    { label: "Active Vendors", value: dashboard?.activeVendorsToday ?? 0, icon: UsersIcon, color: "text-[#d0bcff]", bg: "bg-[#d0bcff]/10" },
    {
      label: "Most Active",
      value: dashboard?.topVendors?.[0]?.user.name ?? "—",
      icon: ChartBarIcon,
      color: "text-emerald-400",
      bg: "bg-emerald-400/10",
    },
    {
      label: "Top Resource",
      value: dashboard?.topResources?.[0]?.resource ?? "—",
      icon: FunnelIcon,
      color: "text-amber-400",
      bg: "bg-amber-400/10",
    },
  ]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 h-full overflow-y-auto"
    >
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Vendor Activity</h1>
        <p className="mt-0.5 text-xs text-zinc-500">Track what vendors do on the platform</p>
      </div>

      {/* KPI cards */}
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

      {/* Filters */}
      <div className="flex gap-3 items-center">
        <select
          value={selectedVendor}
          onChange={(e) => { setSelectedVendor(e.target.value); setPage(1) }}
          className="rounded-xl bg-[#161616] border border-white/[0.06] px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#f751a1]"
        >
          <option value="">All vendors</option>
          {users.filter((u: { role: string }) => u.role !== "ADMIN").map((u: { id: string; name: string; email: string | null }) => (
            <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
          ))}
        </select>

        <select
          value={resourceFilter}
          onChange={(e) => { setResourceFilter(e.target.value); setPage(1) }}
          className="rounded-xl bg-[#161616] border border-white/[0.06] px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#f751a1]"
        >
          <option value="">All resources</option>
          {RESOURCES.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>

        {selectedVendor && vendorStats.data && (
          <div className="ml-auto flex gap-4 text-xs text-zinc-500">
            <span>Total: <span className="text-white font-medium">{vendorStats.data.totalActions}</span></span>
            <span>Today: <span className="text-white font-medium">{vendorStats.data.actionsToday}</span></span>
            <span>Last active: <span className="text-white font-medium">
              {vendorStats.data.lastActive ? timeAgo(vendorStats.data.lastActive) : "Never"}
            </span></span>
          </div>
        )}
      </div>

      {/* Activity feed */}
      <div className="rounded-2xl bg-[#161616] overflow-hidden">
        <div className="px-5 py-4 border-b border-white/[0.04]">
          <h3 className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
            Activity Feed ({feed?.pagination.total ?? 0} events)
          </h3>
        </div>

        {feedLoading ? (
          <div className="p-8 text-center">
            <div className="h-6 w-6 border-2 border-[#f751a1] border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : !feed?.items.length ? (
          <div className="px-5 py-12 text-center">
            <ClockIcon className="h-8 w-8 text-zinc-700 mx-auto mb-2" />
            <p className="text-sm text-zinc-500">No activity recorded yet</p>
          </div>
        ) : (
          <>
            <div className="divide-y divide-white/[0.04]">
              {feed.items.map((entry, i) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, x: -4 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.02 }}
                  className="px-5 py-3 flex items-center gap-4 hover:bg-white/[0.02] transition-colors"
                >
                  {/* Timestamp */}
                  <span className="text-[10px] text-zinc-600 w-16 shrink-0">
                    {timeAgo(entry.createdAt)}
                  </span>

                  {/* User */}
                  <div className="w-32 shrink-0 min-w-0">
                    <p className="text-xs text-white truncate">{entry.user.name}</p>
                    <p className="text-[10px] text-zinc-600 truncate">{entry.user.email}</p>
                  </div>

                  {/* Method badge */}
                  <span className={`text-[10px] font-medium rounded-md px-2 py-0.5 shrink-0 ${METHOD_COLORS[entry.method] ?? "bg-zinc-800 text-zinc-400"}`}>
                    {entry.method}
                  </span>

                  {/* Resource badge */}
                  <span className={`text-[10px] font-medium rounded-md px-2 py-0.5 shrink-0 ${RESOURCE_COLORS[entry.resource] ?? "bg-zinc-800 text-zinc-400"}`}>
                    {entry.resource}
                  </span>

                  {/* Action */}
                  <span className="text-xs text-zinc-300 flex-1 truncate">{entry.action}</span>

                  {/* Success/failure */}
                  {!entry.success && (
                    <span className="text-[10px] bg-rose-500/15 text-rose-400 rounded-md px-2 py-0.5">failed</span>
                  )}

                  {/* Duration */}
                  {entry.duration != null && (
                    <span className="text-[10px] text-zinc-700 shrink-0">{entry.duration}ms</span>
                  )}
                </motion.div>
              ))}
            </div>

            {/* Pagination */}
            {feed.pagination.totalPages > 1 && (
              <div className="px-5 py-3 border-t border-white/[0.04] flex items-center justify-between">
                <span className="text-[11px] text-zinc-600">
                  Page {feed.pagination.page} of {feed.pagination.totalPages}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                    className="rounded-lg px-3 py-1 text-xs text-zinc-400 hover:text-white hover:bg-white/[0.04] disabled:opacity-30 transition-colors"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.min(feed.pagination.totalPages, p + 1))}
                    disabled={page >= feed.pagination.totalPages}
                    className="rounded-lg px-3 py-1 text-xs text-zinc-400 hover:text-white hover:bg-white/[0.04] disabled:opacity-30 transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </motion.div>
  )
}

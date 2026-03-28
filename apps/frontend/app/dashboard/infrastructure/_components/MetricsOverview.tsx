"use client"

import { api } from "@/lib/trpc/react"
import { motion } from "framer-motion"
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts"

// ── Circular progress ring ────────────────────────────────────
function Ring({
  pct,
  color,
  size = 72,
}: {
  pct: number
  color: string
  size?: number
}) {
  const r = (size - 12) / 2
  const c = 2 * Math.PI * r
  const offset = c - (Math.min(pct, 100) / 100) * c

  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="rgba(255,255,255,0.04)"
        strokeWidth="5"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth="5"
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={offset}
        className="transition-all duration-700"
      />
    </svg>
  )
}

// ── Helpers ───────────────────────────────────────────────────
function fmt(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M"
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K"
  return n.toLocaleString()
}

function statusColor(pct: number): string {
  if (pct < 50) return "#4ade80" // green
  if (pct < 80) return "#fbbf24" // amber
  return "#f87171" // red
}

function fmtTime(iso: string) {
  const d = new Date(iso)
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
}

function fmtBytes(b: number) {
  if (b >= 1024 ** 3) return (b / 1024 ** 3).toFixed(1) + " GB"
  if (b >= 1024 ** 2) return (b / 1024 ** 2).toFixed(0) + " MB"
  return (b / 1024).toFixed(0) + " KB"
}

// ── Component ─────────────────────────────────────────────────
export function MetricsOverview() {
  const { data, isLoading, error } = api.infrastructure.overview.useQuery(
    undefined,
    { staleTime: 60_000, refetchOnWindowFocus: false },
  )

  if (isLoading) return <Skeleton />
  if (error)
    return (
      <div className="rounded-2xl bg-[#161616] p-8 text-center">
        <p className="text-sm text-rose-400">
          Failed to connect to GCP Monitoring
        </p>
        <p className="mt-1 text-xs text-zinc-600">{error.message}</p>
      </div>
    )
  if (!data) return null

  const kpis = [
    {
      label: "Cloud Run Requests",
      used: data.kpis.requests.used,
      limit: data.kpis.requests.limit,
      pct: data.kpis.requests.percentage,
      fmtUsed: fmt(data.kpis.requests.used),
      fmtLimit: fmt(data.kpis.requests.limit),
    },
    {
      label: "vCPU Seconds",
      used: data.kpis.vcpuSeconds.used,
      limit: data.kpis.vcpuSeconds.limit,
      pct: data.kpis.vcpuSeconds.percentage,
      fmtUsed: fmt(data.kpis.vcpuSeconds.used),
      fmtLimit: fmt(data.kpis.vcpuSeconds.limit),
    },
    {
      label: "Memory (GiB-sec)",
      used: data.kpis.gibSeconds.used,
      limit: data.kpis.gibSeconds.limit,
      pct: data.kpis.gibSeconds.percentage,
      fmtUsed: fmt(data.kpis.gibSeconds.used),
      fmtLimit: fmt(data.kpis.gibSeconds.limit),
    },
    {
      label: "Artifact Registry",
      used: data.kpis.storageBytes.used,
      limit: data.kpis.storageBytes.limit,
      pct: data.kpis.storageBytes.percentage,
      fmtUsed: fmtBytes(data.kpis.storageBytes.used),
      fmtLimit: fmtBytes(data.kpis.storageBytes.limit),
    },
  ]

  const requestChartData = data.requestRate.map((p) => ({
    time: fmtTime(p.time),
    value: +p.value.toFixed(2),
  }))

  const cpuChartData = data.cpuUtilization.map((p) => ({
    time: fmtTime(p.time),
    value: +(p.value * 100).toFixed(1),
  }))

  const forecasts = [
    { label: "Requests", ...data.forecast.requests },
    { label: "vCPU-sec", ...data.forecast.vcpuSeconds },
    { label: "GiB-sec", ...data.forecast.gibSeconds },
    { label: "Storage", ...data.forecast.storageBytes },
  ]

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((k, i) => (
          <motion.div
            key={k.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: i * 0.06 }}
            className="rounded-2xl bg-[#161616] p-5 flex items-center gap-4"
          >
            <div className="relative flex items-center justify-center">
              <Ring pct={k.pct} color={statusColor(k.pct)} />
              <span className="absolute text-xs font-bold text-white">
                {k.pct.toFixed(0)}%
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] text-zinc-500 uppercase tracking-wider">
                {k.label}
              </p>
              <p className="text-lg font-bold text-white mt-0.5">
                {k.fmtUsed}
              </p>
              <p className="text-[10px] text-zinc-600">
                of {k.fmtLimit} free
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Request Rate */}
        <div className="rounded-2xl bg-[#161616] p-5">
          <h3 className="text-xs font-medium text-zinc-400 mb-4 uppercase tracking-wider">
            Request Rate (24h)
          </h3>
          {requestChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={requestChartData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.04)"
                />
                <XAxis
                  dataKey="time"
                  tick={{ fontSize: 10, fill: "#71717a" }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: "#71717a" }}
                  tickLine={false}
                  axisLine={false}
                  width={40}
                />
                <Tooltip
                  contentStyle={{
                    background: "#1f1f1f",
                    border: "1px solid #333",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                  labelStyle={{ color: "#a1a1aa" }}
                />
                <ReferenceLine
                  y={35}
                  stroke="#fbbf24"
                  strokeDasharray="4 4"
                  label={{
                    value: "Alert: 50K/day",
                    fill: "#fbbf24",
                    fontSize: 10,
                    position: "insideTopRight",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#ccf381"
                  strokeWidth={2}
                  dot={false}
                  name="req/min"
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] flex items-center justify-center text-xs text-zinc-600">
              No request data in the last 24h
            </div>
          )}
        </div>

        {/* CPU Utilization */}
        <div className="rounded-2xl bg-[#161616] p-5">
          <h3 className="text-xs font-medium text-zinc-400 mb-4 uppercase tracking-wider">
            CPU Utilization (24h)
          </h3>
          {cpuChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={cpuChartData}>
                <defs>
                  <linearGradient id="cpuGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#a78bfa" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#a78bfa" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.04)"
                />
                <XAxis
                  dataKey="time"
                  tick={{ fontSize: 10, fill: "#71717a" }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: "#71717a" }}
                  tickLine={false}
                  axisLine={false}
                  width={40}
                  domain={[0, 100]}
                  unit="%"
                />
                <Tooltip
                  contentStyle={{
                    background: "#1f1f1f",
                    border: "1px solid #333",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                  labelStyle={{ color: "#a1a1aa" }}
                />
                <ReferenceLine
                  y={80}
                  stroke="#f87171"
                  strokeDasharray="4 4"
                  label={{
                    value: "Alert: 80%",
                    fill: "#f87171",
                    fontSize: 10,
                    position: "insideTopRight",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#a78bfa"
                  fill="url(#cpuGrad)"
                  strokeWidth={2}
                  name="CPU %"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] flex items-center justify-center text-xs text-zinc-600">
              No CPU data in the last 24h
            </div>
          )}
        </div>
      </div>

      {/* Forecast */}
      <div className="rounded-2xl bg-[#161616] p-5">
        <h3 className="text-xs font-medium text-zinc-400 mb-5 uppercase tracking-wider">
          Free Tier Forecast
        </h3>
        <div className="space-y-4">
          {forecasts.map((f) => {
            const color = statusColor(f.percentage)
            return (
              <div key={f.label}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm text-zinc-300">{f.label}</span>
                  <div className="flex items-center gap-3 text-[11px]">
                    <span className="text-zinc-500">
                      Est. {fmt(f.projected)} of {fmt(f.limit)} (
                      {f.percentage.toFixed(0)}%)
                    </span>
                    <span className="text-zinc-600">
                      {f.daysUntilLimit === null
                        ? "Limit: never"
                        : `~${f.daysUntilLimit}d to limit`}
                    </span>
                    <span
                      style={{ color }}
                      className="font-medium"
                    >
                      ${f.estimatedCost.toFixed(2)}
                    </span>
                  </div>
                </div>
                <div className="h-2 rounded-full bg-white/[0.04] overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${Math.min(f.percentage, 100)}%`,
                      backgroundColor: color,
                    }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ── Loading skeleton ──────────────────────────────────────────
function Skeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 rounded-2xl bg-[#161616] animate-pulse" />
        ))}
      </div>
      <div className="grid grid-cols-2 gap-6">
        <div className="h-72 rounded-2xl bg-[#161616] animate-pulse" />
        <div className="h-72 rounded-2xl bg-[#161616] animate-pulse" />
      </div>
      <div className="h-48 rounded-2xl bg-[#161616] animate-pulse" />
    </div>
  )
}

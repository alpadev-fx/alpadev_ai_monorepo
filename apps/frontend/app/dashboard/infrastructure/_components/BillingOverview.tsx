"use client"

import { useMemo } from "react"
import { motion } from "framer-motion"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"
import { api } from "@/lib/trpc/react"

const COLORS = {
  requests: "#ccf381",
  cpu: "#a78bfa",
  memory: "#f472b6",
  storage: "#38bdf8",
}

function fmt(n: number) {
  if (n >= 1000) return "$" + (n / 1000).toFixed(1) + "K"
  if (n >= 1) return "$" + n.toFixed(2)
  if (n > 0) return "$" + n.toFixed(4)
  return "$0.00"
}

export function BillingOverview() {
  const { data, isLoading, error } =
    api.infrastructure.billingOverview.useQuery(undefined, {
      staleTime: 60_000,
      refetchInterval: 60_000,
    })

  if (isLoading) {
    return (
      <div className="space-y-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="h-48 rounded-2xl bg-[#161616] animate-pulse"
          />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-2xl bg-[#161616] p-8 text-center">
        <p className="text-sm text-rose-400">Failed to load billing data</p>
        <p className="mt-1 text-xs text-zinc-600">{error.message}</p>
      </div>
    )
  }

  if (!data) return null

  const { currentMonth: cm, history, budgets } = data

  // Find the primary budget (first USD one, or first available)
  const primaryBudget =
    budgets.find((b) => b.amount?.currency === "USD") ?? budgets[0]
  const budgetAmount = primaryBudget?.amount
    ? Number(primaryBudget.amount.units)
    : null
  const budgetPct =
    budgetAmount && budgetAmount > 0 ? (cm.total / budgetAmount) * 100 : null

  // Previous month for % change
  const prevMonth = history.length >= 2 ? history[history.length - 2] : null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card
          label="Current Month"
          value={fmt(cm.total)}
          sub={
            cm.grossTotal > cm.total
              ? `${fmt(cm.grossTotal)} without credits`
              : undefined
          }
          subColor="text-amber-400/70"
          accent={cm.total === 0 ? "text-emerald-400" : "text-white"}
        />
        <Card
          label="Daily Average"
          value={fmt(cm.dailyAvg)}
          sub={`Day ${cm.dayOfMonth} of ${cm.daysInMonth}`}
        />
        <Card
          label="Month Projection"
          value={fmt(cm.projectedMonth)}
          sub={
            cm.projectedGross > cm.projectedMonth
              ? `${fmt(cm.projectedGross)} without credits`
              : undefined
          }
          subColor="text-amber-400/70"
        />
        <Card
          label="Budget Status"
          value={budgetPct !== null ? `${budgetPct.toFixed(0)}%` : "No budget"}
          sub={
            budgetAmount
              ? `${fmt(cm.total)} of ${fmt(budgetAmount)}`
              : "Create one in Alerts tab"
          }
          accent={
            budgetPct === null
              ? "text-zinc-500"
              : budgetPct > 90
                ? "text-rose-400"
                : budgetPct > 75
                  ? "text-amber-400"
                  : "text-emerald-400"
          }
        />
      </div>

      {/* Budget Progress Bar */}
      {budgetAmount && budgetPct !== null && (
        <div className="rounded-2xl bg-[#161616] p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
              Budget Progress
            </h3>
            <span className="text-xs text-zinc-500">
              {primaryBudget?.displayName}
            </span>
          </div>
          <div className="h-4 rounded-full bg-white/[0.04] overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${Math.min(budgetPct, 100)}%`,
                backgroundColor:
                  budgetPct > 90
                    ? "#f87171"
                    : budgetPct > 75
                      ? "#fbbf24"
                      : "#4ade80",
              }}
            />
          </div>
          <div className="flex items-center justify-between mt-2">
            <span className="text-[11px] text-zinc-500">
              {fmt(cm.total)} spent
            </span>
            <span className="text-[11px] text-zinc-500">
              {fmt(budgetAmount)} budget
            </span>
          </div>
          {/* Threshold markers */}
          {primaryBudget?.thresholds && primaryBudget.thresholds.length > 0 && (
            <div className="flex gap-2 mt-2">
              {primaryBudget.thresholds.map((t) => (
                <span
                  key={t.percent}
                  className={`text-[9px] px-1.5 py-0.5 rounded ${
                    budgetPct >= t.percent
                      ? "bg-rose-500/20 text-rose-400"
                      : "bg-white/[0.04] text-zinc-600"
                  }`}
                >
                  {t.percent}%
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cost History Chart */}
        <div className="rounded-2xl bg-[#161616] p-5">
          <h3 className="text-xs font-medium text-zinc-400 mb-4 uppercase tracking-wider">
            Cost History (6 months)
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={history}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255,255,255,0.04)"
              />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 10, fill: "#71717a" }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: "#71717a" }}
                tickLine={false}
                axisLine={false}
                width={45}
                tickFormatter={(v) => `$${v}`}
              />
              <Tooltip
                contentStyle={{
                  background: "#1f1f1f",
                  border: "1px solid #333",
                  borderRadius: 8,
                  fontSize: 12,
                }}
                formatter={(value, name) => [
                  `$${Number(value).toFixed(2)}`,
                  String(name),
                ]}
                labelStyle={{ color: "#a1a1aa" }}
              />
              <Legend wrapperStyle={{ fontSize: 11, color: "#71717a" }} />
              <Bar
                dataKey="requests"
                stackId="a"
                fill={COLORS.requests}
                name="Requests"
                radius={[0, 0, 0, 0]}
              />
              <Bar dataKey="cpu" stackId="a" fill={COLORS.cpu} name="CPU" />
              <Bar
                dataKey="memory"
                stackId="a"
                fill={COLORS.memory}
                name="Memory"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Service Cost Table */}
        <div className="rounded-2xl bg-[#161616] p-5">
          <h3 className="text-xs font-medium text-zinc-400 mb-4 uppercase tracking-wider">
            Cost Breakdown by Service
          </h3>
          <table className="w-full text-[12px]">
            <thead>
              <tr className="text-zinc-600 border-b border-white/[0.04]">
                <th className="text-left pb-2">Service</th>
                <th className="text-right pb-2">Cost</th>
                <th className="text-right pb-2">% Total</th>
                <th className="text-right pb-2">vs Last Month</th>
              </tr>
            </thead>
            <tbody className="text-zinc-400">
              <ServiceRow
                name="Cloud Run — Requests"
                cost={cm.costs.requests}
                grossCost={cm.gross.requests}
                total={cm.total}
                prev={prevMonth?.requests}
                color={COLORS.requests}
              />
              <ServiceRow
                name="Cloud Run — CPU"
                cost={cm.costs.cpu}
                grossCost={cm.gross.cpu}
                total={cm.total}
                prev={prevMonth?.cpu}
                color={COLORS.cpu}
              />
              <ServiceRow
                name="Cloud Run — Memory"
                cost={cm.costs.memory}
                grossCost={cm.gross.memory}
                total={cm.total}
                prev={prevMonth?.memory}
                color={COLORS.memory}
              />
              <ServiceRow
                name="Artifact Registry"
                cost={cm.costs.storage}
                grossCost={cm.gross.storage}
                total={cm.total}
                prev={0}
                color={COLORS.storage}
              />
              <tr className="border-t border-white/[0.04] text-white font-medium">
                <td className="pt-3">Total</td>
                <td className="text-right pt-3">{fmt(cm.total)}</td>
                <td className="text-right pt-3">100%</td>
                <td className="text-right pt-3">
                  {prevMonth ? (
                    <ChangeTag current={cm.total} previous={prevMonth.total} />
                  ) : (
                    <span className="text-zinc-600">—</span>
                  )}
                </td>
              </tr>
            </tbody>
          </table>

          {cm.grossTotal > cm.total && (
            <div className="mt-4 pt-3 border-t border-white/[0.04]">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-zinc-600">
                  Without free tier credits
                </span>
                <span className="text-sm font-medium text-amber-400/80">
                  {fmt(cm.grossTotal)}/mo
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

// ── Sub-components ────────────────────────────────────────────

function Card({
  label,
  value,
  sub,
  subColor = "text-zinc-600",
  accent = "text-white",
}: {
  label: string
  value: string
  sub?: string
  subColor?: string
  accent?: string
}) {
  return (
    <div className="rounded-2xl bg-[#161616] p-4">
      <p className="text-[10px] text-zinc-600 uppercase tracking-wider">
        {label}
      </p>
      <p className={`text-2xl font-bold mt-1 ${accent}`}>{value}</p>
      {sub && <p className={`text-[10px] mt-0.5 ${subColor}`}>{sub}</p>}
    </div>
  )
}

function ServiceRow({
  name,
  cost,
  grossCost,
  total,
  prev,
  color,
}: {
  name: string
  cost: number
  grossCost: number
  total: number
  prev?: number
  color: string
}) {
  const pct = total > 0 ? (cost / total) * 100 : 0
  const isFree = cost === 0 && grossCost > 0

  return (
    <tr>
      <td className="py-2">
        <div className="flex items-center gap-2">
          <div
            className="h-2.5 w-2.5 rounded-sm"
            style={{ backgroundColor: color }}
          />
          <span>{name}</span>
        </div>
      </td>
      <td className="text-right py-2">
        {isFree ? (
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400">
            FREE
          </span>
        ) : (
          fmt(cost)
        )}
      </td>
      <td className="text-right py-2 text-zinc-600">{pct.toFixed(0)}%</td>
      <td className="text-right py-2">
        {prev !== undefined ? (
          <ChangeTag current={cost} previous={prev} />
        ) : (
          <span className="text-zinc-600">—</span>
        )}
      </td>
    </tr>
  )
}

function ChangeTag({
  current,
  previous,
}: {
  current: number
  previous: number
}) {
  if (previous === 0 && current === 0)
    return <span className="text-zinc-600">—</span>
  if (previous === 0)
    return <span className="text-rose-400 text-[10px]">NEW</span>

  const change = ((current - previous) / previous) * 100
  if (Math.abs(change) < 1) return <span className="text-zinc-600">~0%</span>

  return (
    <span
      className={`text-[10px] font-medium ${change > 0 ? "text-rose-400" : "text-emerald-400"}`}
    >
      {change > 0 ? "+" : ""}
      {change.toFixed(0)}%
    </span>
  )
}

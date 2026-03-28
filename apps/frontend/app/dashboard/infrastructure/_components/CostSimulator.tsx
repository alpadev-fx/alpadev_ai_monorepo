"use client"

import { useState, useMemo } from "react"
import { motion } from "framer-motion"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceArea,
} from "recharts"

// ── Constants ─────────────────────────────────────────────────
const FREE_TIER = {
  requests: 2_000_000,
  vcpuSeconds: 360_000,
  gibSeconds: 180_000,
  egressGb: 1,
}

const PRICING = {
  requestsPerMillion: 0.4,
  vcpuSecond: 0.000024,
  gibSecond: 0.0000025,
  egressPerGb: 0.12,
}

const PRESETS = [
  { label: "Current (~1.7K/day)", daily: 1667, duration: 200, cpu: 0.3, memory: 128 },
  { label: "10x Growth", daily: 16670, duration: 200, cpu: 0.3, memory: 128 },
  { label: "100x Growth", daily: 166700, duration: 200, cpu: 0.3, memory: 128 },
] as const

// ── Cost math ─────────────────────────────────────────────────
function simulate(daily: number, durationMs: number, cpuFrac: number, memoryMi: number) {
  const monthly = daily * 30
  const durationSec = durationMs / 1000
  const memoryGib = memoryMi / 1024

  const vcpuSec = monthly * durationSec * cpuFrac
  const gibSec = monthly * durationSec * memoryGib

  const reqOverage = Math.max(0, monthly - FREE_TIER.requests)
  const vcpuOverage = Math.max(0, vcpuSec - FREE_TIER.vcpuSeconds)
  const gibOverage = Math.max(0, gibSec - FREE_TIER.gibSeconds)

  const reqCost = (reqOverage / 1_000_000) * PRICING.requestsPerMillion
  const vcpuCost = vcpuOverage * PRICING.vcpuSecond
  const gibCost = gibOverage * PRICING.gibSecond
  const total = reqCost + vcpuCost + gibCost

  return {
    monthly,
    vcpuSec: Math.round(vcpuSec),
    gibSec: Math.round(gibSec),
    reqCost: round2(reqCost),
    vcpuCost: round2(vcpuCost),
    gibCost: round2(gibCost),
    total: round2(total),
    withinFree: total === 0,
  }
}

function round2(n: number) {
  return Math.round(n * 100) / 100
}

function fmt(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M"
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K"
  return n.toLocaleString()
}

// ── Component ─────────────────────────────────────────────────
export function CostSimulator() {
  const [daily, setDaily] = useState(1667)
  const [duration, setDuration] = useState(200)
  const [cpuFrac, setCpuFrac] = useState(0.3)
  const [memoryMi, setMemoryMi] = useState(128)

  const result = useMemo(
    () => simulate(daily, duration, cpuFrac, memoryMi),
    [daily, duration, cpuFrac, memoryMi],
  )

  // 12-month projection for 3 scenarios
  const projectionData = useMemo(() => {
    const now = new Date()
    return Array.from({ length: 12 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() + i, 1)
      const label = d.toLocaleDateString("en", { month: "short", year: "2-digit" })
      const growth10x = daily * Math.pow(1.21, i) // ~10x over 12 months
      const growth100x = daily * Math.pow(1.47, i) // ~100x over 12 months
      return {
        month: label,
        current: simulate(daily, duration, cpuFrac, memoryMi).total,
        "10x": simulate(growth10x, duration, cpuFrac, memoryMi).total,
        "100x": simulate(growth100x, duration, cpuFrac, memoryMi).total,
      }
    })
  }, [daily, duration, cpuFrac, memoryMi])

  // Thresholds
  const breakEvenDaily = Math.ceil(FREE_TIER.requests / 30)
  const at100k = simulate(100_000, duration, cpuFrac, memoryMi).total
  const at500k = simulate(500_000, duration, cpuFrac, memoryMi).total

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Traffic Scenario Controls */}
      <div className="rounded-2xl bg-[#161616] p-5 space-y-5">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
            Traffic Scenario
          </h3>
          <div className="flex gap-2">
            {PRESETS.map((p) => (
              <button
                key={p.label}
                onClick={() => {
                  setDaily(p.daily)
                  setDuration(p.duration)
                  setCpuFrac(p.cpu)
                  setMemoryMi(p.memory)
                }}
                className={`rounded-lg px-3 py-1.5 text-[11px] font-medium transition-all ${
                  daily === p.daily
                    ? "bg-[#ccf381]/15 text-[#ccf381]"
                    : "bg-white/[0.04] text-zinc-500 hover:text-zinc-300"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <SliderInput
            label="Daily Requests"
            value={daily}
            min={0}
            max={500_000}
            step={1000}
            format={(v) => fmt(v)}
            onChange={setDaily}
          />
          <SliderInput
            label="Avg Duration"
            value={duration}
            min={50}
            max={5000}
            step={50}
            format={(v) => v + "ms"}
            onChange={setDuration}
          />
          <SliderInput
            label="CPU Fraction"
            value={cpuFrac}
            min={0.1}
            max={1}
            step={0.1}
            format={(v) => v.toFixed(1)}
            onChange={setCpuFrac}
          />
          <SliderInput
            label="Memory (Mi)"
            value={memoryMi}
            min={64}
            max={512}
            step={64}
            format={(v) => v + "Mi"}
            onChange={setMemoryMi}
          />
        </div>
      </div>

      {/* Results */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Free Tier Usage */}
        <div className="rounded-2xl bg-[#161616] p-5 space-y-4">
          <h3 className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
            Monthly Free Tier Usage
          </h3>
          <Gauge label="Requests" used={result.monthly} limit={FREE_TIER.requests} />
          <Gauge label="vCPU-sec" used={result.vcpuSec} limit={FREE_TIER.vcpuSeconds} />
          <Gauge label="GiB-sec" used={result.gibSec} limit={FREE_TIER.gibSeconds} />

          <div className="pt-3 border-t border-white/[0.04] text-center">
            {result.withinFree ? (
              <p className="text-sm font-bold text-emerald-400">
                WITHIN FREE TIER
              </p>
            ) : (
              <p className="text-sm font-bold text-amber-400">
                EXCEEDS FREE TIER
              </p>
            )}
          </div>
        </div>

        {/* Cost Breakdown */}
        <div className="rounded-2xl bg-[#161616] p-5">
          <h3 className="text-xs font-medium text-zinc-400 mb-4 uppercase tracking-wider">
            Estimated Monthly Cost
          </h3>
          <p
            className={`text-4xl font-bold mb-5 ${
              result.total === 0 ? "text-emerald-400" : "text-[#ccf381]"
            }`}
          >
            ${result.total.toFixed(2)}
            <span className="text-sm text-zinc-600 ml-1">/mo</span>
          </p>

          <table className="w-full text-[12px]">
            <thead>
              <tr className="text-zinc-600 border-b border-white/[0.04]">
                <th className="text-left pb-2">Resource</th>
                <th className="text-right pb-2">Usage</th>
                <th className="text-right pb-2">Free Tier</th>
                <th className="text-right pb-2">Overage</th>
                <th className="text-right pb-2">Cost</th>
              </tr>
            </thead>
            <tbody className="text-zinc-400">
              <tr>
                <td className="py-1.5">Requests</td>
                <td className="text-right">{fmt(result.monthly)}</td>
                <td className="text-right text-zinc-600">{fmt(FREE_TIER.requests)}</td>
                <td className="text-right">
                  {fmt(Math.max(0, result.monthly - FREE_TIER.requests))}
                </td>
                <td className="text-right font-medium">${result.reqCost.toFixed(2)}</td>
              </tr>
              <tr>
                <td className="py-1.5">vCPU-sec</td>
                <td className="text-right">{fmt(result.vcpuSec)}</td>
                <td className="text-right text-zinc-600">{fmt(FREE_TIER.vcpuSeconds)}</td>
                <td className="text-right">
                  {fmt(Math.max(0, result.vcpuSec - FREE_TIER.vcpuSeconds))}
                </td>
                <td className="text-right font-medium">${result.vcpuCost.toFixed(2)}</td>
              </tr>
              <tr>
                <td className="py-1.5">GiB-sec</td>
                <td className="text-right">{fmt(result.gibSec)}</td>
                <td className="text-right text-zinc-600">{fmt(FREE_TIER.gibSeconds)}</td>
                <td className="text-right">
                  {fmt(Math.max(0, result.gibSec - FREE_TIER.gibSeconds))}
                </td>
                <td className="text-right font-medium">${result.gibCost.toFixed(2)}</td>
              </tr>
              <tr className="border-t border-white/[0.04] text-white font-medium">
                <td className="pt-2" colSpan={4}>
                  Total
                </td>
                <td className="text-right pt-2">${result.total.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Growth Projection Chart */}
      <div className="rounded-2xl bg-[#161616] p-5">
        <h3 className="text-xs font-medium text-zinc-400 mb-4 uppercase tracking-wider">
          12-Month Growth Projection
        </h3>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={projectionData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
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
              width={50}
              tickFormatter={(v) => `$${v}`}
            />
            <Tooltip
              contentStyle={{
                background: "#1f1f1f",
                border: "1px solid #333",
                borderRadius: 8,
                fontSize: 12,
              }}
              formatter={(v) => `$${Number(v).toFixed(2)}`}
              labelStyle={{ color: "#a1a1aa" }}
            />
            <Legend
              wrapperStyle={{ fontSize: 11, color: "#71717a" }}
            />
            <ReferenceArea y1={0} y2={0.01} fill="#4ade80" fillOpacity={0.05} />
            <Line
              type="monotone"
              dataKey="current"
              stroke="#ccf381"
              strokeWidth={2}
              dot={false}
              name="Current"
            />
            <Line
              type="monotone"
              dataKey="10x"
              stroke="#a78bfa"
              strokeWidth={2}
              dot={false}
              name="10x Growth"
              strokeDasharray="4 4"
            />
            <Line
              type="monotone"
              dataKey="100x"
              stroke="#f472b6"
              strokeWidth={2}
              dot={false}
              name="100x Growth"
              strokeDasharray="4 4"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Key Thresholds */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Break-even",
            value: `~${fmt(breakEvenDaily)} req/day`,
            desc: "Daily rate to start paying",
          },
          {
            label: "At 100K/day",
            value: `~$${at100k.toFixed(2)}/mo`,
            desc: "Moderate traffic",
          },
          {
            label: "At 500K/day",
            value: `~$${at500k.toFixed(2)}/mo`,
            desc: "High traffic",
          },
          {
            label: "Budget Alert",
            value: "5,000 COP",
            desc: "~$1.25 USD current cap",
          },
        ].map((t) => (
          <div
            key={t.label}
            className="rounded-2xl bg-[#161616] p-4"
          >
            <p className="text-[10px] text-zinc-600 uppercase tracking-wider">
              {t.label}
            </p>
            <p className="text-lg font-bold text-white mt-1">{t.value}</p>
            <p className="text-[10px] text-zinc-500 mt-0.5">{t.desc}</p>
          </div>
        ))}
      </div>
    </motion.div>
  )
}

// ── Sub-components ────────────────────────────────────────────

function SliderInput({
  label,
  value,
  min,
  max,
  step,
  format,
  onChange,
}: {
  label: string
  value: number
  min: number
  max: number
  step: number
  format: (v: number) => string
  onChange: (v: number) => void
}) {
  return (
    <div>
      <div className="flex justify-between mb-1.5">
        <label className="text-xs text-zinc-400">{label}</label>
        <span className="text-xs font-bold text-white">{format(value)}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(+e.target.value)}
        className="w-full accent-[#ccf381]"
      />
    </div>
  )
}

function Gauge({
  label,
  used,
  limit,
}: {
  label: string
  used: number
  limit: number
}) {
  const pct = Math.min((used / limit) * 100, 100)
  const color = pct < 50 ? "#4ade80" : pct < 80 ? "#fbbf24" : "#f87171"

  return (
    <div>
      <div className="flex justify-between mb-1">
        <span className="text-xs text-zinc-400">{label}</span>
        <span className="text-[11px] text-zinc-500">
          {fmt(used)} / {fmt(limit)} ({pct.toFixed(0)}%)
        </span>
      </div>
      <div className="h-2 rounded-full bg-white/[0.04] overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  )
}

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
} from "recharts"

// ── GCP Free Tier & Pricing (same units as billing) ──────────

const FREE_TIER = {
  requests: 2_000_000, // requests/month
  vcpuSeconds: 360_000, // vCPU-seconds/month
  gibSeconds: 180_000, // GiB-seconds/month
}

const PRICE = {
  perRequest: 0.40 / 1_000_000, // $0.40 per 1M requests
  perVcpuSec: 0.000024, // per vCPU-second
  perGibSec: 0.0000025, // per GiB-second
}

// ── Your Cloud Run config (from Scaling tab) ─────────────────
// These determine how requests translate to vCPU-sec and GiB-sec
const CLOUD_RUN = {
  cpu: 1, // 1 vCPU allocated per instance
  memoryGib: 0.5, // 512Mi = 0.5 GiB
}

// ── How GCP calculates billing ───────────────────────────────
//
// When a request hits Cloud Run (with cpu_idle=true):
//   vCPU-seconds = request_duration × cpu_allocation
//   GiB-seconds  = request_duration × memory_allocation
//
// So: monthly_vcpu_sec = monthly_requests × avg_duration_sec × 1 vCPU
//     monthly_gib_sec  = monthly_requests × avg_duration_sec × 0.5 GiB

function simulate(dailyRequests: number, avgDurationMs: number) {
  const monthlyRequests = dailyRequests * 30
  const durationSec = avgDurationMs / 1000

  // These are the exact units GCP bills
  const vcpuSeconds = monthlyRequests * durationSec * CLOUD_RUN.cpu
  const gibSeconds = monthlyRequests * durationSec * CLOUD_RUN.memoryGib

  // Overage beyond free tier
  const reqOver = Math.max(0, monthlyRequests - FREE_TIER.requests)
  const vcpuOver = Math.max(0, vcpuSeconds - FREE_TIER.vcpuSeconds)
  const gibOver = Math.max(0, gibSeconds - FREE_TIER.gibSeconds)

  // Cost = overage × price per unit
  const reqCost = reqOver * PRICE.perRequest
  const vcpuCost = vcpuOver * PRICE.perVcpuSec
  const gibCost = gibOver * PRICE.perGibSec
  const total = reqCost + vcpuCost + gibCost

  return {
    monthlyRequests,
    vcpuSeconds: Math.round(vcpuSeconds),
    gibSeconds: Math.round(gibSeconds),
    reqCost: r2(reqCost),
    vcpuCost: r2(vcpuCost),
    gibCost: r2(gibCost),
    total: r2(total),
    free: total === 0,
  }
}

function r2(n: number) {
  return Math.round(n * 100) / 100
}

function fmt(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M"
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K"
  return n.toLocaleString()
}

// ── Component ─────────────────────────────────────────────────

const PRESETS = [
  { label: "Low (1K/day)", daily: 1000, ms: 200 },
  { label: "Medium (10K/day)", daily: 10_000, ms: 200 },
  { label: "High (100K/day)", daily: 100_000, ms: 200 },
  { label: "Viral (500K/day)", daily: 500_000, ms: 200 },
] as const

export function CostSimulator() {
  const [daily, setDaily] = useState(1000)
  const [durationMs, setDurationMs] = useState(200)

  const result = useMemo(() => simulate(daily, durationMs), [daily, durationMs])

  // 12-month projection
  const projection = useMemo(() => {
    const now = new Date()
    return Array.from({ length: 12 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() + i, 1)
      const month = d.toLocaleDateString("en", { month: "short", year: "2-digit" })
      const x10 = daily * Math.pow(1.21, i) // ~10x in 12 months
      const x100 = daily * Math.pow(1.47, i) // ~100x in 12 months
      return {
        month,
        current: simulate(daily, durationMs).total,
        "10x growth": simulate(x10, durationMs).total,
        "100x growth": simulate(x100, durationMs).total,
      }
    })
  }, [daily, durationMs])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* How it works */}
      <div className="rounded-2xl bg-[#161616] p-5 space-y-4">
        <h3 className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
          How GCP Bills Cloud Run
        </h3>
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="rounded-xl bg-white/[0.02] p-3">
            <p className="text-[10px] text-zinc-600">Per request</p>
            <p className="text-sm font-bold text-white mt-1">$0.40 / 1M</p>
            <p className="text-[10px] text-zinc-500">Free: 2M/mo</p>
          </div>
          <div className="rounded-xl bg-white/[0.02] p-3">
            <p className="text-[10px] text-zinc-600">CPU time</p>
            <p className="text-sm font-bold text-white mt-1">$0.024 / 1K sec</p>
            <p className="text-[10px] text-zinc-500">Free: 360K sec/mo</p>
          </div>
          <div className="rounded-xl bg-white/[0.02] p-3">
            <p className="text-[10px] text-zinc-600">Memory time</p>
            <p className="text-sm font-bold text-white mt-1">$0.0025 / 1K sec</p>
            <p className="text-[10px] text-zinc-500">Free: 180K sec/mo</p>
          </div>
        </div>
        <p className="text-[10px] text-zinc-600 leading-relaxed">
          Your config: <span className="text-zinc-400">{CLOUD_RUN.cpu} vCPU, {CLOUD_RUN.memoryGib * 1024}Mi, scale-to-zero, CPU idle=on</span>.
          GCP charges CPU only while processing requests.
          Each request uses {CLOUD_RUN.cpu} vCPU-sec and {CLOUD_RUN.memoryGib} GiB-sec per second of duration.
        </p>
      </div>

      {/* Controls — only 2 inputs, simple */}
      <div className="rounded-2xl bg-[#161616] p-5 space-y-5">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
            Simulate Traffic
          </h3>
          <div className="flex gap-2">
            {PRESETS.map((p) => (
              <button
                key={p.label}
                onClick={() => {
                  setDaily(p.daily)
                  setDurationMs(p.ms)
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Slider
            label="Daily Requests"
            value={daily}
            min={100}
            max={500_000}
            step={100}
            display={fmt(daily) + " req/day"}
            sub={fmt(daily * 30) + " req/month"}
            onChange={setDaily}
          />
          <Slider
            label="Avg Request Duration"
            value={durationMs}
            min={50}
            max={5000}
            step={50}
            display={durationMs + " ms"}
            sub="Time your server takes to respond"
            onChange={setDurationMs}
          />
        </div>
      </div>

      {/* Results — same units as free tier */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Usage vs Free Tier */}
        <div className="rounded-2xl bg-[#161616] p-5 space-y-4">
          <h3 className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
            Monthly Usage vs Free Tier
          </h3>

          <Bar
            label="Requests"
            used={result.monthlyRequests}
            limit={FREE_TIER.requests}
            unit="requests"
          />
          <Bar
            label="vCPU-seconds"
            used={result.vcpuSeconds}
            limit={FREE_TIER.vcpuSeconds}
            unit="vCPU-sec"
            explanation={`${fmt(result.monthlyRequests)} req × ${durationMs}ms × ${CLOUD_RUN.cpu} vCPU`}
          />
          <Bar
            label="GiB-seconds"
            used={result.gibSeconds}
            limit={FREE_TIER.gibSeconds}
            unit="GiB-sec"
            explanation={`${fmt(result.monthlyRequests)} req × ${durationMs}ms × ${CLOUD_RUN.memoryGib} GiB`}
          />

          <div className="pt-3 border-t border-white/[0.04] text-center">
            {result.free ? (
              <p className="text-sm font-bold text-emerald-400">WITHIN FREE TIER — $0/mo</p>
            ) : (
              <p className="text-sm font-bold text-amber-400">EXCEEDS FREE TIER</p>
            )}
          </div>
        </div>

        {/* Cost Breakdown Table */}
        <div className="rounded-2xl bg-[#161616] p-5">
          <h3 className="text-xs font-medium text-zinc-400 mb-4 uppercase tracking-wider">
            Monthly Cost Breakdown
          </h3>
          <p className={`text-4xl font-bold mb-5 ${result.free ? "text-emerald-400" : "text-[#ccf381]"}`}>
            ${result.total.toFixed(2)}
            <span className="text-sm text-zinc-600 ml-1">/mo</span>
          </p>

          <table className="w-full text-[12px]">
            <thead>
              <tr className="text-zinc-600 border-b border-white/[0.04]">
                <th className="text-left pb-2">Resource</th>
                <th className="text-right pb-2">Your Usage</th>
                <th className="text-right pb-2">Free Limit</th>
                <th className="text-right pb-2">Overage</th>
                <th className="text-right pb-2">Cost</th>
              </tr>
            </thead>
            <tbody className="text-zinc-400">
              <CostRow
                label="Requests"
                used={result.monthlyRequests}
                limit={FREE_TIER.requests}
                cost={result.reqCost}
              />
              <CostRow
                label="vCPU-seconds"
                used={result.vcpuSeconds}
                limit={FREE_TIER.vcpuSeconds}
                cost={result.vcpuCost}
              />
              <CostRow
                label="GiB-seconds"
                used={result.gibSeconds}
                limit={FREE_TIER.gibSeconds}
                cost={result.gibCost}
              />
              <tr className="border-t border-white/[0.04] text-white font-medium">
                <td className="pt-2" colSpan={4}>Total</td>
                <td className="text-right pt-2">${result.total.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 12-Month Projection */}
      <div className="rounded-2xl bg-[#161616] p-5">
        <h3 className="text-xs font-medium text-zinc-400 mb-1 uppercase tracking-wider">
          12-Month Cost Projection
        </h3>
        <p className="text-[10px] text-zinc-600 mb-4">
          If your traffic grows from {fmt(daily)}/day, when would you start paying?
        </p>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={projection}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#71717a" }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 10, fill: "#71717a" }} tickLine={false} axisLine={false} width={50} tickFormatter={(v) => `$${v}`} />
            <Tooltip
              contentStyle={{ background: "#1f1f1f", border: "1px solid #333", borderRadius: 8, fontSize: 12 }}
              formatter={(v) => `$${Number(v).toFixed(2)}/mo`}
              labelStyle={{ color: "#a1a1aa" }}
            />
            <Legend wrapperStyle={{ fontSize: 11, color: "#71717a" }} />
            <Line type="monotone" dataKey="current" stroke="#ccf381" strokeWidth={2} dot={false} name="Steady" />
            <Line type="monotone" dataKey="10x growth" stroke="#a78bfa" strokeWidth={2} dot={false} strokeDasharray="4 4" />
            <Line type="monotone" dataKey="100x growth" stroke="#f472b6" strokeWidth={2} dot={false} strokeDasharray="4 4" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Quick Reference */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Start paying at", value: `~${fmt(Math.ceil(FREE_TIER.requests / 30))} req/day`, desc: "When requests exceed 2M/month" },
          { label: "At 10K/day", value: `$${simulate(10_000, durationMs).total.toFixed(2)}/mo`, desc: "Small SaaS traffic" },
          { label: "At 100K/day", value: `$${simulate(100_000, durationMs).total.toFixed(2)}/mo`, desc: "Growing product" },
          { label: "At 500K/day", value: `$${simulate(500_000, durationMs).total.toFixed(2)}/mo`, desc: "High traffic app" },
        ].map((t) => (
          <div key={t.label} className="rounded-2xl bg-[#161616] p-4">
            <p className="text-[10px] text-zinc-600 uppercase tracking-wider">{t.label}</p>
            <p className="text-lg font-bold text-white mt-1">{t.value}</p>
            <p className="text-[10px] text-zinc-500 mt-0.5">{t.desc}</p>
          </div>
        ))}
      </div>
    </motion.div>
  )
}

// ── Sub-components ────────────────────────────────────────────

function Slider({
  label,
  value,
  min,
  max,
  step,
  display,
  sub,
  onChange,
}: {
  label: string
  value: number
  min: number
  max: number
  step: number
  display: string
  sub: string
  onChange: (v: number) => void
}) {
  return (
    <div>
      <div className="flex justify-between mb-1.5">
        <label className="text-xs text-zinc-400">{label}</label>
        <span className="text-sm font-bold text-white">{display}</span>
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
      <p className="mt-1 text-[10px] text-zinc-600">{sub}</p>
    </div>
  )
}

function Bar({
  label,
  used,
  limit,
  unit,
  explanation,
}: {
  label: string
  used: number
  limit: number
  unit: string
  explanation?: string
}) {
  const pct = Math.min((used / limit) * 100, 150) // allow overflow visual
  const displayPct = Math.min(pct, 100)
  const color = pct < 50 ? "#4ade80" : pct < 80 ? "#fbbf24" : "#f87171"
  const overflows = used > limit

  return (
    <div>
      <div className="flex justify-between mb-1">
        <span className="text-xs text-zinc-300">{label}</span>
        <span className={`text-[11px] font-medium ${overflows ? "text-rose-400" : "text-zinc-500"}`}>
          {fmt(used)} / {fmt(limit)} {unit}
        </span>
      </div>
      <div className="h-2.5 rounded-full bg-white/[0.04] overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${displayPct}%`, backgroundColor: color }}
        />
      </div>
      {explanation && (
        <p className="mt-0.5 text-[9px] text-zinc-600 font-mono">{explanation}</p>
      )}
      {overflows && (
        <p className="mt-0.5 text-[9px] text-rose-400">
          Exceeds by {fmt(used - limit)} {unit} → ${r2((used - limit) * (label.includes("Request") ? PRICE.perRequest : label.includes("vCPU") ? PRICE.perVcpuSec : PRICE.perGibSec)).toFixed(2)}/mo
        </p>
      )}
    </div>
  )
}

function CostRow({ label, used, limit, cost }: { label: string; used: number; limit: number; cost: number }) {
  const overage = Math.max(0, used - limit)
  return (
    <tr>
      <td className="py-1.5">{label}</td>
      <td className="text-right">{fmt(used)}</td>
      <td className="text-right text-zinc-600">{fmt(limit)}</td>
      <td className={`text-right ${overage > 0 ? "text-rose-400" : ""}`}>{fmt(overage)}</td>
      <td className={`text-right font-medium ${cost > 0 ? "text-rose-400" : ""}`}>${cost.toFixed(2)}</td>
    </tr>
  )
}

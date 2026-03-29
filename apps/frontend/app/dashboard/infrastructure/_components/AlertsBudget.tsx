"use client"

import { useState } from "react"
import { api } from "@/lib/trpc/react"
import { motion } from "framer-motion"
import {
  BanknotesIcon,
  BellAlertIcon,
  ExclamationTriangleIcon,
  SparklesIcon,
  TrashIcon,
  PlusIcon,
} from "@heroicons/react/24/outline"

// ── Budget Section ────────────────────────────────────────────

function BudgetSection() {
  const utils = api.useUtils()
  const { data: budgets, isLoading } = api.infrastructure.budgets.useQuery(
    undefined,
    { staleTime: 60_000 },
  )
  const deleteMut = api.infrastructure.deleteBudget.useMutation({
    onSuccess: () => utils.infrastructure.budgets.invalidate(),
  })
  const createMut = api.infrastructure.createBudget.useMutation({
    onSuccess: () => {
      utils.infrastructure.budgets.invalidate()
      setShowForm(false)
      setForm({ displayName: "", amount: 5000, currency: "COP" as const, thresholds: [50, 80, 100], notificationEmail: "" })
    },
  })

  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    displayName: "",
    amount: 5000,
    currency: "COP" as "COP" | "USD",
    thresholds: [50, 80, 100],
    notificationEmail: "",
  })

  return (
    <div className="rounded-2xl bg-[#161616] p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BanknotesIcon className="h-4 w-4 text-[#ccf381]" />
          <h3 className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
            Budget Alerts
          </h3>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1 rounded-lg bg-white/[0.04] px-3 py-1.5 text-[11px] text-zinc-400 hover:text-white transition-colors"
        >
          <PlusIcon className="h-3.5 w-3.5" />
          New Budget
        </button>
      </div>

      {/* Existing budgets */}
      {isLoading ? (
        <div className="h-16 rounded-xl bg-white/[0.02] animate-pulse" />
      ) : budgets && budgets.length > 0 ? (
        <div className="space-y-2">
          {budgets.map((b) => (
            <div
              key={b.name}
              className="flex items-center justify-between rounded-xl bg-white/[0.02] p-3"
            >
              <div>
                <p className="text-sm text-white">{b.displayName}</p>
                <p className="text-[11px] text-zinc-500">
                  {b.amount
                    ? `${b.amount.units} ${b.amount.currency}`
                    : "No amount set"}{" "}
                  &middot; Alerts at{" "}
                  {b.thresholds.map((t) => `${t.percent}%`).join(", ")}
                </p>
              </div>
              <button
                onClick={() => deleteMut.mutate({ name: b.name })}
                disabled={deleteMut.isPending}
                className="rounded-lg p-1.5 text-zinc-600 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
              >
                <TrashIcon className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-zinc-600 py-2">No budget alerts configured</p>
      )}

      {/* Create form */}
      {showForm && (
        <div className="rounded-xl bg-white/[0.02] p-4 space-y-3 border border-white/[0.04]">
          <input
            type="text"
            placeholder="Budget name"
            value={form.displayName}
            onChange={(e) => setForm({ ...form, displayName: e.target.value })}
            className="w-full rounded-lg bg-white/[0.04] px-3 py-2 text-sm text-white placeholder-zinc-600 outline-none focus:ring-1 focus:ring-[#ccf381]/30"
          />
          <div className="grid grid-cols-2 gap-3">
            <input
              type="number"
              placeholder="Amount"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: +e.target.value })}
              className="rounded-lg bg-white/[0.04] px-3 py-2 text-sm text-white placeholder-zinc-600 outline-none focus:ring-1 focus:ring-[#ccf381]/30"
            />
            <select
              value={form.currency}
              onChange={(e) => setForm({ ...form, currency: e.target.value as "COP" | "USD" })}
              className="rounded-lg bg-white/[0.04] px-3 py-2 text-sm text-white outline-none"
            >
              <option value="COP">COP</option>
              <option value="USD">USD</option>
            </select>
          </div>
          <input
            type="email"
            placeholder="Notification email"
            value={form.notificationEmail}
            onChange={(e) => setForm({ ...form, notificationEmail: e.target.value })}
            className="w-full rounded-lg bg-white/[0.04] px-3 py-2 text-sm text-white placeholder-zinc-600 outline-none focus:ring-1 focus:ring-[#ccf381]/30"
          />
          <div>
            <p className="text-[11px] text-zinc-500 mb-1">
              Alert thresholds: {form.thresholds.join("%, ")}%
            </p>
            <div className="flex gap-2">
              {[25, 50, 75, 80, 90, 100].map((t) => (
                <button
                  key={t}
                  onClick={() => {
                    const s = new Set(form.thresholds)
                    s.has(t) ? s.delete(t) : s.add(t)
                    setForm({ ...form, thresholds: Array.from(s).sort((a, b) => a - b) })
                  }}
                  className={`rounded px-2 py-1 text-[10px] transition-all ${
                    form.thresholds.includes(t)
                      ? "bg-[#ccf381]/15 text-[#ccf381]"
                      : "bg-white/[0.04] text-zinc-600"
                  }`}
                >
                  {t}%
                </button>
              ))}
            </div>
          </div>
          <button
            onClick={() => createMut.mutate({
              ...form,
              notificationEmail: form.notificationEmail || undefined,
            })}
            disabled={!form.displayName || createMut.isPending}
            className="w-full rounded-lg bg-[#ccf381] py-2 text-sm font-medium text-black hover:bg-[#daf7a0] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            {createMut.isPending ? "Creating..." : "Create Budget Alert"}
          </button>
          {createMut.isError && (
            <p className="text-xs text-rose-400">{createMut.error.message}</p>
          )}
        </div>
      )}
    </div>
  )
}

// ── Alert Policies Section ────────────────────────────────────

const ALERT_PRESETS = [
  { type: "error_rate" as const, label: "Error Rate", desc: "Alert when error responses exceed threshold", unit: "%" },
  { type: "latency" as const, label: "High Latency", desc: "Alert when P99 latency exceeds threshold", unit: "ms" },
  { type: "instance_crash" as const, label: "Instance Crash", desc: "Alert on container restarts", unit: "restarts" },
]

function AlertPoliciesSection() {
  const utils = api.useUtils()
  const { data: policies, isLoading } = api.infrastructure.alertPolicies.useQuery(
    undefined,
    { staleTime: 60_000 },
  )
  const deleteMut = api.infrastructure.deleteAlertPolicy.useMutation({
    onSuccess: () => utils.infrastructure.alertPolicies.invalidate(),
  })
  const createMut = api.infrastructure.createAlertPolicy.useMutation({
    onSuccess: () => {
      utils.infrastructure.alertPolicies.invalidate()
      setShowForm(false)
    },
  })

  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    type: "error_rate" as "error_rate" | "latency" | "instance_crash" | "custom",
    displayName: "",
    threshold: 5,
    notificationEmail: "",
  })

  return (
    <div className="rounded-2xl bg-[#161616] p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BellAlertIcon className="h-4 w-4 text-[#a78bfa]" />
          <h3 className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
            Alert Policies
          </h3>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1 rounded-lg bg-white/[0.04] px-3 py-1.5 text-[11px] text-zinc-400 hover:text-white transition-colors"
        >
          <PlusIcon className="h-3.5 w-3.5" />
          New Alert
        </button>
      </div>

      {isLoading ? (
        <div className="h-16 rounded-xl bg-white/[0.02] animate-pulse" />
      ) : policies && policies.length > 0 ? (
        <div className="space-y-2">
          {policies.map((p) => (
            <div
              key={p.name}
              className="flex items-center justify-between rounded-xl bg-white/[0.02] p-3"
            >
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm text-white">{p.displayName}</p>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[9px] font-medium ${
                      p.enabled
                        ? "bg-emerald-500/15 text-emerald-400"
                        : "bg-zinc-500/15 text-zinc-500"
                    }`}
                  >
                    {p.enabled ? "Active" : "Disabled"}
                  </span>
                </div>
                <p className="text-[11px] text-zinc-500">
                  {p.conditions.map((c) => c.displayName).join(", ")}
                </p>
              </div>
              <button
                onClick={() => deleteMut.mutate({ name: p.name })}
                disabled={deleteMut.isPending}
                className="rounded-lg p-1.5 text-zinc-600 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
              >
                <TrashIcon className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-zinc-600 py-2">No alert policies configured</p>
      )}

      {showForm && (
        <div className="rounded-xl bg-white/[0.02] p-4 space-y-3 border border-white/[0.04]">
          <div className="grid grid-cols-3 gap-2">
            {ALERT_PRESETS.map((preset) => (
              <button
                key={preset.type}
                onClick={() => setForm({ ...form, type: preset.type, displayName: preset.label })}
                className={`rounded-lg p-2.5 text-left transition-all ${
                  form.type === preset.type
                    ? "bg-[#a78bfa]/15 ring-1 ring-[#a78bfa]/30"
                    : "bg-white/[0.04] hover:bg-white/[0.06]"
                }`}
              >
                <p className={`text-xs font-medium ${form.type === preset.type ? "text-[#a78bfa]" : "text-zinc-400"}`}>
                  {preset.label}
                </p>
                <p className="text-[9px] text-zinc-600 mt-0.5">{preset.desc}</p>
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="Alert name"
              value={form.displayName}
              onChange={(e) => setForm({ ...form, displayName: e.target.value })}
              className="rounded-lg bg-white/[0.04] px-3 py-2 text-sm text-white placeholder-zinc-600 outline-none focus:ring-1 focus:ring-[#a78bfa]/30"
            />
            <input
              type="number"
              placeholder={`Threshold (${ALERT_PRESETS.find((p) => p.type === form.type)?.unit ?? ""})`}
              value={form.threshold}
              onChange={(e) => setForm({ ...form, threshold: +e.target.value })}
              className="rounded-lg bg-white/[0.04] px-3 py-2 text-sm text-white placeholder-zinc-600 outline-none focus:ring-1 focus:ring-[#a78bfa]/30"
            />
          </div>
          <input
            type="email"
            placeholder="Notification email"
            value={form.notificationEmail}
            onChange={(e) => setForm({ ...form, notificationEmail: e.target.value })}
            className="w-full rounded-lg bg-white/[0.04] px-3 py-2 text-sm text-white placeholder-zinc-600 outline-none focus:ring-1 focus:ring-[#a78bfa]/30"
          />
          <button
            onClick={() => createMut.mutate(form)}
            disabled={!form.displayName || !form.notificationEmail || createMut.isPending}
            className="w-full rounded-lg bg-[#a78bfa] py-2 text-sm font-medium text-white hover:bg-[#b99cff] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            {createMut.isPending ? "Creating..." : "Create Alert Policy"}
          </button>
          {createMut.isError && (
            <p className="text-xs text-rose-400">{createMut.error.message}</p>
          )}
        </div>
      )}
    </div>
  )
}

// ── Error Logs + AI Analysis Section ──────────────────────────

function ErrorLogsSection() {
  const { data: errors, isLoading } = api.infrastructure.recentErrors.useQuery(
    { hours: 24 },
    { staleTime: 30_000 },
  )
  const analyzeMut = api.infrastructure.analyzeFailure.useMutation()
  const [selectedErrors, setSelectedErrors] = useState<Set<string>>(new Set())
  const [analysis, setAnalysis] = useState<{
    rootCause: string
    severity: string
    impact: string
    fix: string
    prevention: string
  } | null>(null)

  const handleAnalyze = () => {
    if (!errors) return
    const msgs = errors
      .filter((e) => selectedErrors.has(e.insertId))
      .map((e) => `[${e.severity}] ${e.timestamp}: ${e.message}`)
    if (msgs.length === 0) return

    analyzeMut.mutate(
      { errorMessages: msgs },
      {
        onSuccess: (data) => setAnalysis(data),
      },
    )
  }

  const severityColor: Record<string, string> = {
    CRITICAL: "text-rose-400 bg-rose-500/15",
    ERROR: "text-orange-400 bg-orange-500/15",
    WARNING: "text-amber-400 bg-amber-500/15",
  }

  return (
    <div className="rounded-2xl bg-[#161616] p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ExclamationTriangleIcon className="h-4 w-4 text-orange-400" />
          <h3 className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
            Recent Errors (24h)
          </h3>
        </div>
        {selectedErrors.size > 0 && (
          <button
            onClick={handleAnalyze}
            disabled={analyzeMut.isPending}
            className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-[#a78bfa]/20 to-[#f472b6]/20 px-3 py-1.5 text-[11px] font-medium text-[#a78bfa] hover:from-[#a78bfa]/30 hover:to-[#f472b6]/30 transition-all"
          >
            <SparklesIcon className="h-3.5 w-3.5" />
            {analyzeMut.isPending ? "Analyzing..." : `Analyze ${selectedErrors.size} errors with AI`}
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 rounded-xl bg-white/[0.02] animate-pulse" />
          ))}
        </div>
      ) : errors && errors.length > 0 ? (
        <div className="space-y-1.5 max-h-[320px] overflow-y-auto">
          {errors.map((e) => (
            <button
              key={e.insertId}
              onClick={() => {
                const s = new Set(selectedErrors)
                s.has(e.insertId) ? s.delete(e.insertId) : s.add(e.insertId)
                setSelectedErrors(s)
              }}
              className={`w-full text-left rounded-xl p-3 transition-all ${
                selectedErrors.has(e.insertId)
                  ? "bg-[#a78bfa]/10 ring-1 ring-[#a78bfa]/20"
                  : "bg-white/[0.02] hover:bg-white/[0.04]"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span
                  className={`rounded px-1.5 py-0.5 text-[9px] font-medium ${
                    severityColor[e.severity] ?? "text-zinc-400 bg-zinc-500/15"
                  }`}
                >
                  {e.severity}
                </span>
                <span className="text-[10px] text-zinc-600">
                  {new Date(e.timestamp).toLocaleString()}
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 line-clamp-2 font-mono">
                {e.message}
              </p>
            </button>
          ))}
        </div>
      ) : (
        <div className="py-6 text-center">
          <p className="text-sm text-emerald-400 font-medium">No errors in the last 24h</p>
          <p className="text-[10px] text-zinc-600 mt-1">Your service is running clean</p>
        </div>
      )}

      {/* AI Analysis Result */}
      {analysis && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl bg-gradient-to-br from-[#a78bfa]/5 to-[#f472b6]/5 p-4 border border-[#a78bfa]/10 space-y-3"
        >
          <div className="flex items-center gap-2">
            <SparklesIcon className="h-4 w-4 text-[#a78bfa]" />
            <h4 className="text-xs font-medium text-[#a78bfa] uppercase tracking-wider">
              AI Analysis
            </h4>
            <span
              className={`rounded-full px-2 py-0.5 text-[9px] font-medium ${
                analysis.severity === "critical"
                  ? "bg-rose-500/15 text-rose-400"
                  : analysis.severity === "warning"
                    ? "bg-amber-500/15 text-amber-400"
                    : "bg-emerald-500/15 text-emerald-400"
              }`}
            >
              {analysis.severity}
            </span>
          </div>

          <div className="space-y-2.5">
            <div>
              <p className="text-[10px] text-zinc-600 uppercase tracking-wider mb-0.5">Root Cause</p>
              <p className="text-sm text-white">{analysis.rootCause}</p>
            </div>
            <div>
              <p className="text-[10px] text-zinc-600 uppercase tracking-wider mb-0.5">Impact</p>
              <p className="text-xs text-zinc-300">{analysis.impact}</p>
            </div>
            <div>
              <p className="text-[10px] text-zinc-600 uppercase tracking-wider mb-0.5">Recommended Fix</p>
              <p className="text-xs text-[#ccf381]">{analysis.fix}</p>
            </div>
            <div>
              <p className="text-[10px] text-zinc-600 uppercase tracking-wider mb-0.5">Prevention</p>
              <p className="text-xs text-zinc-400">{analysis.prevention}</p>
            </div>
          </div>

          <button
            onClick={() => setAnalysis(null)}
            className="text-[10px] text-zinc-600 hover:text-zinc-400 transition-colors"
          >
            Dismiss
          </button>
        </motion.div>
      )}
    </div>
  )
}

// ── Main Component ────────────────────────────────────────────

export function AlertsBudget() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BudgetSection />
        <AlertPoliciesSection />
      </div>
      <ErrorLogsSection />
    </motion.div>
  )
}

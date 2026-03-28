"use client"

import { useState, useEffect } from "react"
import { api } from "@/lib/trpc/react"
import { motion } from "framer-motion"

const CPU_OPTIONS = ["0.5", "1", "2", "4"] as const
const MEMORY_OPTIONS = ["256Mi", "512Mi", "1Gi", "2Gi", "4Gi"] as const

// Monthly cost estimate for min=1 instance (always-on)
function estimateMonthlyCost(
  cpu: string,
  memory: string,
  minInstances: number,
): number {
  if (minInstances === 0) return 0
  const cpuVal = parseFloat(cpu)
  const memGib = memory.endsWith("Gi")
    ? parseFloat(memory)
    : parseFloat(memory) / 1024
  const secsPerMonth = 30 * 24 * 3600
  // Free tier already covers most; estimate overage
  const cpuCost = Math.max(0, cpuVal * secsPerMonth * minInstances - 360_000) * 0.000024
  const memCost = Math.max(0, memGib * secsPerMonth * minInstances - 180_000) * 0.0000025
  return Math.round((cpuCost + memCost) * 100) / 100
}

export function ScalingControls() {
  const { data, isLoading, error } = api.infrastructure.serviceConfig.useQuery(
    undefined,
    { staleTime: 30_000 },
  )

  const utils = api.useUtils()
  const mutation = api.infrastructure.updateServiceConfig.useMutation({
    onSuccess: () => utils.infrastructure.serviceConfig.invalidate(),
  })

  // Local state for form
  const [min, setMin] = useState(0)
  const [max, setMax] = useState(2)
  const [cpu, setCpu] = useState<string>("1")
  const [memory, setMemory] = useState<string>("512Mi")
  const [cpuIdle, setCpuIdle] = useState(true)
  const [startupBoost, setStartupBoost] = useState(true)

  useEffect(() => {
    if (data) {
      setMin(data.minInstances)
      setMax(data.maxInstances)
      setCpu(data.cpu)
      setMemory(data.memory)
      setCpuIdle(data.cpuIdle)
      setStartupBoost(data.startupCpuBoost)
    }
  }, [data])

  if (isLoading)
    return (
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-44 rounded-2xl bg-[#161616] animate-pulse" />
        ))}
      </div>
    )

  if (error)
    return (
      <div className="rounded-2xl bg-[#161616] p-8 text-center">
        <p className="text-sm text-rose-400">
          Failed to fetch Cloud Run config
        </p>
        <p className="mt-1 text-xs text-zinc-600">{error.message}</p>
      </div>
    )

  if (!data) return null

  const hasChanges =
    min !== data.minInstances ||
    max !== data.maxInstances ||
    cpu !== data.cpu ||
    memory !== data.memory ||
    cpuIdle !== data.cpuIdle ||
    startupBoost !== data.startupCpuBoost

  const newCost = estimateMonthlyCost(cpu, memory, min)
  const curCost = estimateMonthlyCost(data.cpu, data.memory, data.minInstances)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Service Status */}
      <div className="rounded-2xl bg-[#161616] p-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <div>
            <p className="text-sm font-medium text-white">
              {data.serviceName}
            </p>
            <p className="text-[11px] text-zinc-500">{data.region}</p>
          </div>
        </div>
        <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-[11px] font-medium text-emerald-400">
          {data.status}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Instance Scaling */}
        <div className="rounded-2xl bg-[#161616] p-5 space-y-6">
          <h3 className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
            Instance Configuration
          </h3>

          {/* Min Instances */}
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm text-zinc-300">Min Instances</label>
              <span className="text-sm font-bold text-white">{min}</span>
            </div>
            <input
              type="range"
              min={0}
              max={10}
              value={min}
              onChange={(e) => {
                const v = +e.target.value
                setMin(v)
                if (v > max) setMax(v)
              }}
              className="w-full accent-[#ccf381]"
            />
            <p className="mt-1 text-[10px] text-zinc-600">
              {min === 0
                ? "$0/mo — scale-to-zero"
                : `~$${estimateMonthlyCost(cpu, memory, min).toFixed(2)}/mo — always warm`}
            </p>
          </div>

          {/* Max Instances */}
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm text-zinc-300">Max Instances</label>
              <span className="text-sm font-bold text-white">{max}</span>
            </div>
            <input
              type="range"
              min={1}
              max={10}
              value={max}
              onChange={(e) => {
                const v = +e.target.value
                setMax(v)
                if (v < min) setMin(v)
              }}
              className="w-full accent-[#ccf381]"
            />
            <p className="mt-1 text-[10px] text-zinc-600">
              Hard cap on concurrent instances
            </p>
          </div>

          {/* Toggles */}
          <div className="space-y-3 pt-2 border-t border-white/[0.04]">
            <Toggle
              label="CPU Idle Throttling"
              description="Throttle CPU between requests to save costs"
              checked={cpuIdle}
              onChange={setCpuIdle}
            />
            <Toggle
              label="Startup CPU Boost"
              description="Faster cold starts with temporary CPU boost"
              checked={startupBoost}
              onChange={setStartupBoost}
            />
          </div>
        </div>

        {/* Resource Limits */}
        <div className="rounded-2xl bg-[#161616] p-5 space-y-6">
          <h3 className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
            Resource Limits
          </h3>

          <div>
            <label className="text-sm text-zinc-300 block mb-2">
              CPU Allocation
            </label>
            <div className="flex gap-2">
              {CPU_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  onClick={() => setCpu(opt)}
                  className={`flex-1 rounded-lg py-2 text-sm font-medium transition-all ${
                    cpu === opt
                      ? "bg-[#ccf381]/15 text-[#ccf381] ring-1 ring-[#ccf381]/30"
                      : "bg-white/[0.04] text-zinc-400 hover:bg-white/[0.06]"
                  }`}
                >
                  {opt} vCPU
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm text-zinc-300 block mb-2">
              Memory Allocation
            </label>
            <div className="flex gap-2">
              {MEMORY_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  onClick={() => setMemory(opt)}
                  className={`flex-1 rounded-lg py-2 text-sm font-medium transition-all ${
                    memory === opt
                      ? "bg-[#a78bfa]/15 text-[#a78bfa] ring-1 ring-[#a78bfa]/30"
                      : "bg-white/[0.04] text-zinc-400 hover:bg-white/[0.06]"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* Cost Preview */}
          <div className="rounded-xl bg-white/[0.02] p-4 border border-white/[0.04]">
            <h4 className="text-xs text-zinc-500 mb-3 uppercase tracking-wider">
              Live Impact Preview
            </h4>
            <table className="w-full text-[12px]">
              <thead>
                <tr className="text-zinc-600">
                  <th className="text-left pb-2">Setting</th>
                  <th className="text-right pb-2">Current</th>
                  <th className="text-right pb-2">New</th>
                </tr>
              </thead>
              <tbody className="text-zinc-400">
                <Row label="Min Instances" cur={data.minInstances} next={min} />
                <Row label="Max Instances" cur={data.maxInstances} next={max} />
                <Row label="CPU" cur={data.cpu + " vCPU"} next={cpu + " vCPU"} />
                <Row label="Memory" cur={data.memory} next={memory} />
                <Row
                  label="CPU Idle"
                  cur={data.cpuIdle ? "On" : "Off"}
                  next={cpuIdle ? "On" : "Off"}
                />
                <Row
                  label="CPU Boost"
                  cur={data.startupCpuBoost ? "On" : "Off"}
                  next={startupBoost ? "On" : "Off"}
                />
              </tbody>
            </table>
            <div className="mt-3 pt-3 border-t border-white/[0.04] flex items-center justify-between">
              <span className="text-xs text-zinc-500">
                Est. monthly cost
              </span>
              <span
                className={`text-lg font-bold ${
                  newCost === 0 ? "text-emerald-400" : "text-[#ccf381]"
                }`}
              >
                ${newCost.toFixed(2)}/mo
                {newCost !== curCost && (
                  <span className="text-xs text-zinc-600 ml-2">
                    (was ${curCost.toFixed(2)})
                  </span>
                )}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Apply Button */}
      <div className="flex items-center justify-between rounded-2xl bg-[#161616] p-5">
        <p className="text-[11px] text-zinc-600">
          Changes will be applied via Cloud Run API and may cause a brief
          service restart.
        </p>
        <button
          disabled={!hasChanges || mutation.isPending}
          onClick={() =>
            mutation.mutate({
              minInstances: min,
              maxInstances: max,
              cpu: cpu as "0.5" | "1" | "2" | "4",
              memory: memory as "256Mi" | "512Mi" | "1Gi" | "2Gi" | "4Gi",
              cpuIdle,
              startupCpuBoost: startupBoost,
            })
          }
          className={`rounded-xl px-6 py-2.5 text-sm font-medium transition-all ${
            hasChanges && !mutation.isPending
              ? "bg-[#ccf381] text-black hover:bg-[#daf7a0]"
              : "bg-white/[0.04] text-zinc-600 cursor-not-allowed"
          }`}
        >
          {mutation.isPending ? "Applying..." : "Apply Changes"}
        </button>
      </div>

      {mutation.isSuccess && (
        <p className="text-xs text-emerald-400 text-center">
          Configuration updated successfully. New revision deploying...
        </p>
      )}
      {mutation.isError && (
        <p className="text-xs text-rose-400 text-center">
          Failed to update: {mutation.error.message}
        </p>
      )}
    </motion.div>
  )
}

// ── Sub-components ────────────────────────────────────────────

function Toggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string
  description: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-zinc-300">{label}</p>
        <p className="text-[10px] text-zinc-600">{description}</p>
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 rounded-full transition-colors ${
          checked ? "bg-[#ccf381]/30" : "bg-white/[0.06]"
        }`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full transition-all ${
            checked ? "left-[22px] bg-[#ccf381]" : "left-0.5 bg-zinc-500"
          }`}
        />
      </button>
    </div>
  )
}

function Row({
  label,
  cur,
  next,
}: {
  label: string
  cur: string | number
  next: string | number
}) {
  const changed = String(cur) !== String(next)
  return (
    <tr>
      <td className="py-1">{label}</td>
      <td className="text-right py-1 text-zinc-600">{cur}</td>
      <td className={`text-right py-1 ${changed ? "text-[#ccf381] font-medium" : ""}`}>
        {next}
      </td>
    </tr>
  )
}

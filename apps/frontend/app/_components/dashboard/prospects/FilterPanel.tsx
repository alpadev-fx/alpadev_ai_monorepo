"use client"

import { motion } from "framer-motion"

export interface ProspectFilters {
  nicho: string[]
  webStatus: string[]
  scoreMin?: number
  scoreMax?: number
  ciudad: string
  estado: string
  pais: string
  hasEmail?: boolean
  hasSocialMedia?: boolean
  verified?: boolean
  source: string
}

interface FilterPanelProps {
  filters: ProspectFilters
  nichoOptions: string[]
  onFiltersChange: (filters: ProspectFilters) => void
}

const WEB_STATUS_OPTIONS = [
  { value: "none", label: "None" },
  { value: "basic", label: "Basic" },
  { value: "poor", label: "Poor" },
]

export function FilterPanel({
  filters,
  nichoOptions,
  onFiltersChange,
}: FilterPanelProps) {
  const toggleNicho = (nicho: string) => {
    const updated = filters.nicho.includes(nicho)
      ? filters.nicho.filter((n) => n !== nicho)
      : [...filters.nicho, nicho]
    onFiltersChange({ ...filters, nicho: updated })
  }

  const toggleWebStatus = (status: string) => {
    const updated = filters.webStatus.includes(status)
      ? filters.webStatus.filter((s) => s !== status)
      : [...filters.webStatus, status]
    onFiltersChange({ ...filters, webStatus: updated })
  }

  const cycleTriState = (field: "hasEmail" | "hasSocialMedia" | "verified") => {
    const current = filters[field]
    // undefined → true → false → undefined
    const next =
      current === undefined ? true : current === true ? false : undefined
    onFiltersChange({ ...filters, [field]: next })
  }

  const triStateLabel = (value?: boolean) =>
    value === undefined ? "All" : value ? "Yes" : "No"

  const triStateColor = (value?: boolean) =>
    value === undefined
      ? "border-white/10 bg-white/5 text-zinc-400"
      : value
        ? "border-emerald-500/50 bg-emerald-500/20 text-emerald-400"
        : "border-rose-500/50 bg-rose-500/20 text-rose-400"

  return (
    <motion.div
      animate={{ opacity: 1, height: "auto" }}
      className="rounded-2xl border border-white/5 bg-white/5 p-5 backdrop-blur-xl"
      exit={{ opacity: 0, height: 0 }}
      initial={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
        {/* Nicho filter */}
        <div>
          <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-zinc-400">
            Nicho
          </label>
          <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
            {nichoOptions.length > 0 ? (
              nichoOptions.map((nicho) => (
                <button
                  key={nicho}
                  className={`rounded-lg border px-2.5 py-1 text-xs transition-colors ${
                    filters.nicho.includes(nicho)
                      ? "border-pink-500/50 bg-pink-500/20 text-pink-400"
                      : "border-white/10 bg-white/5 text-zinc-400 hover:bg-white/10"
                  }`}
                  onClick={() => toggleNicho(nicho)}
                >
                  {nicho}
                </button>
              ))
            ) : (
              <span className="text-xs text-zinc-600">No data</span>
            )}
          </div>
        </div>

        {/* Web Status filter */}
        <div>
          <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-zinc-400">
            Web Status
          </label>
          <div className="flex flex-wrap gap-1.5">
            {WEB_STATUS_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                className={`rounded-lg border px-2.5 py-1 text-xs transition-colors ${
                  filters.webStatus.includes(opt.value)
                    ? "border-pink-500/50 bg-pink-500/20 text-pink-400"
                    : "border-white/10 bg-white/5 text-zinc-400 hover:bg-white/10"
                }`}
                onClick={() => toggleWebStatus(opt.value)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Score range */}
        <div>
          <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-zinc-400">
            Score Range
          </label>
          <div className="flex items-center gap-2">
            <input
              className="w-16 rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 text-sm text-white placeholder-zinc-600 focus:border-pink-500/50 focus:outline-none"
              max={10}
              min={0}
              placeholder="Min"
              type="number"
              value={filters.scoreMin ?? ""}
              onChange={(e) =>
                onFiltersChange({
                  ...filters,
                  scoreMin: e.target.value ? Number(e.target.value) : undefined,
                })
              }
            />
            <span className="text-zinc-600">-</span>
            <input
              className="w-16 rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 text-sm text-white placeholder-zinc-600 focus:border-pink-500/50 focus:outline-none"
              max={10}
              min={0}
              placeholder="Max"
              type="number"
              value={filters.scoreMax ?? ""}
              onChange={(e) =>
                onFiltersChange({
                  ...filters,
                  scoreMax: e.target.value ? Number(e.target.value) : undefined,
                })
              }
            />
          </div>
        </div>

        {/* Location */}
        <div>
          <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-zinc-400">
            Location
          </label>
          <div className="space-y-1.5">
            <input
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white placeholder-zinc-600 focus:border-pink-500/50 focus:outline-none"
              placeholder="Pais"
              type="text"
              value={filters.pais}
              onChange={(e) =>
                onFiltersChange({ ...filters, pais: e.target.value })
              }
            />
            <input
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white placeholder-zinc-600 focus:border-pink-500/50 focus:outline-none"
              placeholder="Estado"
              type="text"
              value={filters.estado}
              onChange={(e) =>
                onFiltersChange({ ...filters, estado: e.target.value })
              }
            />
            <input
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white placeholder-zinc-600 focus:border-pink-500/50 focus:outline-none"
              placeholder="Ciudad"
              type="text"
              value={filters.ciudad}
              onChange={(e) =>
                onFiltersChange({ ...filters, ciudad: e.target.value })
              }
            />
          </div>
        </div>

        {/* Toggles: Email, Social, Verified */}
        <div>
          <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-zinc-400">
            Presence
          </label>
          <div className="space-y-1.5">
            <button
              className={`w-full rounded-lg border px-3 py-1.5 text-xs text-left transition-colors ${triStateColor(filters.hasEmail)}`}
              onClick={() => cycleTriState("hasEmail")}
            >
              Email: {triStateLabel(filters.hasEmail)}
            </button>
            <button
              className={`w-full rounded-lg border px-3 py-1.5 text-xs text-left transition-colors ${triStateColor(filters.hasSocialMedia)}`}
              onClick={() => cycleTriState("hasSocialMedia")}
            >
              Social: {triStateLabel(filters.hasSocialMedia)}
            </button>
            <button
              className={`w-full rounded-lg border px-3 py-1.5 text-xs text-left transition-colors ${triStateColor(filters.verified)}`}
              onClick={() => cycleTriState("verified")}
            >
              Verified: {triStateLabel(filters.verified)}
            </button>
          </div>
        </div>

        {/* Source */}
        <div>
          <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-zinc-400">
            Source
          </label>
          <input
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white placeholder-zinc-600 focus:border-pink-500/50 focus:outline-none"
            placeholder="e.g. newyork_codex"
            type="text"
            value={filters.source}
            onChange={(e) =>
              onFiltersChange({ ...filters, source: e.target.value })
            }
          />
        </div>
      </div>
    </motion.div>
  )
}

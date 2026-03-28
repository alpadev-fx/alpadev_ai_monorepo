"use client"

import { createColumnHelper } from "@tanstack/react-table"
import { GlobeAltIcon, CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/outline"
import type { Prospect } from "@package/db"

const columnHelper = createColumnHelper<Prospect>()

// --- Custom Cell Renderers ---

function ScoreBadge({ value }: { value: number }) {
  const color =
    value >= 8
      ? "bg-emerald-500/20 border-emerald-500/30 text-emerald-400"
      : value >= 6
        ? "bg-amber-500/20 border-amber-500/30 text-amber-400"
        : "bg-rose-500/20 border-rose-500/30 text-rose-400"
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${color}`}>
      {value}
    </span>
  )
}

function WebStatusPill({ value }: { value: string }) {
  const styles: Record<string, string> = {
    none: "bg-rose-500/20 border-rose-500/30 text-rose-400",
    basic: "bg-amber-500/20 border-amber-500/30 text-amber-400",
    poor: "bg-orange-500/20 border-orange-500/30 text-orange-400",
  }
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${styles[value] || styles.none}`}>
      {value}
    </span>
  )
}

function LinkCell({ value }: { value: string | null }) {
  if (!value) return <span className="text-zinc-600">-</span>
  let hostname = value
  try {
    hostname = new URL(value.startsWith("http") ? value : `https://${value}`).hostname
  } catch {
    /* use raw value */
  }
  return (
    <a
      className="inline-flex items-center gap-1 text-pink-400 hover:text-pink-300 transition-colors"
      href={value.startsWith("http") ? value : `https://${value}`}
      rel="noopener noreferrer"
      target="_blank"
    >
      <GlobeAltIcon className="h-3.5 w-3.5" />
      <span className="truncate max-w-[120px]">{hostname}</span>
    </a>
  )
}

function TagsCell({ value }: { value: string[] }) {
  if (!value || value.length === 0) return <span className="text-zinc-600">-</span>
  const visible = value.slice(0, 3)
  const remaining = value.length - 3
  return (
    <div className="flex flex-wrap gap-1">
      {visible.map((tag) => (
        <span
          key={tag}
          className="inline-flex rounded-md border border-white/10 bg-white/5 px-1.5 py-0.5 text-[10px] text-zinc-300"
        >
          {tag}
        </span>
      ))}
      {remaining > 0 && (
        <span className="inline-flex rounded-md border border-white/10 bg-white/5 px-1.5 py-0.5 text-[10px] text-zinc-500">
          +{remaining}
        </span>
      )}
    </div>
  )
}

function VerifiedBadge({ value }: { value: boolean }) {
  return value ? (
    <CheckCircleIcon className="h-5 w-5 text-emerald-400" />
  ) : (
    <XCircleIcon className="h-5 w-5 text-zinc-600" />
  )
}

function TruncatedText({ value, max = 80 }: { value: string | null; max?: number }) {
  if (!value) return <span className="text-zinc-600">-</span>
  if (value.length <= max) return <span>{value}</span>
  return (
    <span title={value}>
      {value.slice(0, max)}...
    </span>
  )
}

// --- Column Definitions ---

export const columns = [
  columnHelper.accessor("nombre", {
    header: "Nombre",
    cell: (info) => {
      const name = info.getValue()
      const words = name.split(" ").length
      return (
        <span
          className={`font-medium text-white ${
            words > 9 ? "whitespace-normal leading-tight line-clamp-3" : ""
          }`}
          style={words > 9 ? { maxWidth: 200 } : undefined}
        >
          {name}
        </span>
      )
    },
    size: 220,
    meta: { allowWrap: true },
  }),
  columnHelper.accessor("displayName", {
    header: "Display Name",
    cell: (info) => info.getValue() || <span className="text-zinc-600">-</span>,
    size: 180,
  }),
  columnHelper.accessor("nicho", {
    header: "Nicho",
    cell: (info) => (
      <span className="inline-flex rounded-full border border-violet-500/30 bg-violet-500/20 px-2 py-0.5 text-xs text-violet-400">
        {info.getValue()}
      </span>
    ),
    size: 160,
  }),
  columnHelper.accessor("industry", {
    header: "Industry",
    cell: (info) => <TagsCell value={info.getValue()} />,
    size: 160,
  }),
  columnHelper.accessor("ciudad", {
    header: "Ciudad",
    size: 120,
  }),
  columnHelper.accessor("estado", {
    header: "Estado",
    size: 80,
  }),
  columnHelper.accessor("pais", {
    header: "Pais",
    cell: (info) => {
      const row = info.row.original
      return (
        <span>
          {row.countryFlag ? `${row.countryFlag} ` : ""}
          {info.getValue()}
        </span>
      )
    },
    size: 80,
  }),
  columnHelper.accessor("direccion", {
    header: "Direccion",
    cell: (info) => <TruncatedText value={info.getValue()} max={40} />,
    size: 220,
  }),
  columnHelper.accessor("sitioWeb", {
    header: "Sitio Web",
    cell: (info) => <LinkCell value={info.getValue() ?? null} />,
    size: 160,
  }),
  columnHelper.accessor("email", {
    header: "Email",
    cell: (info) => <span className="text-zinc-300">{info.getValue() || "-"}</span>,
    size: 200,
  }),
  columnHelper.accessor("facebook", {
    header: "Facebook",
    cell: (info) => <LinkCell value={info.getValue() ?? null} />,
    size: 140,
  }),
  columnHelper.accessor("instagram", {
    header: "Instagram",
    cell: (info) => <LinkCell value={info.getValue() ?? null} />,
    size: 140,
  }),
  columnHelper.accessor("tiktok", {
    header: "TikTok",
    cell: (info) => <LinkCell value={info.getValue() ?? null} />,
    size: 140,
  }),
  columnHelper.accessor("telefono", {
    header: "Telefono",
    size: 140,
  }),
  columnHelper.accessor("description", {
    header: "Description",
    cell: (info) => <TruncatedText value={info.getValue() ?? null} max={60} />,
    size: 280,
  }),
  columnHelper.accessor("score", {
    header: "Score",
    cell: (info) => <ScoreBadge value={info.getValue()} />,
    size: 80,
  }),
  columnHelper.accessor("webStatus", {
    header: "Web Status",
    cell: (info) => <WebStatusPill value={info.getValue()} />,
    size: 110,
  }),
  columnHelper.accessor("serviciosRecomendados", {
    header: "Servicios Fit",
    cell: (info) => <TagsCell value={info.getValue()} />,
    size: 180,
  }),
  columnHelper.accessor("serviciosActivos", {
    header: "Servicios Activos",
    cell: (info) => <TagsCell value={info.getValue()} />,
    size: 160,
  }),
  columnHelper.accessor("opportunity", {
    header: "Opportunity",
    cell: (info) => <TagsCell value={info.getValue()} />,
    size: 180,
  }),
  columnHelper.accessor("tags", {
    header: "Tags",
    cell: (info) => <TagsCell value={info.getValue()} />,
    size: 160,
  }),
  columnHelper.accessor("recSoftware", {
    header: "Rec. Software",
    cell: (info) => <TagsCell value={info.getValue()} />,
    size: 200,
  }),
  columnHelper.accessor("recMarketing", {
    header: "Rec. Marketing",
    cell: (info) => <TagsCell value={info.getValue()} />,
    size: 200,
  }),
  columnHelper.accessor("recFinanzas", {
    header: "Rec. Finanzas",
    cell: (info) => <TagsCell value={info.getValue()} />,
    size: 180,
  }),
  columnHelper.accessor("verified", {
    header: "Verified",
    cell: (info) => <VerifiedBadge value={info.getValue()} />,
    size: 80,
  }),
  columnHelper.accessor("source", {
    header: "Source",
    cell: (info) => (
      <span className="text-xs text-zinc-400">{info.getValue() || "-"}</span>
    ),
    size: 160,
  }),
]

export const DEFAULT_VISIBLE_COLUMNS: Record<string, boolean> = {
  nombre: true,
  displayName: false,
  nicho: true,
  industry: false,
  ciudad: true,
  estado: true,
  pais: true,
  direccion: false,
  sitioWeb: true,
  email: true,
  facebook: false,
  instagram: false,
  tiktok: false,
  telefono: true,
  description: false,
  score: true,
  webStatus: true,
  serviciosRecomendados: true,
  serviciosActivos: false,
  opportunity: false,
  tags: false,
  recSoftware: false,
  recMarketing: false,
  recFinanzas: false,
  verified: true,
  source: false,
}

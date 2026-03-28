"use client"

import Modal from "@/app/_components/ui/Modal"
import type { Prospect } from "@package/db"
import {
  GlobeAltIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline"

interface ProspectDetailModalProps {
  prospect: Prospect | null
  open: boolean
  onClose: () => void
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="text-[10px] uppercase tracking-[0.15em] text-zinc-500 mb-2">{title}</h4>
      {children}
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between py-1.5">
      <span className="text-xs text-zinc-500 shrink-0">{label}</span>
      <span className="text-xs text-zinc-200 text-right ml-4">{value || <span className="text-zinc-700">-</span>}</span>
    </div>
  )
}

function TagList({ items, color = "zinc" }: { items: string[]; color?: string }) {
  if (!items || items.length === 0) return <span className="text-xs text-zinc-700">-</span>
  const colors: Record<string, string> = {
    zinc: "bg-white/[0.04] text-zinc-300",
    pink: "bg-[#ffb0cd]/10 text-[#ffb0cd]",
    violet: "bg-[#d0bcff]/10 text-[#d0bcff]",
    emerald: "bg-emerald-500/10 text-emerald-400",
    amber: "bg-amber-500/10 text-amber-400",
  }
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((item, i) => (
        <span key={i} className={`rounded-full px-2 py-0.5 text-[11px] ${colors[color]}`}>
          {item}
        </span>
      ))}
    </div>
  )
}

function RecommendationList({ items, color }: { items: string[]; color: string }) {
  if (!items || items.length === 0) return <span className="text-xs text-zinc-700">No recommendations</span>
  return (
    <ul className="space-y-1.5">
      {items.map((item, i) => (
        <li key={i} className="flex gap-2 text-xs text-zinc-300">
          <span className={`shrink-0 mt-1 h-1.5 w-1.5 rounded-full ${color}`} />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  )
}

function LinkItem({ icon: Icon, value, href }: { icon: typeof GlobeAltIcon; value: string | null | undefined; href?: string }) {
  if (!value) return null
  const content = (
    <span className="flex items-center gap-1.5 text-xs text-zinc-300">
      <Icon className="h-3.5 w-3.5 text-zinc-500" />
      <span className="truncate">{value}</span>
    </span>
  )
  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className="hover:text-[#ffb0cd] transition-colors">
        {content}
      </a>
    )
  }
  return content
}

export function ProspectDetailModal({ prospect, open, onClose }: ProspectDetailModalProps) {
  if (!prospect) return null

  const p = prospect
  const scoreColor =
    p.score >= 8 ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/20"
      : p.score >= 6 ? "bg-amber-500/15 text-amber-400 border-amber-500/20"
      : "bg-rose-500/15 text-rose-400 border-rose-500/20"

  const webStatusColor: Record<string, string> = {
    none: "bg-rose-500/15 text-rose-400",
    basic: "bg-amber-500/15 text-amber-400",
    poor: "bg-orange-500/15 text-orange-400",
  }

  return (
    <Modal open={open} onClose={onClose} size="4xl" title="">
      <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">{p.nombre}</h2>
            {p.displayName && p.displayName !== p.nombre && (
              <p className="text-sm text-zinc-400 mt-0.5">{p.displayName}</p>
            )}
            <div className="flex items-center gap-2 mt-2">
              <span className="rounded-full bg-[#d0bcff]/10 text-[#d0bcff] px-2.5 py-0.5 text-[11px]">{p.nicho}</span>
              <span className={`rounded-full px-2.5 py-0.5 text-[11px] ${webStatusColor[p.webStatus] || webStatusColor.none}`}>
                {p.webStatus}
              </span>
              <span className={`rounded-full border px-2.5 py-0.5 text-sm font-bold ${scoreColor}`}>
                {p.score}
              </span>
              {p.verified ? (
                <CheckCircleIcon className="h-5 w-5 text-emerald-400" />
              ) : (
                <XCircleIcon className="h-5 w-5 text-zinc-600" />
              )}
            </div>
          </div>
          {p.countryFlag && (
            <span className="text-3xl">{p.countryFlag}</span>
          )}
        </div>

        {/* Description */}
        {p.description && (
          <div className="rounded-xl bg-white/[0.03] p-4">
            <p className="text-sm text-zinc-300 leading-relaxed">{p.description}</p>
          </div>
        )}

        {/* Two column grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left: Contact & Location */}
          <div className="space-y-5">
            <Section title="Contact">
              <div className="space-y-2">
                <LinkItem icon={GlobeAltIcon} value={p.sitioWeb} href={p.sitioWeb?.startsWith("http") ? p.sitioWeb : p.sitioWeb ? `https://${p.sitioWeb}` : undefined} />
                <LinkItem icon={EnvelopeIcon} value={p.email} href={p.email ? `mailto:${p.email}` : undefined} />
                <LinkItem icon={PhoneIcon} value={p.telefono} href={p.telefono ? `tel:${p.telefono}` : undefined} />
              </div>
            </Section>

            <Section title="Social Media">
              <div className="space-y-1.5">
                {p.facebook && <InfoRow label="Facebook" value={p.facebook} />}
                {p.instagram && <InfoRow label="Instagram" value={p.instagram} />}
                {p.tiktok && <InfoRow label="TikTok" value={p.tiktok} />}
                {!p.facebook && !p.instagram && !p.tiktok && (
                  <span className="text-xs text-zinc-700">No social media</span>
                )}
              </div>
            </Section>

            <Section title="Location">
              <div className="space-y-0">
                <InfoRow label="Address" value={p.direccion} />
                <InfoRow label="City" value={p.ciudad} />
                <InfoRow label="State" value={p.estado} />
                <InfoRow label="Country" value={`${p.countryFlag || ""} ${p.pais}`} />
              </div>
            </Section>

            <Section title="Metadata">
              <div className="space-y-0">
                <InfoRow label="Source" value={p.source} />
                <InfoRow label="Verified" value={p.verified ? "Yes" : "No"} />
                {p.verifiedAt && <InfoRow label="Verified At" value={new Date(p.verifiedAt).toLocaleDateString()} />}
                {p.verificationNotes && <InfoRow label="Notes" value={p.verificationNotes} />}
                <InfoRow label="Created" value={new Date(p.createdAt).toLocaleDateString()} />
                <InfoRow label="Updated" value={new Date(p.updatedAt).toLocaleDateString()} />
              </div>
            </Section>
          </div>

          {/* Right: Services & Tags */}
          <div className="space-y-5">
            <Section title="Industry">
              <TagList items={p.industry} color="zinc" />
            </Section>

            <Section title="Services Fit">
              <TagList items={p.serviciosRecomendados} color="pink" />
            </Section>

            <Section title="Active Services">
              <TagList items={p.serviciosActivos} color="emerald" />
            </Section>

            <Section title="Opportunity">
              <TagList items={p.opportunity} color="violet" />
            </Section>

            <Section title="Tags">
              <TagList items={p.tags} color="amber" />
            </Section>
          </div>
        </div>

        {/* Recommendations — full width */}
        <div className="space-y-4">
          <h3 className="text-xs uppercase tracking-[0.15em] text-zinc-400 font-medium">Recommendations</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Software */}
            <div className="rounded-xl bg-white/[0.03] p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="h-2 w-2 rounded-full bg-[#ffb0cd]" />
                <h4 className="text-xs font-medium text-zinc-300">Software</h4>
              </div>
              <RecommendationList items={p.recSoftware} color="bg-[#ffb0cd]" />
            </div>

            {/* Marketing */}
            <div className="rounded-xl bg-white/[0.03] p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="h-2 w-2 rounded-full bg-[#d0bcff]" />
                <h4 className="text-xs font-medium text-zinc-300">Marketing</h4>
              </div>
              <RecommendationList items={p.recMarketing} color="bg-[#d0bcff]" />
            </div>

            {/* Finance */}
            <div className="rounded-xl bg-white/[0.03] p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="h-2 w-2 rounded-full bg-emerald-400" />
                <h4 className="text-xs font-medium text-zinc-300">Finance</h4>
              </div>
              <RecommendationList items={p.recFinanzas} color="bg-emerald-400" />
            </div>
          </div>
        </div>
      </div>
    </Modal>
  )
}

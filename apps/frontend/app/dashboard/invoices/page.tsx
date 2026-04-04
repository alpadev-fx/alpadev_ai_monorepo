"use client"

import { useState, useMemo } from "react"
import { api } from "@/lib/trpc/react"
import { motion } from "framer-motion"
import {
  BanknotesIcon,
  ClockIcon,
  CheckCircleIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline"

type InvoiceStatus = "DRAFT" | "SENT" | "PAID" | "OVERDUE" | "CANCELLED"

const STATUS_BADGES: Record<InvoiceStatus, string> = {
  DRAFT: "bg-zinc-500/15 text-zinc-400",
  SENT: "bg-blue-500/15 text-blue-400",
  PAID: "bg-emerald-500/15 text-emerald-400",
  OVERDUE: "bg-rose-500/15 text-rose-400",
  CANCELLED: "bg-zinc-800 text-zinc-600",
}

const FILTER_TABS: Array<{ label: string; value: InvoiceStatus | "ALL" }> = [
  { label: "All", value: "ALL" },
  { label: "Draft", value: "DRAFT" },
  { label: "Sent", value: "SENT" },
  { label: "Paid", value: "PAID" },
  { label: "Overdue", value: "OVERDUE" },
  { label: "Cancelled", value: "CANCELLED" },
]

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount)
}

function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date))
}

export default function InvoicesPage() {
  const [activeFilter, setActiveFilter] = useState<InvoiceStatus | "ALL">("ALL")

  const { data: invoices, isLoading } = api.invoice.getAll.useQuery(undefined, {
    staleTime: 2 * 60_000,
    refetchOnWindowFocus: false,
  })

  const utils = api.useUtils()

  const updateMutation = api.invoice.update.useMutation({
    onSuccess: () => utils.invoice.getAll.invalidate(),
  })

  const handleStatusChange = (id: string, status: InvoiceStatus) => {
    updateMutation.mutate({ id, status })
  }

  const summary = useMemo(() => {
    if (!invoices) return { outstanding: 0, overdue: 0, paidThisMonth: 0, draft: 0 }

    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

    return {
      outstanding: invoices
        .filter((inv) => inv.status !== "PAID" && inv.status !== "CANCELLED")
        .reduce((sum, inv) => sum + inv.amount, 0),
      overdue: invoices.filter((inv) => inv.status === "OVERDUE").length,
      paidThisMonth: invoices.filter(
        (inv) => inv.status === "PAID" && new Date(inv.dueDate) >= monthStart
      ).length,
      draft: invoices.filter((inv) => inv.status === "DRAFT").length,
    }
  }, [invoices])

  const filtered = useMemo(() => {
    if (!invoices) return []
    if (activeFilter === "ALL") return invoices
    return invoices.filter((inv) => inv.status === activeFilter)
  }, [invoices, activeFilter])

  if (isLoading || !invoices) {
    return (
      <div className="space-y-8">
        <div className="h-8 w-48 rounded-lg bg-white/[0.04] animate-pulse" />
        <div className="grid grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 rounded-2xl bg-[#161616] animate-pulse" />
          ))}
        </div>
        <div className="h-10 w-96 rounded-xl bg-white/[0.04] animate-pulse" />
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-14 rounded-2xl bg-[#161616] animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  const kpis = [
    {
      label: "Total Outstanding",
      value: formatCurrency(summary.outstanding),
      icon: BanknotesIcon,
      color: "text-[#ffb0cd]",
      bg: "bg-[#ffb0cd]/10",
    },
    {
      label: "Overdue",
      value: summary.overdue.toString(),
      icon: ClockIcon,
      color: "text-rose-400",
      bg: "bg-rose-400/10",
    },
    {
      label: "Paid This Month",
      value: summary.paidThisMonth.toString(),
      icon: CheckCircleIcon,
      color: "text-emerald-400",
      bg: "bg-emerald-400/10",
    },
    {
      label: "Drafts",
      value: summary.draft.toString(),
      icon: DocumentTextIcon,
      color: "text-[#d0bcff]",
      bg: "bg-[#d0bcff]/10",
    },
  ]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-8 h-full overflow-y-auto"
    >
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Invoices</h1>
        <p className="mt-0.5 text-xs text-zinc-500">Track and manage your invoices</p>
      </div>

      {/* KPIs */}
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

      {/* Filter Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, delay: 0.28 }}
        className="flex gap-1.5"
      >
        {FILTER_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveFilter(tab.value)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
              activeFilter === tab.value
                ? "bg-[#ffb0cd]/15 text-[#ffb0cd]"
                : "text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.04]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </motion.div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, delay: 0.34 }}
        className="rounded-2xl bg-[#161616] overflow-hidden"
      >
        {/* Header */}
        <div className="grid grid-cols-[1fr_120px_100px_120px_160px] gap-4 px-5 py-3 border-b border-white/[0.04]">
          <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Client</span>
          <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider text-right">Amount</span>
          <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Status</span>
          <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Due Date</span>
          <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider text-right">Actions</span>
        </div>

        {/* Rows */}
        {filtered.length === 0 ? (
          <div className="px-5 py-12 text-center text-sm text-zinc-600">
            No invoices found
          </div>
        ) : (
          filtered.map((invoice, i) => (
            <motion.div
              key={invoice.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: 0.36 + i * 0.03 }}
              className="grid grid-cols-[1fr_120px_100px_120px_160px] gap-4 px-5 py-3.5 items-center border-b border-white/[0.02] hover:bg-[#1a1a1a] transition-colors"
            >
              <span className="text-[13px] text-white truncate">{invoice.client}</span>
              <span className="text-[13px] text-white text-right font-medium">
                {formatCurrency(invoice.amount)}
              </span>
              <span
                className={`text-[11px] font-medium px-2 py-0.5 rounded-xl w-fit ${
                  STATUS_BADGES[invoice.status as InvoiceStatus]
                }`}
              >
                {invoice.status}
              </span>
              <span className="text-[12px] text-zinc-400">
                {formatDate(invoice.dueDate)}
              </span>
              <div className="flex gap-2 justify-end">
                {invoice.status === "DRAFT" && (
                  <button
                    onClick={() => handleStatusChange(invoice.id, "SENT")}
                    disabled={updateMutation.isPending}
                    className="text-[11px] px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-colors disabled:opacity-50"
                  >
                    Mark Sent
                  </button>
                )}
                {(invoice.status === "SENT" || invoice.status === "OVERDUE") && (
                  <button
                    onClick={() => handleStatusChange(invoice.id, "PAID")}
                    disabled={updateMutation.isPending}
                    className="text-[11px] px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors disabled:opacity-50"
                  >
                    Mark Paid
                  </button>
                )}
              </div>
            </motion.div>
          ))
        )}
      </motion.div>
    </motion.div>
  )
}

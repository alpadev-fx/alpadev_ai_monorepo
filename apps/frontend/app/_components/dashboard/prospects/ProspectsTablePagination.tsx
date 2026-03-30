"use client"

import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline"

const PAGE_SIZE_OPTIONS = [
  { label: "25", value: 25 },
  { label: "50", value: 50 },
  { label: "100", value: 100 },
  { label: "All", value: 50000 },
]

interface ProspectsTablePaginationProps {
  page: number
  pageSize: number
  total: number
  totalPages: number
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
}

export function ProspectsTablePagination({
  page,
  pageSize,
  total,
  totalPages,
  onPageChange,
  onPageSizeChange,
}: ProspectsTablePaginationProps) {
  const start = (page - 1) * pageSize + 1
  const end = Math.min(page * pageSize, total)
  const getPageNumbers = () => {
    const pages: number[] = []
    let startPage = Math.max(1, page - 2)
    const endPage = Math.min(totalPages, startPage + 4)
    startPage = Math.max(1, endPage - 4)
    for (let i = startPage; i <= endPage; i++) pages.push(i)
    return pages
  }

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <span className="text-xs text-zinc-500">
          {total > 0 ? `${start}-${end}` : "0"} of {total.toLocaleString()}
        </span>
        <div className="flex items-center gap-1">
          {PAGE_SIZE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              className={`rounded-lg px-2.5 py-1 text-xs transition-colors ${
                pageSize === opt.value
                  ? "bg-[#ffb0cd]/10 text-[#ffb0cd]"
                  : "text-zinc-600 hover:text-zinc-400 hover:bg-white/[0.04]"
              }`}
              onClick={() => onPageSizeChange(opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center gap-1">
          <button
            className="rounded-lg bg-white/[0.04] p-1.5 text-zinc-500 transition-colors hover:bg-white/[0.08] hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
          >
            <ChevronLeftIcon className="h-3.5 w-3.5" />
          </button>

          {getPageNumbers().map((p) => (
            <button
              key={p}
              className={`min-w-[28px] rounded-lg px-1.5 py-1 text-xs transition-colors ${
                p === page
                  ? "bg-[#ffb0cd]/10 text-[#ffb0cd]"
                  : "text-zinc-600 hover:text-zinc-400 hover:bg-white/[0.04]"
              }`}
              onClick={() => onPageChange(p)}
            >
              {p}
            </button>
          ))}

          <button
            className="rounded-lg bg-white/[0.04] p-1.5 text-zinc-500 transition-colors hover:bg-white/[0.08] hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
          >
            <ChevronRightIcon className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  )
}

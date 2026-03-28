"use client"

import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline"

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

  // Smart page number windowing (max 5 visible)
  const getPageNumbers = () => {
    const pages: number[] = []
    let startPage = Math.max(1, page - 2)
    const endPage = Math.min(totalPages, startPage + 4)
    startPage = Math.max(1, endPage - 4)

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i)
    }
    return pages
  }

  return (
    <div className="flex items-center justify-between px-2 py-4">
      <div className="flex items-center gap-4">
        <span className="text-sm text-zinc-400">
          Showing {total > 0 ? start : 0}-{end} of {total}
        </span>
        <select
          className="rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-sm text-zinc-300 focus:border-pink-500/50 focus:outline-none"
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
        >
          {[10, 25, 50, 100].map((size) => (
            <option key={size} className="bg-zinc-900" value={size}>
              {size} / page
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-1">
        <button
          className="rounded-lg border border-white/10 bg-white/5 p-1.5 text-zinc-400 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronLeftIcon className="h-4 w-4" />
        </button>

        {getPageNumbers().map((p) => (
          <button
            key={p}
            className={`min-w-[32px] rounded-lg border px-2 py-1 text-sm transition-colors ${
              p === page
                ? "border-pink-500/50 bg-pink-500/20 text-pink-400"
                : "border-white/10 bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white"
            }`}
            onClick={() => onPageChange(p)}
          >
            {p}
          </button>
        ))}

        <button
          className="rounded-lg border border-white/10 bg-white/5 p-1.5 text-zinc-400 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          <ChevronRightIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

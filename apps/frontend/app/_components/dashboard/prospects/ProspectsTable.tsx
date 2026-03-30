"use client"

import { useRef, memo } from "react"
import { flexRender, type Table, type Row } from "@tanstack/react-table"
import { useVirtualizer } from "@tanstack/react-virtual"
import type { Prospect } from "@package/db"

interface ProspectsTableProps {
  table: Table<Prospect>
  isLoading: boolean
  onRowClick?: (prospect: Prospect) => void
}

const ROW_HEIGHT = 44
const OVERSCAN = 20
const VIRTUALIZE_THRESHOLD = 100 // virtualize only when rows exceed this count
const SKELETON_WIDTHS = [65, 80, 45, 72, 58, 90, 52, 68]

function LoadingSkeleton({ cols }: { cols: number }) {
  return (
    <>
      {Array.from({ length: 8 }).map((_, i) => (
        <tr key={i}>
          {Array.from({ length: cols }).map((_, j) => (
            <td key={j} className="px-4 py-3.5">
              <div
                className="h-4 rounded-md bg-white/[0.06] animate-pulse"
                style={{ width: `${SKELETON_WIDTHS[(i * cols + j) % SKELETON_WIDTHS.length]}%` }}
              />
            </td>
          ))}
        </tr>
      ))}
    </>
  )
}

const TableRow = memo(
  function TableRow({ row }: { row: Row<Prospect> }) {
    return (
      <>
        {row.getVisibleCells().map((cell, idx) => (
          <td
            key={cell.id}
            className={`px-4 py-3 text-[13px] text-zinc-300 ${
              (cell.column.columnDef.meta as Record<string, unknown>)?.allowWrap
                ? ""
                : "whitespace-nowrap"
            } ${idx === 0 ? "sticky left-0 z-10 bg-[#161616]" : ""}`}
          >
            {flexRender(cell.column.columnDef.cell, cell.getContext())}
          </td>
        ))}
      </>
    )
  },
  (prev, next) => prev.row.original.id === next.row.original.id,
)

export function ProspectsTable({ table, isLoading, onRowClick }: ProspectsTableProps) {
  const visibleCols = table.getVisibleFlatColumns().length
  const scrollRef = useRef<HTMLDivElement>(null)
  const { rows } = table.getRowModel()
  const useVirtual = rows.length > VIRTUALIZE_THRESHOLD

  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: OVERSCAN,
    enabled: useVirtual,
  })

  const virtualRows = virtualizer.getVirtualItems()
  const totalHeight = virtualizer.getTotalSize()
  const paddingTop = virtualRows[0]?.start ?? 0
  const paddingBottom =
    virtualRows.length > 0 ? totalHeight - (virtualRows.at(-1)?.end ?? 0) : 0

  return (
    <div className="rounded-2xl bg-[#161616] overflow-hidden flex-1 min-h-0 flex flex-col">
      <div ref={scrollRef} className="overflow-auto flex-1">
        <table className="w-max min-w-full border-collapse">
          <thead className="sticky top-0 z-20">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="bg-[#1b1b1b]">
                {headerGroup.headers.map((header, idx) => (
                  <th
                    key={header.id}
                    className={`whitespace-nowrap px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.15em] text-zinc-500 transition-colors ${
                      idx === 0 ? "sticky left-0 z-30 bg-[#1b1b1b]" : ""
                    } ${header.column.getCanSort() ? "cursor-pointer select-none hover:text-zinc-300" : ""}`}
                    style={{ width: header.getSize() }}
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <div className="flex items-center gap-1.5">
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                      {header.column.getIsSorted() === "asc" && (
                        <span className="text-[#ffb0cd]">&#8593;</span>
                      )}
                      {header.column.getIsSorted() === "desc" && (
                        <span className="text-[#ffb0cd]">&#8595;</span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {isLoading ? (
              <LoadingSkeleton cols={visibleCols} />
            ) : rows.length === 0 ? (
              <tr>
                <td className="px-4 py-20 text-center" colSpan={visibleCols}>
                  <div className="flex flex-col items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-white/[0.04] flex items-center justify-center">
                      <ClipboardIcon className="h-6 w-6 text-zinc-700" />
                    </div>
                    <p className="text-sm text-zinc-500">No prospects found</p>
                    <p className="text-xs text-zinc-700">Import a file or adjust your filters</p>
                  </div>
                </td>
              </tr>
            ) : useVirtual ? (
              <>
                {paddingTop > 0 && (
                  <tr>
                    <td style={{ height: paddingTop }} colSpan={visibleCols} />
                  </tr>
                )}
                {virtualRows.map((vRow) => {
                  const row = rows[vRow.index]
                  return (
                    <tr
                      key={row.id}
                      className={`transition-colors duration-100 hover:bg-white/[0.03] ${
                        vRow.index % 2 === 1 ? "bg-white/[0.015]" : ""
                      } ${onRowClick ? "cursor-pointer" : ""}`}
                      style={{ height: ROW_HEIGHT }}
                      onClick={() => onRowClick?.(row.original)}
                    >
                      <TableRow row={row} />
                    </tr>
                  )
                })}
                {paddingBottom > 0 && (
                  <tr>
                    <td style={{ height: paddingBottom }} colSpan={visibleCols} />
                  </tr>
                )}
              </>
            ) : (
              rows.map((row, rowIdx) => (
                <tr
                  key={row.id}
                  className={`transition-colors duration-100 hover:bg-white/[0.03] ${
                    rowIdx % 2 === 1 ? "bg-white/[0.015]" : ""
                  } ${onRowClick ? "cursor-pointer" : ""}`}
                  onClick={() => onRowClick?.(row.original)}
                >
                  {row.getVisibleCells().map((cell, idx) => (
                    <td
                      key={cell.id}
                      className={`px-4 py-3 text-[13px] text-zinc-300 ${
                        (cell.column.columnDef.meta as Record<string, unknown>)?.allowWrap
                          ? ""
                          : "whitespace-nowrap"
                      } ${idx === 0 ? "sticky left-0 z-10 bg-[#161616]" : ""}`}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {!isLoading && rows.length > 0 && (
        <div className="flex items-center justify-between bg-[#1b1b1b]/50 px-4 py-2 shrink-0">
          <span className="text-[11px] text-zinc-600">
            {rows.length.toLocaleString()} rows
          </span>
          <span className="text-[11px] text-zinc-700">
            {table.getVisibleFlatColumns().length}/{table.getAllColumns().length} cols
          </span>
        </div>
      )}
    </div>
  )
}

function ClipboardIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25Z" />
    </svg>
  )
}

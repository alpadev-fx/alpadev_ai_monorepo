"use client"

import { flexRender, type Table } from "@tanstack/react-table"
import type { Prospect } from "@package/db"

interface ProspectsTableProps {
  table: Table<Prospect>
  isLoading: boolean
}

export function ProspectsTable({ table, isLoading }: ProspectsTableProps) {
  return (
    <div className="rounded-3xl border border-white/5 bg-white/5 backdrop-blur-2xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="bg-white/5">
                {headerGroup.headers.map((header, idx) => (
                  <th
                    key={header.id}
                    className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-400 ${
                      idx === 0
                        ? "sticky left-0 z-10 bg-zinc-900/80 backdrop-blur-sm"
                        : ""
                    } ${header.column.getCanSort() ? "cursor-pointer select-none" : ""}`}
                    style={{ width: header.getSize() }}
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <div className="flex items-center gap-1">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                      {header.column.getIsSorted() === "asc" && (
                        <span className="text-pink-400">↑</span>
                      )}
                      {header.column.getIsSorted() === "desc" && (
                        <span className="text-pink-400">↓</span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td
                  className="px-4 py-12 text-center text-zinc-500"
                  colSpan={table.getVisibleFlatColumns().length}
                >
                  Loading prospects...
                </td>
              </tr>
            ) : table.getRowModel().rows.length === 0 ? (
              <tr>
                <td
                  className="px-4 py-12 text-center text-zinc-500"
                  colSpan={table.getVisibleFlatColumns().length}
                >
                  No prospects found
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-white/5 transition-colors hover:bg-white/5"
                >
                  {row.getVisibleCells().map((cell, idx) => (
                    <td
                      key={cell.id}
                      className={`px-4 py-3 text-sm text-zinc-300 ${
                        idx === 0
                          ? "sticky left-0 z-10 bg-zinc-900/80 backdrop-blur-sm"
                          : ""
                      }`}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

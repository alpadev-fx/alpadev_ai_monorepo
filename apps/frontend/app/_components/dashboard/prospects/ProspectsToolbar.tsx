"use client"

import { useState, useRef, useEffect } from "react"
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  XMarkIcon,
  EyeIcon,
} from "@heroicons/react/24/outline"
import type { Table } from "@tanstack/react-table"
import type { Prospect } from "@package/db"

interface ProspectsToolbarProps {
  table: Table<Prospect>
  search: string
  onSearchChange: (value: string) => void
  showFilters: boolean
  onToggleFilters: () => void
  activeFilterCount: number
  onImport: () => void
  onExport: (format: "csv" | "json") => void
}

export function ProspectsToolbar({
  table,
  search,
  onSearchChange,
  showFilters,
  onToggleFilters,
  activeFilterCount,
  onImport,
  onExport,
}: ProspectsToolbarProps) {
  const [showColumns, setShowColumns] = useState(false)
  const [showExportMenu, setShowExportMenu] = useState(false)
  const columnsRef = useRef<HTMLDivElement>(null)
  const exportRef = useRef<HTMLDivElement>(null)

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (columnsRef.current && !columnsRef.current.contains(e.target as Node))
        setShowColumns(false)
      if (exportRef.current && !exportRef.current.contains(e.target as Node))
        setShowExportMenu(false)
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Search */}
      <div className="relative flex-1 min-w-[200px]">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
        <input
          className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-9 pr-8 text-sm text-white placeholder-zinc-600 transition-colors focus:border-pink-500/50 focus:outline-none focus:ring-1 focus:ring-pink-500/30"
          placeholder="Search prospects..."
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
        {search && (
          <button
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-zinc-500 hover:text-white"
            onClick={() => onSearchChange("")}
          >
            <XMarkIcon className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Filter toggle */}
      <button
        className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm transition-colors ${
          showFilters
            ? "border-pink-500/50 bg-pink-500/20 text-pink-400"
            : "border-white/10 bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white"
        }`}
        onClick={onToggleFilters}
      >
        <FunnelIcon className="h-4 w-4" />
        Filters
        {activeFilterCount > 0 && (
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-pink-500 text-[10px] font-bold text-white">
            {activeFilterCount}
          </span>
        )}
      </button>

      {/* Column visibility */}
      <div className="relative" ref={columnsRef}>
        <button
          className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-zinc-400 transition-colors hover:bg-white/10 hover:text-white"
          onClick={() => setShowColumns(!showColumns)}
        >
          <EyeIcon className="h-4 w-4" />
          Columns
        </button>
        {showColumns && (
          <div className="absolute right-0 top-full z-20 mt-2 w-56 rounded-xl border border-white/10 bg-zinc-900/95 p-3 backdrop-blur-xl shadow-2xl">
            <div className="max-h-64 space-y-1 overflow-y-auto">
              {table.getAllLeafColumns().map((column) => (
                <label
                  key={column.id}
                  className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-zinc-300 hover:bg-white/5"
                >
                  <input
                    checked={column.getIsVisible()}
                    className="rounded border-zinc-600 bg-white/5 text-pink-500 focus:ring-pink-500/30"
                    type="checkbox"
                    onChange={column.getToggleVisibilityHandler()}
                  />
                  {typeof column.columnDef.header === "string"
                    ? column.columnDef.header
                    : column.id}
                </label>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Import */}
      <button
        className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-zinc-400 transition-colors hover:bg-white/10 hover:text-white"
        onClick={onImport}
      >
        <ArrowUpTrayIcon className="h-4 w-4" />
        Import
      </button>

      {/* Export dropdown */}
      <div className="relative" ref={exportRef}>
        <button
          className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-zinc-400 transition-colors hover:bg-white/10 hover:text-white"
          onClick={() => setShowExportMenu(!showExportMenu)}
        >
          <ArrowDownTrayIcon className="h-4 w-4" />
          Export
        </button>
        {showExportMenu && (
          <div className="absolute right-0 top-full z-20 mt-2 w-36 rounded-xl border border-white/10 bg-zinc-900/95 p-1.5 backdrop-blur-xl shadow-2xl">
            <button
              className="w-full rounded-lg px-3 py-2 text-left text-sm text-zinc-300 hover:bg-white/10"
              onClick={() => {
                onExport("csv")
                setShowExportMenu(false)
              }}
            >
              Export CSV
            </button>
            <button
              className="w-full rounded-lg px-3 py-2 text-left text-sm text-zinc-300 hover:bg-white/10"
              onClick={() => {
                onExport("json")
                setShowExportMenu(false)
              }}
            >
              Export JSON
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

"use client"

import { useState, useMemo, useCallback } from "react"
import {
  useReactTable,
  getCoreRowModel,
  type SortingState,
  type VisibilityState,
} from "@tanstack/react-table"
import { motion, AnimatePresence } from "framer-motion"
import { api } from "@/lib/trpc/react"
import { columns, DEFAULT_VISIBLE_COLUMNS } from "./columns"
import { ProspectsTable } from "./ProspectsTable"
import { ProspectsToolbar } from "./ProspectsToolbar"
import { FilterPanel } from "./FilterPanel"
import { ImportModal } from "./ImportModal"

export function ProspectsPage() {
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [sorting, setSorting] = useState<SortingState>([
    { id: "createdAt", desc: true },
  ])
  const [columnVisibility, setColumnVisibility] =
    useState<VisibilityState>(DEFAULT_VISIBLE_COLUMNS)
  const [showFilters, setShowFilters] = useState(false)
  const [showImport, setShowImport] = useState(false)
  const [filters, setFilters] = useState({
    nicho: [] as string[],
    webStatus: [] as string[],
    scoreMin: undefined as number | undefined,
    scoreMax: undefined as number | undefined,
    ciudad: "",
    estado: "",
    pais: "",
    hasEmail: undefined as boolean | undefined,
    hasSocialMedia: undefined as boolean | undefined,
    verified: undefined as boolean | undefined,
    source: "",
  })

  // Debounce search
  const debounceTimer = useMemo(() => {
    let timer: ReturnType<typeof setTimeout>
    return (value: string) => {
      clearTimeout(timer)
      timer = setTimeout(() => setDebouncedSearch(value), 300)
    }
  }, [])

  const handleSearchChange = useCallback(
    (value: string) => {
      setSearch(value)
      debounceTimer(value)
    },
    [debounceTimer],
  )

  // Build query — load ALL records (pageSize 50000)
  const queryInput = useMemo(
    () => ({
      page: 1,
      pageSize: 50000,
      search: debouncedSearch || undefined,
      nicho: filters.nicho.length > 0 ? filters.nicho : undefined,
      webStatus:
        filters.webStatus.length > 0
          ? (filters.webStatus as ("none" | "basic" | "poor")[])
          : undefined,
      scoreMin: filters.scoreMin,
      scoreMax: filters.scoreMax,
      ciudad: filters.ciudad || undefined,
      estado: filters.estado || undefined,
      pais: filters.pais || undefined,
      hasEmail: filters.hasEmail,
      hasSocialMedia: filters.hasSocialMedia,
      verified: filters.verified,
      source: filters.source || undefined,
      sortBy: (sorting[0]?.id as
        | "nombre"
        | "nicho"
        | "ciudad"
        | "score"
        | "webStatus"
        | "createdAt"
        | "email"
        | "pais"
        | "estado") || "createdAt",
      sortOrder: (sorting[0]?.desc ? "desc" : "asc") as "asc" | "desc",
    }),
    [debouncedSearch, sorting, filters],
  )

  const { data, isLoading } = api.prospect.getAll.useQuery(queryInput)
  const utils = api.useUtils()

  const importMutation = api.prospect.import.useMutation({
    onSuccess: () => {
      utils.prospect.getAll.invalidate()
    },
  })

  // Derive nicho options from current data for filter chips
  const nichoOptions = useMemo(() => {
    if (!data?.items) return []
    return [...new Set(data.items.map((p) => p.nicho))].sort()
  }, [data?.items])

  // Active filter count
  const activeFilterCount = useMemo(() => {
    let count = 0
    if (filters.nicho.length > 0) count++
    if (filters.webStatus.length > 0) count++
    if (filters.scoreMin !== undefined || filters.scoreMax !== undefined) count++
    if (filters.ciudad || filters.estado || filters.pais) count++
    if (filters.hasEmail !== undefined) count++
    if (filters.hasSocialMedia !== undefined) count++
    if (filters.verified !== undefined) count++
    if (filters.source) count++
    return count
  }, [filters])

  // Export handler
  const handleExport = useCallback(
    async (format: "csv" | "json") => {
      try {
        const result = await utils.prospect.export.fetch({
          format,
          search: debouncedSearch || undefined,
          nicho: filters.nicho.length > 0 ? filters.nicho : undefined,
          webStatus:
            filters.webStatus.length > 0
              ? (filters.webStatus as ("none" | "basic" | "poor")[])
              : undefined,
          scoreMin: filters.scoreMin,
          scoreMax: filters.scoreMax,
          ciudad: filters.ciudad || undefined,
          estado: filters.estado || undefined,
          pais: filters.pais || undefined,
        })

        const blob = new Blob([result.data], {
          type: format === "csv" ? "text/csv" : "application/json",
        })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `prospects_${new Date().toISOString().slice(0, 10)}.${format}`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      } catch (err) {
        console.error("Export failed:", err)
      }
    },
    [utils.prospect.export, debouncedSearch, filters],
  )

  const handleImport = useCallback(
    async (input: { format: "csv" | "json"; data: string }) => {
      return importMutation.mutateAsync(input)
    },
    [importMutation],
  )

  // TanStack Table — all data, no manual pagination
  const table = useReactTable({
    data: data?.items ?? [],
    columns,
    state: {
      sorting,
      columnVisibility,
    },
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    manualSorting: true,
    manualFiltering: true,
  })

  const totalCount = data?.pagination.total ?? 0

  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      className="space-y-5"
      initial={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.4 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Prospects</h1>
          <p className="mt-1 text-sm text-zinc-400">
            {isLoading
              ? "Loading..."
              : `${totalCount.toLocaleString()} prospects`}
          </p>
        </div>
      </div>

      {/* Toolbar */}
      <ProspectsToolbar
        activeFilterCount={activeFilterCount}
        search={search}
        showFilters={showFilters}
        table={table}
        onExport={handleExport}
        onImport={() => setShowImport(true)}
        onSearchChange={handleSearchChange}
        onToggleFilters={() => setShowFilters(!showFilters)}
      />

      {/* Filter Panel */}
      <AnimatePresence>
        {showFilters && (
          <FilterPanel
            filters={filters}
            nichoOptions={nichoOptions}
            onFiltersChange={setFilters}
          />
        )}
      </AnimatePresence>

      {/* Table */}
      <ProspectsTable isLoading={isLoading} table={table} />

      {/* Import Modal */}
      <ImportModal
        isImporting={importMutation.isPending}
        open={showImport}
        onClose={() => {
          setShowImport(false)
          utils.prospect.getAll.invalidate()
        }}
        onImport={handleImport}
      />
    </motion.div>
  )
}

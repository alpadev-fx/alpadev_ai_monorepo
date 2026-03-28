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
import { ProspectsTablePagination } from "./ProspectsTablePagination"
import { FilterPanel } from "./FilterPanel"
import { ImportModal } from "./ImportModal"

export function ProspectsPage() {
  // State
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(25)
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
  })

  // Debounce search
  const debounceTimer = useMemo(() => {
    let timer: ReturnType<typeof setTimeout>
    return (value: string) => {
      clearTimeout(timer)
      timer = setTimeout(() => {
        setDebouncedSearch(value)
        setPage(1)
      }, 300)
    }
  }, [])

  const handleSearchChange = useCallback(
    (value: string) => {
      setSearch(value)
      debounceTimer(value)
    },
    [debounceTimer],
  )

  // Build query input
  const queryInput = useMemo(
    () => ({
      page,
      pageSize,
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
      sortBy: (sorting[0]?.id as
        | "nombre"
        | "nicho"
        | "ciudad"
        | "score"
        | "webStatus"
        | "createdAt") || "createdAt",
      sortOrder: (sorting[0]?.desc ? "desc" : "asc") as "asc" | "desc",
    }),
    [page, pageSize, debouncedSearch, sorting, filters],
  )

  // tRPC queries
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

  // Import handler
  const handleImport = useCallback(
    async (input: { format: "csv" | "json"; data: string }) => {
      return importMutation.mutateAsync(input)
    },
    [importMutation],
  )

  // TanStack Table
  const table = useReactTable({
    data: data?.items ?? [],
    columns,
    state: {
      sorting,
      columnVisibility,
    },
    onSortingChange: (updater) => {
      setSorting(updater)
      setPage(1)
    },
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    pageCount: data?.pagination.totalPages ?? 0,
  })

  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      className="space-y-5"
      initial={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.4 }}
    >
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Prospects</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Manage and track your business prospects
        </p>
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
            onFiltersChange={(f) => {
              setFilters(f)
              setPage(1)
            }}
          />
        )}
      </AnimatePresence>

      {/* Table */}
      <ProspectsTable isLoading={isLoading} table={table} />

      {/* Pagination */}
      <ProspectsTablePagination
        page={data?.pagination.page ?? 1}
        pageSize={data?.pagination.pageSize ?? pageSize}
        total={data?.pagination.total ?? 0}
        totalPages={data?.pagination.totalPages ?? 0}
        onPageChange={setPage}
        onPageSizeChange={(size) => {
          setPageSize(size)
          setPage(1)
        }}
      />

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

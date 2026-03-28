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
import { ProspectDetailModal } from "./ProspectDetailModal"
import type { Prospect } from "@package/db"

export function ProspectsPage() {
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
  const [selectedProspect, setSelectedProspect] = useState<Prospect | null>(null)
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
    [page, pageSize, debouncedSearch, sorting, filters],
  )

  const { data, isLoading } = api.prospect.getAll.useQuery(queryInput, {
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  })
  const utils = api.useUtils()

  const importMutation = api.prospect.import.useMutation({
    onSuccess: () => utils.prospect.getAll.invalidate(),
  })

  const nichoOptions = useMemo(() => {
    if (!data?.items) return []
    return [...new Set(data.items.map((p) => p.nicho))].sort()
  }, [data?.items])

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

  const handleExport = useCallback(
    async (format: "csv" | "json") => {
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
    },
    [utils.prospect.export, debouncedSearch, filters],
  )

  const handleImport = useCallback(
    (input: { format: "csv" | "json"; data: string }) =>
      importMutation.mutateAsync(input),
    [importMutation],
  )

  const table = useReactTable({
    data: data?.items ?? [],
    columns,
    state: { sorting, columnVisibility },
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

  const totalCount = data?.pagination.total ?? 0

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Header — fixed */}
      <div className="shrink-0">
        <h1 className="text-2xl font-bold tracking-tight text-white">Prospects</h1>
        <p className="mt-0.5 text-xs text-zinc-500">
          {isLoading ? "Loading..." : `${totalCount.toLocaleString()} total`}
        </p>
      </div>

      {/* Toolbar — fixed */}
      <div className="shrink-0">
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
      </div>

      {/* Filter Panel — fixed */}
      <AnimatePresence>
        {showFilters && (
          <div className="shrink-0">
            <FilterPanel
              filters={filters}
              nichoOptions={nichoOptions}
              onFiltersChange={(f) => {
                setFilters(f)
                setPage(1)
              }}
            />
          </div>
        )}
      </AnimatePresence>

      {/* Table — fills remaining space, scrolls internally */}
      <ProspectsTable isLoading={isLoading} table={table} onRowClick={setSelectedProspect} />

      {/* Pagination — fixed at bottom */}
      <div className="shrink-0 pb-2">
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
      </div>

      {/* Prospect Detail Modal */}
      <ProspectDetailModal
        prospect={selectedProspect}
        open={!!selectedProspect}
        onClose={() => setSelectedProspect(null)}
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
    </div>
  )
}

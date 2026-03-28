"use client"

import { useState, useCallback } from "react"
import {
  ArrowUpTrayIcon,
  DocumentIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline"
import Modal from "@/app/_components/ui/Modal"

interface ImportModalProps {
  open: boolean
  onClose: () => void
  onImport: (data: {
    format: "csv" | "json"
    data: string
  }) => Promise<{ imported: number; total: number; errors: { row: number; field?: string; message: string }[] }>
  isImporting: boolean
}

type ImportState = "idle" | "preview" | "importing" | "complete"

export function ImportModal({
  open,
  onClose,
  onImport,
  isImporting,
}: ImportModalProps) {
  const [state, setState] = useState<ImportState>("idle")
  const [file, setFile] = useState<File | null>(null)
  const [fileContent, setFileContent] = useState("")
  const [previewRows, setPreviewRows] = useState<string[][]>([])
  const [result, setResult] = useState<{
    imported: number
    total: number
    errors: { row: number; field?: string; message: string }[]
  } | null>(null)
  const [dragActive, setDragActive] = useState(false)

  const reset = () => {
    setState("idle")
    setFile(null)
    setFileContent("")
    setPreviewRows([])
    setResult(null)
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  const getFormat = (filename: string): "csv" | "json" => {
    return filename.endsWith(".json") ? "json" : "csv"
  }

  const processFile = useCallback((f: File) => {
    setFile(f)
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      setFileContent(text)

      // Generate preview
      const format = getFormat(f.name)
      if (format === "csv") {
        const lines = text.split("\n").filter((l) => l.trim())
        const preview = lines.slice(0, 6).map((line) => {
          // Simple CSV split (handles basic cases)
          return line.split(",").map((cell) => cell.trim().replace(/^"|"$/g, ""))
        })
        setPreviewRows(preview)
      } else {
        try {
          const json = JSON.parse(text) as Record<string, unknown>[]
          if (Array.isArray(json) && json.length > 0) {
            const headers = Object.keys(json[0])
            const rows = json.slice(0, 5).map((row) =>
              headers.map((h) => String(row[h] ?? "")),
            )
            setPreviewRows([headers, ...rows])
          }
        } catch {
          setPreviewRows([["Invalid JSON format"]])
        }
      }

      setState("preview")
    }
    reader.readAsText(f)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragActive(false)
      const f = e.dataTransfer.files[0]
      if (f) processFile(f)
    },
    [processFile],
  )

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f) processFile(f)
  }

  const handleImport = async () => {
    if (!file || !fileContent) return
    setState("importing")
    try {
      const res = await onImport({
        format: getFormat(file.name),
        data: fileContent,
      })
      setResult(res)
      setState("complete")
    } catch {
      setResult({ imported: 0, total: 0, errors: [{ row: 0, message: "Import failed" }] })
      setState("complete")
    }
  }

  return (
    <Modal open={open} size="xl" title="Import Prospects" onClose={handleClose}>
      <div className="p-6 space-y-6">
        {/* Idle: Drop zone */}
        {state === "idle" && (
          <div
            className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-10 transition-colors ${
              dragActive
                ? "border-pink-500/50 bg-pink-500/5"
                : "border-white/10 bg-white/[0.02]"
            }`}
            onDragEnter={(e) => {
              e.preventDefault()
              setDragActive(true)
            }}
            onDragLeave={() => setDragActive(false)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
          >
            <ArrowUpTrayIcon className="mb-4 h-10 w-10 text-zinc-500" />
            <p className="mb-2 text-sm text-zinc-300">
              Drag & drop a file here, or{" "}
              <label className="cursor-pointer text-pink-400 hover:text-pink-300">
                browse
                <input
                  accept=".csv,.json"
                  className="hidden"
                  type="file"
                  onChange={handleFileSelect}
                />
              </label>
            </p>
            <p className="text-xs text-zinc-600">Supports CSV and JSON files</p>
          </div>
        )}

        {/* Preview */}
        {state === "preview" && file && (
          <>
            <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3">
              <DocumentIcon className="h-8 w-8 text-zinc-400" />
              <div>
                <p className="text-sm font-medium text-white">{file.name}</p>
                <p className="text-xs text-zinc-500">
                  {(file.size / 1024).toFixed(1)} KB
                </p>
              </div>
            </div>

            {previewRows.length > 0 && (
              <div className="overflow-x-auto rounded-xl border border-white/5">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-white/5">
                      {previewRows[0]?.map((header, i) => (
                        <th
                          key={i}
                          className="px-3 py-2 text-left font-medium text-zinc-400"
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {previewRows.slice(1).map((row, ri) => (
                      <tr
                        key={ri}
                        className="border-t border-white/5"
                      >
                        {row.map((cell, ci) => (
                          <td
                            key={ci}
                            className="px-3 py-2 text-zinc-300 max-w-[150px] truncate"
                          >
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="flex justify-end gap-3">
              <button
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-zinc-400 hover:bg-white/10 hover:text-white transition-colors"
                onClick={reset}
              >
                Cancel
              </button>
              <button
                className="rounded-xl bg-gradient-to-r from-pink-500 to-violet-500 px-6 py-2 text-sm font-semibold text-white hover:from-pink-600 hover:to-violet-600 transition-all"
                onClick={handleImport}
              >
                Import
              </button>
            </div>
          </>
        )}

        {/* Importing */}
        {state === "importing" && (
          <div className="flex flex-col items-center py-8">
            <div className="mb-4 h-10 w-10 animate-spin rounded-full border-2 border-pink-500 border-t-transparent" />
            <p className="text-sm text-zinc-300">Importing prospects...</p>
          </div>
        )}

        {/* Complete */}
        {state === "complete" && result && (
          <>
            <div className="flex items-center gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
              <CheckCircleIcon className="h-6 w-6 text-emerald-400" />
              <div>
                <p className="text-sm font-medium text-emerald-400">
                  {result.imported} of {result.total} prospects imported
                </p>
              </div>
            </div>

            {result.errors.length > 0 && (
              <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
                <div className="mb-2 flex items-center gap-2">
                  <ExclamationTriangleIcon className="h-5 w-5 text-amber-400" />
                  <p className="text-sm font-medium text-amber-400">
                    {result.errors.length} error(s)
                  </p>
                </div>
                <div className="max-h-40 overflow-y-auto space-y-1">
                  {result.errors.map((err, i) => (
                    <p key={i} className="text-xs text-amber-300/80">
                      Row {err.row}
                      {err.field ? ` (${err.field})` : ""}: {err.message}
                    </p>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end">
              <button
                className="rounded-xl bg-gradient-to-r from-pink-500 to-violet-500 px-6 py-2 text-sm font-semibold text-white hover:from-pink-600 hover:to-violet-600 transition-all"
                onClick={handleClose}
              >
                Done
              </button>
            </div>
          </>
        )}
      </div>
    </Modal>
  )
}

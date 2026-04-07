"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { api } from "@/lib/trpc/react"
import { motion, AnimatePresence } from "framer-motion"
import {
  ShieldCheckIcon,
  PlusIcon,
  TrashIcon,
  XMarkIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline"

const RESOURCES = ["prospect", "invoice", "booking", "bill", "transaction"] as const
const ACTIONS = ["read", "write", "delete"] as const

const RESOURCE_LABELS: Record<string, string> = {
  prospect: "Prospects",
  invoice: "Invoices",
  booking: "Bookings",
  bill: "Bills",
  transaction: "Transactions",
}

const ACTION_COLORS: Record<string, string> = {
  read: "bg-blue-500/15 text-blue-400",
  write: "bg-amber-500/15 text-amber-400",
  delete: "bg-rose-500/15 text-rose-400",
}

type AssignFormData = {
  userId: string
  resources: (typeof RESOURCES)[number][]
  actions: (typeof ACTIONS)[number][]
  scope: {
    ciudad: string[]
    estado: string[]
    pais: string[]
    nicho: string[]
  }
}

const EMPTY_FORM: AssignFormData = {
  userId: "",
  resources: [],
  actions: [],
  scope: { ciudad: [], estado: [], pais: [], nicho: [] },
}

export default function PermissionsPage() {
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<AssignFormData>(EMPTY_FORM)
  const [selectedPermId, setSelectedPermId] = useState<string | null>(null)

  const { data: session } = useSession()
  const currentRole = (session?.user as { role?: string })?.role
  const isChief = currentRole === "CHIEF"

  const utils = api.useUtils()
  const { data: permissions, isLoading } = api.permission.getAll.useQuery()
  const { data: usersData } = api.admin.users.list.useQuery({ page: 1, limit: 50 }, { retry: false })
  const allUsers = usersData?.users ?? []
  const users = isChief ? allUsers.filter((u: { role: string }) => u.role === "VENDOR") : allUsers
  const { data: scopeOptions } = api.prospect.scopeOptions.useQuery()
  const { data: myPerms } = api.permission.myPermissions.useQuery(undefined, { enabled: isChief })

  const availableResources = isChief ? (["prospect"] as const) : RESOURCES

  const assignMutation = api.permission.assign.useMutation()
  const assignVendorMutation = api.permission.assignVendorScope.useMutation()

  const revokeMutation = api.permission.revoke.useMutation({
    onSuccess: () => utils.permission.getAll.invalidate(),
  })
  const revokeVendorMutation = api.permission.revokeVendorScope.useMutation({
    onSuccess: () => utils.permission.getAll.invalidate(),
  })

  const handleAssign = async () => {
    const scopeObj: Record<string, string[]> = {}
    if (form.scope.ciudad.length) scopeObj.ciudad = form.scope.ciudad
    if (form.scope.estado.length) scopeObj.estado = form.scope.estado
    if (form.scope.pais.length) scopeObj.pais = form.scope.pais
    if (form.scope.nicho.length) scopeObj.nicho = form.scope.nicho

    const mutate = isChief ? assignVendorMutation : assignMutation
    for (const resource of form.resources) {
      await mutate.mutateAsync({
        userId: form.userId,
        resource,
        actions: form.actions,
        scope: Object.keys(scopeObj).length > 0 ? scopeObj : undefined,
      })
    }
    utils.permission.getAll.invalidate()
    setShowForm(false)
    setForm(EMPTY_FORM)
  }

  const toggleScope = (field: keyof AssignFormData["scope"], value: string) => {
    setForm((prev) => {
      const wasSelected = prev.scope[field].includes(value)
      const updated = wasSelected
        ? prev.scope[field].filter((v) => v !== value)
        : [...prev.scope[field], value]

      const newScope = { ...prev.scope, [field]: updated }

      // State → auto-select/deselect its cities
      if (field === "estado" && scopeOptions?.stateCities) {
        const stateCities = scopeOptions.stateCities[value] ?? []
        if (!wasSelected) {
          // Selecting state → add all its cities
          const merged = new Set([...newScope.ciudad, ...stateCities])
          newScope.ciudad = Array.from(merged)
        } else {
          // Deselecting state → remove its cities
          newScope.ciudad = newScope.ciudad.filter((c) => !stateCities.includes(c))
        }
      }

      return { ...prev, scope: newScope }
    })
  }

  const toggleResource = (resource: (typeof RESOURCES)[number]) => {
    setForm((prev) => ({
      ...prev,
      resources: prev.resources.includes(resource)
        ? prev.resources.filter((r) => r !== resource)
        : [...prev.resources, resource],
    }))
  }

  const toggleAction = (action: (typeof ACTIONS)[number]) => {
    setForm((prev) => ({
      ...prev,
      actions: prev.actions.includes(action)
        ? prev.actions.filter((a) => a !== action)
        : [...prev.actions, action],
    }))
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 rounded-lg bg-white/[0.04] animate-pulse" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 rounded-2xl bg-[#161616] animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 h-full overflow-y-auto"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Permissions</h1>
          <p className="mt-0.5 text-xs text-zinc-500">Assign granular resource permissions to users</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 rounded-xl bg-[#f751a1] px-4 py-2 text-sm font-medium text-white hover:bg-[#ec4899] transition-colors"
        >
          {showForm ? <XMarkIcon className="h-4 w-4" /> : <PlusIcon className="h-4 w-4" />}
          {showForm ? "Cancel" : "Assign Permission"}
        </button>
      </div>

      {/* Chief scope banner */}
      {isChief && myPerms && (() => {
        const prospectPerm = myPerms.find((p: { resource: string }) => p.resource === "prospect")
        const scope = prospectPerm?.scope as Record<string, string[]> | null | undefined
        const cities = scope?.ciudad ?? []
        if (!cities.length) return null
        return (
          <div className="rounded-2xl bg-[#8B5CF6]/10 border border-[#8B5CF6]/20 px-5 py-3">
            <p className="text-[11px] text-[#d0bcff] uppercase tracking-wider font-medium mb-1.5">Your assigned cities</p>
            <div className="flex flex-wrap gap-1.5">
              {cities.map((c: string) => (
                <span key={c} className="text-[11px] bg-[#8B5CF6]/20 text-[#d0bcff] rounded-md px-2.5 py-1">{c}</span>
              ))}
            </div>
          </div>
        )
      })()}

      {/* Assign Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="rounded-2xl bg-[#161616] p-6 space-y-4 overflow-hidden"
          >
            <h3 className="text-sm font-medium text-white">Assign Permission</h3>

            <div className="grid grid-cols-2 gap-4">
              {/* User select */}
              <div>
                <label className="text-[11px] text-zinc-500 uppercase tracking-wider">User</label>
                <select
                  value={form.userId}
                  onChange={(e) => setForm((p) => ({ ...p, userId: e.target.value }))}
                  className="mt-1 w-full rounded-xl bg-white/[0.04] border border-white/[0.06] px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#f751a1]"
                >
                  <option value="">Select user...</option>
                  {(users ?? []).map((u: { id: string; name: string; email: string | null; role: string }) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.email}) — {u.role}
                    </option>
                  ))}
                </select>
              </div>

              {/* Resources — multi-select */}
              <div>
                <label className="text-[11px] text-zinc-500 uppercase tracking-wider">Resources</label>
                <div className="mt-1 flex flex-wrap gap-2">
                  {availableResources.map((r) => (
                    <button
                      key={r}
                      onClick={() => toggleResource(r)}
                      className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                        form.resources.includes(r)
                          ? "bg-[#d0bcff]/20 text-[#d0bcff]"
                          : "bg-white/[0.04] text-zinc-600 hover:text-zinc-400"
                      }`}
                    >
                      {RESOURCE_LABELS[r]}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div>
              <label className="text-[11px] text-zinc-500 uppercase tracking-wider">Actions</label>
              <div className="mt-1 flex gap-2">
                {ACTIONS.map((action) => (
                  <button
                    key={action}
                    onClick={() => toggleAction(action)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                      form.actions.includes(action)
                        ? ACTION_COLORS[action]
                        : "bg-white/[0.04] text-zinc-600 hover:text-zinc-400"
                    }`}
                  >
                    {action}
                  </button>
                ))}
              </div>
            </div>

            {/* Scope filters — select from real data */}
            {scopeOptions && (
              <div className="space-y-3">
                {([
                  { field: "ciudad" as const, label: "Cities", options: scopeOptions.ciudades },
                  { field: "estado" as const, label: "States", options: scopeOptions.estados },
                  { field: "nicho" as const, label: "Niches", options: scopeOptions.nichos },
                  { field: "pais" as const, label: "Countries", options: scopeOptions.paises },
                ]).map(({ field, label, options }) => (
                  <div key={field}>
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] text-zinc-500 uppercase tracking-wider">
                        {label} <span className="text-zinc-700">({form.scope[field].length}/{options.length})</span>
                      </label>
                      <button
                        onClick={() => setForm((prev) => ({
                          ...prev,
                          scope: {
                            ...prev.scope,
                            [field]: prev.scope[field].length === options.length ? [] : options.map((o) => o.value),
                          },
                        }))}
                        className="text-[10px] text-[#ffb0cd] hover:text-white transition-colors"
                      >
                        {form.scope[field].length === options.length ? "Clear all" : "Select all"}
                      </button>
                    </div>
                    <div className="mt-1 flex flex-wrap gap-1.5 max-h-28 overflow-y-auto rounded-xl bg-white/[0.02] p-2">
                      {options.map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => toggleScope(field, opt.value)}
                          className={`rounded-md px-2 py-1 text-[11px] transition-all ${
                            form.scope[field].includes(opt.value)
                              ? "bg-[#f751a1]/20 text-[#ffb0cd]"
                              : "bg-white/[0.04] text-zinc-600 hover:text-zinc-400"
                          }`}
                        >
                          {opt.value} <span className="text-zinc-700">({opt.count})</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Submit */}
            <div className="flex justify-end gap-3">
              <button
                onClick={() => { setShowForm(false); setForm(EMPTY_FORM) }}
                className="rounded-xl px-4 py-2 text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAssign}
                disabled={!form.userId || form.resources.length === 0 || form.actions.length === 0 || assignMutation.isPending || assignVendorMutation.isPending}
                className="rounded-xl bg-[#f751a1] px-4 py-2 text-sm font-medium text-white hover:bg-[#ec4899] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {(assignMutation.isPending || assignVendorMutation.isPending) ? "Assigning..." : "Assign"}
              </button>
            </div>

            {(assignMutation.error || assignVendorMutation.error) && (
              <p className="text-xs text-rose-400">{(assignMutation.error || assignVendorMutation.error)?.message}</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active Permissions — table + detail panel */}
      {(() => {
        const allPerms = (permissions ?? []).filter((p) => isChief ? p.user.role === "VENDOR" : true)
        const selectedPerm = allPerms.find((p) => p.id === selectedPermId) ?? null
        const scopeLabels: Record<string, string> = { ciudad: "Cities", estado: "States", pais: "Countries", nicho: "Niches" }

        return (
          <div className="flex gap-4 min-h-0">
            {/* Table */}
            <div className={`rounded-2xl bg-[#161616] overflow-hidden flex-1 min-h-0 flex flex-col ${selectedPerm ? "max-w-[60%]" : ""}`}>
              <div className="px-5 py-3 border-b border-white/[0.04] flex items-center justify-between">
                <h3 className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
                  Active Permissions ({allPerms.length})
                </h3>
              </div>

              {!allPerms.length ? (
                <div className="px-5 py-12 text-center">
                  <ShieldCheckIcon className="h-8 w-8 text-zinc-700 mx-auto mb-2" />
                  <p className="text-sm text-zinc-500">No permissions assigned yet</p>
                </div>
              ) : (
                <div className="overflow-auto flex-1">
                  <table className="w-full border-collapse">
                    <thead className="sticky top-0 z-20">
                      <tr className="bg-[#1b1b1b]">
                        <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">User</th>
                        <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">Resource</th>
                        <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">Actions</th>
                        <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">Scope</th>
                        <th className="px-4 py-3 w-10" />
                      </tr>
                    </thead>
                    <tbody>
                      {allPerms.map((perm, i) => {
                        const scope = perm.scope && typeof perm.scope === "object" ? perm.scope as Record<string, string[]> : null
                        const scopeCount = scope ? Object.values(scope).reduce((sum, v) => sum + v.length, 0) : 0
                        const isSelected = perm.id === selectedPermId

                        return (
                          <motion.tr
                            key={perm.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: i * 0.02 }}
                            onClick={() => setSelectedPermId(isSelected ? null : perm.id)}
                            className={`cursor-pointer transition-colors duration-100 ${
                              isSelected ? "bg-[#f751a1]/5" : "hover:bg-white/[0.03]"
                            } ${i > 0 ? "border-t border-white/[0.03]" : ""}`}
                          >
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2.5">
                                <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-[#f751a1] to-[#8B5CF6] flex items-center justify-center shrink-0">
                                  <span className="text-[10px] font-bold text-white">{perm.user.name[0]}</span>
                                </div>
                                <div className="min-w-0">
                                  <p className="text-[13px] text-white truncate">{perm.user.name}</p>
                                  <p className="text-[10px] text-zinc-600 truncate">{perm.user.role}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <span className="text-xs font-medium bg-[#d0bcff]/15 text-[#d0bcff] rounded-lg px-2.5 py-1">
                                {RESOURCE_LABELS[perm.resource] ?? perm.resource}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex gap-1">
                                {perm.actions.map((action) => (
                                  <span key={action} className={`text-[10px] font-medium rounded-md px-2 py-0.5 ${ACTION_COLORS[action] ?? "bg-zinc-800 text-zinc-400"}`}>
                                    {action}
                                  </span>
                                ))}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              {scopeCount > 0 ? (
                                <span className="text-[11px] text-zinc-400">{scopeCount} filters</span>
                              ) : (
                                <span className="text-[11px] text-zinc-700 italic">Unrestricted</span>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              <ChevronRightIcon className={`h-4 w-4 transition-transform ${isSelected ? "text-[#ffb0cd] rotate-90" : "text-zinc-700"}`} />
                            </td>
                          </motion.tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Detail panel */}
            <AnimatePresence>
              {selectedPerm && (
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "40%" }}
                  exit={{ opacity: 0, width: 0 }}
                  className="rounded-2xl bg-[#161616] overflow-hidden shrink-0"
                >
                  <div className="p-5 h-full overflow-y-auto">
                    {/* User info */}
                    <div className="flex items-center gap-3 mb-5">
                      <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-[#f751a1] to-[#8B5CF6] flex items-center justify-center shrink-0">
                        <span className="text-sm font-bold text-white">{selectedPerm.user.name[0]}</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-white">{selectedPerm.user.name}</p>
                        <p className="text-[11px] text-zinc-600">{selectedPerm.user.email}</p>
                      </div>
                      <span className="text-[9px] uppercase tracking-wider font-medium bg-[#8B5CF6]/20 text-[#d0bcff] rounded-full px-2.5 py-0.5">
                        {selectedPerm.user.role}
                      </span>
                    </div>

                    {/* Resource + actions */}
                    <div className="space-y-4">
                      <div>
                        <p className="text-[10px] text-zinc-600 uppercase tracking-wider mb-1.5">Resource</p>
                        <span className="text-sm font-medium bg-[#d0bcff]/15 text-[#d0bcff] rounded-lg px-3 py-1">
                          {RESOURCE_LABELS[selectedPerm.resource] ?? selectedPerm.resource}
                        </span>
                      </div>

                      <div>
                        <p className="text-[10px] text-zinc-600 uppercase tracking-wider mb-1.5">Actions</p>
                        <div className="flex gap-1.5">
                          {selectedPerm.actions.map((action) => (
                            <span key={action} className={`text-[11px] font-medium rounded-md px-3 py-1 ${ACTION_COLORS[action] ?? "bg-zinc-800 text-zinc-400"}`}>
                              {action}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Scope sections */}
                      {(() => {
                        const scope = selectedPerm.scope && typeof selectedPerm.scope === "object"
                          ? selectedPerm.scope as Record<string, string[]>
                          : null
                        if (!scope || Object.keys(scope).length === 0) {
                          return (
                            <div>
                              <p className="text-[10px] text-zinc-600 uppercase tracking-wider mb-1.5">Scope</p>
                              <p className="text-xs text-zinc-500 italic">Unrestricted — full access to all data</p>
                            </div>
                          )
                        }
                        return Object.entries(scope).map(([key, values]) => (
                          <div key={key}>
                            <p className="text-[10px] text-zinc-600 uppercase tracking-wider mb-1.5">
                              {scopeLabels[key] ?? key} ({values.length})
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                              {values.map((v) => (
                                <span key={v} className="text-[11px] bg-[#f751a1]/10 text-[#ffb0cd] rounded-md px-2.5 py-1">
                                  {v}
                                </span>
                              ))}
                            </div>
                          </div>
                        ))
                      })()}

                      {/* Revoke button */}
                      <button
                        onClick={() => {
                          const revoke = isChief ? revokeVendorMutation : revokeMutation
                          revoke.mutate({ userId: selectedPerm.user.id, resource: selectedPerm.resource as typeof RESOURCES[number] })
                          setSelectedPermId(null)
                        }}
                        disabled={revokeMutation.isPending || revokeVendorMutation.isPending}
                        className="w-full mt-4 flex items-center justify-center gap-2 rounded-xl bg-rose-500/10 px-4 py-2.5 text-sm font-medium text-rose-400 hover:bg-rose-500/20 transition-colors"
                      >
                        <TrashIcon className="h-4 w-4" />
                        Revoke Permission
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )
      })()}
    </motion.div>
  )
}

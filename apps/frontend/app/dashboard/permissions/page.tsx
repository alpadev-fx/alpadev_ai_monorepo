"use client"

import { useState } from "react"
import { api } from "@/lib/trpc/react"
import { motion, AnimatePresence } from "framer-motion"
import {
  ShieldCheckIcon,
  PlusIcon,
  TrashIcon,
  XMarkIcon,
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

  const utils = api.useUtils()
  const { data: permissions, isLoading } = api.permission.getAll.useQuery()
  const { data: usersData } = api.admin.users.list.useQuery({ page: 1, limit: 50 }, { retry: false })
  const users = usersData?.users ?? []
  const { data: scopeOptions } = api.prospect.scopeOptions.useQuery()

  const assignMutation = api.permission.assign.useMutation()

  const revokeMutation = api.permission.revoke.useMutation({
    onSuccess: () => utils.permission.getAll.invalidate(),
  })

  const handleAssign = async () => {
    const scopeObj: Record<string, string[]> = {}
    if (form.scope.ciudad.length) scopeObj.ciudad = form.scope.ciudad
    if (form.scope.estado.length) scopeObj.estado = form.scope.estado
    if (form.scope.pais.length) scopeObj.pais = form.scope.pais
    if (form.scope.nicho.length) scopeObj.nicho = form.scope.nicho

    for (const resource of form.resources) {
      await assignMutation.mutateAsync({
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
                  {RESOURCES.map((r) => (
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
                disabled={!form.userId || form.resources.length === 0 || form.actions.length === 0 || assignMutation.isPending}
                className="rounded-xl bg-[#f751a1] px-4 py-2 text-sm font-medium text-white hover:bg-[#ec4899] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {assignMutation.isPending ? "Assigning..." : "Assign"}
              </button>
            </div>

            {assignMutation.error && (
              <p className="text-xs text-rose-400">{assignMutation.error.message}</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Permissions table */}
      <div className="rounded-2xl bg-[#161616] overflow-hidden">
        <div className="px-5 py-4 border-b border-white/[0.04]">
          <h3 className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
            Active Permissions ({permissions?.length ?? 0})
          </h3>
        </div>

        {!permissions?.length ? (
          <div className="px-5 py-12 text-center">
            <ShieldCheckIcon className="h-8 w-8 text-zinc-700 mx-auto mb-2" />
            <p className="text-sm text-zinc-500">No permissions assigned yet</p>
          </div>
        ) : (
          <div className="divide-y divide-white/[0.04]">
            {permissions.map((perm, i) => (
              <motion.div
                key={perm.id}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="px-5 py-3 flex items-center justify-between hover:bg-white/[0.02] transition-colors"
              >
                <div className="flex items-center gap-4 min-w-0 flex-1">
                  {/* User */}
                  <div className="min-w-0 w-40">
                    <p className="text-sm text-white truncate">{perm.user.name}</p>
                    <p className="text-[10px] text-zinc-600 truncate">{perm.user.email}</p>
                  </div>

                  {/* Resource */}
                  <span className="text-xs font-medium bg-[#d0bcff]/15 text-[#d0bcff] rounded-lg px-2.5 py-1">
                    {RESOURCE_LABELS[perm.resource] ?? perm.resource}
                  </span>

                  {/* Actions */}
                  <div className="flex gap-1.5">
                    {perm.actions.map((action) => (
                      <span key={action} className={`text-[10px] font-medium rounded-md px-2 py-0.5 ${ACTION_COLORS[action] ?? "bg-zinc-800 text-zinc-400"}`}>
                        {action}
                      </span>
                    ))}
                  </div>

                  {/* Scope */}
                  {perm.scope && typeof perm.scope === "object" && Object.keys(perm.scope).length > 0 && (
                    <div className="flex gap-1.5">
                      {Object.entries(perm.scope as Record<string, string[]>).map(([key, values]) => (
                        <span key={key} className="text-[10px] bg-white/[0.04] text-zinc-400 rounded-md px-2 py-0.5">
                          {key}: {values.join(", ")}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Revoke */}
                <button
                  onClick={() => revokeMutation.mutate({ userId: perm.user.id, resource: perm.resource as typeof RESOURCES[number] })}
                  disabled={revokeMutation.isPending}
                  className="shrink-0 p-1.5 rounded-lg text-zinc-600 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                  title="Revoke permission"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  )
}

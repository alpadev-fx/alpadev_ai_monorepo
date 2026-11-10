import { serverSession } from "@package/auth"
import { mkdir, open, readFile, rename, rmdir, unlink } from "node:fs/promises"
import { join } from "node:path"
import { validateLab } from "../../lab/validation"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"
const headers = { "Cache-Control": "no-store", Vary: "Cookie" }
const reply = (data: unknown, status = 200) => Response.json(data, { status, headers })
const MAX_BYTES = 2_000_000
let writer: Promise<void> = Promise.resolve()

async function authorized() {
  const session = await serverSession()
  return !!session && (session.user as { role?: string })?.role === "ADMIN"
}
function storagePath() {
  const dir = process.env.AEGIS_LAB_DATA_DIR
  if (!dir || !dir.startsWith('/')) throw new Error('Storage not configured')
  return { dir, file: join(dir, 'lab-state.json') }
}
async function load(file: string): Promise<{ revision: number; data: unknown; updated: string | null } | null> {
  try { return JSON.parse(await readFile(file, 'utf8')) }
  catch (error) { if ((error as NodeJS.ErrnoException).code === 'ENOENT') return null; throw error }
}
export async function GET() {
  if (!await authorized()) return reply({ error: 'Acceso de administrador requerido.' }, 401)
  try {
    const state = await load(storagePath().file)
    return state ? reply(state) : reply({ error: 'Laboratorio sin inicializar. Importa el respaldo privado mediante la API.' }, 503)
  } catch { return reply({ error: 'El almacenamiento no está disponible.' }, 503) }
}
export async function PUT(request: Request) {
  if (!await authorized()) return reply({ error: 'Acceso de administrador requerido.' }, 401)
  const origin = request.headers.get('origin')
  // Requests arrive behind Caddy; trust only the configured public origin, never forwarded headers.
  if (origin !== process.env.AEGIS_PUBLIC_ORIGIN || request.headers.get('sec-fetch-site') === 'cross-site') return reply({ error: 'Origen no permitido.' }, 403)
  if (!request.headers.get('content-type')?.toLowerCase().startsWith('application/json')) return reply({ error: 'Se requiere JSON.' }, 415)
  if (Number(request.headers.get('content-length') || 0) > MAX_BYTES) return reply({ error: 'Archivo demasiado grande.' }, 413)
  let body: any
  try {
    if (!request.body) return reply({ error: 'Falta el contenido.' }, 400)
    const reader = request.body.getReader(), chunks: Uint8Array[] = []; let size = 0
    while (true) { const { done, value } = await reader.read(); if (done) break; size += value.byteLength; if (size > MAX_BYTES) { await reader.cancel(); return reply({ error: 'Archivo demasiado grande.' }, 413) } chunks.push(value) }
    body = JSON.parse(Buffer.concat(chunks).toString('utf8'))
  } catch { return reply({ error: 'JSON inválido.' }, 400) }
  const invalid = validateLab(body); if (invalid) return reply({ error: invalid }, 400)
  let release!: () => void
  const previous = writer; writer = new Promise<void>(resolve => { release = resolve }); await previous
  try {
    const { dir, file } = storagePath(); await mkdir(dir, { recursive: true, mode: 0o700 })
    // mkdir is an atomic cross-process lock, including during overlapping deployments.
    // A crash leaves the lock in place for explicit recovery; never guess that it is stale.
    const lock = join(dir, '.writer-lock')
    try { await mkdir(lock, { mode: 0o700 }) } catch (e) {
      if ((e as NodeJS.ErrnoException).code === 'EEXIST') return reply({ error: 'Otro proceso está guardando. Vuelve a intentar.' }, 503)
      throw e
    }
    try {
    const current = await load(file)
    if ((current?.revision ?? 0) !== body.revision) return reply({ error: 'Hay una versión más reciente. Exporta tus cambios y recarga.' }, 409)
    const state = { revision: body.revision + 1, data: body.data, updated: new Date().toISOString() }
    const temporary = join(dir, `.lab-${crypto.randomUUID()}.tmp`)
    try {
      const handle = await open(temporary, 'wx', 0o600)
      try { await handle.writeFile(JSON.stringify(state)); await handle.sync() } finally { await handle.close() }
      await rename(temporary, file)
    } finally { await unlink(temporary).catch(() => {}) }
    return reply({ revision: state.revision, updated: state.updated })
    } finally { await rmdir(lock) }
  } catch { return reply({ error: 'No se pudo guardar el laboratorio.' }, 503) }
  finally { release() }
}

import { createHash } from "node:crypto"
import bcrypt from "bcryptjs"

// Optional owner account for the dedicated Railway admin. No plaintext password
// or shared default is stored in source; normal deployments keep database auth.
export function labRoot() {
  const username = process.env.LAB_ROOT_USERNAME
  const hash = process.env.LAB_ROOT_PASSWORD_HASH
  if (!username || !hash || !/^\$2[aby]\$\d\d\$/.test(hash) || !process.env.NEXTAUTH_SECRET) return null
  return {
    username,
    hash,
    id: `lab-root:${createHash("sha256").update(username).digest("hex").slice(0, 24)}`,
    name: "Alpadev · Administración",
    email: "founder@alpadev.xyz",
  }
}

const attempts = new Map<string, { count: number; until: number }>()
export function verifyLabRoot(username: string, password: string, ip: string) {
  const root = labRoot()
  if (!root || username !== root.username || password.length > 1024) return null
  const now = Date.now()
  const key = ip.slice(0, 180)
  const state = attempts.get(key)
  if (state && state.until > now && state.count >= 8) return null
  if (attempts.size > 5000) for (const [id, entry] of attempts) if (entry.until <= now) attempts.delete(id)
  const current = state && state.until > now ? state : { count: 0, until: now + 15 * 60_000 }
  current.count++
  attempts.set(key, current)
  if (!bcrypt.compareSync(password, root.hash)) return null
  attempts.delete(key)
  const { hash: _hash, username: _username, ...user } = root
  return user
}

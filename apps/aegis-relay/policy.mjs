// Shared by both ends so neither side can turn the tunnel into a general proxy.
const routes = [
  ['GET', /^\/dashboard\/aegis\/api\/lab$/],
  ['PUT', /^\/dashboard\/aegis\/api\/lab$/],
  ['GET', /^\/api\/v1\/(health|settings|missions|events|diagnostics)$/],
  ['POST', /^\/api\/v1\/auth\/(pair|logout)$/],
  ['PUT', /^\/api\/v1\/settings$/],
  ['PUT', /^\/api\/v1\/missions\/[A-Za-z0-9_-]{1,128}$/],
  ['DELETE', /^\/api\/v1\/missions\/[A-Za-z0-9_-]{1,128}$/],
  ['GET', /^\/cam\/sources$/],
  ['GET', /^\/cam\/[A-Za-z0-9_-]{1,128}\/(stream|frame\.jpg)$/],
  ['GET', /^\/vision\/(models|model\/[A-Za-z0-9_-]{1,128}\.onnx|ort\/[A-Za-z0-9_.-]{1,128})$/],
  ['GET', /^\/vigil\/(model\/face_landmarker\.task|wasm\/[A-Za-z0-9_.-]{1,128})$/],
  ['GET', /^\/llm\/status$/],
  ['POST', /^\/llm\/(chat|vision|router\/warm)$/],
  ['GET', /^\/jev\/(status|objects)$/],
  ['POST', /^\/jev\/(classify|objects\/reference|objects\/identify)$/],
  ['DELETE', /^\/jev\/objects\/reference$/],
  ['POST', /^\/vision\/(identify|point|review)$/],
]
export function allowed(method, raw) {
  if (typeof raw !== 'string' || raw.length > 2048 || !raw.startsWith('/') || raw.startsWith('//') || raw.includes('\\') || /%2f|%5c|%2e/i.test(raw)) return false
  let u; try { u = new URL(raw, 'http://127.0.0.1') } catch { return false }
  if (u.origin !== 'http://127.0.0.1' || u.hash) return false
  return routes.some(([verb, re]) => verb === method && re.test(u.pathname))
}
export const MAX_REQUEST = 8 * 1024 * 1024
export const MAX_MESSAGE = 12 * 1024 * 1024
export const MAX_BUFFERED = 2 * 1024 * 1024
export const CHUNK = 48 * 1024

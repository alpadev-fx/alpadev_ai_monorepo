import { google } from "googleapis"

const PROJECT_ID = "alpadev-ai-prod"
const REGION = "us-central1"
const SERVICE_NAME = "alpadev-frontend"

export const FREE_TIER = {
  requests: 2_000_000,
  vcpuSeconds: 360_000,
  gibSeconds: 180_000,
  storageBytes: 500 * 1024 * 1024,
  egressGb: 1,
} as const

export const PRICING = {
  requestsPerMillion: 0.4,
  vcpuSecond: 0.000024,
  gibSecond: 0.0000025,
  egressPerGb: 0.12,
  storagePerGbMonth: 0.1,
} as const

type Point = { time: string; value: number }

function createAuth() {
  return new google.auth.GoogleAuth({
    scopes: ["https://www.googleapis.com/auth/cloud-platform"],
  })
}

export class InfrastructureService {
  // ── Overview (metrics + forecast) ──────────────────────────

  async getOverview() {
    const auth = createAuth()
    const mon = google.monitoring({ version: "v3", auth })

    const now = new Date()
    const som = new Date(now.getFullYear(), now.getMonth(), 1)
    const h24 = new Date(now.getTime() - 86_400_000)

    const [rTotal, rRate, cpuSeries, storage] = await Promise.allSettled([
      this.monthlySum(mon, "run.googleapis.com/request_count", som, now),
      this.timeSeries(mon, "run.googleapis.com/request_count", "cloud_run_revision", h24, now, "600s", "ALIGN_RATE", "REDUCE_SUM"),
      this.timeSeries(mon, "run.googleapis.com/container/cpu/utilizations", "cloud_run_revision", h24, now, "600s", "ALIGN_MEAN", "REDUCE_PERCENTILE_99"),
      this.latestValue(mon, "artifactregistry.googleapis.com/repository/size", "artifactregistry.googleapis.com/Repository"),
    ])

    const requests = val(rTotal, 0)
    const storageBytes = val(storage, 0)
    const estVcpu = requests * 0.2 // 200ms avg × 1 vCPU
    const estGib = requests * 0.2 * 0.5 // 200ms avg × 512Mi

    const day = now.getDate()
    const dim = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
    const f = dim / Math.max(day, 1)

    return {
      kpis: {
        requests: kpi(requests, FREE_TIER.requests),
        vcpuSeconds: kpi(estVcpu, FREE_TIER.vcpuSeconds),
        gibSeconds: kpi(estGib, FREE_TIER.gibSeconds),
        storageBytes: kpi(storageBytes, FREE_TIER.storageBytes),
      },
      requestRate: val(rRate, []) as Point[],
      cpuUtilization: val(cpuSeries, []) as Point[],
      forecast: {
        requests: forecast(requests, f, FREE_TIER.requests, PRICING.requestsPerMillion / 1e6, day, dim),
        vcpuSeconds: forecast(estVcpu, f, FREE_TIER.vcpuSeconds, PRICING.vcpuSecond, day, dim),
        gibSeconds: forecast(estGib, f, FREE_TIER.gibSeconds, PRICING.gibSecond, day, dim),
        storageBytes: forecast(storageBytes, 1, FREE_TIER.storageBytes, PRICING.storagePerGbMonth / (1024 ** 3), day, dim),
      },
    }
  }

  // ── Cloud Run service config ───────────────────────────────

  async getServiceConfig() {
    const auth = createAuth()
    const run = google.run({ version: "v2", auth })

    const { data } = await run.projects.locations.services.get({
      name: `projects/${PROJECT_ID}/locations/${REGION}/services/${SERVICE_NAME}`,
    })

    const c = data.template?.containers?.[0]
    const s = data.template?.scaling
    const ready = data.conditions?.find((x) => x.type === "Ready")

    return {
      serviceName: SERVICE_NAME,
      region: REGION,
      status: ready?.state === "CONDITION_SUCCEEDED" ? "RUNNING" : "UNKNOWN",
      minInstances: s?.minInstanceCount ?? 0,
      maxInstances: s?.maxInstanceCount ?? 2,
      cpu: c?.resources?.limits?.cpu ?? "1",
      memory: c?.resources?.limits?.memory ?? "512Mi",
      cpuIdle: c?.resources?.cpuIdle ?? true,
      startupCpuBoost: c?.resources?.startupCpuBoost ?? true,
      image: c?.image ?? "",
    }
  }

  async updateServiceConfig(cfg: {
    minInstances?: number
    maxInstances?: number
    cpu?: string
    memory?: string
    cpuIdle?: boolean
    startupCpuBoost?: boolean
  }) {
    const auth = createAuth()
    const run = google.run({ version: "v2", auth })
    const name = `projects/${PROJECT_ID}/locations/${REGION}/services/${SERVICE_NAME}`

    const { data: cur } = await run.projects.locations.services.get({ name })
    const cc = cur.template?.containers?.[0]

    await run.projects.locations.services.patch({
      name,
      requestBody: {
        template: {
          ...cur.template,
          scaling: {
            ...cur.template?.scaling,
            ...(cfg.minInstances !== undefined && { minInstanceCount: cfg.minInstances }),
            ...(cfg.maxInstances !== undefined && { maxInstanceCount: cfg.maxInstances }),
          },
          containers: [
            {
              ...cc,
              resources: {
                ...cc?.resources,
                limits: {
                  ...cc?.resources?.limits,
                  ...(cfg.cpu && { cpu: cfg.cpu }),
                  ...(cfg.memory && { memory: cfg.memory }),
                },
                ...(cfg.cpuIdle !== undefined && { cpuIdle: cfg.cpuIdle }),
                ...(cfg.startupCpuBoost !== undefined && { startupCpuBoost: cfg.startupCpuBoost }),
              },
            },
          ],
        },
      },
    })
  }

  // ── Monitoring helpers ─────────────────────────────────────

  private async monthlySum(
    mon: ReturnType<typeof google.monitoring>,
    metric: string,
    start: Date,
    end: Date,
  ): Promise<number> {
    const res = await mon.projects.timeSeries.list({
      name: `projects/${PROJECT_ID}`,
      filter: `metric.type = "${metric}" AND resource.type = "cloud_run_revision" AND resource.labels.service_name = "${SERVICE_NAME}"`,
      "interval.startTime": start.toISOString(),
      "interval.endTime": end.toISOString(),
      "aggregation.alignmentPeriod": "86400s",
      "aggregation.perSeriesAligner": "ALIGN_SUM",
      "aggregation.crossSeriesReducer": "REDUCE_SUM",
    })
    let total = 0
    for (const ts of res.data.timeSeries ?? []) {
      for (const p of ts.points ?? []) {
        total += Number(p.value?.int64Value ?? p.value?.doubleValue ?? 0)
      }
    }
    return total
  }

  private async timeSeries(
    mon: ReturnType<typeof google.monitoring>,
    metric: string,
    resType: string,
    start: Date,
    end: Date,
    period: string,
    aligner: string,
    reducer?: string,
  ): Promise<Point[]> {
    const filter = `metric.type = "${metric}" AND resource.type = "${resType}" AND resource.labels.service_name = "${SERVICE_NAME}"`
    const params: Record<string, string> = {
      name: `projects/${PROJECT_ID}`,
      filter,
      "interval.startTime": start.toISOString(),
      "interval.endTime": end.toISOString(),
      "aggregation.alignmentPeriod": period,
      "aggregation.perSeriesAligner": aligner,
    }
    if (reducer) params["aggregation.crossSeriesReducer"] = reducer

    const res = await mon.projects.timeSeries.list(params as any)
    const pts: Point[] = []
    for (const ts of res.data.timeSeries ?? []) {
      for (const p of ts.points ?? []) {
        pts.push({ time: p.interval?.endTime ?? "", value: Number(p.value?.int64Value ?? p.value?.doubleValue ?? 0) })
      }
    }
    return pts.sort((a, b) => +new Date(a.time) - +new Date(b.time))
  }

  private async latestValue(
    mon: ReturnType<typeof google.monitoring>,
    metric: string,
    resType: string,
  ): Promise<number> {
    const now = new Date()
    const ago = new Date(now.getTime() - 3_600_000)
    const res = await mon.projects.timeSeries.list({
      name: `projects/${PROJECT_ID}`,
      filter: `metric.type = "${metric}" AND resource.type = "${resType}"`,
      "interval.startTime": ago.toISOString(),
      "interval.endTime": now.toISOString(),
      "aggregation.alignmentPeriod": "3600s",
      "aggregation.perSeriesAligner": "ALIGN_MEAN",
    })
    const p = res.data.timeSeries?.[0]?.points?.[0]
    return Number(p?.value?.int64Value ?? p?.value?.doubleValue ?? 0)
  }
}

// ── Pure helpers ──────────────────────────────────────────────

function val<T>(r: PromiseSettledResult<T>, fallback: T): T {
  return r.status === "fulfilled" ? r.value : fallback
}

function kpi(used: number, limit: number) {
  return { used: Math.round(used), limit, percentage: limit > 0 ? +((used / limit) * 100).toFixed(1) : 0 }
}

function forecast(
  current: number,
  factor: number,
  limit: number,
  unitPrice: number,
  day: number,
  daysInMonth: number,
) {
  const projected = current * factor
  const overage = Math.max(0, projected - limit)
  const cost = Math.round(overage * unitPrice * 100) / 100

  let daysUntilLimit: number | null = null
  if (current > 0 && day > 0) {
    const daily = current / day
    if (daily > 0) {
      const d = (limit - current) / daily
      daysUntilLimit = d > daysInMonth - day ? null : Math.max(0, Math.round(d))
    }
  }

  return {
    projected: Math.round(projected),
    limit,
    percentage: +(limit > 0 ? (projected / limit) * 100 : 0).toFixed(1),
    daysUntilLimit,
    estimatedCost: cost,
  }
}

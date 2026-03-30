import { google } from "googleapis"
import { ai } from "../../config/ai.config"

const PROJECT_ID = process.env.GCP_PROJECT_ID ?? "alpadev-ai-prod"
const PROJECT_NUMBER = process.env.GCP_PROJECT_NUMBER ?? "570037043182"
const REGION = process.env.GCP_REGION ?? "us-central1"
const SERVICE_NAME = process.env.GCP_SERVICE_NAME ?? "alpadev-frontend"
const BILLING_ACCOUNT = process.env.GCP_BILLING_ACCOUNT ?? "01E568-05D922-FFE202"

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

  // ── Billing overview (real costs from metrics) ─────────────

  async getBillingOverview() {
    const auth = createAuth()
    const mon = google.monitoring({ version: "v3", auth })

    const now = new Date()
    const dayOfMonth = now.getDate()
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()

    // Current month metrics
    const som = new Date(now.getFullYear(), now.getMonth(), 1)
    const [reqR, cpuR, memR, storR] = await Promise.allSettled([
      this.monthlySum(mon, "run.googleapis.com/request_count", som, now),
      this.monthlySum(mon, "run.googleapis.com/container/cpu/allocation_time", som, now),
      this.monthlySum(mon, "run.googleapis.com/container/memory/allocation_time", som, now),
      this.latestValue(mon, "artifactregistry.googleapis.com/repository/size", "artifactregistry.googleapis.com/Repository"),
    ])

    const reqVal = val(reqR, 0)
    // Fallback: estimate CPU/memory from requests if allocation metrics unavailable
    const cpuRaw = val(cpuR, 0)
    const memRaw = val(memR, 0)
    const cpuVal = cpuRaw > 0 ? cpuRaw : reqVal * 0.2 // 200ms avg
    const memVal = memRaw > 0 ? memRaw : reqVal * 0.2 * 0.5
    const storVal = val(storR, 0)

    const calcCosts = (req: number, cpu: number, mem: number, stor: number) => {
      const requests = Math.max(0, req - FREE_TIER.requests) * PRICING.requestsPerMillion / 1e6
      const cpuCost = Math.max(0, cpu - FREE_TIER.vcpuSeconds) * PRICING.vcpuSecond
      const memory = Math.max(0, mem - FREE_TIER.gibSeconds) * PRICING.gibSecond
      const storage = Math.max(0, stor - FREE_TIER.storageBytes) / (1024 ** 3) * PRICING.storagePerGbMonth
      return { requests, cpu: cpuCost, memory, storage, total: requests + cpuCost + memory + storage }
    }

    const calcGross = (req: number, cpu: number, mem: number, stor: number) => {
      const requests = req * PRICING.requestsPerMillion / 1e6
      const cpuCost = cpu * PRICING.vcpuSecond
      const memory = mem * PRICING.gibSecond
      const storage = (stor / (1024 ** 3)) * PRICING.storagePerGbMonth
      return { requests, cpu: cpuCost, memory, storage, total: requests + cpuCost + memory + storage }
    }

    const costs = calcCosts(reqVal, cpuVal, memVal, storVal)
    const gross = calcGross(reqVal, cpuVal, memVal, storVal)

    const dailyAvg = dayOfMonth > 0 ? costs.total / dayOfMonth : 0
    const projectedMonth = dailyAvg * daysInMonth
    const dailyAvgGross = dayOfMonth > 0 ? gross.total / dayOfMonth : 0
    const projectedGross = dailyAvgGross * daysInMonth

    // Historical: last 6 months in parallel (4 metrics × 6 months = 24 queries)
    const months: { start: Date; end: Date; label: string }[] = []
    for (let i = 5; i >= 0; i--) {
      const mStart = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const mEnd = i === 0 ? now : new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59)
      months.push({
        start: mStart,
        end: mEnd,
        label: mStart.toLocaleDateString("en", { month: "short", year: "2-digit" }),
      })
    }

    const historyPromises = months.map(async (m) => {
      const [hReq, hCpu, hMem] = await Promise.allSettled([
        this.monthlySum(mon, "run.googleapis.com/request_count", m.start, m.end),
        this.monthlySum(mon, "run.googleapis.com/container/cpu/allocation_time", m.start, m.end),
        this.monthlySum(mon, "run.googleapis.com/container/memory/allocation_time", m.start, m.end),
      ])
      const r = val(hReq, 0)
      const c = val(hCpu, 0) || r * 0.2
      const me = val(hMem, 0) || r * 0.2 * 0.5
      const net = calcCosts(r, c, me, 0)
      const gr = calcGross(r, c, me, 0)
      return {
        month: m.label,
        requests: round2(net.requests),
        cpu: round2(net.cpu),
        memory: round2(net.memory),
        total: round2(net.total),
        grossTotal: round2(gr.total),
      }
    })

    const history = await Promise.all(historyPromises)

    // Budget data
    let budgets: Awaited<ReturnType<typeof this.listBudgets>> = []
    try { budgets = await this.listBudgets() } catch { /* no budgets configured */ }

    return {
      currentMonth: {
        costs: { requests: round2(costs.requests), cpu: round2(costs.cpu), memory: round2(costs.memory), storage: round2(costs.storage) },
        total: round2(costs.total),
        gross: { requests: round2(gross.requests), cpu: round2(gross.cpu), memory: round2(gross.memory), storage: round2(gross.storage) },
        grossTotal: round2(gross.total),
        dailyAvg: round2(dailyAvg),
        projectedMonth: round2(projectedMonth),
        dailyAvgGross: round2(dailyAvgGross),
        projectedGross: round2(projectedGross),
        dayOfMonth,
        daysInMonth,
      },
      history,
      budgets,
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

  // ── Budget management ───────────────────────────────────────

  async listBudgets() {
    const auth = createAuth()
    const budgets = google.billingbudgets({ version: "v1", auth })
    const res = await budgets.billingAccounts.budgets.list({
      parent: `billingAccounts/${BILLING_ACCOUNT}`,
    })
    return (res.data.budgets ?? []).map((b) => ({
      name: b.name ?? "",
      displayName: b.displayName ?? "",
      amount: b.amount?.specifiedAmount
        ? { units: b.amount.specifiedAmount.units ?? "0", currency: b.amount.specifiedAmount.currencyCode ?? "USD" }
        : null,
      thresholds: (b.thresholdRules ?? []).map((t) => ({
        percent: (t.thresholdPercent ?? 0) * 100,
        basis: t.spendBasis ?? "CURRENT_SPEND",
      })),
    }))
  }

  async createBudget(input: {
    displayName: string
    amount: number
    currency: string
    thresholds: number[]
    notificationEmail?: string
  }) {
    const auth = createAuth()
    const budgets = google.billingbudgets({ version: "v1", auth })

    // Ensure notification channel exists
    let channelName: string | undefined
    if (input.notificationEmail) {
      channelName = await this.ensureEmailChannel(input.notificationEmail)
    }

    await budgets.billingAccounts.budgets.create({
      parent: `billingAccounts/${BILLING_ACCOUNT}`,
      requestBody: {
        displayName: input.displayName,
        budgetFilter: { projects: [`projects/${PROJECT_NUMBER}`] },
        amount: {
          specifiedAmount: {
            currencyCode: input.currency,
            units: String(input.amount),
          },
        },
        thresholdRules: input.thresholds.map((pct) => ({
          thresholdPercent: pct / 100,
          spendBasis: "CURRENT_SPEND",
        })),
        notificationsRule: {
          ...(channelName && { monitoringNotificationChannels: [channelName] }),
          disableDefaultIamRecipients: false,
        },
      },
    })
  }

  async deleteBudget(budgetName: string) {
    const auth = createAuth()
    const budgets = google.billingbudgets({ version: "v1", auth })
    await budgets.billingAccounts.budgets.delete({ name: budgetName })
  }

  // ── Alert policies ─────────────────────────────────────────

  async listAlertPolicies() {
    const auth = createAuth()
    const mon = google.monitoring({ version: "v3", auth })
    const res = await mon.projects.alertPolicies.list({ name: `projects/${PROJECT_ID}` })
    return (res.data.alertPolicies ?? []).map((p) => ({
      name: p.name ?? "",
      displayName: p.displayName ?? "",
      enabled: p.enabled ?? true,
      conditions: (p.conditions ?? []).map((c) => ({
        displayName: c.displayName ?? "",
        threshold: c.conditionThreshold?.thresholdValue ?? null,
      })),
    }))
  }

  async createAlertPolicy(input: {
    type: "error_rate" | "latency" | "instance_crash" | "custom"
    displayName: string
    threshold: number
    notificationEmail: string
  }) {
    const auth = createAuth()
    const mon = google.monitoring({ version: "v3", auth })
    const channelName = await this.ensureEmailChannel(input.notificationEmail)

    const policyTemplates: Record<string, object> = {
      error_rate: {
        displayName: input.displayName,
        combiner: "OR",
        conditions: [{
          displayName: `Error rate > ${input.threshold}%`,
          conditionThreshold: {
            filter: `metric.type = "run.googleapis.com/request_count" AND resource.type = "cloud_run_revision" AND resource.labels.service_name = "${SERVICE_NAME}" AND metric.labels.response_code_class != "2xx"`,
            comparison: "COMPARISON_GT",
            thresholdValue: input.threshold / 100,
            duration: "300s",
            aggregations: [{ alignmentPeriod: "300s", perSeriesAligner: "ALIGN_RATE", crossSeriesReducer: "REDUCE_SUM" }],
          },
        }],
        notificationChannels: [channelName],
        alertStrategy: { autoClose: "1800s" },
      },
      latency: {
        displayName: input.displayName,
        combiner: "OR",
        conditions: [{
          displayName: `P99 latency > ${input.threshold}ms`,
          conditionThreshold: {
            filter: `metric.type = "run.googleapis.com/request_latencies" AND resource.type = "cloud_run_revision" AND resource.labels.service_name = "${SERVICE_NAME}"`,
            comparison: "COMPARISON_GT",
            thresholdValue: input.threshold,
            duration: "300s",
            aggregations: [{ alignmentPeriod: "300s", perSeriesAligner: "ALIGN_PERCENTILE_99", crossSeriesReducer: "REDUCE_MAX" }],
          },
        }],
        notificationChannels: [channelName],
        alertStrategy: { autoClose: "1800s" },
      },
      instance_crash: {
        displayName: input.displayName,
        combiner: "OR",
        conditions: [{
          displayName: "Container restart detected",
          conditionThreshold: {
            filter: `metric.type = "run.googleapis.com/container/startup_latencies" AND resource.type = "cloud_run_revision" AND resource.labels.service_name = "${SERVICE_NAME}"`,
            comparison: "COMPARISON_GT",
            thresholdValue: input.threshold,
            duration: "60s",
            aggregations: [{ alignmentPeriod: "60s", perSeriesAligner: "ALIGN_COUNT", crossSeriesReducer: "REDUCE_SUM" }],
          },
        }],
        notificationChannels: [channelName],
        alertStrategy: { autoClose: "1800s" },
      },
      custom: {
        displayName: input.displayName,
        combiner: "OR",
        conditions: [{
          displayName: input.displayName,
          conditionThreshold: {
            filter: `metric.type = "run.googleapis.com/request_count" AND resource.type = "cloud_run_revision" AND resource.labels.service_name = "${SERVICE_NAME}"`,
            comparison: "COMPARISON_GT",
            thresholdValue: input.threshold,
            duration: "300s",
            aggregations: [{ alignmentPeriod: "300s", perSeriesAligner: "ALIGN_RATE", crossSeriesReducer: "REDUCE_SUM" }],
          },
        }],
        notificationChannels: [channelName],
        alertStrategy: { autoClose: "1800s" },
      },
    }

    await mon.projects.alertPolicies.create({
      name: `projects/${PROJECT_ID}`,
      requestBody: policyTemplates[input.type] as any,
    })
  }

  async deleteAlertPolicy(policyName: string) {
    const auth = createAuth()
    const mon = google.monitoring({ version: "v3", auth })
    await mon.projects.alertPolicies.delete({ name: policyName })
  }

  // ── Error logs + AI analysis ───────────────────────────────

  async getRecentErrors(hours = 24) {
    const auth = createAuth()
    const logging = google.logging({ version: "v2", auth })
    const cutoff = new Date(Date.now() - hours * 3_600_000).toISOString()

    const res = await logging.entries.list({
      requestBody: {
        resourceNames: [`projects/${PROJECT_ID}`],
        filter: `resource.type = "cloud_run_revision" AND resource.labels.service_name = "${SERVICE_NAME}" AND severity >= ERROR AND timestamp >= "${cutoff}"`,
        orderBy: "timestamp desc",
        pageSize: 50,
      },
    })

    return (res.data.entries ?? []).map((e) => ({
      timestamp: e.timestamp ?? "",
      severity: e.severity ?? "ERROR",
      message:
        typeof e.textPayload === "string"
          ? e.textPayload
          : typeof e.jsonPayload === "object"
            ? JSON.stringify(e.jsonPayload, null, 2)
            : String(e.protoPayload ?? ""),
      insertId: e.insertId ?? "",
      resource: e.resource?.labels ?? {},
    }))
  }

  async analyzeFailure(errorMessages: string[]) {
    const logsText = errorMessages.slice(0, 10).join("\n---\n")

    const { text } = await ai.generate({
      prompt: `You are a Cloud Run SRE expert. Analyze these error logs from a Next.js 15 app running on Google Cloud Run (1 vCPU, 512Mi, scale-to-zero, us-central1).

Error logs:
${logsText}

Respond in this exact JSON format (no markdown, just raw JSON):
{
  "rootCause": "1-2 sentence root cause",
  "severity": "critical" | "warning" | "info",
  "impact": "How this affects the service",
  "fix": "Recommended action to resolve",
  "prevention": "How to prevent this in the future"
}`,
    })

    try {
      const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim()
      return JSON.parse(cleaned) as {
        rootCause: string
        severity: string
        impact: string
        fix: string
        prevention: string
      }
    } catch {
      return {
        rootCause: text,
        severity: "info",
        impact: "Unable to parse structured analysis",
        fix: "Review the error logs manually",
        prevention: "N/A",
      }
    }
  }

  // ── Notification channel helper ────────────────────────────

  private async ensureEmailChannel(email: string): Promise<string> {
    const auth = createAuth()
    const mon = google.monitoring({ version: "v3", auth })

    // Check existing channels
    const existing = await mon.projects.notificationChannels.list({ name: `projects/${PROJECT_ID}` })
    const found = (existing.data.notificationChannels ?? []).find(
      (ch) => ch.type === "email" && ch.labels?.email_address === email,
    )
    if (found?.name) return found.name

    // Create new
    const created = await mon.projects.notificationChannels.create({
      name: `projects/${PROJECT_ID}`,
      requestBody: {
        type: "email",
        displayName: `Alert: ${email}`,
        labels: { email_address: email },
      },
    })
    return created.data.name ?? ""
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

function round2(n: number) {
  return Math.round(n * 100) / 100
}

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

export type BlogSection = {
  title: string
  paragraphs: string[]
  bullets?: string[]
}

export type BlogAuthor = {
  name: string
  role: string
}

export type BlogPost = {
  slug: string
  title: string
  description: string
  publishedAt: string
  updatedAt: string
  readingTime: string
  category: string
  featured: boolean
  author: BlogAuthor
  tags: string[]
  seoKeywords: string[]
  intro: string[]
  takeaways: string[]
  pullQuote: string
  sections: BlogSection[]
}

const fallbackSiteUrl = "https://www.alpadev.ai"

function resolveSiteUrl() {
  const envSiteUrl = process.env.NEXT_PUBLIC_SITE_URL

  try {
    return new URL(envSiteUrl ?? fallbackSiteUrl)
  } catch {
    return new URL(fallbackSiteUrl)
  }
}

export const siteUrl = resolveSiteUrl()

const posts: BlogPost[] = [
  {
    slug: "2026-tech-landscape-agentic-ai-autonomous-infrastructure",
    title: "The 2026 Tech Landscape: Agentic AI & Autonomous Infrastructure",
    description:
      "Why 2026 belongs to teams that pair agentic AI with self-managing platforms, stronger guardrails, and software operations designed for autonomous change.",
    publishedAt: "2026-03-18",
    updatedAt: "2026-03-18",
    readingTime: "9 min read",
    category: "AI Strategy",
    featured: true,
    author: {
      name: "Alpadev AI Editorial",
      role: "Software, AI & Cloud Strategy",
    },
    tags: [
      "Agentic AI",
      "Platform Engineering",
      "Autonomous Infrastructure",
      "Cloud Operations",
      "Governance",
    ],
    seoKeywords: [
      "agentic AI",
      "autonomous infrastructure",
      "2026 tech landscape",
      "platform engineering",
      "AI governance",
      "self-healing systems",
      "observability",
      "cloud automation",
    ],
    intro: [
      "The most important software trend in 2026 is not that AI can generate more content, write more code, or answer more questions. It is that AI systems are increasingly able to execute work across tools, environments, and operational boundaries with limited human intervention.",
      "That shift matters because it changes the job of modern software teams. The new challenge is no longer just shipping digital products faster. It is building operating environments where intelligent systems can act safely, infrastructure can recover automatically, and critical workflows remain observable from end to end.",
    ],
    takeaways: [
      "Agentic AI is moving from suggestion engines to bounded operators that can plan, act, and escalate when confidence drops.",
      "Infrastructure is becoming increasingly autonomous through policy-driven automation, continuous remediation, and richer operational context.",
      "The winning stack combines intelligence with traceability, governance, and human override paths designed into the runtime.",
    ],
    pullQuote:
      "The winning stack in 2026 is not just intelligent. It is accountable, observable, and able to recover without heroics.",
    sections: [
      {
        title: "From Assistants to Operators",
        paragraphs: [
          "In the previous wave, most AI products behaved like copilots: they suggested, summarized, or accelerated a single user in a single interface. In 2026, the center of gravity is shifting toward agents that can coordinate across ticketing systems, knowledge bases, developer tooling, cloud APIs, and business workflows.",
          "That does not mean fully autonomous software everywhere. It means the best teams are decomposing work into bounded operating loops: collect context, propose a plan, execute approved actions, verify the result, and surface an audit trail. The result is software that behaves less like a chatbot and more like a disciplined teammate.",
        ],
        bullets: [
          "Agents increasingly manage routine triage, incident enrichment, back-office workflows, and first-pass operations.",
          "Human review remains essential at approval boundaries, policy exceptions, and high-impact production changes.",
          "Product teams now design task scope, tool permissions, and fallback behavior as carefully as they design UI.",
        ],
      },
      {
        title: "Autonomous Infrastructure Stops Being Optional",
        paragraphs: [
          "As systems become more distributed, reactive operations no longer scale. Engineering organizations are leaning harder into infrastructure defined as software, policy encoded as guardrails, and remediation pipelines that trigger before an incident becomes customer-visible.",
          "Autonomous infrastructure is not a single product category. It is an operating model that combines platform engineering, infrastructure as code, event-driven automation, runtime policy enforcement, and service-level objectives. The aim is simple: reduce the amount of operational stability that depends on expert memory and manual intervention.",
        ],
        bullets: [
          "Provisioning, scaling, and rollback processes are increasingly policy-aware and event-triggered.",
          "Self-healing patterns now extend beyond restart logic to include dependency rerouting, drift correction, and controlled degradation.",
          "Platform teams are becoming internal product teams for reliability, compliance, and developer velocity.",
        ],
      },
      {
        title: "Observability Becomes Decision Intelligence",
        paragraphs: [
          "Telemetry in 2026 is no longer just about dashboards. It is about giving both humans and agents the context required to make good decisions. Logs, traces, metrics, cost signals, and model behavior need to converge into an operational narrative, not remain scattered across disconnected tools.",
          "This is where mature teams pull ahead. They are instrumenting workflows so an agent can determine not only what happened, but what changed, what risk is attached to the change, and which actions are allowed next. Better visibility does not merely improve debugging; it enables safer autonomy.",
        ],
        bullets: [
          "Observability pipelines increasingly include model quality, prompt lineage, and automation outcomes alongside system metrics.",
          "Incident response improves when agents can retrieve relevant traces, affected services, runbooks, and ownership context instantly.",
          "Cost intelligence becomes part of reliability strategy as teams optimize both performance and operating margin.",
        ],
      },
      {
        title: "Governance Moves Into the Runtime",
        paragraphs: [
          "The more autonomy you introduce, the more important runtime governance becomes. Static policies and annual reviews are not enough when intelligent systems can touch production workflows, sensitive data, and customer-facing experiences in real time.",
          "Leading teams are embedding governance directly into execution paths. Identity, permissions, approval checkpoints, policy tests, and immutable activity logs are becoming first-class product requirements. Governance is no longer a drag on speed when it is designed as software from the beginning.",
        ],
        bullets: [
          "Every agent action needs a clear identity, a bounded scope, and a recoverable trail.",
          "Sensitive workflows benefit from human-in-the-loop checkpoints rather than blanket denial of automation.",
          "Regulated environments increasingly demand explainability for both infrastructure behavior and AI-assisted actions.",
        ],
      },
      {
        title: "What High-Performing Teams Do Next",
        paragraphs: [
          "The practical path forward is not to automate everything. It is to choose high-friction workflows where context is available, policies are clear, and success criteria can be measured. Teams that win in this landscape start with a contained loop, instrument it deeply, and expand autonomy only when reliability proves out.",
          "In other words, 2026 rewards operational discipline. The organizations that benefit most from agentic AI are not necessarily the ones with the flashiest demos. They are the ones that pair software craftsmanship with infrastructure rigor and treat autonomy as an engineering system, not a marketing feature.",
        ],
        bullets: [
          "Map repeatable workflows before you automate them.",
          "Design guardrails, rollback paths, and manual override states up front.",
          "Measure outcomes in latency, quality, reliability, and operator time recovered.",
          "Scale autonomy gradually, one trusted operating loop at a time.",
        ],
      },
    ],
  },
]

export function getBlogPosts() {
  return posts
    .slice()
    .sort(
      (leftPost, rightPost) =>
        new Date(rightPost.publishedAt).getTime() -
        new Date(leftPost.publishedAt).getTime()
    )
}

export function getBlogPostBySlug(slug: string) {
  return posts.find((post) => post.slug === slug)
}

export function formatBlogDate(date: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date))
}

export function getBlogIndexUrl() {
  return new URL("/blog", siteUrl).toString()
}

export function getBlogPostUrl(slug: string) {
  return new URL(`/blog/${slug}`, siteUrl).toString()
}

export function getSectionId(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
}

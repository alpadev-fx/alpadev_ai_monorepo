export type BlogSection = {
  title: string
  paragraphs: string[]
  bullets?: string[]
}

export type BlogAuthor = {
  name: string
  role: string
}

export type BlogPostTranslations = {
  title: string
  description: string
  intro: string[]
  takeaways: string[]
  pullQuote: string
  sections: BlogSection[]
}

export type BlogPost = {
  slug: string
  publishedAt: string
  updatedAt: string
  readingTime: string
  category: string
  featured: boolean
  author: BlogAuthor
  tags: string[]
  seoKeywords: string[]
  en: BlogPostTranslations
  es: BlogPostTranslations
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
    slug: "the-end-of-sora-openai-shifts-to-agentic-ai",
    publishedAt: "2026-03-25",
    updatedAt: "2026-03-25",
    readingTime: "6 min read",
    category: "AI Strategy",
    featured: true,
    author: {
      name: "Alpadev AI Editorial",
      role: "Digital Strategy",
    },
    tags: ["OpenAI", "Sora", "Agentic AI", "GPT-5.4", "Tech Strategy"],
    seoKeywords: ["OpenAI closes Sora", "agentic AI 2026", "GPT-5.4 Computer Use", "future of AI"],
    en: {
      title: "The End of Sora: Why OpenAI is Abandoning Video to Conquer Autonomy",
      description: "OpenAI confirms the shutdown of Sora to focus resources on GPT-5.4 and autonomous agents.",
      intro: [
        "Today, March 25, 2026, the tech world received unexpected news: OpenAI is shutting down Sora.",
        "This move redefined priorities, marking the end of the era of recreational visual generation to make way for operational execution.",
      ],
      takeaways: [
        "OpenAI prioritizes software execution over video generation.",
        "The shutdown responds to extreme compute costs.",
      ],
      pullQuote: "We are moving from an AI that simply suggests to an AI that acts.",
      sections: [
        {
          title: "Execution over Creation",
          paragraphs: ["OpenAI is shifting resources toward GPT-5.4 and its new Computer Use capabilities."],
        }
      ],
    },
    es: {
      title: "El Fin de Sora: Por qué OpenAI abandona el video para conquistar la Autonomía",
      description: "OpenAI confirma el cierre de Sora para centrar recursos en GPT-5.4 y agentes autónomos.",
      intro: [
        "Hoy, 25 de marzo de 2026, el mundo tecnológico ha recibido una noticia inesperada: OpenAI cierra Sora.",
        "Este movimiento marca el fin de la era de la generación visual recreativa para dar paso a la ejecución operativa.",
      ],
      takeaways: [
        "OpenAI prioriza la ejecución de software sobre la generación de video.",
        "El cierre responde a los altísimos costos de computación.",
      ],
      pullQuote: "Estamos pasando de una IA que simplemente sugiere a una IA que actúa.",
      sections: [
        {
          title: "Prioridad en la Ejecución",
          paragraphs: ["OpenAI está moviendo recursos hacia GPT-5.4 y sus capacidades de Computer Use."],
        }
      ],
    },
  },
  {
    slug: "2026-tech-landscape-agentic-ai-autonomous-infrastructure",
    publishedAt: "2026-03-18",
    updatedAt: "2026-03-18",
    readingTime: "9 min read",
    category: "AI Strategy",
    featured: true,
    author: {
      name: "Alpadev AI Editorial",
      role: "Software, AI & Cloud Strategy",
    },
    tags: ["Agentic AI", "Infrastructure", "Autonomous"],
    seoKeywords: ["agentic AI", "autonomous infrastructure"],
    en: {
      title: "The 2026 Tech Landscape: Agentic AI & Autonomous Infrastructure",
      description: "Why 2026 belongs to teams that pair agentic AI with self-managing platforms.",
      intro: ["The most important software trend in 2026 is execution over tools."],
      takeaways: ["Agentic AI is moving from suggestion to operation."],
      pullQuote: "The winning stack in 2026 is accountable and observable.",
      sections: [
        {
          title: "From Assistants to Operators",
          paragraphs: ["The center of gravity is shifting toward agents that coordinate across systems."],
        }
      ],
    },
    es: {
      title: "El Panorama Tech 2026: IA Agéntica e Infraestructura Autónoma",
      description: "Por qué el 2026 pertenece a los equipos que combinan IA agéntica con plataformas autogestionadas.",
      intro: ["La tendencia más importante en 2026 es la ejecución sobre las herramientas."],
      takeaways: ["La IA agéntica está pasando de la sugerencia a la operación."],
      pullQuote: "El stack ganador en 2026 es responsable y observable.",
      sections: [
        {
          title: "De Asistentes a Operadores",
          paragraphs: ["El centro de gravedad se está desplazando hacia agentes que coordinan sistemas."],
        }
      ],
    },
  }
]

export function getBlogPosts() {
  return posts.slice().sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
}

export function getBlogPostBySlug(slug: string) {
  return posts.find((post) => post.slug === slug)
}

export function formatBlogDate(date: string) {
  try {
    return new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric" }).format(new Date(date))
  } catch {
    return date
  }
}

export function getSectionId(title: string) {
  return title.toLowerCase().replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-")
}

export function getBlogPostUrl(slug: string) {
  return new URL("/blog/" + slug, siteUrl).toString()
}

import type { Metadata } from "next"
import Link from "next/link"

import {
  formatBlogDate,
  getBlogIndexUrl,
  getBlogPosts,
  siteUrl,
} from "./_content/posts"

const blogDescription =
  "Field notes on software architecture, agentic AI, autonomous infrastructure, and the systems required to scale intelligently."

export const metadata: Metadata = {
  metadataBase: siteUrl,
  title: "Blog",
  description: blogDescription,
  alternates: {
    canonical: "/blog",
  },
  keywords: [
    "software blog",
    "agentic AI",
    "autonomous infrastructure",
    "platform engineering",
    "cloud operations",
  ],
  openGraph: {
    title: "Blog | Alpadev AI",
    description: blogDescription,
    url: getBlogIndexUrl(),
    type: "website",
    siteName: "Alpadev AI",
  },
  twitter: {
    card: "summary_large_image",
    title: "Blog | Alpadev AI",
    description: blogDescription,
    creator: "@alpadev",
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function BlogIndexPage() {
  const posts = getBlogPosts()

  return (
    <main className="min-h-screen bg-black px-6 pb-24 pt-24 text-white selection:bg-primary/30 selection:text-white sm:px-8 lg:px-10">
      <section className="mx-auto max-w-6xl border-b border-white/10 pb-16 pt-10 sm:pb-20">
        <div className="max-w-3xl">
          <p className="text-sm font-medium uppercase tracking-[0.28em] text-primary">
            Journal
          </p>
          <h1 className="mt-6 text-balance text-4xl font-semibold tracking-tight text-white sm:text-6xl">
            Software. Solved.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-400 sm:text-xl">
            Essays on designing resilient products, AI systems, and cloud
            platforms that perform under pressure.
          </p>
        </div>

        <div className="mt-12 grid gap-6 text-sm text-zinc-400 sm:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">
              Focus
            </p>
            <p className="mt-3 text-base text-zinc-100">
              Architecture, agentic AI, and autonomous operations.
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">
              Style
            </p>
            <p className="mt-3 text-base text-zinc-100">
              Strategic, technical, and written for decision-makers.
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">
              Archive
            </p>
            <p className="mt-3 text-base text-zinc-100">
              {posts.length} published {posts.length === 1 ? "essay" : "essays"}.
            </p>
          </div>
        </div>
      </section>

      <section
        aria-labelledby="latest-posts"
        className="mx-auto mt-14 max-w-6xl sm:mt-16"
      >
        <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-6">
          <h2
            className="text-2xl font-semibold tracking-tight text-white"
            id="latest-posts"
          >
            Latest posts
          </h2>
          <p className="text-sm text-zinc-500">Updated for 2026</p>
        </div>

        <div className="mt-8 grid gap-6">
          {posts.map((post) => (
            <article
              className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.05] to-white/[0.02] p-6 transition duration-200 hover:border-primary/40 hover:bg-white/[0.06] sm:p-8"
              key={post.slug}
            >
              <div className="flex flex-wrap items-center gap-3 text-sm text-zinc-400">
                {post.featured ? (
                  <span className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.22em] text-primary">
                    Featured
                  </span>
                ) : null}
                <span>{post.category}</span>
                <span aria-hidden="true">•</span>
                <time dateTime={post.publishedAt}>{formatBlogDate(post.publishedAt)}</time>
                <span aria-hidden="true">•</span>
                <span>{post.readingTime}</span>
              </div>

              <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)] lg:items-start">
                <div>
                  <h3 className="text-balance text-2xl font-semibold tracking-tight text-white sm:text-4xl">
                    <Link href={`/blog/${post.slug}`}>
                      {post.title}
                    </Link>
                  </h3>
                  <p className="mt-4 max-w-3xl text-base leading-7 text-zinc-400 sm:text-lg">
                    {post.description}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/40 p-5">
                  <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">
                    Key takeaways
                  </p>
                  <ul className="mt-4 space-y-3 text-sm leading-6 text-zinc-300">
                    {post.takeaways.slice(0, 2).map((takeaway) => (
                      <li className="border-l border-primary/40 pl-4" key={takeaway}>
                        {takeaway}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-6">
                <div>
                  <p className="text-sm font-medium text-zinc-200">{post.author.name}</p>
                  <p className="mt-1 text-sm text-zinc-500">{post.author.role}</p>
                </div>

                <Link
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm font-medium text-white transition hover:border-primary/40 hover:text-primary"
                  href={`/blog/${post.slug}`}
                >
                  Read article
                  <span aria-hidden="true">→</span>
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  )
}

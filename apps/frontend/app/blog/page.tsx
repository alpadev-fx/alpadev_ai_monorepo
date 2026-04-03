"use client"

import Link from "next/link"
import { useLanguage } from "@/contexts/LanguageContext"
import { getBlogPosts, formatBlogDate } from "./_content/posts"

export default function BlogIndexPage() {
  const { language } = useLanguage()
  const posts = getBlogPosts()

  const featuredPost = posts.find((p) => p.featured) ?? posts[0]
  const remainingPosts = posts.filter((p) => p.slug !== featuredPost?.slug)

  if (!featuredPost) return null

  const featuredContent = language === "es" ? featuredPost.es : featuredPost.en

  return (
    <main className="min-h-screen bg-black px-6 pb-24 pt-24 text-white sm:px-8 lg:px-10">
      <div className="mx-auto max-w-6xl pt-10">
        <header className="max-w-3xl">
          <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-6xl">
            {language === "es" ? "Blog & Noticias" : "Blog & News"}
          </h1>
          <p className="mt-6 text-lg leading-8 text-zinc-400">
            {language === "es"
              ? "Perspectivas sobre el futuro de la IA, ingeniería de software y automatización agéntica."
              : "Insights on the future of AI, software engineering, and agentic automation."}
          </p>
        </header>

        {/* Hero: most recent featured post */}
        <Link
          href={`/blog/${featuredPost.slug}`}
          className="group relative mt-16 flex flex-col overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] transition hover:bg-white/[0.06] sm:flex-row"
        >
          <div className="flex-1 p-6 sm:p-8">
            <div className="flex items-center gap-3 text-xs tracking-wide">
              <span className="rounded-full bg-primary/10 px-2.5 py-0.5 font-medium text-primary">
                {featuredPost.category}
              </span>
              <span className="text-zinc-500">{featuredPost.readingTime}</span>
              <span className="text-zinc-600">&middot;</span>
              <time className="text-zinc-500" dateTime={featuredPost.publishedAt}>
                {formatBlogDate(featuredPost.publishedAt)}
              </time>
            </div>
            <h2 className="mt-3 text-xl font-semibold tracking-tight text-white line-clamp-2 group-hover:text-primary transition">
              {featuredContent.title}
            </h2>
            <p className="mt-2 text-sm leading-6 text-zinc-400 line-clamp-2">
              {featuredContent.description}
            </p>
            <div className="mt-4 flex items-center gap-1.5 text-sm font-medium text-zinc-500 group-hover:text-primary transition">
              {language === "es" ? "Leer más" : "Read more"}
              <span
                aria-hidden="true"
                className="transition-transform group-hover:translate-x-1"
              >
                →
              </span>
            </div>
          </div>
          <div className="hidden sm:flex sm:w-72 sm:flex-col sm:justify-center sm:border-l sm:border-white/5 sm:bg-white/[0.02] sm:p-8">
            <div className="h-px w-10 bg-primary/60" />
            <p className="mt-4 text-sm italic leading-6 text-zinc-500 line-clamp-3">
              &ldquo;{featuredContent.pullQuote}&rdquo;
            </p>
          </div>
        </Link>

        {/* Grid: remaining posts */}
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {remainingPosts.map((post) => {
            const content = language === "es" ? post.es : post.en
            return (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group relative flex flex-col rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition hover:bg-white/[0.06] hover:border-white/15"
              >
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium tracking-wide text-primary">
                    {post.category}
                  </span>
                  <span className="text-[11px] text-zinc-600">
                    {post.readingTime}
                  </span>
                </div>
                <h2 className="mt-3 text-base font-semibold leading-snug tracking-tight text-white line-clamp-2 group-hover:text-primary transition">
                  {content.title}
                </h2>
                <p className="mt-2 text-sm leading-5 text-zinc-500 line-clamp-2">
                  {content.description}
                </p>
                <div className="mt-3 flex items-center justify-between pt-3 border-t border-white/5">
                  <time
                    className="text-[11px] text-zinc-600"
                    dateTime={post.publishedAt}
                  >
                    {formatBlogDate(post.publishedAt)}
                  </time>
                  <span
                    className="text-zinc-600 transition-transform group-hover:translate-x-0.5 group-hover:text-primary"
                    aria-hidden="true"
                  >
                    →
                  </span>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </main>
  )
}

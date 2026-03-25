"use client"

import Link from "next/link"
import { useLanguage } from "@/contexts/LanguageContext"
import { getBlogPosts, formatBlogDate } from "./_content/posts"

export default function BlogIndexPage() {
  const { language } = useLanguage()
  const posts = getBlogPosts()

  return (
    <main className="min-h-screen bg-black px-6 pb-24 pt-24 text-white sm:px-8 lg:px-10">
      <div className="mx-auto max-w-6xl pt-10">
        <header className="max-w-3xl">
          <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-6xl">
            {language === 'es' ? 'Blog & Noticias' : 'Blog & News'}
          </h1>
          <p className="mt-6 text-lg leading-8 text-zinc-400">
            {language === 'es' 
              ? 'Perspectivas sobre el futuro de la IA, ingeniería de software y automatización agéntica.'
              : 'Insights on the future of AI, software engineering, and agentic automation.'}
          </p>
        </header>

        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => {
            const content = language === 'es' ? post.es : post.en
            return (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group relative flex flex-col items-start rounded-3xl border border-white/10 bg-white/[0.03] p-8 transition hover:bg-white/[0.06]"
              >
                <time className="text-sm text-zinc-500" dateTime={post.publishedAt}>
                  {formatBlogDate(post.publishedAt)}
                </time>
                <h2 className="mt-4 text-2xl font-semibold text-white group-hover:text-primary transition">
                  {content.title}
                </h2>
                <p className="mt-4 text-base leading-7 text-zinc-400">
                  {content.description}
                </p>
                <div className="mt-6 flex items-center gap-2 text-sm font-medium text-white group-hover:text-primary transition">
                  {language === 'es' ? 'Leer más' : 'Read more'}
                  <span aria-hidden="true">→</span>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </main>
  )
}

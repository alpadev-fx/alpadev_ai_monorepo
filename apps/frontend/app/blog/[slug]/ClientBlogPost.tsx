"use client"

import Link from "next/link"
import { useLanguage } from "@/contexts/LanguageContext"
import {
  formatBlogDate,
  getSectionId,
} from "../_content/posts"
import type { BlogPost } from "../_content/posts"

export default function ClientBlogPost({ post }: { post: BlogPost }) {
  const { language } = useLanguage()

  const content = language === "es" ? post.es : post.en

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: content.title,
    description: content.description,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    articleSection: post.category,
    keywords: post.seoKeywords.join(", "),
    author: {
      "@type": "Organization",
      name: post.author.name,
    },
    publisher: {
      "@type": "Organization",
      name: "Alpadev AI",
      logo: {
        "@type": "ImageObject",
        url: "https://assets.alpadev.xyz/assets/logo.jpg",
      },
    },
  }

  return (
    <main className="min-h-screen bg-black px-6 pb-24 pt-24 text-white selection:bg-primary/30 selection:text-white sm:px-8 lg:px-10">
      <script
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
        type="application/ld+json"
      />

      <div className="mx-auto max-w-6xl pt-10">
        <nav aria-label="Breadcrumb" className="text-sm text-zinc-500">
          <ol className="flex flex-wrap items-center gap-2">
            <li>
              <Link className="transition hover:text-white" href="/blog">
                Blog
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li className="text-zinc-300">{content.title}</li>
          </ol>
        </nav>

        <article className="mt-8">
          <header className="max-w-4xl border-b border-white/10 pb-12">
            <p className="text-sm font-medium uppercase tracking-[0.28em] text-primary">
              {post.category}
            </p>
            <h1 className="mt-6 text-balance text-4xl font-semibold tracking-tight text-white sm:text-6xl">
              {content.title}
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-zinc-400 sm:text-xl">
              {content.description}
            </p>

            <div className="mt-8 grid gap-4 text-sm text-zinc-400 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">
                  {language === 'es' ? 'Publicado' : 'Published'}
                </p>
                <time className="mt-3 block text-base text-zinc-100" dateTime={post.publishedAt}>
                  {formatBlogDate(post.publishedAt)}
                </time>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">
                   {language === 'es' ? 'Actualizado' : 'Updated'}
                </p>
                <time className="mt-3 block text-base text-zinc-100" dateTime={post.updatedAt}>
                  {formatBlogDate(post.updatedAt)}
                </time>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">
                  {language === 'es' ? 'Tiempo de lectura' : 'Reading time'}
                </p>
                <p className="mt-3 text-base text-zinc-100">{post.readingTime}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">
                   {language === 'es' ? 'Autor' : 'Author'}
                </p>
                <p className="mt-3 text-base text-zinc-100">{post.author.name}</p>
                <p className="mt-1 text-sm text-zinc-500">{post.author.role}</p>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span
                  className="rounded-full border border-white/10 px-3 py-1 text-sm text-zinc-300"
                  key={tag}
                >
                  {tag}
                </span>
              ))}
            </div>
          </header>

          <div className="mt-12 grid gap-12 lg:grid-cols-[220px_minmax(0,1fr)] lg:items-start">
            <aside className="lg:sticky lg:top-28">
              <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
                <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">
                  {language === 'es' ? 'En esta página' : 'On this page'}
                </p>
                <nav aria-label="Table of contents" className="mt-4">
                  <ul className="space-y-3 text-sm leading-6 text-zinc-400">
                    {content.sections.map((section) => (
                      <li key={section.title}>
                        <a
                          className="transition hover:text-white"
                          href={"#" + getSectionId(section.title)}
                        >
                          {section.title}
                        </a>
                      </li>
                    ))}
                  </ul>
                </nav>
              </div>
            </aside>

            <div className="max-w-3xl">
              <div className="space-y-6 text-lg leading-8 text-zinc-300">
                {content.intro.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>

              <section
                aria-labelledby="key-takeaways"
                className="mt-10 rounded-3xl border border-primary/20 bg-primary/5 p-6"
              >
                <div className="h-px w-16 bg-primary/80" />
                <h2
                  className="mt-4 text-2xl font-semibold tracking-tight text-white"
                  id="key-takeaways"
                >
                  {language === 'es' ? 'Conclusiones clave' : 'Key takeaways'}
                </h2>
                <ul className="mt-6 space-y-4 text-base leading-7 text-zinc-200">
                  {content.takeaways.map((takeaway) => (
                    <li className="border-l border-primary/40 pl-4" key={takeaway}>
                      {takeaway}
                    </li>
                  ))}
                </ul>
              </section>

              <blockquote className="my-16 rounded-3xl border border-white/10 bg-white/[0.03] px-6 py-8 text-2xl font-medium leading-[1.52] tracking-tight text-white sm:px-8">
                “{content.pullQuote}”
              </blockquote>

              <div className="mt-12 space-y-12">
                {content.sections.map((section) => (
                  <section
                    className="scroll-mt-28 border-t border-white/10 pt-10"
                    id={getSectionId(section.title)}
                    key={section.title}
                  >
                    <h2 className="text-3xl font-semibold tracking-tight text-white">
                      {section.title}
                    </h2>
                    <div className="mt-6 space-y-6 text-lg leading-8 text-zinc-300">
                      {section.paragraphs.map((paragraph) => (
                        <p key={paragraph}>{paragraph}</p>
                      ))}
                    </div>

                    {section.bullets?.length ? (
                      <ul className="mt-6 space-y-4 border-l border-white/10 pl-6 text-base leading-7 text-zinc-300">
                        {section.bullets.map((bullet) => (
                          <li key={bullet}>{bullet}</li>
                        ))}
                      </ul>
                    ) : null}
                  </section>
                ))}
              </div>

              <footer className="mt-16 border-t border-white/10 pt-8">
                <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
                  <p className="text-sm uppercase tracking-[0.24em] text-zinc-500">
                    {language === 'es' ? 'Continuar leyendo' : 'Continue reading'}
                  </p>
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
                    <p className="max-w-xl text-base leading-7 text-zinc-300">
                      {language === 'es' 
                        ? 'Explora el resto del diario para más escritos sobre sistemas de software y modelos operativos de IA.'
                        : 'Explore the rest of the journal for more writing on software systems, cloud execution, and AI operating models.'}
                    </p>
                    <Link
                      className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm font-medium text-white transition hover:border-primary/40 hover:text-primary"
                      href="/blog"
                    >
                      {language === 'es' ? 'Volver al blog' : 'Back to blog'}
                      <span aria-hidden="true">→</span>
                    </Link>
                  </div>
                </div>
              </footer>
            </div>
          </div>
        </article>
      </div>
    </main>
  )
}

import type { Metadata } from "next"
import { notFound } from "next/navigation"
import ClientBlogPost from "./ClientBlogPost"

import {
  getBlogPostBySlug,
  getBlogPostUrl,
  getBlogPosts,
  siteUrl,
} from "../_content/posts"

type BlogPostPageProps = {
  params: Promise<{
    slug: string
  }>
}

export const dynamicParams = false

export function generateStaticParams() {
  return getBlogPosts().map((post) => ({ slug: post.slug }))
}

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params
  const post = getBlogPostBySlug(slug)

  if (!post) {
    return {
      title: "Post not found",
      robots: {
        index: false,
        follow: false,
      },
    }
  }

  return {
    metadataBase: siteUrl,
    title: post.en.title,
    description: post.en.description,
    alternates: {
      canonical: "/blog/" + post.slug,
    },
    keywords: post.seoKeywords,
    authors: [{ name: post.author.name }],
    category: post.category,
    openGraph: {
      title: post.en.title,
      description: post.en.description,
      url: getBlogPostUrl(post.slug),
      type: "article",
      siteName: "Alpadev AI",
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      authors: [post.author.name],
      tags: post.tags,
    },
    twitter: {
      card: "summary_large_image",
      title: post.en.title,
      description: post.en.description,
      creator: "@alpadev",
    },
    robots: {
      index: true,
      follow: true,
    },
  }
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params
  const post = getBlogPostBySlug(slug)

  if (!post) {
    notFound()
  }

  return <ClientBlogPost post={post} />
}

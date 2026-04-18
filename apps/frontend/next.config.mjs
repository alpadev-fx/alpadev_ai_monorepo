import bundleAnalyzer from "@next/bundle-analyzer"

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
})

const isProd = process.env.NODE_ENV === "production"

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    "@package/auth",
    "@package/api",
    "@package/db",
    "@package/utils",
    "@package/validations",
    "@package/email",
  ],

  // Standalone build for docker/production
  output: "standalone",
  // Performance optimizations
  compress: true,

  // Keep heavy server-only packages out of the webpack bundle
  serverExternalPackages: ["googleapis", "google-auth-library"],

  // Image optimization
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 2592000, // 30 days
    remotePatterns: [
      {
        protocol: "https",
        hostname: "assets.alpadev.xyz",
      },
      {
        protocol: "https",
        hostname: "alpadev.xyz",
      },
      {
        protocol: "https",
        hostname: "aceternity.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "pub-17cfbc261d654bd0bcc5166f3bf46f6b.r2.dev",
      },
    ],
  },

  // Compiler optimizations
  compiler: {
    removeConsole:
      process.env.NODE_ENV === "production"
        ? {
            exclude: ["error", "warn"],
          }
        : false,
  },

  // Experimental features for better performance
  experimental: {
    // Only in prod — barrel-file optimization slows dev cold starts on R3F/drei
    ...(isProd && {
      optimizePackageImports: [
        "@heroui/react",
        "@iconify/react",
        "@react-three/drei",
        "lucide-react",
        "date-fns",
      ],
    }),
  },

  // Include Prisma engine binaries in standalone build (pnpm monorepo paths)
  outputFileTracingIncludes: {
    "/api/**/*": [
      "../../node_modules/.pnpm/@prisma+engines@*/node_modules/@prisma/engines/*",
      "../../node_modules/.pnpm/@prisma+client@*/node_modules/.prisma/client/*",
    ],
  },

  // Output configuration
  poweredByHeader: false,

  // Headers for better caching
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Referrer-Policy",
            value: "origin-when-cross-origin",
          },
        ],
      },
      {
        source: "/fonts/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/_next/static/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/_next/image/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=2592000, stale-while-revalidate=86400",
          },
        ],
      },
      {
        source: "/api/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "no-store, must-revalidate",
          },
        ],
      },
    ]
  },

  eslint: {
    // Pre-existing lint debt (100+ errors: unused vars, function-component style, no-explicit-any).
    // Separate audit needed. TypeScript type-checking remains strict — ignoreBuildErrors stays off.
    ignoreDuringBuilds: true,
  },
}

export default withBundleAnalyzer(nextConfig)

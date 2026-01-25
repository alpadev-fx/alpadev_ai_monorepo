/** @type {import('next').NextConfig} */
const nextConfig = {
  // ✅ ACTUALIZADO: Agregamos las librerías 3D críticas aquí
  // transpilePackages: ["gsap", "three", "@react-three/fiber", "@react-three/drei"],
  
  // Standalone build for docker/production
  output: "standalone",
  // Performance optimizations
  compress: true,

  // Image optimization
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 2592000, // 30 days
    remotePatterns: [
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
    // ✅ ACTUALIZADO: Optimizamos Drei para que el dev server no sea lento
    // optimizePackageImports: ["@heroui/react", "@iconify/react", "@react-three/drei"],
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
        source: "/api/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, s-maxage=60, stale-while-revalidate=300",
          },
        ],
      },
    ]
  },

  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // (OPCIONAL) Si en el futuro decides usar archivos .glsl separados en lugar de strings
  // webpack: (config) => {
  //   config.module.rules.push({
  //     test: /\.(glsl|vs|fs|vert|frag)$/,
  //     use: ['raw-loader', 'glslify-loader'],
  //   });
  //   return config;
  // },
}

export default nextConfig// Build trigger Sun Jan 25 01:51:58 -05 2026

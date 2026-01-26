import "@/styles/globals.css"
import { Metadata, Viewport } from "next"
import Script from "next/script"
import clsx from "clsx"

import { siteConfig } from "../config/site"
import { fontSans } from "../config/fonts"

import { Providers } from "./providers"
import Navbar from "./_components/landing/Navbar"
import Footer from "./_components/landing/Footer"
import WhatsAppButton from "./_components/ui/WhatsAppButton"
import { FPSMonitor } from "./_components/diagnostics/FPSMonitor"

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s - ${siteConfig.name}`,
  },
  description: siteConfig.description,
  icons: {
    icon: [
      { url: "/logo.png", type: "image/svg+xml" },
      { url: "/logo.png", sizes: "any" },
    ],
    apple: "/logo.png",
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      suppressHydrationWarning
      lang="en"
      style={{ scrollBehavior: "smooth" }}
    >
      <head>
        {/* Google Analytics */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}');
          `}
        </Script>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fira+Code:wght@300..700&family=Inter:wght@100..900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        suppressHydrationWarning
        className={clsx(
          "min-h-screen bg-black font-sans antialiased",
          fontSans.variable
        )}
        style={{
          '--font-sans': '"Inter", sans-serif',
          '--font-mono': '"Fira Code", monospace',
        } as React.CSSProperties}
      >
        <Providers attribute="class" defaultTheme="dark">
          <div className="relative flex flex-col min-h-screen">
            <Navbar />
            <main className="w-full flex-grow">{children}</main>
            <WhatsAppButton />
            <Footer />
            <FPSMonitor />
          </div>
        </Providers>
      </body>
    </html>
  )
}

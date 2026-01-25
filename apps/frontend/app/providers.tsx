"use client"

import type { ThemeProviderProps } from "next-themes"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { HeroUIProvider } from "@heroui/system"
import { useRouter } from "next/navigation"

import { LanguageProvider } from "@/contexts/LanguageContext"
import { TRPCReactProvider } from "@/lib/trpc/react"

export interface ProvidersProps extends Omit<ThemeProviderProps, "children"> {
  children: React.ReactNode
}

declare module "@react-types/shared" {
  interface RouterConfig {
    routerOptions: NonNullable<
      Parameters<ReturnType<typeof useRouter>["push"]>[1]
    >
  }
}

export function Providers({
  children,
  attribute = "class",
  defaultTheme = "dark",
  ...themeProps
}: ProvidersProps) {
  const router = useRouter()

  return (
    // @ts-ignore
    <HeroUIProvider navigate={router.push}>
      <NextThemesProvider
        attribute={attribute}
        defaultTheme={defaultTheme}
        {...themeProps}
      >
        <TRPCReactProvider>
          <LanguageProvider>{children}</LanguageProvider>
        </TRPCReactProvider>
      </NextThemesProvider>
    </HeroUIProvider>
    // <>{children}</>
  )
}

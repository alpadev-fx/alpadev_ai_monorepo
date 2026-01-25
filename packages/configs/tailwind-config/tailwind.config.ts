import type { Config } from "tailwindcss"
import plugin from "tailwindcss/plugin"
import { heroui } from "@heroui/react"

export const buildHeroUIConfig = (content: Config["content"] = []): Config => ({
  content: [
    "../../node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
    ...(content as string[]),
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      fontSize: {
        "heading-s": "1.25rem",
        "heading-m": "1.5rem",
        "heading-l": "2rem",
        "heading-2xl": "4rem",
        "2xl": "3rem",
        "3xl": "3.5rem",
        "5xl": "4.5rem",
      },
      lineHeight: {
        "2xl": "3rem",
        "3xl": "4rem",
        "5xl": "5rem",
      },
      keyframes: {
        "scrolling-banner": {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(calc(-50% - var(--gap)/2))" },
        },
        "scrolling-banner-vertical": {
          from: { transform: "translateY(0)" },
          to: { transform: "translateY(calc(-50% - var(--gap)/2))" },
        },
        "fade-in-right": {
          "0%": { opacity: "0", transform: "translateX(-50px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        "fade-in-left": {
          "0%": { opacity: "0", transform: "translateX(50px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        "fade-in-bottom": {
          "0%": { opacity: "0", transform: "translateY(50px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in-zoom": {
          "0%": { opacity: "0", transform: "scale(0.8)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
      },
      animation: {
        "scrolling-banner": "scrolling-banner var(--duration) linear infinite",
        "scrolling-banner-vertical":
          "scrolling-banner-vertical var(--duration) linear infinite",
        "fade-in-right": "fade-in-right 0.5s ease-out forwards",
        "fade-in-left": "fade-in-left 0.5s ease-out forwards",
        "fade-in-bottom": "fade-in-bottom 0.5s ease-out forwards",
        "fade-in-zoom": "fade-in-zoom 0.5s ease-out forwards",
      },
    },
  },
  darkMode: "class",
  plugins: [
    heroui({
      defaultTheme: "light",
      layout: {
        fontSize: {
          large: "1.125rem", // text-large
        },
        lineHeight: {
          large: "1.75rem", // text-large
        },
      },
      themes: {
        light: {
          colors: {
            primary: {
              DEFAULT: "#DC143C",
              500: "#ED3B5E",
            },
            secondary: {
              DEFAULT: "#9353D3", // Color morado/púrpura
              500: "#8B5CF6",
            },
            content2: {
              foreground: "#27272A",
            },
            content4: {
              foreground: "#A1A1AA",
            },
          }, // dark theme colors
        },
        dark: {
          colors: {
            primary: {
              DEFAULT: "#DC143C",
              500: "#ED3B5E",
            },
            secondary: {
              DEFAULT: "#9353D3", // Color morado/púrpura
              500: "#8B5CF6",
            },
            content2: {
              foreground: "#F4F4F5",
            },
            content4: {
              foreground: "#A1A1AA",
            },
          }, // dark theme colors
        },
      },
    }),
  ],
})

export const nextJetConfig: Config = {
  darkMode: ["class"],
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1440px",
      },
    },
    extend: {
      typography: ({}) => ({
        DEFAULT: {
          css: {
            maxWidth: "680px",
          },
        },
      }),
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        foregroundGrey: "hsl(var--(foreground-grey))",
        success: "hsl(var(--success))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.5s ease-in",
      },
      fontFamily: {
        sarabun: ["var(--font-sarabun)"],
        archivoBlack: ["var(--font-archivo-black)"],
      },
      screens: {
        xs: "425px",
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    require("@tailwindcss/typography"),
    plugin(({ addUtilities }) => {
      addUtilities({
        ".text-balance": {
          "text-wrap": "balance",
        },
        ".text-pretty": {
          "text-wrap": "pretty",
        },
        ".min-h-dynamic-screen": {
          "min-height": ["100vh", "100dvh"],
        },
        ".min-h-dynamic-screen-nav": {
          "min-height": ["calc(100vh - 70px)", "calc(100dvh - 64px)"],
        },
        ".h-dynamic-screen": {
          height: ["100vh", "100dvh"],
        },
        ".h-dynamic-screen-nav": {
          height: ["calc(100vh - 64px)", "calc(100dvh - 64px)"],
        },
        ".max-h-dynamic-screen": {
          "max-height": ["100vh", "100dvh"],
        },
        ".break-anywhere": {
          "overflow-wrap": "anywhere",
        },
      })
    }),
  ],
} satisfies Config

export default nextJetConfig

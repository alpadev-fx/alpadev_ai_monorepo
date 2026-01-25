import plugin from "tailwindcss/plugin";
import { heroui } from "@heroui/theme";

const config = {
  content: [
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
  	extend: {
      letterSpacing: {
        tighter: '-0.04em',
        tight: '-0.02em',
      },
  		fontFamily: {
  			sans: ['"Inter Tight"', 'Inter', 'sans-serif'],
  			mono: ['"JetBrains Mono"', 'monospace'],
  		},
  		colors: {
  			background: '#050505', // Void Black
  			foreground: '#f4f4f5', // Vapor White
  			
            // Quiet Luxury Palette
            'alpadev-void': '#050505',
            'alpadev-charcoal': '#121212',
            'alpadev-steel': '#27272a',
            'alpadev-vapor': '#f4f4f5',
            'alpadev-ash': '#a1a1aa',
            'alpadev-lime': '#ccf381', // Electric Lime Accent
  			
  			card: {
  				DEFAULT: '#121212',
  				foreground: '#f4f4f5'
  			},
  			popover: {
  				DEFAULT: '#121212',
  				foreground: '#f4f4f5'
  			},
  			primary: {
  				DEFAULT: '#ccf381', // Electric Lime
  				foreground: '#050505'
  			},
  			secondary: {
  				DEFAULT: '#27272a',
  				foreground: '#f4f4f5'
  			},
  			muted: {
  				DEFAULT: '#27272a',
  				foreground: '#a1a1aa'
  			},
  			accent: {
  				DEFAULT: '#ccf381',
  				foreground: '#050505'
  			},
  			destructive: {
  				DEFAULT: '#ef4444', // Red-500
  				foreground: '#f4f4f5'
  			},
  			border: '#27272a',
  			input: '#27272a',
  			ring: '#ccf381',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		},
  		fontSize: {
  			'heading-s': '1.25rem',
  			'heading-m': '1.5rem',
  			'heading-l': '2rem',
  			'heading-2xl': '4rem',
  			'2xl': '3rem',
  			'3xl': '3.5rem',
  			'5xl': '4.5rem'
  		},
  		lineHeight: {
  			'2xl': '3rem',
  			'3xl': '4rem',
  			'5xl': '5rem'
  		},
  		keyframes: {
  			'scrolling-banner': {
  				from: {
  					transform: 'translateX(0)'
  				},
  				to: {
  					transform: 'translateX(calc(-50% - var(--gap)/2))'
  				}
  			},
  			'scrolling-banner-vertical': {
  				from: {
  					transform: 'translateY(0)'
  				},
  				to: {
  					transform: 'translateY(calc(-50% - var(--gap)/2))'
  				}
  			},
  			'fade-in-right': {
  				'0%': {
  					opacity: '0',
  					transform: 'translateX(-50px)'
  				},
  				'100%': {
  					opacity: '1',
  					transform: 'translateX(0)'
  				}
  			},
  			'fade-in-left': {
  				'0%': {
  					opacity: '0',
  					transform: 'translateX(50px)'
  				},
  				'100%': {
  					opacity: '1',
  					transform: 'translateX(0)'
  				}
  			},
  			'fade-in-bottom': {
  				'0%': {
  					opacity: '0',
  					transform: 'translateY(50px)'
  				},
  				'100%': {
  					opacity: '1',
  					transform: 'translateY(0)'
  				}
  			},
  			'fade-in-zoom': {
  				'0%': {
  					opacity: '0',
  					transform: 'scale(0.8)'
  				},
  				'100%': {
  					opacity: '1',
  					transform: 'scale(1)'
  				}
  			},
  			'gradient-xy': {
  				'0%, 100%': {
  					'background-position': '0% 50%'
  				},
  				'50%': {
  					'background-position': '100% 50%'
  				}
  			}
  		},
  		animation: {
  			'scrolling-banner': 'scrolling-banner var(--duration) linear infinite',
  			'scrolling-banner-vertical': 'scrolling-banner-vertical var(--duration) linear infinite',
  			'fade-in-right': 'fade-in-right 0.5s ease-out forwards',
  			'fade-in-left': 'fade-in-left 0.5s ease-out forwards',
  			'fade-in-bottom': 'fade-in-bottom 0.5s ease-out forwards',
  			'fade-in-zoom': 'fade-in-zoom 0.5s ease-out forwards',
  			'gradient-xy': 'gradient-xy 15s ease infinite'
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		}
  	}
  },
  darkMode: ["class", "class"],
  plugins: [
    heroui({
      defaultTheme: "light",
      layout: {
        fontSize: {
          large: "1.125rem",
        },
        lineHeight: {
          large: "1.75rem",
        },
      },
      themes: {
        light: {
          colors: {
            primary: {
              DEFAULT: "#FF6600",
              500: "#FFA100",
            },
            content2: {
              foreground: "#27272A",
            },
            content4: {
              foreground: "#A1A1AA",
            },
          },
        },
        dark: {
          colors: {
            primary: {
              DEFAULT: "#FF6600",
              500: "#FFA100",
            },
            content2: {
              foreground: "#F4F4F5",
            },
            content4: {
              foreground: "#A1A1AA",
            },
          },
        },
      },
    }),
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
      });
    }),
      require("tailwindcss-animate")
],
};

export default config;

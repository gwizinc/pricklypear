
import type { Config } from "tailwindcss";

export default {
	darkMode: "class",
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: '#1E2A44',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: '#2CCED2',
					foreground: '#1E2A44'
				},
				accent: {
					DEFAULT: '#FF6B6B',
					foreground: '#FFFFFF'
				},
				warm: {
					DEFAULT: '#FFD166',
					foreground: '#1E2A44'
				},
				bglight: '#F7FAFC',
				textbody: '#3A475E',
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},
				chat: {
					blue: '#D3E4FD',
					purple: '#E5DEFF',
					gray: '#F3F3F3',
					sender1: '#0EA5E9',
					sender2: '#8B5CF6'
				}
			},
			fontFamily: {
				sans: ['Inter', 'sans-serif'],
				rounded: ['Nunito', 'sans-serif'],
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)',
				'xl': '20px',
			},
			boxShadow: {
				card: '0 2px 4px rgba(0,0,0,.04), 0 1px 2px rgba(0,0,0,.02)',
			},
			keyframes: {
				'accordion-down': {
					from: { height: '0' },
					to: { height: 'var(--radix-accordion-content-height)' }
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)' },
					to: { height: '0' }
				},
				'message-appear': {
					from: { opacity: '0', transform: 'translateY(10px)' },
					to: { opacity: '1', transform: 'translateY(0)' }
				},
				wobble: {
					'0%,100%': { transform: 'rotate(0)' },
					'25%': { transform: 'rotate(-4deg)' },
					'75%': { transform: 'rotate(4deg)' },
				},
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'message-appear': 'message-appear 0.3s ease-out',
				wobble: 'wobble 0.3s ease-in-out',
			},
			backgroundImage: {
				'hero-gradient': 'linear-gradient(135deg, #2CCED2 0%, #FFD166 50%, #FF6B6B 100%)',
			},
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
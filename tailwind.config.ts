import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

export default {
	darkMode: ["class"],
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
					DEFAULT: '#8A3B12', // Terracotta
					foreground: '#F8F1E8' // Light sand
				},
				secondary: {
					DEFAULT: '#79A089', // Sage green
					foreground: '#39352A' // Dusk
				},
				accent: {
					DEFAULT: '#8A3B12', // Terracotta
					foreground: '#F8F1E8' // Light sand
				},
				warm: {
					DEFAULT: '#EAD9C5', // Sand light
					foreground: '#39352A' // Dusk
				},
				desert1: '#EAD9C5', // Lighter sand
				desert2: '#D4BFA9', // Deeper sand
				sage: '#79A089',    // Accent & icons
				dusk: '#39352A',    // Headlines / strong text
				surface: '#F8F1E8', // Card / modal background
				bgLight: '#EAD9C5', // Sand light background
				textBody: '#4F4738', // Body text
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
				display: ['"Libre Baskerville"', 'serif'],
				rounded: ['Nunito', 'sans-serif'],
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)',
				'xl': '20px',
				card: '16px',
			},
			boxShadow: {
				card: '0 1px 3px rgba(0,0,0,.04), 0 1px 1px rgba(0,0,0,.02)',
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
		}
	},
	plugins: [animate],
} satisfies Config;

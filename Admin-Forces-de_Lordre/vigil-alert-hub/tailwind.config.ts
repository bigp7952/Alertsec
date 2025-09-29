import type { Config } from "tailwindcss";

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
			padding: '1rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				// Nouvelle palette professionnelle blanc + jaune/orange
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: '#ffffff', // Blanc pur
				foreground: '#1a1a1a', // Texte noir foncé
				primary: {
					DEFAULT: '#d97706', // Orange foncé principal
					foreground: '#ffffff',
					50: '#fff7ed',
					100: '#ffedd5',
					500: '#f97316',
					600: '#ea580c',
					700: '#d97706', 
					800: '#c2410c',
					900: '#9a3412'
				},
				secondary: {
					DEFAULT: '#f3f4f6', // Gris très clair
					foreground: '#374151'
				},
				accent: {
					DEFAULT: '#fbbf24', // Jaune foncé
					foreground: '#1f2937',
					50: '#fffbeb',
					100: '#fef3c7',
					400: '#fbbf24',
					500: '#f59e0b',
					600: '#d97706'
				},
				destructive: {
					DEFAULT: '#ef4444',
					foreground: '#ffffff'
				},
				warning: {
					DEFAULT: '#f59e0b',
					foreground: '#ffffff'
				},
				success: {
					DEFAULT: '#10b981',
					foreground: '#ffffff'
				},
				muted: {
					DEFAULT: '#f9fafb', // Gris très clair
					foreground: '#6b7280'
				},
				popover: {
					DEFAULT: '#ffffff',
					foreground: '#1a1a1a'
				},
				card: {
					DEFAULT: '#ffffff',
					foreground: '#1a1a1a'
				},
				sidebar: {
					DEFAULT: '#ffffff',
					foreground: '#374151',
					primary: '#d97706',
					'primary-foreground': '#ffffff',
					accent: '#f3f4f6',
					'accent-foreground': '#374151',
					border: '#e5e7eb',
					ring: '#d97706'
				},
				// Police specific colors (plus compacts)
				'danger-critical': '#dc2626',
				'danger-medium': '#f59e0b', 
				'safe-zone': '#10b981'
			},
			borderRadius: {
				lg: '8px', // Plus petit que l'original
				md: '6px',
				sm: '4px'
			},
			spacing: {
				'18': '4.5rem',
				'22': '5.5rem'
			},
			fontSize: {
				'2xs': ['0.625rem', { lineHeight: '0.75rem' }], // Très petite taille
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
				'fade-in': {
					from: { opacity: '0', transform: 'translateY(10px)' },
					to: { opacity: '1', transform: 'translateY(0)' }
				},
				'slide-in': {
					from: { transform: 'translateX(-100%)' },
					to: { transform: 'translateX(0)' }
				},
				'bounce-in': {
					'0%': { transform: 'scale(0.3)', opacity: '0' },
					'50%': { transform: 'scale(1.05)' },
					'70%': { transform: 'scale(0.9)' },
					'100%': { transform: 'scale(1)', opacity: '1' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fade-in 0.3s ease-out',
				'slide-in': 'slide-in 0.3s ease-out',
				'bounce-in': 'bounce-in 0.4s ease-out'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;

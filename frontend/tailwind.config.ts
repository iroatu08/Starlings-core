import type { Config } from 'tailwindcss'
import tailwindcssAnimate from 'tailwindcss-animate'

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        // Starlings brand
        navy: {
          DEFAULT: '#1B2A4A',
          50: '#E8EBF0',
          100: '#C5CDD9',
          200: '#9AAABF',
          300: '#6F88A4',
          400: '#4A6689',
          500: '#1B2A4A',
          600: '#162240',
          700: '#101A34',
          800: '#0B1228',
          900: '#060B1C',
        },
        gold: {
          DEFAULT: '#C49A2D',
          50: '#FDF8EC',
          100: '#F9EDCA',
          200: '#F2D98E',
          300: '#E8C057',
          400: '#D5A838',
          500: '#C49A2D',
          600: '#A07D22',
          700: '#7C6119',
          800: '#584510',
          900: '#342908',
        },
        'off-white': '#F8F6F2',
        slate: '#6B7280',
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: '#1B2A4A',
          foreground: '#F8F6F2',
        },
        secondary: {
          DEFAULT: '#C49A2D',
          foreground: '#fff',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        /**
         * Editorial join flow — flat keys so utilities (e.g. bg-editorial-primary) resolve
         * reliably in Tailwind JIT and Tailwind CSS IntelliSense (nested objects are often skipped).
         */
        'editorial-primary': '#041534',
        'editorial-gold': '#785a00',
        'editorial-surface': '#fbf9f5',
        'editorial-surface-container-low': '#f5f3ef',
        'editorial-on-surface-variant': '#45464e',
        'editorial-outline-variant': '#c5c6cf',
        'editorial-on-background': '#1b1c1a',
        /** Admin shell (management suite) */
        'admin-canvas': '#F5F5F0',
        'admin-navy': '#0A162B',
      },
      fontFamily: {
        display: ['Playfair Display', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        shimmer: 'shimmer 2s linear infinite',
        float: 'float 3s ease-in-out infinite',
      },
    },
  },
  plugins: [tailwindcssAnimate],
}

export default config

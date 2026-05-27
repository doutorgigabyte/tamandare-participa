import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '1rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        // Paleta "Atlântico Sul" — ver globals.css
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',

        // Tokens semânticos da paleta Atlântico Sul (uso direto sem CSS vars)
        atlantico: {
          areia: '#FEF8EE',
          'areia-quente': '#F5EBD5',
          'mar-raso': '#4DB6AC',
          'mar-profundo': '#00838F',
          'mata-atlantica': '#2E7D32',
          'mata-clara': '#A5D6A7',
          terracota: '#C75B39',
          'terracota-clara': '#E89B82',
          tinta: '#1C2A33',
          neblina: '#5B6B73',
        },

        // Cores das macroáreas — adendo v1.2 §3.1 (mantidas pra consistência
        // com o mapa do zoneamento)
        macroarea: {
          'lazer-turismo': '#663399',
          'orla-carneiros-1': '#4682B4',
          'orla-carneiros-2': '#6495ED',
          'conservacao-ambiental': '#228B22',
          'orla-tamandare': '#FFD700',
          'centro-tamandare': '#B22234',
          'social-morros': '#A52A2A',
          'uso-institucional': '#696969',
          'mamucabinhas': '#DA70D6',
          'brejo-saue': '#FFB6C1',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 4px)',
        sm: 'calc(var(--radius) - 8px)',
        xl: 'calc(var(--radius) + 4px)',
        '2xl': 'calc(var(--radius) + 8px)',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        display: ['var(--font-fraunces)', 'Georgia', 'serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      boxShadow: {
        // Sombras suaves, "atmosféricas" — não dramáticas
        soft: '0 2px 12px -2px rgba(28, 42, 51, 0.08)',
        card: '0 4px 24px -8px rgba(28, 42, 51, 0.10)',
        hero: '0 16px 48px -16px rgba(28, 42, 51, 0.18)',
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
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'fade-up': 'fade-up 0.4s ease-out',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;

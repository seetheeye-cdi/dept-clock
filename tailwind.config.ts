import type { Config } from 'tailwindcss';

const config = {
  darkMode: ['class'],
  content: ['./src/**/*.{ts,tsx}'],
  prefix: '',
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
        border: 'var(--border)',
        input: 'var(--input)',
        ring: 'var(--ring)',
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        // Semantic palette mapped to CSS variables for light/dark schemes
        primary: {
          DEFAULT: 'var(--primary)',
          foreground: 'var(--primary-foreground)',
        },
        secondary: {
          DEFAULT: 'var(--secondary)',
          foreground: 'var(--secondary-foreground)',
        },
        destructive: {
          DEFAULT: 'var(--destructive)',
          foreground: 'var(--destructive-foreground)',
        },
        muted: {
          DEFAULT: 'var(--muted)',
          foreground: 'var(--muted-foreground)',
        },
        accent: {
          DEFAULT: 'var(--accent)',
          foreground: 'var(--accent-foreground)',
        },
        popover: {
          DEFAULT: 'var(--popover)',
          foreground: 'var(--popover-foreground)',
        },
        card: {
          DEFAULT: 'var(--card)',
          foreground: 'var(--card-foreground)',
        },
        // Brand & semantic tokens
        brand: {
          yellow: '#FFD400',
          black: '#111111',
          red: '#E02424',
        },
        surface: {
          base: 'var(--surface-base)',
          muted: 'var(--surface-muted)',
          dark: 'var(--surface-dark)',
        },
        text: {
          primary: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          danger: 'var(--text-danger)',
        },
      },
      fontFamily: {
        sans: ['Pretendard Variable', 'system-ui', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
        xs: '4px',
        xl: '1rem',
        '2xl': '1.25rem',
      },
      boxShadow: {
        card: '0 8px 24px rgba(0,0,0,0.08)',
        'elevation-sm': '0 4px 12px rgba(0,0,0,0.06)',
        elevation: '0 1px 0 rgba(255,255,255,0.04) inset, 0 8px 24px rgba(0,0,0,0.08)',
        'elevation-lg': '0 12px 32px rgba(0,0,0,0.12)',
      },
      backgroundImage: {
        receiptTexture: 'var(--texture-receipt)',
        vaultGradient: 'linear-gradient(180deg,#FFE44D 0%,#FFD400 100%)',
      },
      maxWidth: {
        mobile: '480px',
      },
      transitionDuration: {
        fast: '150ms',
        DEFAULT: '200ms',
        slow: '250ms',
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
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [require('tailwindcss-animate'), require('@tailwindcss/typography')],
} satisfies Config;

export default config;

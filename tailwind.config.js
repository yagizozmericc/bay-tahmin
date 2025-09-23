/** @type {import('tailwindcss').Config} */
import forms from '@tailwindcss/forms';
import animate from 'tailwindcss-animate';

export default {
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
      extend: {
        colors: {
          border: 'var(--color-border)', // light gray
          input: 'var(--color-input)', // pure white
          ring: 'var(--color-ring)', // deep forest green
          background: 'var(--color-background)', // warm off-white
          foreground: 'var(--color-foreground)', // near-black
          primary: {
            DEFAULT: 'var(--color-primary)', // deep forest green
            foreground: 'var(--color-primary-foreground)' // white
          },
          secondary: {
            DEFAULT: 'var(--color-secondary)', // lighter green
            foreground: 'var(--color-secondary-foreground)' // white
          },
          destructive: {
            DEFAULT: 'var(--color-destructive)', // clear red
            foreground: 'var(--color-destructive-foreground)' // white
          },
          muted: {
            DEFAULT: 'var(--color-muted)', // light gray
            foreground: 'var(--color-muted-foreground)' // medium gray
          },
          accent: {
            DEFAULT: 'var(--color-accent)', // vibrant orange
            foreground: 'var(--color-accent-foreground)' // white
          },
          popover: {
            DEFAULT: 'var(--color-popover)', // pure white
            foreground: 'var(--color-popover-foreground)' // near-black
          },
          card: {
            DEFAULT: 'var(--color-card)', // pure white
            foreground: 'var(--color-card-foreground)' // near-black
          },
          success: {
            DEFAULT: 'var(--color-success)', // balanced green
            foreground: 'var(--color-success-foreground)' // white
          },
          warning: {
            DEFAULT: 'var(--color-warning)', // warm amber
            foreground: 'var(--color-warning-foreground)' // white
          },
          error: {
            DEFAULT: 'var(--color-error)', // clear red
            foreground: 'var(--color-error-foreground)' // white
          }
        },
        fontFamily: {
          sans: ['Inter', 'system-ui', 'sans-serif'],
          mono: ['JetBrains Mono', 'monospace']
        },
        fontSize: {
          'xs': ['0.75rem', { lineHeight: '1rem' }],
          'sm': ['0.875rem', { lineHeight: '1.25rem' }],
          'base': ['1rem', { lineHeight: '1.5rem' }],
          'lg': ['1.125rem', { lineHeight: '1.75rem' }],
          'xl': ['1.25rem', { lineHeight: '1.75rem' }],
          '2xl': ['1.5rem', { lineHeight: '2rem' }],
          '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
          '4xl': ['2.25rem', { lineHeight: '2.5rem' }]
        },
        borderRadius: {
          lg: '12px',
          md: '8px',
          sm: '4px'
        },
        boxShadow: {
          'elevation-1': '0 2px 8px rgba(0, 0, 0, 0.1)',
          'elevation-2': '0 4px 12px rgba(0, 0, 0, 0.15)'
        },
        animation: {
          'scale-in': 'scaleIn 150ms ease-in-out',
          'fade-in': 'fadeIn 200ms ease-out',
          'slide-up': 'slideUp 200ms ease-out',
          'shimmer': 'shimmer 2s linear infinite',
          'logo-glow': 'logoGlow 3s ease-in-out infinite',
          'gradient-shift': 'gradientShift 4s ease-in-out infinite',
          'float': 'float 6s ease-in-out infinite'
        },
        keyframes: {
          scaleIn: {
            '0%': { transform: 'scale(0.95)', opacity: '0' },
            '100%': { transform: 'scale(1)', opacity: '1' }
          },
          fadeIn: {
            '0%': { opacity: '0' },
            '100%': { opacity: '1' }
          },
          slideUp: {
            '0%': { transform: 'translateY(10px)', opacity: '0' },
            '100%': { transform: 'translateY(0)', opacity: '1' }
          },
          shimmer: {
            '0%': { transform: 'translateX(-100%)' },
            '100%': { transform: 'translateX(100%)' }
          },
          logoGlow: {
            '0%, 100%': { boxShadow: '0 0 15px rgba(34, 197, 94, 0.2)' },
            '50%': { boxShadow: '0 0 20px rgba(255, 111, 0, 0.3), 0 0 25px rgba(34, 197, 94, 0.15)' }
          },
          gradientShift: {
            '0%, 100%': { backgroundPosition: '0% 50%' },
            '50%': { backgroundPosition: '100% 50%' }
          },
          float: {
            '0%, 100%': { transform: 'translateY(0px)' },
            '50%': { transform: 'translateY(-2px)' }
          }
        },
        spacing: {
          '18': '4.5rem',
          '76': '19rem'
        }
      },
    },
    plugins: [
      forms,
      animate
    ],
  }
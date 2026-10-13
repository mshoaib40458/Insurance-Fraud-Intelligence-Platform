/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f3ff',
          100: '#e0e6fe',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          950: '#1e1b4b',
        },
        primary: {
          25: '#f5f8ff',
          50: '#eef4ff',
          100: '#e0eaff',
          200: '#c7d8fe',
          300: '#a4bdfd',
          400: '#7d9bf9',
          500: '#5b78f4',
          600: '#3e54e8',
          700: '#3343d1',
          800: '#2d3aa9',
          900: '#2b3685',
          950: '#1a2151',
        },
        dark: {
          bg: '#090d16',
          card: '#0f172a',
          cardHover: '#141e36',
          border: 'rgba(255, 255, 255, 0.08)',
          subtle: '#1e293b',
        },
        surface: {
          DEFAULT: '#0f172a',
          dark: '#0b1220',
          darker: '#060a12',
          light: '#1e293b',
          card: '#16213a',
        },
        risk: {
          low: '#10b981',
          medium: '#f59e0b',
          high: '#f43f5e',
        },
        accent: {
          cyan: '#06b6d4',
          violet: '#8b5cf6',
          rose: '#f43f5e',
          amber: '#f59e0b',
          emerald: '#10b981',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
        display: ['Outfit', '"Plus Jakarta Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        'card-hover': '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
        'glow-primary': '0 0 20px -3px rgba(99, 102, 241, 0.4)',
        'glow-rose': '0 0 20px -3px rgba(244, 63, 94, 0.4)',
        'glow-emerald': '0 0 20px -3px rgba(16, 185, 129, 0.4)',
        'glow-amber': '0 0 20px -3px rgba(245, 158, 11, 0.4)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'glass-gradient': 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.01) 100%)',
        'sidebar-dark': 'linear-gradient(180deg, #090d16 0%, #060911 100%)',
        'brand-glow': 'linear-gradient(135deg, #6366f1 0%, #a855f7 50%, #ec4899 100%)',
        'dark-card': 'linear-gradient(180deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.8) 100%)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'pulse-glow': {
          '0%, 100%': { opacity: '1', filter: 'drop-shadow(0 0 8px rgba(99, 102, 241, 0.6))' },
          '50%': { opacity: '0.6', filter: 'drop-shadow(0 0 2px rgba(99, 102, 241, 0.2))' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'fade-in': 'fade-in 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'scale-in': 'scale-in 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'pulse-glow': 'pulse-glow 3s ease-in-out infinite',
        'float': 'float 4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}

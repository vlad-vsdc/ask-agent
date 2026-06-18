/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        base: '#0a0a0f',
        panel: '#11111a',
        elevated: '#171724',
        border: '#29293a',
        muted: '#9ca3af',
        accent: '#6366f1',
        accentSoft: '#818cf8',
        success: '#22c55e',
        danger: '#ef4444',
        warning: '#f59e0b',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 0 1px rgb(99 102 241 / 0.22), 0 20px 70px rgb(0 0 0 / 0.35)',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        softPulse: {
          '0%, 100%': { opacity: '0.55' },
          '50%': { opacity: '1' },
        },
        updateFlash: {
          '0%': { boxShadow: '0 0 0 1px rgb(99 102 241 / 0.65)' },
          '100%': { boxShadow: '0 0 0 1px rgb(41 41 58 / 1)' },
        },
      },
      animation: {
        fadeUp: 'fadeUp 240ms ease-out both',
        softPulse: 'softPulse 1.4s ease-in-out infinite',
        updateFlash: 'updateFlash 700ms ease-out',
      },
    },
  },
  plugins: [],
}

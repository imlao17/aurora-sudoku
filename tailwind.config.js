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
        board: {
          bg: '#0f172a',
          surface: '#1e293b',
          grid: '#334155',
          major: '#64748b',
          cell: '#1e293b',
          cellHover: '#334155',
          selected: '#3b82f6',
          highlight: '#1e3a5f',
          sameNum: '#254f6e',
          conflict: '#451a1a',
          errorText: '#f87171',
          initialText: '#f8fafc',
          userText: '#60a5fa',
          noteText: '#94a3b8',
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'Fira Code', 'monospace'],
      },
      keyframes: {
        pop: {
          '0%': { transform: 'scale(0.85)' },
          '50%': { transform: 'scale(1.12)' },
          '100%': { transform: 'scale(1)' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '20%, 60%': { transform: 'translateX(-4px)' },
          '40%, 80%': { transform: 'translateX(4px)' },
        },
        glow: {
          '0%, 100%': { opacity: '0.6' },
          '50%': { opacity: '1' },
        }
      },
      animation: {
        pop: 'pop 0.18s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        shake: 'shake 0.3s ease-in-out',
        glow: 'glow 2s infinite ease-in-out',
      }
    },
  },
  plugins: [],
}

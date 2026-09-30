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
        // `slate-850` is not part of Tailwind's default palette; several
        // components reference it for hover/background states.
        slate: {
          850: '#172033',
        },
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
        sans: ['-apple-system', 'BlinkMacSystemFont', '"SF Pro Display"', '"SF Pro Text"', '"Plus Jakarta Sans"', '"PingFang SC"', '"Hiragino Sans GB"', '"Microsoft YaHei"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      boxShadow: {
        xs: '0 1px 2px 0 rgb(0 0 0 / 0.04)',
        sm: '0 2px 8px -1px rgb(0 0 0 / 0.05), 0 1px 3px -1px rgb(0 0 0 / 0.03)',
        md: '0 6px 20px -2px rgb(0 0 0 / 0.06), 0 2px 6px -2px rgb(0 0 0 / 0.03)',
        card: '0 4px 20px -2px rgba(0, 0, 0, 0.05), 0 2px 8px -2px rgba(0, 0, 0, 0.03)',
        'card-hover': '0 12px 32px -4px rgba(0, 0, 0, 0.08), 0 4px 12px -2px rgba(0, 0, 0, 0.04)',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
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
        fadeIn: 'fadeIn 0.2s ease-out',
        pop: 'pop 0.18s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        shake: 'shake 0.3s ease-in-out',
        glow: 'glow 2s infinite ease-in-out',
      }
    },
  },
  plugins: [],
}

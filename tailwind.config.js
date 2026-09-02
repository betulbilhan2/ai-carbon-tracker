/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: {
          page: '#0A0F0D',
          sidebar: '#0D1410',
          card: '#111816',
          elevated: '#182420',
        },
        accent: {
          green: '#22C55E',
          teal: '#14B8A6',
          amber: '#F59E0B',
          red: '#EF4444',
          blue: '#60A5FA',
        },
        border: {
          DEFAULT: '#1E3A30',
        },
        text: {
          primary: '#F0FDF4',
          secondary: '#86EFAC',
          muted: '#4B6E5E',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        card: '0 0 0 1px #1E3A30',
        'glow-green': '0 0 20px rgba(34,197,94,0.12)',
        'glow-green-md': '0 0 30px rgba(34,197,94,0.20)',
      },
    },
  },
  plugins: [],
};

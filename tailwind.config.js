/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg: "#0f1724",        // page background
        surface: "#0b1220",   // card bg
        accent1: "#7C5CFF",   // purple (primary)
        accent2: "#00D4FF",   // cyan
        accent3: "#FFB86B",   // warm orange
        success: "#10B981",
        danger: "#EF4444",
        text: "#E6EEF8",
        sub: "#94A3B8"
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['Monaco', 'Courier New', 'monospace'],
      },
      boxShadow: {
        'glow': '0 0 20px rgba(124, 92, 255, 0.3)',
        'glow-cyan': '0 0 20px rgba(0, 212, 255, 0.3)',
      }
    },
  },
  plugins: [],
}

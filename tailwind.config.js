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
        bg: "rgb(var(--c-bg) / <alpha-value>)",
        surface: "rgb(var(--c-surface) / <alpha-value>)",
        raised: "rgb(var(--c-raised) / <alpha-value>)",
        line: "rgb(var(--c-line) / <alpha-value>)",
        accent1: "rgb(var(--c-accent1) / <alpha-value>)",
        accent2: "rgb(var(--c-accent2) / <alpha-value>)",
        accent3: "rgb(var(--c-accent3) / <alpha-value>)",
        success: "rgb(var(--c-success) / <alpha-value>)",
        danger: "rgb(var(--c-danger) / <alpha-value>)",
        text: "rgb(var(--c-text) / <alpha-value>)",
        sub: "rgb(var(--c-sub) / <alpha-value>)"
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      boxShadow: {
        'glow': '0 0 24px rgb(var(--c-accent1) / 0.18)',
        'glow-cyan': '0 0 24px rgb(var(--c-accent2) / 0.18)',
        'card': '0 1px 0 rgba(255,255,255,0.04) inset, 0 12px 32px -12px rgba(0,0,0,0.6)',
      }
    },
  },
  plugins: [],
}

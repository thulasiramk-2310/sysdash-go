import { useMemo } from 'react';
import useSettingsStore from '../hooks/useSettingsStore';

// Reads the live CSS variables so Chart.js (canvas) follows the selected theme + accent.
export default function useChartTheme() {
  const theme = useSettingsStore((s) => s.theme);
  const accent = useSettingsStore((s) => s.accentColor);
  return useMemo(() => {
    const cs = getComputedStyle(document.documentElement);
    const rgb = (n) => cs.getPropertyValue(n).trim().split(/\s+/).map(Number);
    const c = (n, a = 1) => { const [r, g, b] = rgb(n); return `rgba(${r}, ${g}, ${b}, ${a})`; };
    return {
      a1: c('--c-accent1'), a2: c('--c-accent2'), a3: c('--c-accent3'), ok: c('--c-success'), bad: c('--c-danger'),
      a1a: (o) => c('--c-accent1', o), a2a: (o) => c('--c-accent2', o), a3a: (o) => c('--c-accent3', o), okA: (o) => c('--c-success', o), badA: (o) => c('--c-danger', o),
      text: c('--c-text'), sub: c('--c-sub'), grid: c('--c-line', theme === 'light' ? 0.1 : 0.07), border: c('--c-line', 0.2), surface: c('--c-surface'),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [theme, accent]);
}

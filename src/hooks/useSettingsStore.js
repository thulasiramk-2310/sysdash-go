import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const ACCENTS = ['cyan', 'red', 'cobalt', 'sage'];
const THEMES = ['dark', 'light'];
const validTheme = (t) => (THEMES.includes(t) ? t : 'dark');
const validAccent = (a) => (ACCENTS.includes(a) ? a : 'cyan'); // old values such as 'purple' fall back to cyan

// Writes the theme/accent onto <html> so CSS variables switch instantly (before React re-renders)
export const applyAppearance = ({ theme, accentColor }) => {
  if (typeof document === 'undefined') return;
  const el = document.documentElement;
  el.dataset.theme = validTheme(theme);
  el.dataset.accent = validAccent(accentColor);
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', validTheme(theme) === 'light' ? '#F4F1EA' : '#0a0b0e');
};

const defaultLayout = [
  { i: 'cpu', x: 0, y: 0, w: 6, h: 4, minW: 3, minH: 2 },
  { i: 'memory', x: 6, y: 0, w: 6, h: 4, minW: 3, minH: 2 },
  { i: 'disk', x: 0, y: 4, w: 6, h: 3, minW: 3, minH: 2 },
  { i: 'network', x: 6, y: 4, w: 6, h: 3, minW: 3, minH: 2 },
  { i: 'gpu', x: 0, y: 11, w: 6, h: 2, minW: 3, minH: 2 },
  { i: 'processes', x: 0, y: 7, w: 8, h: 4, minW: 4, minH: 2 },
  { i: 'alerts', x: 8, y: 7, w: 4, h: 4, minW: 3, minH: 2 },
];

const useSettingsStore = create(
  persist(
    (set, get) => ({
      // Theme settings
      theme: 'dark', // 'dark' or 'light'
      accentColor: 'cyan', // 'cyan', 'red', 'cobalt', 'sage'
      
      // Refresh rate (milliseconds)
      refreshRate: 2000, // 1s, 2s, 5s, 10s
      
      // Enabled metrics
      enabledMetrics: {
        cpu: true,
        memory: true,
        disk: true,
        network: true,
        gpu: false,
        processes: true,
        alerts: true,
      },
      
      // Dashboard layout
      layout: defaultLayout,
      
      // Alert thresholds
      alertThresholds: {
        cpu: 80,
        memory: 85,
        disk: 90,
        temperature: 80,
      },
      
      // Notification settings
      notifications: {
        enabled: true,
        sound: false,
        desktop: false,
      },
      
      // Chart preferences
      chartPreferences: {
        showGrid: true,
        showLegend: true,
        smoothLines: true,
        showPoints: false,
      },
      
      // Actions
      setTheme: (theme) => { applyAppearance({ theme, accentColor: get().accentColor }); set({ theme: validTheme(theme) }); },
      
      setAccentColor: (accentColor) => { applyAppearance({ theme: get().theme, accentColor }); set({ accentColor: validAccent(accentColor) }); },
      
      setRefreshRate: (refreshRate) => set({ refreshRate }),
      
      toggleMetric: (metric) => set((state) => ({
        enabledMetrics: {
          ...state.enabledMetrics,
          [metric]: !state.enabledMetrics[metric],
        },
      })),
      
      setMetricEnabled: (metric, enabled) => set((state) => ({
        enabledMetrics: {
          ...state.enabledMetrics,
          [metric]: enabled,
        },
      })),
      
      updateLayout: (newLayout) => set({ layout: newLayout }),
      
      resetLayout: () => set({ layout: defaultLayout }),
      
      setAlertThreshold: (metric, value) => set((state) => ({
        alertThresholds: {
          ...state.alertThresholds,
          [metric]: value,
        },
      })),
      
      updateNotifications: (settings) => set((state) => ({
        notifications: {
          ...state.notifications,
          ...settings,
        },
      })),
      
      updateChartPreferences: (preferences) => set((state) => ({
        chartPreferences: {
          ...state.chartPreferences,
          ...preferences,
        },
      })),
      
      // Export configuration
      exportConfig: () => {
        const state = get();
        return JSON.stringify({
          theme: state.theme,
          accentColor: state.accentColor,
          refreshRate: state.refreshRate,
          enabledMetrics: state.enabledMetrics,
          layout: state.layout,
          alertThresholds: state.alertThresholds,
          notifications: state.notifications,
          chartPreferences: state.chartPreferences,
        }, null, 2);
      },
      
      // Import configuration
      importConfig: (config) => {
        try {
          const parsed = JSON.parse(config);
          applyAppearance({ theme: parsed.theme, accentColor: parsed.accentColor });
          set({
            theme: validTheme(parsed.theme),
            accentColor: validAccent(parsed.accentColor),
            refreshRate: parsed.refreshRate || 2000,
            enabledMetrics: parsed.enabledMetrics || get().enabledMetrics,
            layout: parsed.layout || defaultLayout,
            alertThresholds: parsed.alertThresholds || get().alertThresholds,
            notifications: parsed.notifications || get().notifications,
            chartPreferences: parsed.chartPreferences || get().chartPreferences,
          });
          return true;
        } catch (error) {
          console.error('Failed to import config:', error);
          return false;
        }
      },
      
      // Reset all settings
      resetSettings: () => { applyAppearance({ theme: 'dark', accentColor: 'cyan' }); set({
        theme: 'dark',
        accentColor: 'cyan',
        refreshRate: 2000,
        enabledMetrics: {
          cpu: true,
          memory: true,
          disk: true,
          network: true,
          gpu: false,
          processes: true,
          alerts: true,
        },
        layout: defaultLayout,
        alertThresholds: {
          cpu: 80,
          memory: 85,
          disk: 90,
          temperature: 80,
        },
        notifications: {
          enabled: true,
          sound: false,
          desktop: false,
        },
        chartPreferences: {
          showGrid: true,
          showLegend: true,
          smoothLines: true,
          showPoints: false,
        },
      }); },
    }),
    {
      name: 'sysdash-settings',
      version: 2,
      migrate: (persisted) => ({ ...persisted, theme: validTheme(persisted?.theme), accentColor: validAccent(persisted?.accentColor) }),
      onRehydrateStorage: () => (state) => { if (state) applyAppearance(state); },
    }
  )
);

export default useSettingsStore;

import { StrictMode, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { useThemeStore } from './store/useThemeStore'
import { useSettingsStore } from './store/useSettingsStore'
import { useCurrencyStore } from './store/useCurrencyStore'
import { Toaster } from 'react-hot-toast'

function ThemeInitializer() {
  const { theme } = useThemeStore();

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  return null;
}

function AppStateInitializer() {
  const { language, currency } = useSettingsStore();
  const { fetchRates } = useCurrencyStore();

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  useEffect(() => {
    void fetchRates();
  }, [fetchRates, currency]);

  return <App />;
}

function ToastProvider() {
  const { theme } = useThemeStore();
  const isDark = theme === 'dark';

  return (
    <Toaster
      position="top-center"
      toastOptions={{
        duration: 3000,
        style: {
          background: isDark ? '#0f172a' : '#ffffff',
          color: isDark ? '#f8fafc' : '#0f172a',
          border: isDark ? '1px solid rgba(148,163,184,0.16)' : '1px solid rgba(148,163,184,0.24)',
          borderRadius: '14px',
          boxShadow: '0 20px 60px rgba(15,23,42,0.18)',
        },
        success: {
          icon: '✅',
        },
        error: {
          icon: '❌',
        },
        loading: {
          icon: '⌛',
        },
      }}
    />
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeInitializer />
    <AppStateInitializer />
    <ToastProvider />
  </StrictMode>,
)

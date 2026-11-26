import { useLayoutEffect } from 'react';
import { MotionConfig } from 'framer-motion';
import { useAppearanceStore, COLOR_MODE_KEY } from '@/stores/useAppearanceStore';
import '@/shared/styles/app-experience.css';

export default function ThemeProvider({ children }) {
  const mode = useAppearanceStore((state) => state.mode);
  useLayoutEffect(() => {
    const root = document.documentElement;
    root.dataset.colorMode = mode;
    root.classList.toggle('dark', mode === 'dark');
    root.style.colorScheme = mode;
  }, [mode]);
  useLayoutEffect(() => {
    const sync = (event) => {
      if (event.key === COLOR_MODE_KEY) {
        useAppearanceStore.getState().setMode(event.newValue === 'dark' ? 'dark' : 'light');
      }
    };
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, []);
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}

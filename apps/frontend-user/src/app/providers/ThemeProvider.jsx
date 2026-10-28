import { useLayoutEffect } from 'react';
import { useAppearanceStore, COLOR_MODE_KEY } from '@/stores/useAppearanceStore';
import '@/shared/styles/app-experience.css';

export default function ThemeProvider({ children }) {
  const mode=useAppearanceStore(state=>state.mode);
  useLayoutEffect(()=>{ document.documentElement.dataset.colorMode=mode; },[mode]);
  useLayoutEffect(()=>{
    const sync=event=>{ if(event.key===COLOR_MODE_KEY) useAppearanceStore.getState().setMode(event.newValue==='dark'?'dark':'light'); };
    window.addEventListener('storage',sync);return()=>window.removeEventListener('storage',sync);
  },[]);
  return children;
}

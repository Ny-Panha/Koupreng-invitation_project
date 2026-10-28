import { Moon, Sun } from 'lucide-react';
import { useAppearanceStore } from '@/stores/useAppearanceStore';
import { useLanguageStore } from '@/stores/useLanguageStore';

export default function DisplayPreferences({ compact=false, language=true }) {
  const mode=useAppearanceStore(state=>state.mode),setMode=useAppearanceStore(state=>state.setMode);
  const lang=useLanguageStore(state=>state.lang),setLang=useLanguageStore(state=>state.setLang);
  const en=lang==='en',dark=mode==='dark';
  const target=dark?(en?'Switch to light mode':'ប្ដូរទៅផ្ទាំងភ្លឺ'):(en?'Switch to dark mode':'ប្ដូរទៅផ្ទាំងងងឹត');
  return <div className={`app-preferences${compact?' is-compact':''}`}>
    {language && <label className="app-language-control"><span className="sr-only">{en?'Language':'ភាសា'}</span><select aria-label={en?'Language':'ភាសា'} value={lang} onChange={event=>setLang(event.target.value)}><option value="km" lang="km">ខ្មែរ</option><option value="en" lang="en">EN</option></select></label>}
    <button type="button" className="app-theme-toggle" aria-label={target} title={target} aria-pressed={dark} onClick={()=>setMode(dark?'light':'dark')}>{dark?<Sun size={18} aria-hidden="true"/>:<Moon size={18} aria-hidden="true"/>}</button>
  </div>;
}

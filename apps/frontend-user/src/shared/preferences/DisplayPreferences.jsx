import { Languages, Moon, Sun } from 'lucide-react';
import { useAppearanceStore } from '@/stores/useAppearanceStore';
import { useLanguageStore } from '@/stores/useLanguageStore';

export default function DisplayPreferences({ compact=false, language=true }) {
  const mode=useAppearanceStore(state=>state.mode),setMode=useAppearanceStore(state=>state.setMode);
  const lang=useLanguageStore(state=>state.lang),setLang=useLanguageStore(state=>state.setLang);
  const en=lang==='en',dark=mode==='dark';
  const target=dark?(en?'Switch to light mode':'ប្ដូរទៅផ្ទាំងភ្លឺ'):(en?'Switch to dark mode':'ប្ដូរទៅផ្ទាំងងងឹត');
  return <div className={`app-preferences${compact?' is-compact':''}`}>
    {language && <button type="button" role="switch" className="app-language-toggle" aria-label={en ? 'English interface' : 'ប្រើភាសាអង់គ្លេស'} aria-checked={en} title={en ? 'Switch to Khmer' : 'ប្ដូរទៅភាសាអង់គ្លេស'} onClick={() => setLang(en ? 'km' : 'en')}>
      <Languages size={17} aria-hidden="true" />
      <span className="app-language-options" aria-hidden="true"><span lang="km" data-active={!en}>ខ្មែរ</span><span lang="en" data-active={en}>EN</span></span>
    </button>}
    <button type="button" className="app-theme-toggle" aria-label={target} title={target} aria-pressed={dark} onClick={()=>setMode(dark?'light':'dark')}>{dark?<Sun size={18} aria-hidden="true"/>:<Moon size={18} aria-hidden="true"/>}</button>
  </div>;
}

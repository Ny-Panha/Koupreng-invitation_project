import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, expect, it } from 'vitest';
import DisplayPreferences from './DisplayPreferences';
import ThemeProvider from '@/app/providers/ThemeProvider';
import { useAppearanceStore,storedColorMode,COLOR_MODE_KEY } from '@/stores/useAppearanceStore';
import { useLanguageStore } from '@/stores/useLanguageStore';

beforeEach(()=>{localStorage.clear();useAppearanceStore.setState({mode:'light'});useLanguageStore.setState({lang:'en'});});
afterEach(()=>{cleanup();delete document.documentElement.dataset.colorMode;});
it('persists light/dark mode and preserves the controlled form while switching',()=>{
  render(<ThemeProvider><DisplayPreferences/><input aria-label="Draft" defaultValue="Unsaved Khmer / English text"/></ThemeProvider>);
  expect(document.documentElement).toHaveAttribute('data-color-mode','light');
  fireEvent.click(screen.getByRole('button',{name:'Switch to dark mode'}));
  expect(document.documentElement).toHaveAttribute('data-color-mode','dark');expect(localStorage.getItem(COLOR_MODE_KEY)).toBe('dark');
  expect(screen.getByRole('textbox',{name:'Draft'})).toHaveValue('Unsaved Khmer / English text');
  fireEvent.click(screen.getByRole('button',{name:'Switch to light mode'}));expect(document.documentElement).toHaveAttribute('data-color-mode','light');
});
it('changes only the interface language from the navbar control',()=>{
  render(<DisplayPreferences/>);fireEvent.click(screen.getByRole('switch',{name:'English interface'}));
  expect(useLanguageStore.getState().lang).toBe('km');expect(localStorage.getItem('koupreng.lang')).toBe('km');
  expect(screen.getByRole('switch')).toHaveAttribute('aria-checked','false');
  fireEvent.click(screen.getByRole('switch'));
  expect(useLanguageStore.getState().lang).toBe('en');
});
it('rejects invalid persisted modes and follows cross-tab preference updates',()=>{
  localStorage.setItem(COLOR_MODE_KEY,'untrusted');expect(storedColorMode()).toBe('light');
  render(<ThemeProvider><DisplayPreferences/></ThemeProvider>);
  act(()=>window.dispatchEvent(new StorageEvent('storage',{key:COLOR_MODE_KEY,newValue:'dark'})));
  expect(document.documentElement).toHaveAttribute('data-color-mode','dark');
  act(()=>useAppearanceStore.getState().setMode('invalid'));expect(useAppearanceStore.getState().mode).toBe('dark');
});

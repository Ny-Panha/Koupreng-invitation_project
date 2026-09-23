import { Menu, Moon, Sun } from "lucide-react";

export default function AdminHeader({ title, onShowSidebar, isDark, onToggleTheme }) {
  return (
    <header className="flex min-h-16 items-center justify-between border-b border-slate-200 bg-white px-4 dark:border-zinc-800 dark:bg-[#111113] sm:px-6">
      <button type="button" className="btn btn-ghost btn-sm" onClick={onShowSidebar} aria-label="Toggle sidebar">
        <Menu size={18} />
      </button>
      <h1 className="text-base font-bold text-slate-900 dark:text-zinc-100">{title}</h1>
      <button type="button" className="btn btn-ghost btn-sm" onClick={onToggleTheme} aria-label="Toggle theme">
        {isDark ? <Sun size={18} /> : <Moon size={18} />}
      </button>
    </header>
  );
}
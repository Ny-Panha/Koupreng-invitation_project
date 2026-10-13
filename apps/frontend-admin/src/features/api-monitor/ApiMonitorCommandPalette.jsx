import { useEffect, useState } from "react";
import {
  Search,
  Pause,
  Play,
  Trash2,
  Layers,
  ShieldAlert,
  Clock,
  Download,
  Filter,
  X,
  Keyboard,
} from "lucide-react";

export function ApiMonitorCommandPalette({
  isOpen,
  onClose,
  isPaused,
  onTogglePause,
  onClear,
  showWaterfall,
  onToggleWaterfall,
  onSetAppFilter,
  onSetStatusFilter,
  onSetSlowOnly,
  onResetFilters,
  onStartQaSession,
  onExport,
  lang,
}) {
  const [query, setQuery] = useState("");

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        onClose((prev) => !prev);
      } else if (e.key === "Escape" && isOpen) {
        e.preventDefault();
        onClose(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const actions = [
    {
      id: "toggle-pause",
      title: isPaused ? (lang === "km" ? "បន្តការផ្សាយ (Resume Stream)" : "Resume Live Stream") : (lang === "km" ? "ផ្អាកការផ្សាយ (Pause Stream)" : "Pause Live Stream"),
      icon: isPaused ? Play : Pause,
      shortcut: "P",
      run: () => {
        onTogglePause();
        onClose(false);
      },
    },
    {
      id: "toggle-waterfall",
      title: showWaterfall ? (lang === "km" ? "បិទគំនូសតាង Waterfall" : "Hide Waterfall View") : (lang === "km" ? "បង្ហាញគំនូសតាង Waterfall" : "Show Request Waterfall"),
      icon: Layers,
      shortcut: "W",
      run: () => {
        onToggleWaterfall();
        onClose(false);
      },
    },
    {
      id: "filter-errors",
      title: lang === "km" ? "ត្រងយកតែកំហុស (Filter Errors: 4xx, 5xx)" : "Filter Errors (4xx & 5xx only)",
      icon: ShieldAlert,
      shortcut: "E",
      run: () => {
        onSetStatusFilter("4xx");
        onClose(false);
      },
    },
    {
      id: "filter-slow",
      title: lang === "km" ? "ត្រងយកសំណើយឺត (Filter Slow Requests >500ms)" : "Filter Slow Requests (>500ms)",
      icon: Clock,
      shortcut: "S",
      run: () => {
        onSetSlowOnly((s) => !s);
        onClose(false);
      },
    },
    {
      id: "filter-user",
      title: lang === "km" ? "ត្រងកម្មវិធី User Web (:5173)" : "Filter User Web (:5173)",
      icon: Filter,
      shortcut: "U",
      run: () => {
        onSetAppFilter("user");
        onClose(false);
      },
    },
    {
      id: "filter-admin",
      title: lang === "km" ? "ត្រងកម្មវិធី Admin Dashboard (:5174)" : "Filter Admin App (:5174)",
      icon: Filter,
      shortcut: "A",
      run: () => {
        onSetAppFilter("admin");
        onClose(false);
      },
    },
    {
      id: "reset-filters",
      title: lang === "km" ? "កំណត់តម្រងឡើងវិញ (Reset Filters)" : "Reset All Filters",
      icon: Filter,
      shortcut: "R",
      run: () => {
        onResetFilters();
        onClose(false);
      },
    },
    {
      id: "export-json",
      title: lang === "km" ? "ទាញយកទិន្នន័យ Sanitized JSON" : "Export Sanitized JSON",
      icon: Download,
      shortcut: "J",
      run: () => {
        onExport("json");
        onClose(false);
      },
    },
    {
      id: "clear-stream",
      title: lang === "km" ? "លុបប្រវត្តិនៃសំណើ (Clear History)" : "Clear Live History",
      icon: Trash2,
      shortcut: "C",
      run: () => {
        onClear();
        onClose(false);
      },
    },
  ];

  const filteredActions = actions.filter((act) =>
    act.title.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-start justify-center bg-slate-900/50 p-4 pt-20 backdrop-blur-xs"
      onClick={() => onClose(false)}
    >
      <div
        className="w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center border-b border-slate-200 px-4 py-3 dark:border-zinc-800">
          <Search className="h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={
              lang === "km"
                ? "វាយពាក្យបញ្ជា ឬចុចផ្លូវកាត់..."
                : "Type a command or choose an action (Ctrl+K)..."
            }
            className="flex-1 bg-transparent px-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none dark:text-zinc-100"
            autoFocus
          />
          <button
            type="button"
            onClick={() => onClose(false)}
            className="rounded p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-zinc-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Action List */}
        <div className="max-h-80 overflow-y-auto p-2">
          {filteredActions.length === 0 ? (
            <div className="p-4 text-center text-xs text-slate-400">
              {lang === "km" ? "រកមិនឃើញពាក្យបញ្ជាសមស្រប" : "No commands found"}
            </div>
          ) : (
            filteredActions.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.id}
                  type="button"
                  onClick={action.run}
                  className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-xs transition-colors hover:bg-amber-500/10 dark:hover:bg-amber-500/20"
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="h-4 w-4 text-slate-500 dark:text-zinc-400" />
                    <span className="font-medium text-slate-800 dark:text-zinc-200">
                      {action.title}
                    </span>
                  </div>
                  {action.shortcut && (
                    <kbd className="rounded border border-slate-200 bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] text-slate-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                      {action.shortcut}
                    </kbd>
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}


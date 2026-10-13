import { useEffect, useState, useMemo } from "react";
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
  Table,
  Database,
  Combine,
} from "lucide-react";

export function ApiMonitorCommandPalette({
  isOpen,
  onClose,
  isPaused,
  onTogglePause,
  onClear,
  onSelectViewMode,
  onSetAppFilter,
  onSetStatusFilter,
  onSetSlowOnly,
  onResetFilters,
  onStartQaSession,
  onExport,
  lang,
}) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);

  const actions = useMemo(
    () => [
      {
        id: "view-table",
        title: lang === "km" ? "មើលតារាងសំណើ (Switch to Live Table)" : "Switch to Live Table View",
        icon: Table,
        shortcut: "T",
        category: "Navigation",
        run: () => {
          if (onSelectViewMode) onSelectViewMode("table");
          onClose(false);
        },
      },
      {
        id: "view-waterfall",
        title: lang === "km" ? "មើលគំនូសតាង Waterfall" : "Switch to Request Waterfall View",
        icon: Layers,
        shortcut: "W",
        category: "Navigation",
        run: () => {
          if (onSelectViewMode) onSelectViewMode("waterfall");
          onClose(false);
        },
      },
      {
        id: "view-errors",
        title: lang === "km" ? "មើលការស៊ើបអង្កេតកំហុស (Error Investigation)" : "Switch to Error Investigation View",
        icon: ShieldAlert,
        shortcut: "E",
        category: "Navigation",
        run: () => {
          if (onSelectViewMode) onSelectViewMode("errors");
          onClose(false);
        },
      },
      {
        id: "view-sql",
        title: lang === "km" ? "មើលការវិភាគ SQL (SQL Diagnostics)" : "Switch to SQL Diagnostics View",
        icon: Database,
        shortcut: "D",
        category: "Navigation",
        run: () => {
          if (onSelectViewMode) onSelectViewMode("sql");
          onClose(false);
        },
      },
      {
        id: "view-both",
        title: lang === "km" ? "មើលទាំងពីរ (Combined View)" : "Switch to Combined View",
        icon: Combine,
        shortcut: "B",
        category: "Navigation",
        run: () => {
          if (onSelectViewMode) onSelectViewMode("both");
          onClose(false);
        },
      },
      {
        id: "toggle-pause",
        title: isPaused
          ? lang === "km"
            ? "បន្តការផ្សាយ (Resume Stream)"
            : "Resume Live Stream"
          : lang === "km"
          ? "ផ្អាកការផ្សាយ (Pause Stream)"
          : "Pause Live Stream",
        icon: isPaused ? Play : Pause,
        shortcut: "P",
        category: "Stream",
        run: () => {
          onTogglePause();
          onClose(false);
        },
      },
      {
        id: "filter-errors",
        title: lang === "km" ? "ត្រងយកតែកំហុស (Filter Errors: 4xx, 5xx)" : "Filter Errors (4xx & 5xx only)",
        icon: ShieldAlert,
        shortcut: "4",
        category: "Filter",
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
        category: "Filter",
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
        category: "Filter",
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
        category: "Filter",
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
        category: "Filter",
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
        category: "Export",
        run: () => {
          onExport("json");
          onClose(false);
        },
      },
      ...(onStartQaSession
        ? [
            {
              id: "start-qa-session",
              title: lang === "km" ? "ចាប់ផ្ដើមវគ្គកត់ត្រា QA (Start QA Session)" : "Start QA Recording Session",
              icon: Play,
              shortcut: "Q",
              category: "QA",
              run: () => {
                onStartQaSession();
                onClose(false);
              },
            },
          ]
        : []),
      {
        id: "clear-stream",
        title: lang === "km" ? "លុបប្រវត្តិនៃសំណើ (Clear History)" : "Clear Live History",
        icon: Trash2,
        shortcut: "C",
        category: "Stream",
        run: () => {
          onClear();
          onClose(false);
        },
      },
    ],
    [
      lang,
      isPaused,
      onClose,
      onSelectViewMode,
      onTogglePause,
      onSetStatusFilter,
      onSetSlowOnly,
      onSetAppFilter,
      onResetFilters,
      onExport,
      onStartQaSession,
      onClear,
    ]
  );

  const filteredActions = useMemo(() => {
    return actions.filter((act) =>
      act.title.toLowerCase().includes(query.toLowerCase()) ||
      act.category.toLowerCase().includes(query.toLowerCase())
    );
  }, [actions, query]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        onClose((prev) => !prev);
        return;
      }

      if (!isOpen) return;

      if (e.key === "Escape") {
        e.preventDefault();
        onClose(false);
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((idx) => (idx + 1 < filteredActions.length ? idx + 1 : 0));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((idx) => (idx - 1 >= 0 ? idx - 1 : filteredActions.length - 1));
      } else if (e.key === "Enter" && filteredActions[selectedIndex]) {
        e.preventDefault();
        filteredActions[selectedIndex].run();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, filteredActions, selectedIndex]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-start justify-center bg-slate-900/50 p-4 pt-20 backdrop-blur-xs motion-reduce:backdrop-blur-none"
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
                ? "វាយពាក្យបញ្ជា ឬចុចផ្លូវកាត់ (Ctrl+K)..."
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
            filteredActions.map((action, idx) => {
              const Icon = action.icon;
              const isSelected = idx === selectedIndex;
              return (
                <button
                  key={action.id}
                  type="button"
                  onClick={action.run}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs transition-colors ${
                    isSelected
                      ? "bg-amber-500/15 text-amber-950 dark:bg-amber-500/20 dark:text-amber-100 ring-1 ring-amber-500/30"
                      : "hover:bg-slate-50 dark:hover:bg-zinc-800/40 text-slate-800 dark:text-zinc-200"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`h-4 w-4 ${isSelected ? "text-amber-600 dark:text-amber-400" : "text-slate-400 dark:text-zinc-500"}`} />
                    <div>
                      <span className="font-medium">
                        {action.title}
                      </span>
                      <span className="ml-2 font-mono text-[9px] uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                        {action.category}
                      </span>
                    </div>
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

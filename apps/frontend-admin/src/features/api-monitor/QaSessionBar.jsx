import { useState, useEffect } from "react";
import { Play, Square, MessageSquarePlus, Download, ShieldCheck, Clock } from "lucide-react";

export function QaSessionBar({
  isRecording,
  activeSession,
  onStartSession,
  onStopSession,
  onAddNote,
  onExport,
  eventsCount,
  lang,
}) {
  const [sessionNameInput, setSessionNameInput] = useState("");
  const [isStarting, setIsStarting] = useState(false);
  const [noteInput, setNoteInput] = useState("");
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    let interval = null;
    if (isRecording) {
      setElapsedSeconds(0);
      interval = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      setElapsedSeconds(0);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRecording]);

  const formatElapsed = (sec) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const handleStart = (e) => {
    e.preventDefault();
    const name = sessionNameInput.trim() || (lang === "km" ? "ការសាកល្បង QA" : "QA Test Run");
    onStartSession(name);
    setSessionNameInput("");
    setIsStarting(false);
  };

  const handleNoteSubmit = (e) => {
    e.preventDefault();
    if (!noteInput.trim()) return;
    onAddNote(noteInput.trim());
    setNoteInput("");
    setIsAddingNote(false);
  };

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-sm dark:border-zinc-800/80 dark:bg-zinc-900">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Left: Status & Controls */}
        <div className="flex items-center gap-3">
          {isRecording ? (
            <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75 motion-reduce:animate-none"></span>
                <span className="relative inline-flex h-3 w-3 rounded-full bg-rose-500"></span>
              </span>
              <span className="text-xs font-bold text-rose-600 dark:text-rose-400">
                {lang === "km" ? "កំពុងថតវគ្គសាកល្បង QA:" : "RECORDING QA SESSION:"}
              </span>
              <span className="rounded-lg bg-rose-50 px-2 py-0.5 text-xs font-semibold text-rose-700 dark:bg-rose-950/50 dark:text-rose-300">
                {activeSession?.name}
              </span>

              {/* Live Timer */}
              <div className="flex items-center gap-1 rounded bg-slate-100 px-2 py-0.5 font-mono text-xs font-semibold text-slate-700 dark:bg-zinc-800 dark:text-zinc-300 tabular-nums">
                <Clock className="h-3 w-3 text-rose-500" />
                <span>{formatElapsed(elapsedSeconds)}</span>
              </div>

              {activeSession?.notes?.length > 0 && (
                <span className="text-xs text-slate-400 dark:text-zinc-500 font-mono tabular-nums">
                  ({activeSession.notes.length} {lang === "km" ? "កំណត់សម្គាល់" : "notes"})
                </span>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-zinc-300">
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
              <span>
                {lang === "km"
                  ? "ឧបករណ៍កត់ត្រាវគ្គសាកល្បង QA (Sanitized Session Recorder)"
                  : "QA Diagnostic Session Recorder"}
              </span>
            </div>
          )}
        </div>

        {/* Right: Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {!isRecording ? (
            isStarting ? (
              <form onSubmit={handleStart} className="flex items-center gap-2">
                <input
                  type="text"
                  value={sessionNameInput}
                  onChange={(e) => setSessionNameInput(e.target.value)}
                  placeholder={lang === "km" ? "ឈ្មោះវគ្គសាកល្បង..." : "Test session name..."}
                  className="rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs text-slate-900 focus:border-amber-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                  autoFocus
                />
                <button
                  type="submit"
                  className="rounded-lg bg-emerald-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-emerald-700"
                >
                  {lang === "km" ? "ចាប់ផ្ដើម" : "Start"}
                </button>
                <button
                  type="button"
                  onClick={() => setIsStarting(false)}
                  className="rounded-lg border border-slate-200 px-2 py-1 text-xs text-slate-500 hover:bg-slate-100 dark:border-zinc-700 dark:text-zinc-400"
                >
                  {lang === "km" ? "បោះបង់" : "Cancel"}
                </button>
              </form>
            ) : (
              <button
                type="button"
                onClick={() => setIsStarting(true)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700"
              >
                <Play className="h-3.5 w-3.5" />
                <span>{lang === "km" ? "កត់ត្រាវគ្គ QA" : "Record QA Session"}</span>
              </button>
            )
          ) : (
            <div className="flex items-center gap-2">
              {isAddingNote ? (
                <form onSubmit={handleNoteSubmit} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={noteInput}
                    onChange={(e) => setNoteInput(e.target.value)}
                    placeholder={lang === "km" ? "បញ្ចូលចំណាំជំហានតេស្ត..." : "Enter test step note..."}
                    className="rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs text-slate-900 focus:border-amber-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                    autoFocus
                  />
                  <button
                    type="submit"
                    className="rounded-lg bg-amber-500 px-2.5 py-1 text-xs font-semibold text-white hover:bg-amber-600"
                  >
                    {lang === "km" ? "រក្សាទុក" : "Save"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAddingNote(false)}
                    className="rounded-lg border border-slate-200 px-2 py-1 text-xs text-slate-500 hover:bg-slate-100 dark:border-zinc-700 dark:text-zinc-400"
                  >
                    {lang === "km" ? "បោះបង់" : "Cancel"}
                  </button>
                </form>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsAddingNote(true)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
                >
                  <MessageSquarePlus className="h-3.5 w-3.5 text-amber-500" />
                  <span>{lang === "km" ? "បន្ថែមចំណាំ" : "Add Note"}</span>
                </button>
              )}

              <button
                type="button"
                onClick={onStopSession}
                className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-rose-700"
              >
                <Square className="h-3.5 w-3.5" />
                <span>{lang === "km" ? "បញ្ចប់ការកត់ត្រា" : "Stop Recording"}</span>
              </button>
            </div>
          )}

          {/* Export Dropdown */}
          <div className="flex items-center gap-1 border-l border-slate-200 pl-2 dark:border-zinc-700">
            <button
              type="button"
              onClick={() => onExport("json")}
              disabled={eventsCount === 0}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
              title="Export sanitized session JSON"
            >
              <Download className="h-3 w-3 text-slate-400" />
              <span>JSON</span>
            </button>
            <button
              type="button"
              onClick={() => onExport("csv")}
              disabled={eventsCount === 0}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
              title="Export sanitized session CSV"
            >
              <Download className="h-3 w-3 text-slate-400" />
              <span>CSV</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

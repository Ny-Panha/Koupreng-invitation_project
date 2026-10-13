import { useState } from "react";
import { X, Copy, Check, Shield, Globe, Cpu, AlertTriangle, Clock, Hash } from "lucide-react";

export function RequestDetailsDrawer({ event, onClose, lang }) {
  const [copiedKey, setCopiedKey] = useState(null);

  if (!event) return null;

  const copyToClipboard = (text, key) => {
    navigator.clipboard?.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const isSuccess = event.status < 400;
  const isClientErr = event.status >= 400 && event.status < 500;

  return (
    <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-lg flex-col border-l border-slate-200 bg-white shadow-2xl transition-transform dark:border-zinc-800 dark:bg-zinc-900 sm:max-w-xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-zinc-800">
        <div className="flex items-center gap-2.5">
          <span
            className={`inline-flex rounded-lg px-2 py-0.5 font-mono text-xs font-bold ${
              isSuccess
                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                : isClientErr
                ? "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                : "bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300"
            }`}
          >
            {event.status} {event.method}
          </span>
          <span className="truncate font-mono text-xs font-semibold text-slate-700 dark:text-zinc-200">
            {event.path}
          </span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:text-zinc-500 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Body Content */}
      <div className="flex-1 space-y-5 overflow-y-auto p-5 text-xs">
        {/* Request Correlation */}
        <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-3.5 dark:border-zinc-800/80 dark:bg-zinc-800/40">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 font-semibold text-slate-600 dark:text-zinc-400">
              <Hash className="h-4 w-4 text-sky-500" />
              <span>{lang === "km" ? "លេខកូដសម្គាល់សំណើ (X-Request-Id)" : "Request Correlation ID"}</span>
            </div>
            <button
              type="button"
              onClick={() => copyToClipboard(event.requestId, "requestId")}
              className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-medium text-slate-500 hover:bg-slate-200/60 dark:text-zinc-400 dark:hover:bg-zinc-700"
            >
              {copiedKey === "requestId" ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
              {copiedKey === "requestId" ? "Copied" : "Copy"}
            </button>
          </div>
          <div className="mt-1.5 font-mono text-[11px] font-semibold text-slate-900 dark:text-zinc-100 select-all break-all">
            {event.requestId}
          </div>
        </div>

        {/* Client Origin Section */}
        <div className="rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/60">
          <div className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-zinc-300">
            <Globe className="h-4 w-4 text-indigo-500" />
            <span>{lang === "km" ? "ប្រភពសំណើ (Client Origin)" : "Client Origin & Trace"}</span>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-3">
            <div>
              <span className="text-[11px] text-slate-400 dark:text-zinc-500">
                {lang === "km" ? "កម្មវិធី (X-Client-App)" : "Client Application"}
              </span>
              <p className="mt-0.5 font-mono font-medium text-slate-800 dark:text-zinc-200">
                {event.clientApp || "external"}
              </p>
            </div>

            <div>
              <span className="text-[11px] text-slate-400 dark:text-zinc-500">
                {lang === "km" ? "ផ្លូវកម្មវិធី (X-Frontend-Route)" : "Frontend Route"}
              </span>
              <p className="mt-0.5 font-mono font-medium text-slate-800 dark:text-zinc-200">
                {event.frontendRoute || "/"}
              </p>
            </div>

            <div>
              <span className="text-[11px] text-slate-400 dark:text-zinc-500">
                {lang === "km" ? "សកម្មភាព (X-Client-Action)" : "Client Action"}
              </span>
              <p className="mt-0.5 font-mono font-semibold text-amber-600 dark:text-amber-400">
                {event.clientAction || "—"}
              </p>
            </div>

            <div>
              <span className="text-[11px] text-slate-400 dark:text-zinc-500">
                {lang === "km" ? "អាសយដ្ឋាន IP" : "Client IP"}
              </span>
              <p className="mt-0.5 font-mono font-medium text-slate-800 dark:text-zinc-200">
                {event.clientIp || "127.0.0.1"}
              </p>
            </div>
          </div>
        </div>

        {/* Server Routing Section */}
        <div className="rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/60">
          <div className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-zinc-300">
            <Cpu className="h-4 w-4 text-emerald-500" />
            <span>{lang === "km" ? "ការកំណត់ផ្លូវ Spring Boot" : "Backend Routing & Dispatch"}</span>
          </div>

          <div className="mt-3 space-y-2">
            <div>
              <span className="text-[11px] text-slate-400 dark:text-zinc-500">
                {lang === "km" ? "គំរូផ្លូវ (Matched Route Pattern)" : "Matched Route Pattern"}
              </span>
              <p className="mt-0.5 font-mono font-medium text-slate-800 dark:text-zinc-200">
                {event.matchedPattern || event.path}
              </p>
            </div>

            <div>
              <span className="text-[11px] text-slate-400 dark:text-zinc-500">
                {lang === "km" ? "កម្មវិធីបញ្ជា (Controller & Handler)" : "Controller Handler Method"}
              </span>
              <p className="mt-0.5 font-mono font-medium text-slate-800 dark:text-zinc-200">
                {event.controller || "—"}
              </p>
            </div>

            <div className="flex items-center justify-between pt-1">
              <div>
                <span className="text-[11px] text-slate-400 dark:text-zinc-500">
                  {lang === "km" ? "ថេរវេលាដំណើរការ" : "Execution Duration"}
                </span>
                <p className="mt-0.5 font-mono font-bold text-slate-900 dark:text-zinc-100">
                  {event.durationMs} ms {event.slow && <span className="ml-1 text-orange-600 dark:text-orange-400">(SLOW)</span>}
                </p>
              </div>

              <div>
                <span className="text-[11px] text-slate-400 dark:text-zinc-500">
                  {lang === "km" ? "កាលបរិច្ឆេទ" : "Timestamp"}
                </span>
                <p className="mt-0.5 font-mono text-slate-700 dark:text-zinc-300">
                  {event.timestamp}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Security & Auth Context */}
        <div className="rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/60">
          <div className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-zinc-300">
            <Shield className="h-4 w-4 text-violet-500" />
            <span>{lang === "km" ? "បរិបទសុវត្ថិភាព (Security Context)" : "Security & Authentication"}</span>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-3">
            <div>
              <span className="text-[11px] text-slate-400 dark:text-zinc-500">
                {lang === "km" ? "ស្ថានភាពផ្ទៀងផ្ទាត់" : "Auth Status"}
              </span>
              <p className="mt-0.5 font-medium text-slate-800 dark:text-zinc-200">
                {event.authenticated ? (
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold">AUTHENTICATED</span>
                ) : (
                  <span className="text-slate-500 dark:text-zinc-400">ANONYMOUS</span>
                )}
              </p>
            </div>

            <div>
              <span className="text-[11px] text-slate-400 dark:text-zinc-500">
                {lang === "km" ? "តួនាទី (Role)" : "Role"}
              </span>
              <p className="mt-0.5 font-mono font-medium text-slate-800 dark:text-zinc-200">
                {event.userRole || "ANONYMOUS"}
              </p>
            </div>

            <div className="col-span-2">
              <span className="text-[11px] text-slate-400 dark:text-zinc-500">
                {lang === "km" ? "អ្នកប្រើប្រាស់ (User Principal)" : "User Principal"}
              </span>
              <p className="mt-0.5 font-mono font-medium text-slate-800 dark:text-zinc-200">
                {event.userPrincipal || "anonymous"}
              </p>
            </div>
          </div>
        </div>

        {/* Error Details (if applicable) */}
        {event.errorCode && (
          <div className="rounded-xl border border-rose-200 bg-rose-50/70 p-3.5 dark:border-rose-900/60 dark:bg-rose-950/30">
            <div className="flex items-center gap-1.5 font-semibold text-rose-700 dark:text-rose-400">
              <AlertTriangle className="h-4 w-4" />
              <span>{lang === "km" ? "ព័ត៌មានកំហុស (Error Code)" : "Error Diagnostics"}</span>
            </div>
            <p className="mt-1.5 font-mono text-xs font-bold text-rose-800 dark:text-rose-300">
              {event.errorCode}
            </p>
          </div>
        )}

        {/* Raw JSON */}
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-zinc-800 dark:bg-zinc-950">
          <div className="flex items-center justify-between pb-2">
            <span className="font-mono text-[11px] text-slate-500 dark:text-zinc-400">Raw Event JSON</span>
            <button
              type="button"
              onClick={() => copyToClipboard(JSON.stringify(event, null, 2), "json")}
              className="inline-flex items-center gap-1 text-[11px] text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-200"
            >
              {copiedKey === "json" ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
              {copiedKey === "json" ? "Copied" : "Copy JSON"}
            </button>
          </div>
          <pre className="max-h-48 overflow-x-auto rounded bg-slate-900 p-2.5 font-mono text-[11px] text-emerald-400 select-all">
            {JSON.stringify(event, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}


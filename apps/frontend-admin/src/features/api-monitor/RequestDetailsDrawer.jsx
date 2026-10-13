import { useState, useEffect } from "react";
import {
  X,
  Copy,
  Check,
  Shield,
  Globe,
  Cpu,
  AlertTriangle,
  Clock,
  Hash,
  Database,
  FileCode,
  Layers,
  CheckCircle2,
  ExternalLink,
  Zap,
} from "lucide-react";
import { validateApiContract } from "./apiContractValidator";

export function RequestDetailsDrawer({ event, onClose, onFilterByAction, lang }) {
  const [copiedKey, setCopiedKey] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!event) return null;

  const copyToClipboard = (text, key) => {
    if (!navigator.clipboard) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const isSuccess = event.status < 400 && event.status >= 200;
  const isClientErr = event.status >= 400 && event.status < 500;
  const isNetworkErr = event.status === 0 || event.outcome === "NETWORK_ERROR";

  // OpenAPI validation result
  const contract = validateApiContract(event.method, event.path);

  // Latency delta (network overhead)
  const clientDuration = event.clientDurationMs || event.durationMs;
  const serverDuration = event.durationMs;
  const networkDeltaMs = Math.max(0, clientDuration - serverDuration);

  const tabs = [
    { id: "overview", label: lang === "km" ? "ទិដ្ឋភាពទូទៅ" : "Overview" },
    { id: "timeline", label: lang === "km" ? "លំដាប់ពេលវេលា" : "Timeline" },
    { id: "headers", label: lang === "km" ? "បឋមកថា & សិទ្ធិ" : "Headers & Auth" },
    { id: "controller", label: lang === "km" ? "Controller" : "Controller" },
    { id: "database", label: lang === "km" ? "ទិន្នន័យ SQL" : "Database" },
    { id: "contract", label: lang === "km" ? "កិច្ចសន្យា API" : "Contract" },
    ...(event.status >= 400 || isNetworkErr ? [{ id: "errors", label: lang === "km" ? "កំហុស" : "Errors" }] : []),
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="drawer-title"
      className="fixed inset-y-0 right-0 z-50 flex w-full max-w-lg flex-col border-l border-slate-200 bg-white shadow-2xl transition-transform dark:border-zinc-800 dark:bg-zinc-900 sm:max-w-xl"
    >
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
            {event.status === 0 ? "ERR" : event.status} {event.method}
          </span>
          <span
            id="drawer-title"
            className="truncate font-mono text-xs font-semibold text-slate-700 dark:text-zinc-200"
          >
            {event.path}
          </span>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close details"
          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:text-zinc-500 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Tabs Navigation */}
      <div className="flex overflow-x-auto border-b border-slate-100 px-5 text-xs dark:border-zinc-800">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`border-b-2 py-2.5 px-3 font-medium whitespace-nowrap transition-colors ${
              activeTab === tab.id
                ? "border-amber-500 text-amber-600 dark:text-amber-400"
                : "border-transparent text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Body Content */}
      <div className="flex-1 space-y-4 overflow-y-auto p-5 text-xs">
        {/* TAB 1: OVERVIEW */}
        {activeTab === "overview" && (
          <div className="space-y-4">
            {/* Correlation ID & Action ID */}
            <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-3.5 dark:border-zinc-800/80 dark:bg-zinc-800/40">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-semibold text-slate-600 dark:text-zinc-400">
                  <Hash className="h-4 w-4 text-sky-500" />
                  <span>X-Request-Id</span>
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
              <div className="mt-1 font-mono text-[11px] font-semibold text-slate-900 select-all break-all dark:text-zinc-100">
                {event.requestId}
              </div>

              {event.actionId && (
                <div className="mt-3 border-t border-slate-200/60 pt-2.5 dark:border-zinc-700/60">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-600 dark:text-zinc-400">X-Action-Id:</span>
                    {onFilterByAction && (
                      <button
                        type="button"
                        onClick={() => onFilterByAction(event.actionId)}
                        className="text-[11px] font-semibold text-amber-600 hover:underline dark:text-amber-400"
                      >
                        {lang === "km" ? "មើលសំណើក្នុងសកម្មភាពនេះ" : "Filter by this Action"}
                      </button>
                    )}
                  </div>
                  <div className="mt-0.5 font-mono text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                    {event.actionId}
                  </div>
                </div>
              )}
            </div>

            {/* Timing Breakdown Card */}
            <div className="rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/60">
              <div className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-zinc-300">
                <Clock className="h-4 w-4 text-amber-500" />
                <span>{lang === "km" ? "ការបែងចែកថេរវេលា (Latency Breakdown)" : "Latency Breakdown"}</span>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                <div className="rounded-lg bg-slate-50 p-2 dark:bg-zinc-800/50">
                  <div className="text-[10px] text-slate-400 dark:text-zinc-500">
                    {lang === "km" ? "ម៉ាស៊ីនបម្រើ (Server)" : "Server Time"}
                  </div>
                  <div className="mt-1 font-mono text-sm font-bold text-slate-800 dark:text-zinc-100">
                    {serverDuration}ms
                  </div>
                </div>
                <div className="rounded-lg bg-slate-50 p-2 dark:bg-zinc-800/50">
                  <div className="text-[10px] text-slate-400 dark:text-zinc-500">
                    {lang === "km" ? "បណ្ដាញ (Network)" : "Network Delta"}
                  </div>
                  <div className="mt-1 font-mono text-sm font-bold text-sky-600 dark:text-sky-400">
                    +{networkDeltaMs}ms
                  </div>
                </div>
                <div className="rounded-lg bg-slate-50 p-2 dark:bg-zinc-800/50">
                  <div className="text-[10px] text-slate-400 dark:text-zinc-500">
                    {lang === "km" ? "កូនក្ដារ (Total Client)" : "Total Latency"}
                  </div>
                  <div className="mt-1 font-mono text-sm font-bold text-amber-600 dark:text-amber-400">
                    {clientDuration}ms
                  </div>
                </div>
              </div>
            </div>

            {/* Target and Route Details */}
            <div className="rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/60">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-[11px] text-slate-400 dark:text-zinc-500">Application</span>
                  <p className="mt-0.5 font-mono font-medium text-slate-800 dark:text-zinc-200">
                    {event.clientApp || "external"}
                  </p>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 dark:text-zinc-500">Frontend Route</span>
                  <p className="mt-0.5 font-mono font-medium text-slate-800 dark:text-zinc-200">
                    {event.frontendRoute || "/"}
                  </p>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 dark:text-zinc-500">Client Action</span>
                  <p className="mt-0.5 font-mono font-semibold text-amber-600 dark:text-amber-400">
                    {event.clientAction || "—"}
                  </p>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 dark:text-zinc-500">Observation Source</span>
                  <p className="mt-0.5 font-mono font-medium text-slate-800 dark:text-zinc-200">
                    {event.source || "BACKEND_OBSERVED"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: TIMELINE */}
        {activeTab === "timeline" && (
          <div className="space-y-3">
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              {lang === "km"
                ? "ដំណាក់កាលនៃសំណើចាប់ពីកូនក្ដាររហូតដល់ម៉ាស៊ីនបម្រើ"
                : "Step-by-step lifecycle from client dispatch to Spring Boot response:"}
            </p>

            <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-zinc-700">
              <div className="relative">
                <span className="absolute -left-6 top-1 h-3.5 w-3.5 rounded-full border-2 border-white bg-blue-500 dark:border-zinc-900" />
                <div className="font-semibold text-slate-800 dark:text-zinc-200">1. Client Request Dispatched</div>
                <div className="text-[11px] text-slate-500 dark:text-zinc-400 font-mono">
                  From {event.clientApp} at route {event.frontendRoute || "/"}
                </div>
              </div>

              <div className="relative">
                <span className="absolute -left-6 top-1 h-3.5 w-3.5 rounded-full border-2 border-white bg-sky-500 dark:border-zinc-900" />
                <div className="font-semibold text-slate-800 dark:text-zinc-200">2. Network Transit</div>
                <div className="text-[11px] text-slate-500 dark:text-zinc-400 font-mono">
                  Transit overhead: ~{networkDeltaMs}ms
                </div>
              </div>

              <div className="relative">
                <span className="absolute -left-6 top-1 h-3.5 w-3.5 rounded-full border-2 border-white bg-amber-500 dark:border-zinc-900" />
                <div className="font-semibold text-slate-800 dark:text-zinc-200">3. Spring Boot Dispatcher & Logging Filter</div>
                <div className="text-[11px] text-slate-500 dark:text-zinc-400 font-mono">
                  Handler: {event.controller || "Spring Controller"}
                </div>
              </div>

              {event.sqlQueryCount > 0 && (
                <div className="relative">
                  <span className="absolute -left-6 top-1 h-3.5 w-3.5 rounded-full border-2 border-white bg-violet-500 dark:border-zinc-900" />
                  <div className="font-semibold text-slate-800 dark:text-zinc-200">4. Database Execution</div>
                  <div className="text-[11px] text-slate-500 dark:text-zinc-400 font-mono">
                    {event.sqlQueryCount} SQL statements executed in {event.sqlDurationMs || 0}ms
                  </div>
                </div>
              )}

              <div className="relative">
                <span className={`absolute -left-6 top-1 h-3.5 w-3.5 rounded-full border-2 border-white ${
                  isSuccess ? "bg-emerald-500" : "bg-rose-500"
                } dark:border-zinc-900`} />
                <div className="font-semibold text-slate-800 dark:text-zinc-200">
                  {event.sqlQueryCount > 0 ? "5." : "4."} HTTP Response {event.status}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-zinc-400 font-mono">
                  Execution completed in {serverDuration}ms
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: HEADERS & AUTH */}
        {activeTab === "headers" && (
          <div className="space-y-4">
            <div className="rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/60">
              <div className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-zinc-300">
                <Shield className="h-4 w-4 text-emerald-500" />
                <span>Authentication & Authorization Context</span>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <div>
                  <span className="text-[11px] text-slate-400 dark:text-zinc-500">User Principal</span>
                  <p className="mt-0.5 font-mono font-medium text-slate-800 dark:text-zinc-200">
                    {event.userPrincipal || "anonymous"}
                  </p>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 dark:text-zinc-500">Security Role</span>
                  <p className="mt-0.5 font-mono font-medium text-slate-800 dark:text-zinc-200">
                    {event.userRole || "ANONYMOUS"}
                  </p>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 dark:text-zinc-500">Auth Status</span>
                  <p className="mt-0.5">
                    <span
                      className={`inline-flex rounded px-1.5 py-0.5 font-mono text-[10px] font-bold ${
                        event.authenticated
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                          : "bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:text-zinc-400"
                      }`}
                    >
                      {event.authenticated ? "AUTHENTICATED" : "ANONYMOUS"}
                    </span>
                  </p>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 dark:text-zinc-500">Remote Client IP</span>
                  <p className="mt-0.5 font-mono font-medium text-slate-800 dark:text-zinc-200">
                    {event.clientIp || "127.0.0.1"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: CONTROLLER */}
        {activeTab === "controller" && (
          <div className="space-y-4">
            <div className="rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/60">
              <div className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-zinc-300">
                <Cpu className="h-4 w-4 text-violet-500" />
                <span>Spring Boot Controller Handler</span>
              </div>
              <div className="mt-3 space-y-2">
                <div>
                  <span className="text-[11px] text-slate-400 dark:text-zinc-500">Handler Method</span>
                  <p className="mt-0.5 font-mono text-xs font-semibold text-slate-900 dark:text-zinc-100">
                    {event.controller || "Unknown / Not Handled"}
                  </p>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 dark:text-zinc-500">Matched Request Pattern</span>
                  <p className="mt-0.5 font-mono text-xs text-slate-700 dark:text-zinc-300">
                    {event.matchedPattern || event.path}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: DATABASE */}
        {activeTab === "database" && (
          <div className="space-y-4">
            <div className="rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/60">
              <div className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-zinc-300">
                <Database className="h-4 w-4 text-amber-500" />
                <span>Development SQL Statement Diagnostics</span>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-slate-50 p-2.5 dark:bg-zinc-800/40">
                  <span className="text-[11px] text-slate-400 dark:text-zinc-500">Executed Queries</span>
                  <p className="mt-1 font-mono text-lg font-bold text-slate-900 dark:text-zinc-100">
                    {event.sqlQueryCount || 0}
                  </p>
                </div>
                <div className="rounded-lg bg-slate-50 p-2.5 dark:bg-zinc-800/40">
                  <span className="text-[11px] text-slate-400 dark:text-zinc-500">SQL Execution Time</span>
                  <p className="mt-1 font-mono text-lg font-bold text-slate-900 dark:text-zinc-100">
                    {event.sqlDurationMs || 0}ms
                  </p>
                </div>
              </div>

              {event.nPlusOneDetected && (
                <div className="mt-3 rounded-lg border border-amber-300 bg-amber-50/80 p-3 text-amber-900 dark:border-amber-800/60 dark:bg-amber-950/40 dark:text-amber-300">
                  <div className="flex items-center gap-2 font-bold">
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                    <span>Potential N+1 Query Detected!</span>
                  </div>
                  <p className="mt-1 text-[11px] leading-relaxed">
                    This request executed the same SQL template 3 or more times. Consider optimizing with JPA
                    <code className="mx-1 rounded bg-amber-200/60 px-1 py-0.5 dark:bg-amber-900/60">JOIN FETCH</code>,
                    EntityGraph, or batch fetching.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 6: CONTRACT */}
        {activeTab === "contract" && (
          <div className="space-y-4">
            <div className="rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/60">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-zinc-300">
                  <FileCode className="h-4 w-4 text-indigo-500" />
                  <span>OpenAPI Specification Alignment</span>
                </div>
                <span
                  className={`inline-flex rounded-md px-2 py-0.5 font-mono text-[10px] font-bold ${
                    contract.status === "MATCHED"
                      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                      : contract.status === "COMPATIBILITY_ALIAS"
                      ? "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                      : "bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300"
                  }`}
                >
                  {contract.status}
                </span>
              </div>

              <div className="mt-3 space-y-2">
                <div>
                  <span className="text-[11px] text-slate-400 dark:text-zinc-500">Contract Tag</span>
                  <p className="mt-0.5 font-medium text-slate-800 dark:text-zinc-200">{contract.tag}</p>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 dark:text-zinc-500">Operation Summary</span>
                  <p className="mt-0.5 text-slate-800 dark:text-zinc-200">{contract.summary}</p>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 dark:text-zinc-500">Matched Template Path</span>
                  <p className="mt-0.5 font-mono text-[11px] text-slate-600 dark:text-zinc-400">
                    {contract.matchedTemplate}
                  </p>
                </div>
                {contract.isLegacy && (
                  <div className="rounded-lg bg-amber-50 p-2.5 text-[11px] text-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
                    Notice: This request is using a legacy alias route. Prefer migrating to the canonical
                    <code className="mx-1 font-mono font-bold">/api/v1/...</code> endpoint.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 7: ERRORS */}
        {(event.status >= 400 || isNetworkErr) && activeTab === "errors" && (
          <div className="space-y-4">
            <div className="rounded-xl border border-rose-200 bg-rose-50/70 p-3.5 dark:border-rose-900/60 dark:bg-rose-950/30">
              <div className="flex items-center gap-1.5 font-bold text-rose-800 dark:text-rose-300">
                <AlertTriangle className="h-4 w-4" />
                <span>Error Diagnostics ({event.status || "Client Network Failure"})</span>
              </div>
              <div className="mt-3 space-y-2">
                <div>
                  <span className="text-[11px] text-rose-500">Error Code</span>
                  <p className="mt-0.5 font-mono font-bold text-rose-900 dark:text-rose-200">
                    {event.errorCode || "HTTP_" + event.status}
                  </p>
                </div>
                <div>
                  <span className="text-[11px] text-rose-500">Outcome</span>
                  <p className="mt-0.5 font-mono text-rose-800 dark:text-rose-300">{event.outcome}</p>
                </div>
                {event.errorMessage && (
                  <div>
                    <span className="text-[11px] text-rose-500">Exception Message</span>
                    <p className="mt-0.5 font-mono text-xs text-rose-900 dark:text-rose-100">
                      {event.errorMessage}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

import { useState, useRef, useEffect, useCallback } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Type,
  Image as ImageIcon,
  MousePointerClick,
  Copy,
  Trash2,
  Undo2,
  Redo2,
  Eye,
  EyeOff,
  Save,
  Move,
  Check,
  Palette,
  Sliders,
  AlignLeft,
  AlignCenter,
  AlignRight,
} from "lucide-react";
import adminManagementService from "../../../shared/api/adminService";
import {
  CANVAS_FONTS,
  LUXURY_PALETTES,
  CARD_BACKGROUND_THEMES,
  INITIAL_CANVAS_ELEMENTS,
} from "./canvasDefaults.js";

export default function VisualCanvasStudio() {
  const navigate = useNavigate();
  const { templateId } = useParams();
  const isNew = !templateId || templateId === "new";

  // Template Meta
  const [templateName, setTemplateName] = useState(
    isNew ? "គំរូធៀបការថ្មី · Luxury Wedding Canvas" : "គំរូធៀបការ"
  );
  const [templateCode, setTemplateCode] = useState(
    isNew ? `TPL-${Date.now().toString().slice(-4)}` : ""
  );
  const [category, setCategory] = useState("WEDDING");
  const [scrollMode, setScrollMode] = useState("vertical"); // "vertical" | "slide-right"
  const [cardTheme, setCardTheme] = useState(CARD_BACKGROUND_THEMES[0]);
  const [cardBg, setCardBg] = useState(CARD_BACKGROUND_THEMES[0].bg);
  const [hasArch, setHasArch] = useState(true);
  const [hasMarbleWall, setHasMarbleWall] = useState(true);

  // Canvas Elements & Selection
  const [elements, setElements] = useState(INITIAL_CANVAS_ELEMENTS);
  const [selectedId, setSelectedId] = useState("el-1");
  const [editingTextId, setEditingTextId] = useState(null);
  const [isPreview, setIsPreview] = useState(false);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);

  // Undo / Redo History
  const [history, setHistory] = useState([INITIAL_CANVAS_ELEMENTS]);
  const [historyIndex, setHistoryIndex] = useState(0);

  // Dragging State
  const cardRef = useRef(null);
  const [dragState, setDragState] = useState(null); // { id, startX, startY, origX, origY }
  const [resizeState, setResizeState] = useState(null); // { id, startX, origWidth }

  const selectedElement = elements.find((el) => el.id === selectedId);

  // Show Toast
  const showFeedback = (msg, type = "success") => {
    setFeedback({ msg, type });
    setTimeout(() => setFeedback(null), 3500);
  };

  // Push to history
  const pushState = useCallback((newElements) => {
    setHistory((prev) => {
      const upToCurrent = prev.slice(0, historyIndex + 1);
      return [...upToCurrent, newElements];
    });
    setHistoryIndex((prev) => prev + 1);
  }, [historyIndex]);

  const updateElements = (newElements) => {
    setElements(newElements);
    pushState(newElements);
  };

  // Undo
  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIdx = historyIndex - 1;
      setHistoryIndex(newIdx);
      setElements(history[newIdx]);
    }
  };

  // Redo
  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const newIdx = historyIndex + 1;
      setHistoryIndex(newIdx);
      setElements(history[newIdx]);
    }
  };

  // Load existing template data
  useEffect(() => {
    if (isNew) return;
    let isMounted = true;
    const fetchTemplate = async () => {
      setLoading(true);
      try {
        const res = await adminManagementService.getTemplateById(templateId);
        if (!isMounted || !res) return;
        setTemplateName(res.name || "គំរូធៀបការ");
        setTemplateCode(res.code || `TPL-${templateId}`);
        setCategory(res.category || "WEDDING");

        if (typeof res.description === "string" && res.description.startsWith("{")) {
          try {
            const parsed = JSON.parse(res.description);
            if (parsed.canvas?.elements?.length) {
              setElements(parsed.canvas.elements);
              setHistory([parsed.canvas.elements]);
              setHistoryIndex(0);
              if (parsed.canvas.cardBg) setCardBg(parsed.canvas.cardBg);
              if (parsed.canvas.scrollMode) setScrollMode(parsed.canvas.scrollMode);
              if (typeof parsed.canvas.hasArch === "boolean") setHasArch(parsed.canvas.hasArch);
            }
          } catch {
            // fallback
          }
        }
      } catch (err) {
        showFeedback(err?.message || "បរាជ័យក្នុងការទាញយកគំរូ", "error");
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchTemplate();
    return () => {
      isMounted = false;
    };
  }, [templateId, isNew]);

  // Handle Drag Move on Card
  const handleMouseDown = (e, id) => {
    if (isPreview) return;
    e.stopPropagation();
    setSelectedId(id);
    const el = elements.find((item) => item.id === id);
    if (!el) return;

    setDragState({
      id,
      startX: e.clientX,
      startY: e.clientY,
      origX: el.x,
      origY: el.y,
    });
  };

  // Handle Resize Drag
  const handleResizeStart = (e, id) => {
    e.stopPropagation();
    const el = elements.find((item) => item.id === id);
    if (!el) return;
    setResizeState({
      id,
      startX: e.clientX,
      origWidth: el.width || 60,
    });
  };

  // Global mousemove / mouseup for smooth dragging
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!cardRef.current) return;
      const rect = cardRef.current.getBoundingClientRect();

      if (dragState) {
        const deltaXPercent = ((e.clientX - dragState.startX) / rect.width) * 100;
        const deltaYPercent = ((e.clientY - dragState.startY) / rect.height) * 100;

        let nextX = Math.round(dragState.origX + deltaXPercent);
        let nextY = Math.round(dragState.origY + deltaYPercent);

        nextX = Math.max(0, Math.min(90, nextX));
        nextY = Math.max(0, Math.min(92, nextY));

        setElements((prev) =>
          prev.map((el) => (el.id === dragState.id ? { ...el, x: nextX, y: nextY } : el))
        );
      } else if (resizeState) {
        const deltaWidthPercent = ((e.clientX - resizeState.startX) / rect.width) * 100;
        let nextWidth = Math.round(resizeState.origWidth + deltaWidthPercent);
        nextWidth = Math.max(20, Math.min(96, nextWidth));

        setElements((prev) =>
          prev.map((el) => (el.id === resizeState.id ? { ...el, width: nextWidth } : el))
        );
      }
    };

    const handleMouseUp = () => {
      if (dragState || resizeState) {
        pushState(elements);
        setDragState(null);
        setResizeState(null);
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [dragState, resizeState, elements, pushState]);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (editingTextId || isPreview) return;
      if (!selectedId) return;

      if (e.key === "Delete" || e.key === "Backspace") {
        if (elements.length <= 1) return;
        e.preventDefault();
        const next = elements.filter((el) => el.id !== selectedId);
        updateElements(next);
        setSelectedId(next[0]?.id || null);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        const next = elements.map((el) =>
          el.id === selectedId ? { ...el, y: Math.max(0, el.y - 1) } : el
        );
        updateElements(next);
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        const next = elements.map((el) =>
          el.id === selectedId ? { ...el, y: Math.min(92, el.y + 1) } : el
        );
        updateElements(next);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        const next = elements.map((el) =>
          el.id === selectedId ? { ...el, x: Math.max(0, el.x - 1) } : el
        );
        updateElements(next);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        const next = elements.map((el) =>
          el.id === selectedId ? { ...el, x: Math.min(90, el.x + 1) } : el
        );
        updateElements(next);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedId, elements, editingTextId, isPreview]);

  // Actions
  const handleAddText = () => {
    const newEl = {
      id: `el-${Date.now()}`,
      type: "text",
      text: "អត្ថបទថ្មី · New Luxury Text",
      x: 20,
      y: 40,
      width: 60,
      fontSize: 22,
      fontFamily: "'Cinzel', serif",
      color: "#ffffff",
      fontWeight: "normal",
      align: "center",
      letterSpacing: 2,
      zIndex: elements.length + 10,
    };
    const next = [...elements, newEl];
    updateElements(next);
    setSelectedId(newEl.id);
  };

  const handleAddImage = () => {
    const newEl = {
      id: `el-${Date.now()}`,
      type: "image",
      src: "/facebook/all/03-card/03-01.jpg",
      x: 25,
      y: 20,
      width: 50,
      borderRadius: 16,
      borderWidth: 2,
      borderColor: "#f5d061",
      zIndex: elements.length + 10,
    };
    const next = [...elements, newEl];
    updateElements(next);
    setSelectedId(newEl.id);
  };

  const handleAddButton = () => {
    const newEl = {
      id: `el-${Date.now()}`,
      type: "button",
      text: "ឆ្លើយតបការអញ្ជើញ (RSVP)",
      x: 20,
      y: 75,
      width: 60,
      fontSize: 14,
      fontFamily: "'Kantumruy Pro', sans-serif",
      color: "#03140e",
      bgColor: "#f5d061",
      fontWeight: "bold",
      align: "center",
      borderRadius: 9999,
      zIndex: elements.length + 10,
    };
    const next = [...elements, newEl];
    updateElements(next);
    setSelectedId(newEl.id);
  };

  const handleDuplicate = () => {
    if (!selectedElement) return;
    const cloned = {
      ...selectedElement,
      id: `el-${Date.now()}`,
      x: Math.min(85, selectedElement.x + 4),
      y: Math.min(88, selectedElement.y + 4),
      zIndex: elements.length + 10,
    };
    const next = [...elements, cloned];
    updateElements(next);
    setSelectedId(cloned.id);
  };

  const handleDeleteSelected = () => {
    if (!selectedId || elements.length <= 1) return;
    const next = elements.filter((el) => el.id !== selectedId);
    updateElements(next);
    setSelectedId(next[0]?.id || null);
  };

  const handleBringForward = () => {
    if (!selectedElement) return;
    const next = elements.map((el) =>
      el.id === selectedId ? { ...el, zIndex: (el.zIndex || 10) + 1 } : el
    );
    updateElements(next);
  };

  const handleSendBackward = () => {
    if (!selectedElement) return;
    const next = elements.map((el) =>
      el.id === selectedId ? { ...el, zIndex: Math.max(1, (el.zIndex || 10) - 1) } : el
    );
    updateElements(next);
  };

  const updateSelectedProp = (prop, value) => {
    if (!selectedId) return;
    const next = elements.map((el) =>
      el.id === selectedId ? { ...el, [prop]: value } : el
    );
    updateElements(next);
  };

  const handleApplyTheme = (theme) => {
    setCardTheme(theme);
    setCardBg(theme.bg);
    setHasArch(theme.archShape);
  };

  const handleSaveTemplate = async () => {
    setSaving(true);
    try {
      const canvasConfig = {
        cardBg,
        scrollMode,
        hasArch,
        hasMarbleWall,
        elements,
      };

      const payload = {
        name: templateName.trim(),
        code: templateCode.trim() || `TPL-${Date.now().toString().slice(-4)}`,
        category,
        thumbnailUrl: "/facebook/all/03-card/03-01.jpg",
        previewUrl: `/templates/${templateCode.toLowerCase()}`,
        premium: true,
        status: "ACTIVE",
        price: 0,
        description: JSON.stringify({
          canvas: canvasConfig,
          editorVersion: "greenvelope-canvas-v1",
        }),
      };

      const res = isNew
        ? await adminManagementService.createTemplate(payload)
        : await adminManagementService.updateTemplate(templateId, payload);

      showFeedback("បានរក្សាទុកគំរូ Canvas ជោគជ័យ ✓");
      if (isNew && res?.id) {
        navigate(`/templates/${res.id}`, { replace: true });
      }
    } catch (err) {
      showFeedback(err?.message || "បរាជ័យក្នុងការរក្សាទុក", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-zinc-950 text-amber-500">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-amber-500 border-t-transparent" />
          <span className="text-sm font-semibold">កំពុងដំណើរការ Studio Canvas...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex h-screen w-screen flex-col bg-zinc-950 text-zinc-100 overflow-hidden font-sans select-none">
      {/* 1. TOP GREENVELOPE-STYLE TOOLBAR */}
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-zinc-800 bg-zinc-900/95 px-4 backdrop-blur-md z-40">
        {/* Left: Back & Title */}
        <div className="flex items-center gap-3 min-w-0">
          <Link
            to="/templates"
            className="flex h-9 shrink-0 items-center gap-1.5 rounded-xl border border-zinc-800 bg-zinc-800/80 px-3 text-xs font-semibold text-zinc-300 transition hover:bg-zinc-700 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>ត្រឡប់</span>
          </Link>
          <div className="h-5 w-px bg-zinc-800 shrink-0" />
          <input
            type="text"
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
            className="h-8 max-w-[200px] sm:max-w-xs rounded-lg bg-zinc-950/60 px-2.5 text-xs font-bold text-amber-400 border border-zinc-800 outline-none focus:border-amber-500"
            title="ចុចដើម្បីកែឈ្មោះគំរូ"
          />
          <span className="hidden sm:inline-flex items-center rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-400 border border-emerald-500/20">
            Interactive Canvas
          </span>
        </div>

        {/* Center: Canvas Toolset */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1">
          <button
            type="button"
            onClick={handleAddText}
            className="flex items-center gap-1.5 rounded-lg border border-amber-500/40 bg-amber-500/10 px-2.5 py-1.5 text-xs font-semibold text-amber-300 hover:bg-amber-500/20 transition cursor-pointer shrink-0"
            title="Add Textbox onto card"
          >
            <Type className="h-3.5 w-3.5 text-amber-400" />
            <span>+ Add Text</span>
          </button>

          <button
            type="button"
            onClick={handleAddImage}
            className="flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-800/90 px-2.5 py-1.5 text-xs font-semibold text-zinc-200 hover:border-amber-500/50 hover:text-amber-300 transition cursor-pointer shrink-0"
            title="Add photo or graphic"
          >
            <ImageIcon className="h-3.5 w-3.5 text-amber-400" />
            <span>+ Add Image</span>
          </button>

          <button
            type="button"
            onClick={handleAddButton}
            className="flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-800/90 px-2.5 py-1.5 text-xs font-semibold text-zinc-200 hover:border-amber-500/50 hover:text-amber-300 transition cursor-pointer shrink-0"
            title="Add interactive RSVP button"
          >
            <MousePointerClick className="h-3.5 w-3.5 text-amber-400" />
            <span>+ RSVP Button</span>
          </button>

          <div className="h-5 w-px bg-zinc-800 mx-1 shrink-0" />

          {/* Duplicate, Layer, Undo/Redo */}
          <button
            type="button"
            disabled={!selectedElement}
            onClick={handleDuplicate}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 disabled:opacity-30 cursor-pointer"
            title="Duplicate selected element"
          >
            <Copy className="h-4 w-4" />
          </button>

          <button
            type="button"
            disabled={!selectedElement}
            onClick={handleDeleteSelected}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-red-500/10 disabled:opacity-30 cursor-pointer"
            title="Delete selected element"
          >
            <Trash2 className="h-4 w-4" />
          </button>

          <div className="h-5 w-px bg-zinc-800 mx-1 shrink-0" />

          <button
            type="button"
            disabled={historyIndex <= 0}
            onClick={handleUndo}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 disabled:opacity-30 cursor-pointer"
            title="Undo"
          >
            <Undo2 className="h-4 w-4" />
          </button>

          <button
            type="button"
            disabled={historyIndex >= history.length - 1}
            onClick={handleRedo}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 disabled:opacity-30 cursor-pointer"
            title="Redo"
          >
            <Redo2 className="h-4 w-4" />
          </button>
        </div>

        {/* Right: Layout Switcher, Preview, Save */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="hidden md:flex items-center rounded-xl border border-zinc-800 bg-zinc-950 p-1">
            <button
              type="button"
              onClick={() => setScrollMode("vertical")}
              className={`rounded-lg px-2 py-1 text-[11px] font-semibold transition ${
                scrollMode === "vertical"
                  ? "bg-amber-500 text-slate-950 font-bold"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              Scroll Down
            </button>
            <button
              type="button"
              onClick={() => setScrollMode("slide-right")}
              className={`rounded-lg px-2 py-1 text-[11px] font-semibold transition ${
                scrollMode === "slide-right"
                  ? "bg-amber-500 text-slate-950 font-bold"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              Slide Right
            </button>
          </div>

          <button
            type="button"
            onClick={() => setIsPreview(!isPreview)}
            className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition cursor-pointer ${
              isPreview
                ? "border-amber-400 bg-amber-500/20 text-amber-300"
                : "border-zinc-700 bg-zinc-800 text-zinc-300 hover:text-white"
            }`}
          >
            {isPreview ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            <span>{isPreview ? "Exit Preview" : "Preview"}</span>
          </button>

          <button
            type="button"
            disabled={saving}
            onClick={handleSaveTemplate}
            className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-1.5 text-xs font-bold text-slate-950 hover:brightness-110 active:scale-95 disabled:opacity-60 transition shadow-lg shadow-emerald-500/20 cursor-pointer"
          >
            {saving ? (
              <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-slate-950 border-t-transparent" />
            ) : (
              <Save className="h-3.5 w-3.5" />
            )}
            <span>រក្សាទុក (Save)</span>
          </button>
        </div>
      </header>

      {/* 2. MAIN WORKSPACE */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* A. LEFT PROPERTIES / FORMATTING PANEL */}
        {!isPreview && (
          <aside className="w-80 shrink-0 border-r border-zinc-800 bg-zinc-900/95 overflow-y-auto p-4 space-y-5">
            {selectedElement ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                  <div className="flex items-center gap-2">
                    <Sliders className="h-4 w-4 text-amber-400" />
                    <span className="text-xs font-bold text-zinc-200 uppercase tracking-wider">
                      {selectedElement.type === "text"
                        ? "Text Properties"
                        : selectedElement.type === "image"
                        ? "Image Properties"
                        : "Button Properties"}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedId(null)}
                    className="text-[11px] text-zinc-400 hover:text-amber-400"
                  >
                    Deselect
                  </button>
                </div>

                {/* Edit Text Content */}
                {(selectedElement.type === "text" || selectedElement.type === "button") && (
                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-400 mb-1">
                      Text Content (ឬចុចពីដងលើ Card ដើម្បីកែផ្ទាល់)
                    </label>
                    <textarea
                      rows={3}
                      value={selectedElement.text}
                      onChange={(e) => updateSelectedProp("text", e.target.value)}
                      className="w-full rounded-xl border border-zinc-800 bg-zinc-950 p-2 text-xs text-zinc-100 outline-none focus:border-amber-500"
                    />
                  </div>
                )}

                {/* Font Family */}
                {selectedElement.type === "text" && (
                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-400 mb-1">
                      Font Family (ពុម្ពអក្សរ)
                    </label>
                    <select
                      value={selectedElement.fontFamily}
                      onChange={(e) => updateSelectedProp("fontFamily", e.target.value)}
                      className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-zinc-100 outline-none focus:border-amber-500 cursor-pointer"
                    >
                      {CANVAS_FONTS.map((f) => (
                        <option key={f.name} value={f.value}>
                          {f.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Font Size */}
                {selectedElement.type === "text" && (
                  <div>
                    <div className="flex justify-between text-[11px] font-semibold text-zinc-400 mb-1">
                      <span>Font Size</span>
                      <span className="text-amber-400">{selectedElement.fontSize}px</span>
                    </div>
                    <input
                      type="range"
                      min={12}
                      max={64}
                      value={selectedElement.fontSize || 20}
                      onChange={(e) =>
                        updateSelectedProp("fontSize", parseInt(e.target.value, 10))
                      }
                      className="w-full accent-amber-500 cursor-pointer"
                    />
                  </div>
                )}

                {/* Text Color */}
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-400 mb-1.5">
                    {selectedElement.type === "button" ? "Button Color" : "Text Color"}
                  </label>
                  <div className="grid grid-cols-5 gap-2 mb-2">
                    {LUXURY_PALETTES.map((p) => (
                      <button
                        key={p.name}
                        type="button"
                        onClick={() =>
                          updateSelectedProp(
                            selectedElement.type === "button" ? "bgColor" : "color",
                            p.value
                          )
                        }
                        className="h-7 rounded-lg border border-white/20 transition hover:scale-110 cursor-pointer flex items-center justify-center shadow-sm"
                        style={{ backgroundColor: p.value }}
                        title={p.name}
                      >
                        {(selectedElement.type === "button"
                          ? selectedElement.bgColor
                          : selectedElement.color) === p.value && (
                          <Check
                            className={`h-3 w-3 ${
                              p.value === "#ffffff" || p.value === "#fef3c7"
                                ? "text-black"
                                : "text-white"
                            }`}
                          />
                        )}
                      </button>
                    ))}
                  </div>
                  <input
                    type="color"
                    value={
                      selectedElement.type === "button"
                        ? selectedElement.bgColor || "#f59e0b"
                        : selectedElement.color || "#ffffff"
                    }
                    onChange={(e) =>
                      updateSelectedProp(
                        selectedElement.type === "button" ? "bgColor" : "color",
                        e.target.value
                      )
                    }
                    className="w-full h-8 rounded-lg cursor-pointer bg-zinc-950 border border-zinc-800"
                  />
                </div>

                {/* Text Alignment */}
                {selectedElement.type === "text" && (
                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-400 mb-1">
                      Alignment
                    </label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => updateSelectedProp("align", "left")}
                        className={`flex-1 py-1.5 rounded-lg border flex items-center justify-center transition ${
                          selectedElement.align === "left"
                            ? "border-amber-500 bg-amber-500/20 text-amber-300"
                            : "border-zinc-800 bg-zinc-950 text-zinc-400"
                        }`}
                      >
                        <AlignLeft className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => updateSelectedProp("align", "center")}
                        className={`flex-1 py-1.5 rounded-lg border flex items-center justify-center transition ${
                          selectedElement.align === "center"
                            ? "border-amber-500 bg-amber-500/20 text-amber-300"
                            : "border-zinc-800 bg-zinc-950 text-zinc-400"
                        }`}
                      >
                        <AlignCenter className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => updateSelectedProp("align", "right")}
                        className={`flex-1 py-1.5 rounded-lg border flex items-center justify-center transition ${
                          selectedElement.align === "right"
                            ? "border-amber-500 bg-amber-500/20 text-amber-300"
                            : "border-zinc-800 bg-zinc-950 text-zinc-400"
                        }`}
                      >
                        <AlignRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Layer Ordering */}
                <div className="pt-2 border-t border-zinc-800 flex gap-2">
                  <button
                    type="button"
                    onClick={handleBringForward}
                    className="flex-1 py-1.5 rounded-lg border border-zinc-800 bg-zinc-950 text-xs font-semibold text-zinc-300 hover:border-amber-500 hover:text-amber-300 transition"
                  >
                    Bring Forward
                  </button>
                  <button
                    type="button"
                    onClick={handleSendBackward}
                    className="flex-1 py-1.5 rounded-lg border border-zinc-800 bg-zinc-950 text-xs font-semibold text-zinc-300 hover:border-amber-500 hover:text-amber-300 transition"
                  >
                    Send Backward
                  </button>
                </div>
              </div>
            ) : (
              /* Canvas / Card Design Settings */
              <div className="space-y-4">
                <div className="pb-2 border-b border-zinc-800">
                  <div className="flex items-center gap-2">
                    <Palette className="h-4 w-4 text-amber-400" />
                    <span className="text-xs font-bold text-zinc-200 uppercase tracking-wider">
                      Card Design & Theme
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    ជ្រើសរើសទម្រង់កាត និងផ្ទៃខាងក្រោយ
                  </p>
                </div>

                {/* Theme Presets */}
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-400 mb-2">
                    Theme Presets (រចនាបថប្រណិត)
                  </label>
                  <div className="space-y-2">
                    {CARD_BACKGROUND_THEMES.map((theme) => (
                      <button
                        key={theme.id}
                        type="button"
                        onClick={() => handleApplyTheme(theme)}
                        className={`w-full flex items-center justify-between p-2.5 rounded-xl border transition text-left cursor-pointer ${
                          cardTheme.id === theme.id
                            ? "border-amber-400 bg-zinc-800/80 shadow-md"
                            : "border-zinc-800 bg-zinc-950/60 hover:border-zinc-700"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div
                            className="h-6 w-6 rounded-full border border-white/20 shadow-sm"
                            style={{ background: theme.bg }}
                          />
                          <span className="text-xs font-semibold text-zinc-200">
                            {theme.name}
                          </span>
                        </div>
                        {cardTheme.id === theme.id && (
                          <Check className="h-3.5 w-3.5 text-amber-400" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Arch Top Shape Switch */}
                <div className="flex items-center justify-between p-3 rounded-xl border border-zinc-800 bg-zinc-950">
                  <div>
                    <span className="block text-xs font-semibold text-zinc-200">
                      Arch Top Shape (ក្បាលកាតមូល)
                    </span>
                    <span className="text-[10px] text-zinc-500">
                      រចនាបថកោងដូច Greenvelope Luxury
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={hasArch}
                    onChange={(e) => setHasArch(e.target.checked)}
                    className="h-4 w-4 accent-amber-500 cursor-pointer"
                  />
                </div>

                {/* Marble Wallpaper Backdrop */}
                <div className="flex items-center justify-between p-3 rounded-xl border border-zinc-800 bg-zinc-950">
                  <div>
                    <span className="block text-xs font-semibold text-zinc-200">
                      Marble Studio Wallpaper
                    </span>
                    <span className="text-[10px] text-zinc-500">
                      ផ្ទៃខាងក្រោយជញ្ជាំងថ្មម៉ាប
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={hasMarbleWall}
                    onChange={(e) => setHasMarbleWall(e.target.checked)}
                    className="h-4 w-4 accent-amber-500 cursor-pointer"
                  />
                </div>
              </div>
            )}
          </aside>
        )}

        {/* B. CENTRAL CANVAS WORKSPACE */}
        <main
          onClick={() => setSelectedId(null)}
          className={`flex-1 flex items-center justify-center p-6 overflow-auto relative ${
            hasMarbleWall ? "bg-[#141416]" : "bg-zinc-950"
          }`}
          style={{
            backgroundImage: hasMarbleWall
              ? "radial-gradient(circle at 50% 40%, rgba(255,255,255,0.06) 0%, transparent 60%), radial-gradient(circle at 80% 20%, rgba(245,158,11,0.04) 0%, transparent 40%)"
              : undefined,
          }}
        >
          {!isPreview && (
            <div className="absolute top-4 left-6 z-10 flex items-center gap-2 rounded-xl bg-zinc-900/90 border border-zinc-800/80 px-3 py-1.5 text-[11px] text-zinc-400 shadow-md backdrop-blur-md">
              <Move className="h-3.5 w-3.5 text-amber-400" />
              <span>ចាប់ទាញអក្សរ/រូបភាព Move ដោយសេរី ឬចុចពីរដងដើម្បីកែអក្សរផ្ទាល់</span>
            </div>
          )}

          {/* THE DIGITAL INVITATION CARD (Greenvelope-Style Interactive Canvas) */}
          <div
            ref={cardRef}
            onClick={(e) => e.stopPropagation()}
            className={`relative w-[380px] h-[600px] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] transition-all overflow-hidden border border-white/10 ${
              hasArch ? "rounded-t-[190px] rounded-b-2xl" : "rounded-3xl"
            }`}
            style={{
              background: cardBg,
            }}
          >
            {/* Elegant Inner Luxury Border Line */}
            <div
              className={`absolute inset-3 border border-amber-400/30 pointer-events-none ${
                hasArch ? "rounded-t-[178px] rounded-b-xl" : "rounded-2xl"
              }`}
            />

            {/* ELEMENTS LAYER */}
            {elements.map((el) => {
              const isSelected = selectedId === el.id && !isPreview;
              const isEditing = editingTextId === el.id;

              return (
                <div
                  key={el.id}
                  onMouseDown={(e) => handleMouseDown(e, el.id)}
                  onDoubleClick={() => {
                    if (el.type === "text" || el.type === "button") {
                      setEditingTextId(el.id);
                    }
                  }}
                  className={`absolute transition-shadow ${
                    isSelected
                      ? "ring-2 ring-emerald-400 ring-offset-2 ring-offset-transparent cursor-grab active:cursor-grabbing z-30"
                      : "cursor-pointer hover:ring-1 hover:ring-white/30"
                  }`}
                  style={{
                    left: `${el.x}%`,
                    top: `${el.y}%`,
                    width: el.width ? `${el.width}%` : "auto",
                    zIndex: el.zIndex || 10,
                  }}
                >
                  {/* Bounding box resize handles (Greenvelope Style) */}
                  {isSelected && (
                    <>
                      <div className="absolute -top-1.5 -left-1.5 h-3 w-3 rounded-full bg-white border-2 border-emerald-500 shadow-sm" />
                      <div
                        onMouseDown={(e) => handleResizeStart(e, el.id)}
                        className="absolute -top-1.5 -right-1.5 h-3 w-3 rounded-full bg-white border-2 border-emerald-500 shadow-sm cursor-ew-resize"
                      />
                      <div className="absolute -bottom-1.5 -left-1.5 h-3 w-3 rounded-full bg-white border-2 border-emerald-500 shadow-sm" />
                      <div
                        onMouseDown={(e) => handleResizeStart(e, el.id)}
                        className="absolute -bottom-1.5 -right-1.5 h-3 w-3 rounded-full bg-white border-2 border-emerald-500 shadow-sm cursor-se-resize"
                      />
                      <div className="absolute -top-6 left-1/2 -translate-x-1/2 rounded bg-emerald-500 px-1.5 py-0.2 text-[9px] font-bold text-slate-950 uppercase tracking-wider">
                        Move
                      </div>
                    </>
                  )}

                  {/* ELEMENT TYPE: TEXT */}
                  {el.type === "text" && (
                    <div
                      style={{
                        fontFamily: el.fontFamily || "'Cinzel', serif",
                        fontSize: `${el.fontSize || 18}px`,
                        color: el.color || "#ffffff",
                        fontWeight: el.fontWeight || "normal",
                        textAlign: el.align || "center",
                        letterSpacing: el.letterSpacing ? `${el.letterSpacing}px` : "normal",
                        lineHeight: 1.4,
                        whiteSpace: "pre-line",
                      }}
                      className="p-1 select-none"
                    >
                      {isEditing ? (
                        <textarea
                          autoFocus
                          rows={el.text.split("\n").length || 2}
                          value={el.text}
                          onChange={(e) => updateSelectedProp("text", e.target.value)}
                          onBlur={() => setEditingTextId(null)}
                          className="w-full bg-black/60 p-1 rounded text-white border border-emerald-400 outline-none text-center"
                          style={{
                            fontFamily: el.fontFamily,
                            fontSize: `${el.fontSize}px`,
                            color: el.color,
                          }}
                        />
                      ) : (
                        el.text
                      )}
                    </div>
                  )}

                  {/* ELEMENT TYPE: IMAGE */}
                  {el.type === "image" && (
                    <div
                      className="overflow-hidden shadow-lg"
                      style={{
                        borderRadius: `${el.borderRadius || 12}px`,
                        border: `${el.borderWidth || 0}px solid ${el.borderColor || "transparent"}`,
                      }}
                    >
                      <img
                        src={el.src}
                        alt="Card element"
                        className="w-full h-auto object-cover pointer-events-none"
                      />
                    </div>
                  )}

                  {/* ELEMENT TYPE: BUTTON (RSVP) */}
                  {el.type === "button" && (
                    <div
                      style={{
                        fontFamily: el.fontFamily || "'Kantumruy Pro', sans-serif",
                        fontSize: `${el.fontSize || 13}px`,
                        color: el.color || "#000000",
                        backgroundColor: el.bgColor || "#f59e0b",
                        fontWeight: el.fontWeight || "bold",
                        textAlign: el.align || "center",
                        borderRadius: `${el.borderRadius || 9999}px`,
                      }}
                      className="py-2.5 px-4 shadow-xl select-none"
                    >
                      {isEditing ? (
                        <input
                          autoFocus
                          type="text"
                          value={el.text}
                          onChange={(e) => updateSelectedProp("text", e.target.value)}
                          onBlur={() => setEditingTextId(null)}
                          className="w-full bg-black/50 text-white rounded px-2 py-0.5 outline-none text-center"
                        />
                      ) : (
                        el.text
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </main>
      </div>

      {/* Toast Notification */}
      {feedback && (
        <div
          className={`fixed bottom-6 right-6 z-50 rounded-xl px-4 py-3 shadow-2xl text-xs font-bold transition-all flex items-center gap-2 ${
            feedback.type === "error"
              ? "bg-red-500 text-white"
              : "bg-emerald-500 text-slate-950"
          }`}
        >
          <span>{feedback.msg}</span>
        </div>
      )}
    </div>
  );
}

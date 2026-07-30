"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  ChevronLeft,
  Save,
  Send,
  Trash2,
  RotateCw,
  Sparkles,
  Code,
  Eye,
  FileText,
  Clock,
  CheckCircle,
  AlertTriangle,
  Info,
  Underline as UnderlineIcon,
  Bold as BoldIcon,
  Italic as ItalicIcon,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote
} from "lucide-react";

export default function DocumentEditor({
  item,
  form,
  setForm,
  onClose,
  onSave,
  isSaving,
  onSubmitNow,
  onDelete,
  actionItemState,
  readOnly = false
}) {
  const [viewMode, setViewMode] = useState("normal"); // 'normal' | 'code'
  const editorRef = useRef(null);
  const isBusy = actionItemState[item._id];

  // Helper to escape regex special characters
  const escapeRegExp = (string) => {
    return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  };

  // Strip HTML tags helper
  const stripHtml = (html) => {
    if (!html) return "";
    return html.replace(/<[^>]+>/g, " ");
  };

  // Calculations for Metrics
  const bodyText = stripHtml(form.body);
  const wordCount = bodyText.trim() === "" ? 0 : bodyText.trim().split(/\s+/).filter(Boolean).length;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  const titleLength = form.title ? form.title.length : 0;
  const summaryLength = form.summary ? form.summary.length : 0;

  // Process keywords
  const keywordsList = form.keywords
    ? form.keywords.split(",").map((k) => k.trim()).filter(Boolean)
    : [];

  const keywordAnalysis = keywordsList.map((kw) => {
    const escKw = escapeRegExp(kw);
    const titleMatch = form.title
      ? new RegExp(escKw, "i").test(form.title)
      : false;
    const summaryMatch = form.summary
      ? new RegExp(escKw, "i").test(form.summary)
      : false;

    // Body occurrence check
    let bodyOccurrences = 0;
    if (bodyText) {
      const matches = bodyText.match(new RegExp(escKw, "gi"));
      bodyOccurrences = matches ? matches.length : 0;
    }

    const density = wordCount > 0 ? ((bodyOccurrences / wordCount) * 100).toFixed(1) : "0.0";

    return {
      keyword: kw,
      inTitle: titleMatch,
      inSummary: summaryMatch,
      occurrences: bodyOccurrences,
      density: density
    };
  });

  // Sync contentEditable innerHTML on view mode switch to 'normal'
  useEffect(() => {
    if (viewMode === "normal" && editorRef.current) {
      if (editorRef.current.innerHTML !== form.body) {
        editorRef.current.innerHTML = form.body || "";
      }
    }
  }, [viewMode]);

  // Sync state on contentEditable change
  const handleInput = () => {
    if (editorRef.current) {
      const newBody = editorRef.current.innerHTML;
      if (newBody !== form.body) {
        setForm((prev) => ({ ...prev, body: newBody }));
      }
    }
  };

  // Run formatting commands on contentEditable editor
  const runCommand = (e, command, value = null) => {
    e.preventDefault();
    if (editorRef.current) {
      document.execCommand(command, false, value);
      editorRef.current.focus();
      handleInput();
    }
  };

  const getStatusBadge = () => {
    if (item.status === "submitted") {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold uppercase tracking-wider">
          <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
          Published
        </span>
      );
    }
    if (item.status === "failed") {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold uppercase tracking-wider">
          <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
          Failed Submission
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold uppercase tracking-wider">
        <Clock className="w-3.5 h-3.5 text-amber-600" />
        {item.hoursRemaining > 0
          ? `Auto-Submits in ${item.hoursRemaining}h ${item.minsRemaining}m`
          : "Pending Queue Auto-Submit"}
      </span>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Scoped CSS block for the Visual Editor text canvas */}
      <style>{`
        .editor-canvas {
          outline: none;
          font-family: inherit;
        }
        .editor-canvas h2 {
          font-size: 1.5rem;
          font-weight: 800;
          margin-top: 1.75rem;
          margin-bottom: 0.75rem;
          color: #0f172a;
          line-height: 1.3;
        }
        .editor-canvas h3 {
          font-size: 1.25rem;
          font-weight: 700;
          margin-top: 1.5rem;
          margin-bottom: 0.5rem;
          color: #1e293b;
          line-height: 1.35;
        }
        .editor-canvas p {
          margin-bottom: 1.1rem;
          line-height: 1.75;
          color: #334155;
        }
        .editor-canvas ul {
          list-style-type: disc;
          padding-left: 1.75rem;
          margin-bottom: 1.1rem;
        }
        .editor-canvas ol {
          list-style-type: decimal;
          padding-left: 1.75rem;
          margin-bottom: 1.1rem;
        }
        .editor-canvas li {
          margin-bottom: 0.35rem;
          color: #334155;
        }
        .editor-canvas blockquote {
          border-left: 4px solid #a855f7;
          background-color: #faf5ff;
          padding: 0.75rem 1.25rem;
          font-style: italic;
          margin: 1.25rem 0;
          color: #581c87;
          border-radius: 0 0.5rem 0.5rem 0;
        }
        .editor-canvas a {
          color: #7c3aed;
          text-decoration: underline;
          font-weight: 600;
        }
      `}</style>

      {/* Editor Main Top Header bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-xl text-slate-500 hover:text-slate-800 transition-colors border border-slate-200 bg-white shadow-xs"
            title={readOnly ? "Go Back" : "Back to Queue"}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-bold text-purple-600 uppercase tracking-widest">Document Editor</span>
              {getStatusBadge()}
            </div>
            <h2 className="text-lg font-black text-slate-900 leading-none mt-1">Article Optimization Workspace</h2>
          </div>
        </div>

        {/* Global Save/Submit/Delete Actions */}
        {!readOnly && (
          <div className="flex items-center gap-2 self-start md:self-center">
            {item.status === "scheduled" && (
              <button
                onClick={() => onSubmitNow(item._id)}
                disabled={isBusy || isSaving}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 disabled:opacity-50"
              >
                {isBusy === "submitting" ? (
                  <RotateCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5 text-amber-300" />
                )}
                <span>Publish Now</span>
              </button>
            )}

            <button
              onClick={onSave}
              disabled={isSaving || isBusy}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 disabled:opacity-50"
            >
              {isSaving ? (
                <RotateCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Save className="w-3.5 h-3.5 text-purple-300" />
              )}
              <span>Save Draft</span>
            </button>

            <button
              onClick={onDelete}
              disabled={isSaving || isBusy}
              className="p-2 border border-rose-200 bg-white hover:bg-rose-50 text-rose-600 rounded-xl transition-colors disabled:opacity-50"
              title="Delete Document"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Main Editing Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Side: Document Title & Text Editor */}
        <div className="lg:col-span-8 space-y-4">
          
          {/* Main Document Workspace Card */}
          <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-[680px]">
            
            {/* Tab view controllers & toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 bg-slate-50/50 p-4 gap-3 shrink-0">
              {/* Tab Selector */}
              <div className="flex items-center gap-1 p-1 bg-slate-200/70 rounded-xl w-fit text-xs font-bold">
                <button
                  onClick={() => setViewMode("normal")}
                  className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                    viewMode === "normal"
                      ? "bg-white text-purple-700 shadow-xs"
                      : "text-slate-600 hover:text-slate-955"
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Normal View</span>
                </button>
                <button
                  onClick={() => setViewMode("code")}
                  className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                    viewMode === "code"
                      ? "bg-white text-purple-700 shadow-xs"
                      : "text-slate-600 hover:text-slate-955"
                  }`}
                >
                  <Code className="w-3.5 h-3.5" />
                  <span>Code View (HTML)</span>
                </button>
              </div>

              {/* Text formatting toolbar (only for Normal View and when not readOnly) */}
              {viewMode === "normal" && !readOnly && (
                <div className="flex flex-wrap items-center gap-1 bg-white border border-slate-200 rounded-xl p-1 shadow-xs">
                  <button
                    onMouseDown={(e) => runCommand(e, "bold")}
                    className="p-1.5 hover:bg-slate-100 text-slate-700 rounded-lg transition-colors"
                    title="Bold"
                  >
                    <BoldIcon className="w-3.5 h-3.5 font-bold" />
                  </button>
                  <button
                    onMouseDown={(e) => runCommand(e, "italic")}
                    className="p-1.5 hover:bg-slate-100 text-slate-700 rounded-lg transition-colors"
                    title="Italic"
                  >
                    <ItalicIcon className="w-3.5 h-3.5 italic" />
                  </button>
                  <button
                    onMouseDown={(e) => runCommand(e, "underline")}
                    className="p-1.5 hover:bg-slate-100 text-slate-700 rounded-lg transition-colors"
                    title="Underline"
                  >
                    <UnderlineIcon className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-[1px] h-4 bg-slate-200 mx-1"></span>
                  <button
                    onMouseDown={(e) => runCommand(e, "formatBlock", "<h2>")}
                    className="p-1.5 hover:bg-slate-100 text-slate-700 rounded-lg transition-colors font-bold text-xs"
                    title="Heading 2"
                  >
                    <Heading2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onMouseDown={(e) => runCommand(e, "formatBlock", "<h3>")}
                    className="p-1.5 hover:bg-slate-100 text-slate-700 rounded-lg transition-colors font-bold text-xs"
                    title="Heading 3"
                  >
                    <Heading3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onMouseDown={(e) => runCommand(e, "formatBlock", "<p>")}
                    className="p-1.5 hover:bg-slate-100 text-slate-700 rounded-lg transition-colors font-semibold text-xs animate-none"
                    title="Paragraph Text"
                  >
                    P
                  </button>
                  <span className="w-[1px] h-4 bg-slate-200 mx-1"></span>
                  <button
                    onMouseDown={(e) => runCommand(e, "insertUnorderedList")}
                    className="p-1.5 hover:bg-slate-100 text-slate-700 rounded-lg transition-colors"
                    title="Bullet List"
                  >
                    <List className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onMouseDown={(e) => runCommand(e, "insertOrderedList")}
                    className="p-1.5 hover:bg-slate-100 text-slate-700 rounded-lg transition-colors"
                    title="Numbered List"
                  >
                    <ListOrdered className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onMouseDown={(e) => runCommand(e, "formatBlock", "<blockquote>")}
                    className="p-1.5 hover:bg-slate-100 text-slate-700 rounded-lg transition-colors"
                    title="Blockquote"
                  >
                    <Quote className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-[1px] h-4 bg-slate-200 mx-1"></span>
                  <button
                    onMouseDown={(e) => runCommand(e, "removeFormat")}
                    className="p-1.5 hover:bg-slate-100 text-rose-500 rounded-lg transition-colors font-bold text-[10px]"
                    title="Clear Formatting"
                  >
                    Tx
                  </button>
                </div>
              )}
            </div>

            {/* Document Canvas Body */}
            <div className="flex-1 p-6 md:p-10 flex flex-col bg-white">
              {/* Document borderless header title */}
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                className="w-full text-2xl md:text-3xl font-black text-slate-900 border-none outline-none focus:ring-0 placeholder-slate-200 pb-3 mb-6 bg-transparent border-b border-slate-100 focus:border-purple-300 transition-colors"
                placeholder="Article Title..."
                required
                readOnly={readOnly}
              />

              {/* Editing Area */}
              <div className="flex-1 flex flex-col">
                {viewMode === "normal" ? (
                  <div
                    ref={editorRef}
                    contentEditable={!readOnly}
                    onInput={handleInput}
                    className="editor-canvas flex-1 outline-none text-slate-800 text-sm leading-relaxed min-h-[450px]"
                    placeholder="Start writing your visual blog article contents..."
                  />
                ) : (
                  <textarea
                    value={form.body}
                    onChange={(e) => setForm((prev) => ({ ...prev, body: e.target.value }))}
                    className="flex-1 w-full p-4 font-mono text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 min-h-[450px] leading-relaxed"
                    placeholder="<html>\n  <body>\n    Enter HTML block tags directly here...\n  </body>\n</html>"
                    required
                    readOnly={readOnly}
                  />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Metadata fields & SEO live checklist */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Metadata Card */}
          <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <FileText className="w-4 h-4 text-purple-600" />
              <span>Document Metadata</span>
            </h3>

            {/* Target Keywords Field */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">
                Target Keywords
              </label>
              <input
                type="text"
                value={form.keywords}
                onChange={(e) => setForm((prev) => ({ ...prev, keywords: e.target.value }))}
                placeholder="Comma separated: keyword1, keyword2"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                readOnly={readOnly}
              />
              <p className="text-[10px] text-slate-400 font-medium">Used for live SEO analysis and keyword checks</p>
            </div>

            {/* Summary / Meta Description Field */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Summary / Meta Description
                </label>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                  summaryLength > 160 ? "bg-rose-50 text-rose-600" : summaryLength >= 120 ? "bg-emerald-50 text-emerald-600" : "bg-slate-50 text-slate-500"
                }`}>
                  {summaryLength} / 160
                </span>
              </div>
              <textarea
                rows="3"
                value={form.summary}
                onChange={(e) => setForm((prev) => ({ ...prev, summary: e.target.value }))}
                placeholder="Enter a meta summary describing the article for search results..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all leading-relaxed"
                readOnly={readOnly}
              />
              {summaryLength > 160 && (
                <p className="text-[10px] text-rose-500 font-semibold flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3 text-rose-600" /> Exceeds SEO length recommendation (max 160)
                </p>
              )}
            </div>
          </div>

          {/* Live SEO Analytics Card */}
          <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Live SEO Scoring</span>
            </h3>

            {/* Live Metrics Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Word Count</div>
                <div className="text-lg font-black text-slate-800">{wordCount}</div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      wordCount >= 1000 ? "bg-emerald-500" : wordCount >= 500 ? "bg-amber-500" : "bg-rose-500"
                    }`}
                    style={{ width: `${Math.min(100, (wordCount / 1000) * 100)}%` }}
                  ></div>
                </div>
                <div className="text-[10px] text-slate-400 mt-1.5">Goal: 1000+ words</div>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 flex flex-col justify-between">
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Read Time</div>
                  <div className="text-lg font-black text-slate-800">{readingTime} min</div>
                </div>
                <div className="text-[10px] text-slate-400 font-medium">Est. speed 200 wpm</div>
              </div>
            </div>

            {/* Title Length Meter */}
            <div className="space-y-1.5 bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Title Length</span>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                  titleLength > 60 ? "bg-rose-50 text-rose-600" : titleLength >= 40 ? "bg-emerald-50 text-emerald-600" : "bg-slate-50 text-slate-500"
                }`}>
                  {titleLength} chars
                </span>
              </div>
              <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    titleLength > 60 ? "bg-rose-500" : titleLength >= 40 ? "bg-emerald-500" : "bg-amber-500"
                  }`}
                  style={{ width: `${Math.min(100, (titleLength / 60) * 100)}%` }}
                ></div>
              </div>
              <p className="text-[9px] text-slate-400 font-medium">Optimal: 40-60 characters</p>
            </div>

            {/* Keyword Checklist */}
            <div className="space-y-3 pt-2">
              <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Keyword Density & Placement
              </div>

              {keywordAnalysis.length > 0 ? (
                <div className="space-y-3">
                  {keywordAnalysis.map((analysis, index) => (
                    <div key={index} className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                      <div className="flex justify-between items-start">
                        <span className="text-xs font-extrabold text-slate-800 truncate max-w-[150px]" title={analysis.keyword}>
                          "{analysis.keyword}"
                        </span>
                        <span className="px-2 py-0.5 bg-purple-50 text-purple-700 text-[10px] font-bold rounded-md shrink-0">
                          {analysis.occurrences}x ({analysis.density}%)
                        </span>
                      </div>

                      {/* Locations presence indicators */}
                      <div className="grid grid-cols-3 gap-1.5 text-[9px] font-bold uppercase tracking-wider pt-1 border-t border-slate-200/50">
                        <div className="flex flex-col items-center p-1 rounded">
                          <span className={analysis.inTitle ? "text-emerald-600" : "text-slate-400"}>Title</span>
                          <span className={`w-1.5 h-1.5 rounded-full mt-1 ${analysis.inTitle ? "bg-emerald-500" : "bg-slate-300"}`}></span>
                        </div>
                        <div className="flex flex-col items-center p-1 rounded">
                          <span className={analysis.inSummary ? "text-emerald-600" : "text-slate-400"}>Summary</span>
                          <span className={`w-1.5 h-1.5 rounded-full mt-1 ${analysis.inSummary ? "bg-emerald-500" : "bg-slate-300"}`}></span>
                        </div>
                        <div className="flex flex-col items-center p-1 rounded">
                          <span className={analysis.occurrences > 0 ? "text-emerald-600" : "text-slate-400"}>Body</span>
                          <span className={`w-1.5 h-1.5 rounded-full mt-1 ${analysis.occurrences > 0 ? "bg-emerald-500" : "bg-slate-300"}`}></span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl text-center text-xs text-slate-400 flex items-center gap-2 justify-center">
                  <Info className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>Enter keywords above to analyze keyword optimization</span>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import { useSeo } from "@/context/SeoContext";
import {
  Sparkles,
  FileText,
  Copy,
  Check,
  Download,
  RotateCw,
  BookOpen,
  Layers,
  HelpCircle,
  Edit3,
  AlignLeft,
  CheckCircle2,
  Zap,
  Target,
  ChevronRight,
  Code
} from "lucide-react";

export default function ContentGeneratorStudio() {
  const { currentDomain } = useSeo();

  // Form State
  const [topic, setTopic] = useState("");
  const [primaryKeyword, setPrimaryKeyword] = useState("");
  const [contentType, setContentType] = useState("blog");
  const [tone, setTone] = useState("Authoritative");
  const [wordCountGoal, setWordCountGoal] = useState(1000);
  const [targetAudience, setTargetAudience] = useState("");

  // Generation & Result State
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedArticle, setGeneratedArticle] = useState(null);
  const [viewMode, setViewMode] = useState("preview"); // 'preview' | 'html' | 'markdown' | 'schema'
  const [copiedMode, setCopiedMode] = useState(null);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5000";

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!topic.trim() && !primaryKeyword.trim()) return;

    setIsGenerating(true);
    setGeneratedArticle(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/content/generate-blog`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: topic.trim(),
          primaryKeyword: primaryKeyword.trim(),
          contentType,
          tone,
          wordCountGoal,
          targetAudience: targetAudience.trim(),
          domain: currentDomain
        })
      });

      const resData = await response.json();
      if (resData.success) {
        setGeneratedArticle(resData);
      }
    } catch (err) {
      console.error("Content generation error:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = (text, mode) => {
    navigator.clipboard.writeText(text);
    setCopiedMode(mode);
    setTimeout(() => setCopiedMode(null), 2000);
  };

  const handleDownload = (content, filename) => {
    const element = document.createElement("a");
    const file = new Blob([content], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="space-y-8">
      {/* Hero Studio Banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-900 via-slate-900 to-purple-950 p-8 md:p-10 rounded-[2rem] text-white shadow-xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-purple-500/20 via-transparent to-transparent opacity-70"></div>
        
        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/20 border border-purple-400/30 text-purple-300 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" /> AI Content & Blog Generator Studio
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight leading-tight">
              Create Rank-Ready SEO Content for <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-amber-300">
                {currentDomain}
              </span>
            </h1>
            <p className="text-slate-300 text-sm max-w-2xl leading-relaxed font-medium">
              Generate full-length articles, structured blog outlines, FAQ schemas, and persuasive copywriting optimized for Google AI Overviews & Answer Engines.
            </p>
          </div>

          <div className="flex-shrink-0 bg-white/10 backdrop-blur-md border border-white/20 px-5 py-3.5 rounded-2xl flex items-center gap-3">
            <Target className="w-5 h-5 text-purple-400" />
            <div>
              <div className="text-[10px] text-slate-300 font-bold uppercase tracking-wider">Active Domain</div>
              <div className="text-sm font-extrabold text-white">{currentDomain}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Form Control Panel */}
        <div className="lg:col-span-5 bg-white p-6 md:p-8 rounded-[2rem] border border-slate-200 shadow-md space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className="p-2.5 rounded-xl bg-purple-50 border border-purple-100 text-purple-600">
              <Edit3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Content Parameters</h3>
              <p className="text-xs text-slate-500 font-medium">Configure topic, keywords, and tone</p>
            </div>
          </div>

          <form onSubmit={handleGenerate} className="space-y-5">
            {/* Topic Input */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Article Topic or Headline <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. How AI-Driven Call Analytics Accelerates Sales Revenue"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                required
              />
            </div>

            {/* Primary Keyword Input */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Primary Target Keyword
              </label>
              <input
                type="text"
                value={primaryKeyword}
                onChange={(e) => setPrimaryKeyword(e.target.value)}
                placeholder="e.g. sales call tracking software"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
              />
            </div>

            {/* Content Type & Tone Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Format Type
                </label>
                <select
                  value={contentType}
                  onChange={(e) => setContentType(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                >
                  <option value="blog">Full Blog Post</option>
                  <option value="press-release">Press Release</option>
                  <option value="guide">How-To Guide</option>
                  <option value="product-review">Product Comparison</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Tone Profile
                </label>
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                >
                  <option value="Authoritative">Authoritative</option>
                  <option value="Conversational">Conversational</option>
                  <option value="Professional">Professional</option>
                  <option value="Persuasive">Persuasive</option>
                  <option value="Technical">Technical</option>
                </select>
              </div>
            </div>

            {/* Target Word Count Slider */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Target Word Count
                </label>
                <span className="text-xs font-bold text-purple-600 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-100">
                  {wordCountGoal} words
                </span>
              </div>
              <input
                type="range"
                min="500"
                max="2500"
                step="100"
                value={wordCountGoal}
                onChange={(e) => setWordCountGoal(Number(e.target.value))}
                className="w-full accent-purple-600 cursor-pointer"
              />
            </div>

            {/* Target Audience */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Target Audience (Optional)
              </label>
              <input
                type="text"
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                placeholder="e.g. Sales Directors, Marketing Managers"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isGenerating || (!topic.trim() && !primaryKeyword.trim())}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-sm shadow-md shadow-purple-500/20 transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Generating AI Content...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Generate AI Article Now</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Studio Live Preview & Output Panel */}
        <div className="lg:col-span-7 bg-white p-6 md:p-8 rounded-[2rem] border border-slate-200 shadow-md flex flex-col min-h-[550px]">
          
          {/* Header Controls & Tabs */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 mb-6">
            <div>
              <h3 className="text-base font-bold text-slate-900">Generated Content Output</h3>
              <p className="text-xs text-slate-500 font-medium">Preview, edit, or copy formatted markdown/HTML</p>
            </div>

            {generatedArticle && (
              <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-bold">
                <button
                  onClick={() => setViewMode("preview")}
                  className={`px-3 py-1.5 rounded-lg transition-colors ${viewMode === "preview" ? "bg-white text-purple-700 shadow-xs" : "text-slate-600 hover:text-slate-900"}`}
                >
                  Preview
                </button>
                <button
                  onClick={() => setViewMode("markdown")}
                  className={`px-3 py-1.5 rounded-lg transition-colors ${viewMode === "markdown" ? "bg-white text-purple-700 shadow-xs" : "text-slate-600 hover:text-slate-900"}`}
                >
                  Markdown
                </button>
                <button
                  onClick={() => setViewMode("html")}
                  className={`px-3 py-1.5 rounded-lg transition-colors ${viewMode === "html" ? "bg-white text-purple-700 shadow-xs" : "text-slate-600 hover:text-slate-900"}`}
                >
                  HTML Code
                </button>
                <button
                  onClick={() => setViewMode("schema")}
                  className={`px-3 py-1.5 rounded-lg transition-colors ${viewMode === "schema" ? "bg-white text-purple-700 shadow-xs" : "text-slate-600 hover:text-slate-900"}`}
                >
                  FAQ Schema
                </button>
              </div>
            )}
          </div>

          {/* Main Output Canvas */}
          {generatedArticle ? (
            <div className="flex-1 flex flex-col justify-between space-y-6">
              
              {/* Top Article Specs Badge Bar */}
              <div className="flex flex-wrap items-center gap-3 p-3 bg-purple-50/60 rounded-2xl border border-purple-100 text-xs font-semibold text-purple-800">
                <div className="flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-purple-600" />
                  <span>Word Count: <strong>{generatedArticle.wordCount} words</strong></span>
                </div>
                <span className="text-purple-300">•</span>
                <div>Reading Time: <strong>{generatedArticle.estimatedReadingTime}</strong></div>
                <span className="text-purple-300">•</span>
                <div className="text-emerald-700 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> SEO Optimized
                </div>
              </div>

              {/* View Modes */}
              <div className="flex-1 overflow-y-auto max-h-[420px] p-5 bg-slate-50 rounded-2xl border border-slate-200">
                {viewMode === "preview" && (
                  <div className="prose prose-slate prose-sm max-w-none text-slate-800 leading-relaxed">
                    <h1 className="text-xl font-black text-slate-900 mb-2">{generatedArticle.title}</h1>
                    <p className="text-xs text-slate-500 font-semibold italic mb-4">Meta: {generatedArticle.metaDescription}</p>
                    <div dangerouslySetInnerHTML={{ __html: generatedArticle.contentHtml }} />
                  </div>
                )}

                {viewMode === "markdown" && (
                  <pre className="text-xs font-mono text-slate-700 whitespace-pre-wrap">{generatedArticle.contentMarkdown}</pre>
                )}

                {viewMode === "html" && (
                  <pre className="text-xs font-mono text-slate-700 whitespace-pre-wrap">{generatedArticle.contentHtml}</pre>
                )}

                {viewMode === "schema" && (
                  <pre className="text-xs font-mono text-slate-700 whitespace-pre-wrap">{`<script type="application/ld+json">\n${JSON.stringify({
                    "@context": "https://schema.org",
                    "@type": "FAQPage",
                    "mainEntity": (generatedArticle.faqSchema || []).map(f => ({
                      "@type": "Question",
                      "name": f.question,
                      "acceptedAnswer": { "@type": "Answer", "text": f.answer }
                    }))
                  }, null, 2)}\n</script>`}</pre>
                )}
              </div>

              {/* Action Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => handleCopy(viewMode === 'html' ? generatedArticle.contentHtml : generatedArticle.contentMarkdown, viewMode)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-colors shadow-sm"
                  >
                    {copiedMode === viewMode ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedMode === viewMode ? "Copied!" : "Copy Content"}</span>
                  </button>

                  <button
                    onClick={async () => {
                      try {
                        const res = await fetch(`${API_BASE_URL}/api/content/auto-queue/add-manual`, {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            domain: currentDomain,
                            title: generatedArticle.title,
                            summary: generatedArticle.metaDescription,
                            body: generatedArticle.contentHtml,
                            keywords: primaryKeyword || topic,
                          }),
                        });
                        const data = await res.json();
                        if (data.success) {
                          setCopiedMode("queue");
                          setTimeout(() => setCopiedMode(null), 3000);
                        }
                      } catch (e) {
                        console.error(e);
                      }
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-colors shadow-sm"
                  >
                    {copiedMode === "queue" ? <Check className="w-4 h-4 text-white" /> : <Sparkles className="w-4 h-4 text-amber-200" />}
                    <span>{copiedMode === "queue" ? "Pushed to Queue!" : "Add to 3-Day Queue"}</span>
                  </button>

                  <button
                    onClick={() => handleDownload(generatedArticle.contentMarkdown, `${generatedArticle.slug || 'article'}.md`)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
                  >
                    <Download className="w-4 h-4 text-slate-500" />
                    <span>Download .MD</span>
                  </button>
                </div>

                <button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-700 text-xs font-bold transition-colors"
                >
                  <RotateCw className={`w-3.5 h-3.5 text-purple-600 ${isGenerating ? 'animate-spin' : ''}`} />
                  <span>Regenerate Article</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
              <div className="p-4 rounded-full bg-purple-50 text-purple-600 mb-3">
                <FileText className="w-8 h-8 text-purple-500" />
              </div>
              <h4 className="text-sm font-bold text-slate-800 mb-1">No AI Content Generated Yet</h4>
              <p className="text-xs text-slate-500 max-w-sm mb-4">
                Enter your article topic or target keyword in the control panel to generate rank-ready copy instantly.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

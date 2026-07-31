"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { useSeo } from "@/context/SeoContext";
import DocumentEditor from "./DocumentEditor";
import {
  Sparkles,
  Clock,
  Send,
  Edit3,
  Trash2,
  CheckCircle2,
  AlertCircle,
  RotateCw,
  Layers,
  X,
  Save,
  Zap,
  Settings
} from "lucide-react";

export default function AutoContentQueue() {
  const router = useRouter();
  const { currentDomain } = useSeo();
  const [queueItems, setQueueItems] = useState([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  const [stats, setStats] = useState({
    totalGeneratedCount: 0,
    totalSubmittedCount: 0,
    totalWipedCount: 0,
    currentScheduledInQueue: 0,
    activeSubmittedInQueue: 0,
  });
  const [pipelineSettings, setPipelineSettings] = useState({
    wordCountLimit: 1000,
    targetKeywords: [],
    preferredTone: "Authoritative",
    dailyQuota: 10,
    autoFillRemaining: true,
  });
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [settingsForm, setSettingsForm] = useState({
    company: "",
    email: "",
    phone: "",
    address: "",
    wordCountLimit: 1000,
    targetKeywordsStr: "",
    preferredTone: "Authoritative",
    dailyQuota: 10,
    autoFillRemaining: true,
  });
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingBatch, setIsGeneratingBatch] = useState(false);
  const [actionItemState, setActionItemState] = useState({});

  // Edit Modal State
  const [editingItem, setEditingItem] = useState(null);
  const [editForm, setEditForm] = useState({ title: "", summary: "", keywords: "", body: "" });
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5000";

  const fetchQueueData = async () => {
    if (!currentDomain) return;
    setIsLoading(true);
    try {
      const [queueRes, statsRes, settingsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/content/auto-queue?domain=${currentDomain}`),
        fetch(`${API_BASE_URL}/api/content/auto-stats?domain=${currentDomain}`),
        fetch(`${API_BASE_URL}/api/content/settings?domain=${currentDomain}`)
      ]);

      const queueData = await queueRes.json();
      const statsData = await statsRes.json();
      const settingsData = await settingsRes.json();

      if (queueData.items) setQueueItems(queueData.items);
      if (statsData.stats) setStats(statsData.stats);
      if (settingsData.settings) {
        setPipelineSettings(settingsData.settings);
        setSettingsForm({
          company: settingsData.settings.company || "",
          email: settingsData.settings.email || "",
          phone: settingsData.settings.phone || "",
          address: settingsData.settings.address || "",
          wordCountLimit: settingsData.settings.wordCountLimit || 1000,
          targetKeywordsStr: (settingsData.settings.targetKeywords || []).join(", "),
          preferredTone: settingsData.settings.preferredTone || "Authoritative",
          dailyQuota: settingsData.settings.dailyQuota || 10,
          autoFillRemaining: settingsData.settings.autoFillRemaining !== undefined ? settingsData.settings.autoFillRemaining : true,
        });
      }
    } catch (err) {
      console.error("Error fetching queue data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setIsSavingSettings(true);
    try {
      const kwArray = settingsForm.targetKeywordsStr.split(",").map(k => k.trim()).filter(Boolean);
      const res = await fetch(`${API_BASE_URL}/api/content/settings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          domain: currentDomain,
          company: settingsForm.company,
          email: settingsForm.email,
          phone: settingsForm.phone,
          address: settingsForm.address,
          wordCountLimit: Number(settingsForm.wordCountLimit),
          targetKeywords: kwArray,
          preferredTone: settingsForm.preferredTone,
          dailyQuota: Number(settingsForm.dailyQuota),
          autoFillRemaining: settingsForm.autoFillRemaining,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShowSettingsModal(false);
        await fetchQueueData();
      }
    } catch (err) {
      console.error("Error saving settings:", err);
    } finally {
      setIsSavingSettings(false);
    }
  };

  useEffect(() => {
    fetchQueueData();
  }, [currentDomain]);

  const handleGenerateBatch = async () => {
    setIsGeneratingBatch(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/content/auto-queue/generate-batch`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain: currentDomain }),
      });
      const data = await res.json();
      if (data.success) {
        await fetchQueueData();
      }
    } catch (err) {
      console.error("Failed to generate batch:", err);
    } finally {
      setIsGeneratingBatch(false);
    }
  };

  const handleSubmitNow = async (id) => {
    setActionItemState((prev) => ({ ...prev, [id]: "submitting" }));
    try {
      const res = await fetch(`${API_BASE_URL}/api/content/auto-queue/${id}/submit-now`, {
        method: "POST",
      });
      const data = await res.json();
      
      // Always fetch updated queue data so the UI reflects the new state (submitted or failed)
      await fetchQueueData();
      
      if (!data.success) {
        alert(data.message || "Submission failed. Please check the error details on the card.");
      }
    } catch (err) {
      console.error("Failed to submit item now:", err);
      alert("Network error: Failed to submit the article.");
      await fetchQueueData();
    } finally {
      setActionItemState((prev) => ({ ...prev, [id]: null }));
    }
  };

  const handleDeleteItem = async (id) => {
    setActionItemState((prev) => ({ ...prev, [id]: "deleting" }));
    try {
      const res = await fetch(`${API_BASE_URL}/api/content/auto-queue/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        await fetchQueueData();
      }
    } catch (err) {
      console.error("Failed to delete item:", err);
    } finally {
      setActionItemState((prev) => ({ ...prev, [id]: null }));
    }
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setEditForm({
      title: item.title,
      summary: item.summary || "",
      keywords: item.keywords || "",
      body: item.body || "",
    });
  };

  const handleSaveEdit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!editingItem) return;

    setIsSavingEdit(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/content/auto-queue/${editingItem._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      const data = await res.json();
      if (data.success) {
        setEditingItem(null);
        await fetchQueueData();
      }
    } catch (err) {
      console.error("Error saving edits:", err);
    } finally {
      setIsSavingEdit(false);
    }
  };

  if (editingItem) {
    return (
      <DocumentEditor
        item={editingItem}
        form={editForm}
        setForm={setEditForm}
        onClose={() => setEditingItem(null)}
        onSave={handleSaveEdit}
        isSaving={isSavingEdit}
        onSubmitNow={handleSubmitNow}
        onDelete={() => {
          if (confirm("Are you sure you want to delete this queued article?")) {
            handleDeleteItem(editingItem._id);
            setEditingItem(null);
          }
        }}
        actionItemState={actionItemState}
      />
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Top Banner Stats Bar */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-6 md:p-8 rounded-[2rem] text-white shadow-xl">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-400/30 text-purple-300 text-xs font-bold uppercase tracking-wider mb-2">
              <Zap className="w-3.5 h-3.5 text-amber-300" /> Automated {(pipelineSettings && pipelineSettings.dailyQuota) || 10}/Day Content Pipeline
            </div>
            <h2 className="text-xl md:text-2xl font-black tracking-tight">
              3-Day Queued Submission & Retention Engine
            </h2>
            <p className="text-xs md:text-sm text-slate-300 mt-1 max-w-xl">
              {(pipelineSettings && pipelineSettings.dailyQuota) || 10} articles generated daily. Editable for 72 hours before auto-posting to Rankgeni Backlink Engine. Raw data wiped after 60 days while lifetime publication counts are permanently tracked.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowSettingsModal(true)}
              className="px-4 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-white font-bold text-xs transition-colors flex items-center gap-1.5"
            >
              <Settings className="w-4 h-4 text-purple-300" />
              <span>Pipeline Settings</span>
            </button>

            <button
              onClick={handleGenerateBatch}
              disabled={isGeneratingBatch}
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white font-bold text-xs shadow-lg transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {isGeneratingBatch ? (
                <>
                  <RotateCw className="w-4 h-4 animate-spin text-amber-300" />
                  <span>Generating Articles...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Generate Content for Target Keywords</span>
                </>
              )}
            </button>

            <button
              onClick={fetchQueueData}
              className="p-3 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl text-white transition-colors"
              title="Refresh Queue"
            >
              <RotateCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Permanent Counters Bar */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white/10 border border-white/10 p-4 rounded-2xl">
            <div className="text-[10px] font-bold text-slate-300 uppercase tracking-wider mb-1">Lifetime Published</div>
            <div className="text-2xl font-black text-emerald-400">{stats.totalSubmittedCount}</div>
            <div className="text-[11px] text-slate-400 font-medium">Permanent Record</div>
          </div>

          <div className="bg-white/10 border border-white/10 p-4 rounded-2xl">
            <div className="text-[10px] font-bold text-slate-300 uppercase tracking-wider mb-1">Total Generated</div>
            <div className="text-2xl font-black text-purple-300">{stats.totalGeneratedCount}</div>
            <div className="text-[11px] text-slate-400 font-medium">{(pipelineSettings && pipelineSettings.dailyQuota) || 10} Articles / Day</div>
          </div>

          <div className="bg-white/10 border border-white/10 p-4 rounded-2xl">
            <div className="text-[10px] font-bold text-slate-300 uppercase tracking-wider mb-1">Scheduled in Queue</div>
            <div className="text-2xl font-black text-amber-300">{stats.currentScheduledInQueue}</div>
            <div className="text-[11px] text-slate-400 font-medium">Editable (3-Day Delay)</div>
          </div>

          <div className="bg-white/10 border border-white/10 p-4 rounded-2xl">
            <div className="text-[10px] font-bold text-slate-300 uppercase tracking-wider mb-1">60-Day Data Wiped</div>
            <div className="text-2xl font-black text-slate-300">{stats.totalWipedCount}</div>
            <div className="text-[11px] text-slate-400 font-medium">Cleaned Storage</div>
          </div>
        </div>
      </div>

      {/* Queue Items Table / Cards */}
      <div className="bg-white p-6 md:p-8 rounded-[2rem] border border-slate-200 shadow-md space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">Today's Content Pipeline</h3>
            <p className="text-xs text-slate-500">Edit today's articles before the 72-hour window closes or submit immediately</p>
          </div>
          <span className="px-3 py-1 bg-purple-50 border border-purple-100 text-purple-700 text-xs font-bold rounded-full">
            {queueItems.length} Items Today
          </span>
        </div>

        {queueItems.length > 0 ? (
          <div className="space-y-4">
            {queueItems.map((item) => {
              const isScheduled = item.status === "scheduled";
              const isSubmitted = item.status === "submitted";
              const isFailed = item.status === "failed";
              const isBusy = actionItemState[item._id];

              return (
                <div
                  key={item._id}
                  className={`p-5 rounded-2xl border transition-all ${
                    isScheduled
                      ? "bg-amber-50/40 border-amber-200/80 hover:border-amber-300"
                      : isSubmitted
                      ? "bg-emerald-50/40 border-emerald-200/80"
                      : "bg-rose-50/40 border-rose-200/80"
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    
                    {/* Left Details */}
                    <div className="space-y-2 max-w-2xl">
                      <div className="flex flex-wrap items-center gap-2">
                        {isScheduled && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 border border-amber-200 text-amber-800 text-[10px] font-bold uppercase tracking-wider">
                            <Clock className="w-3 h-3 text-amber-600" />
                            {item.hoursRemaining > 0
                              ? `Auto-Submits in ${item.hoursRemaining}h ${item.minsRemaining}m`
                              : "Pending Immediate Submission"}
                          </span>
                        )}

                        {isSubmitted && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 border border-emerald-200 text-emerald-800 text-[10px] font-bold uppercase tracking-wider">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Submitted to Backlink Engine
                          </span>
                        )}

                        {isFailed && (
                          <div className="flex flex-col gap-1">
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-100 border border-rose-200 text-rose-800 text-[10px] font-bold uppercase tracking-wider w-max">
                              <AlertCircle className="w-3 h-3 text-rose-600" />
                              Submission Error
                            </span>
                            {item.submissionError && (
                              <span className="text-[10px] text-rose-600 bg-rose-50 px-2.5 py-1 rounded-md border border-rose-100 font-medium">
                                Reason: {item.submissionError}
                              </span>
                            )}
                          </div>
                        )}

                        {item.backlinkJobId && (
                          <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                            Job ID: {item.backlinkJobId}
                          </span>
                        )}
                      </div>

                      <h4 className="font-extrabold text-slate-900 text-sm md:text-base leading-snug">
                        {item.title}
                      </h4>

                      <p className="text-xs text-slate-600 line-clamp-2">
                        {item.summary || item.body.replace(/<[^>]+>/g, '')}
                      </p>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 font-medium">
                        <span>Keywords: <strong className="text-slate-800">{item.keywords || "N/A"}</strong></span>
                        <span>•</span>
                        <span>Created: <strong>{new Date(item.createdAt).toLocaleDateString()}</strong></span>
                      </div>
                    </div>

                    {/* Right Actions */}
                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      {(isScheduled || isFailed) && (
                        <>
                          {isScheduled && (
                            <button
                              onClick={() => router.push(`/content-library?edit=${item._id}`)}
                              className="px-3.5 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs"
                            >
                              <Edit3 className="w-3.5 h-3.5 text-purple-600" /> Edit Content
                            </button>
                          )}

                          <button
                            onClick={() => handleSubmitNow(item._id)}
                            disabled={isBusy}
                            className={`px-3.5 py-2 rounded-xl text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm disabled:opacity-50 ${
                              isFailed
                                ? "bg-rose-600 hover:bg-rose-700"
                                : "bg-purple-600 hover:bg-purple-700"
                            }`}
                          >
                            {isBusy === 'submitting' ? (
                              <RotateCw className="w-3.5 h-3.5 animate-spin" />
                            ) : isFailed ? (
                              <RotateCw className="w-3.5 h-3.5 text-rose-200" />
                            ) : (
                              <Send className="w-3.5 h-3.5 text-amber-300" />
                            )}
                            <span>{isFailed ? "Resubmit" : "Submit Now"}</span>
                          </button>
                        </>
                      )}

                      <button
                        onClick={() => handleDeleteItem(item._id)}
                        disabled={isBusy}
                        className="p-2 rounded-xl border border-rose-200 bg-white hover:bg-rose-50 text-rose-600 transition-colors disabled:opacity-50"
                        title={isFailed ? "Delete Failed Article" : "Delete from Queue"}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
            <Layers className="w-8 h-8 text-purple-400 mx-auto mb-2" />
            <h4 className="text-sm font-bold text-slate-800">No Content Items in Queue</h4>
            <p className="text-xs text-slate-500 mt-1 mb-4">Click "Generate Today's {(pipelineSettings && pipelineSettings.dailyQuota) || 10} Articles" above to populate your 3-day queue.</p>
            <button
              onClick={handleGenerateBatch}
              disabled={isGeneratingBatch}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow transition-colors"
            >
              Generate {(pipelineSettings && pipelineSettings.dailyQuota) || 10} Articles Now
            </button>
          </div>
        )}
      </div>



      {/* Pipeline Settings Modal Drawer */}
      {showSettingsModal && mounted && createPortal(
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] max-w-xl w-full p-6 md:p-8 shadow-2xl space-y-6 relative max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
            
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-purple-50 text-purple-600 border border-purple-100">
                  <Settings className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-slate-900">Pipeline Generation Settings</h3>
              </div>
              <button
                onClick={() => setShowSettingsModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-5">
              {/* Company Profile Details */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <div className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
                  Company / Organization Profile
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Company Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Acme Systems Inc."
                      value={settingsForm.company}
                      onChange={(e) => setSettingsForm({ ...settingsForm, company: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Contact Email</label>
                    <input
                      type="email"
                      placeholder="e.g. info@acme.com"
                      value={settingsForm.email}
                      onChange={(e) => setSettingsForm({ ...settingsForm, email: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Phone Number</label>
                    <input
                      type="text"
                      placeholder="e.g. +1 800 555 0199"
                      value={settingsForm.phone}
                      onChange={(e) => setSettingsForm({ ...settingsForm, phone: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Business Address</label>
                    <input
                      type="text"
                      placeholder="e.g. New York, USA"
                      value={settingsForm.address}
                      onChange={(e) => setSettingsForm({ ...settingsForm, address: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Target Word Count Limit (Per Article)
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[500, 800, 1000, 1500].map((w) => (
                    <button
                      key={w}
                      type="button"
                      onClick={() => setSettingsForm({ ...settingsForm, wordCountLimit: w })}
                      className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                        Number(settingsForm.wordCountLimit) === w
                          ? "bg-purple-600 text-white border-purple-600 shadow-sm"
                          : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      {w} words
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Target Primary Keywords (Comma Separated)
                </label>
                <input
                  type="text"
                  value={settingsForm.targetKeywordsStr}
                  onChange={(e) => setSettingsForm({ ...settingsForm, targetKeywordsStr: e.target.value })}
                  placeholder="e.g. sales call tracking, whatsapp crm automation, lead management"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                />
                <p className="text-[11px] text-slate-500 mt-1">If left blank, keywords are automatically derived from audited SEORecords.</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Writing Tone Profile
                  </label>
                  <select
                    value={settingsForm.preferredTone}
                    onChange={(e) => setSettingsForm({ ...settingsForm, preferredTone: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                  >
                    <option value="Authoritative">Authoritative</option>
                    <option value="Conversational">Conversational</option>
                    <option value="Professional">Professional</option>
                    <option value="Persuasive">Persuasive</option>
                    <option value="Technical">Technical</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Daily Total Quota
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={settingsForm.dailyQuota}
                    onChange={(e) => setSettingsForm({ ...settingsForm, dailyQuota: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="p-4 bg-purple-50/60 rounded-2xl border border-purple-100 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-900">Auto-Fill Remaining Daily Quota</div>
                  <div className="text-[11px] text-slate-500">Automatically generate remaining articles up to {settingsForm.dailyQuota}/day</div>
                </div>
                <input
                  type="checkbox"
                  checked={settingsForm.autoFillRemaining}
                  onChange={(e) => setSettingsForm({ ...settingsForm, autoFillRemaining: e.target.checked })}
                  className="w-4 h-4 accent-purple-600 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowSettingsModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSavingSettings}
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                >
                  {isSavingSettings ? (
                    <>
                      <RotateCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5" />
                      <span>Save Settings</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

    </div>
  );
}

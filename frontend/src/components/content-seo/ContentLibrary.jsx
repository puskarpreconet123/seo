"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSeo } from "@/context/SeoContext";
import DocumentEditor from "./DocumentEditor";
import {
  Search,
  Clock,
  CheckCircle,
  AlertTriangle,
  Calendar,
  Eye,
  Edit3,
  X,
  RotateCw,
  BookOpen,
} from "lucide-react";

export default function ContentLibrary() {
  const { currentDomain } = useSeo();
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");

  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // 'all' | 'submitted' | 'scheduled' | 'failed'
  
  // Selected item for the full details view workspace
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedForm, setSelectedForm] = useState({ title: "", summary: "", keywords: "", body: "" });

  // Edit Modal State
  const [editingItem, setEditingItem] = useState(null);
  const [editForm, setEditForm] = useState({ title: "", summary: "", keywords: "", body: "" });
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [actionItemState, setActionItemState] = useState({});

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5000";

  const fetchLibraryData = async () => {
    if (!currentDomain) return;
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/content/library?domain=${currentDomain}`);
      const data = await response.json();
      if (data.success && data.items) {
        setItems(data.items);
      }
    } catch (err) {
      console.error("Error fetching content library:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLibraryData();
  }, [currentDomain]);

  useEffect(() => {
    if (editId && items.length > 0) {
      const foundItem = items.find((item) => item._id === editId);
      if (foundItem && foundItem.status === "scheduled") {
        openEditModal(foundItem);
      }
    }
  }, [editId, items]);

  const openViewDetails = (item) => {
    setSelectedItem(item);
    setSelectedForm({
      title: item.title,
      summary: item.summary || "",
      keywords: item.keywords || "",
      body: item.body || "",
    });
  };

  // Handle Edit Actions (similar to AutoContentQueue)
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
        router.push("/content-library");
        await fetchLibraryData();
      }
    } catch (err) {
      console.error("Error saving edits:", err);
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleSubmitNow = async (id) => {
    setActionItemState((prev) => ({ ...prev, [id]: "submitting" }));
    try {
      const res = await fetch(`${API_BASE_URL}/api/content/auto-queue/${id}/submit-now`, {
        method: "POST",
      });
      const data = await res.json();
      if (data.success) {
        await fetchLibraryData();
      }
    } catch (err) {
      console.error("Failed to submit item now:", err);
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
        await fetchLibraryData();
      }
    } catch (err) {
      console.error("Failed to delete item:", err);
    } finally {
      setActionItemState((prev) => ({ ...prev, [id]: null }));
    }
  };

  // Filter items based on search and status tabs
  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.keywords || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.summary || "").toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "all" || item.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Calculate status counts
  const stats = items.reduce(
    (acc, curr) => {
      acc.total++;
      if (curr.status === "submitted") acc.published++;
      else if (curr.status === "scheduled") acc.queued++;
      else if (curr.status === "failed") acc.failed++;
      return acc;
    },
    { total: 0, published: 0, queued: 0, failed: 0 }
  );

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Render DocumentEditor if editing an item
  if (editingItem) {
    return (
      <DocumentEditor
        item={editingItem}
        form={editForm}
        setForm={setEditForm}
        onClose={() => {
          setEditingItem(null);
          router.push("/content-library");
        }}
        onSave={handleSaveEdit}
        isSaving={isSavingEdit}
        onSubmitNow={handleSubmitNow}
        onDelete={() => {
          if (confirm("Are you sure you want to delete this article?")) {
            handleDeleteItem(editingItem._id);
            setEditingItem(null);
            router.push("/content-library");
          }
        }}
        actionItemState={actionItemState}
      />
    );
  }

  // Render DocumentEditor in read-only mode if viewing details of an item
  if (selectedItem) {
    return (
      <DocumentEditor
        item={selectedItem}
        form={selectedForm}
        setForm={setSelectedForm}
        onClose={() => setSelectedItem(null)}
        readOnly={true}
        actionItemState={{}}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header and Stats */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-slate-50 p-6 rounded-3xl border border-slate-200">
        <div>
          <h2 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-purple-600" />
            Content Library
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            View, filter, and edit all auto-generated content from the last 60 days.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs font-bold">
          <div className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-600 shadow-sm">
            Total Records: <span className="text-purple-600 font-black">{stats.total}</span>
          </div>
          <div className="px-4 py-2 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-700 shadow-sm">
            Published: <span className="font-black">{stats.published}</span>
          </div>
          <div className="px-4 py-2 bg-indigo-50 border border-indigo-100 rounded-xl text-indigo-700 shadow-sm">
            Queued: <span className="font-black">{stats.queued}</span>
          </div>
          {stats.failed > 0 && (
            <div className="px-4 py-2 bg-rose-50 border border-rose-100 rounded-xl text-rose-700 shadow-sm">
              Failed: <span className="font-black">{stats.failed}</span>
            </div>
          )}
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        {/* Status Filter Tabs */}
        <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200 w-full sm:w-auto">
          {[
            { id: "all", label: `All (${stats.total})` },
            { id: "submitted", label: `Published (${stats.published})` },
            { id: "scheduled", label: `Queued (${stats.queued})` },
            { id: "failed", label: `Failed (${stats.failed})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`flex-1 sm:flex-initial px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                statusFilter === tab.id
                  ? "bg-white text-purple-600 shadow-sm border border-slate-200"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search title or keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-xs border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 shadow-sm bg-white"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Grid of Small Cards */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-slate-50/50 rounded-3xl border border-slate-100">
          <RotateCw className="w-8 h-8 text-purple-600 animate-spin" />
          <p className="text-xs text-slate-500 font-bold mt-3">Loading library content...</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-slate-50/50 rounded-3xl border border-dashed border-slate-300 text-center px-6">
          <div className="p-4 bg-purple-50 rounded-full text-purple-600 mb-4">
            <BookOpen className="w-8 h-8" />
          </div>
          <h3 className="font-black text-slate-800 text-sm">No Content Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mt-1">
            {searchQuery || statusFilter !== "all"
              ? "Try adjusting your filters or search keywords to locate articles."
              : "No articles have been generated or scheduled in the last 60 days."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <div
              key={item._id}
              className="bg-white p-5 rounded-[2rem] border border-slate-200 shadow-sm hover:shadow-md transition-all hover:scale-[1.01] flex flex-col justify-between"
            >
              <div>
                {/* Header Status & Date */}
                <div className="flex items-center justify-between mb-3.5">
                  {item.status === "submitted" ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-700 text-[10px] font-bold">
                      <CheckCircle className="w-3 h-3" /> Live & Published
                    </span>
                  ) : item.status === "scheduled" ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-700 text-[10px] font-bold">
                      <Clock className="w-3 h-3" /> Queued
                    </span>
                  ) : (
                    <div className="flex flex-col gap-1">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-50 border border-rose-100 text-rose-700 text-[10px] font-bold w-max">
                        <AlertTriangle className="w-3 h-3" /> Failed
                      </span>
                      {item.submissionError && (
                        <span className="text-[10px] text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-100 font-medium">
                          Reason: {item.submissionError}
                        </span>
                      )}
                    </div>
                  )}
                  
                  <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {item.status === "submitted"
                      ? formatDate(item.submittedAt)
                      : formatDate(item.createdAt)}
                  </span>
                </div>

                {/* Article Title */}
                <h3 className="font-black text-slate-900 text-sm leading-snug line-clamp-2 hover:text-purple-600 transition-colors">
                  {item.title}
                </h3>

                {/* Article Keywords */}
                {item.keywords && (
                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    {item.keywords.split(",").slice(0, 3).map((kw, i) => (
                      <span
                        key={i}
                        className="text-[9px] font-semibold text-slate-500 bg-slate-50 px-2 py-0.5 rounded border border-slate-100"
                      >
                        {kw.trim()}
                      </span>
                    ))}
                  </div>
                )}

                {/* Summary / Body Snippet */}
                <p className="text-[11px] text-slate-500 font-medium leading-relaxed mt-3.5 line-clamp-3">
                  {item.summary || (item.body ? item.body.replace(/<[^>]+>/g, "").substring(0, 150) : "")}...
                </p>
              </div>

              {/* Actions footer */}
              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
                {item.status === "scheduled" && (
                  <button
                    onClick={() => openEditModal(item)}
                    className="px-3.5 py-2 border border-purple-200 text-purple-700 hover:bg-purple-50 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shadow-sm"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    Edit Content
                  </button>
                )}
                {item.status === "failed" && (
                  <button
                    onClick={() => handleSubmitNow(item._id)}
                    disabled={actionItemState[item._id] === "submitting"}
                    className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                  >
                    {actionItemState[item._id] === "submitting" ? (
                      <RotateCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <RotateCw className="w-3.5 h-3.5 text-rose-200" />
                    )}
                    Resubmit
                  </button>
                )}
                <button
                  onClick={() => openViewDetails(item)}
                  className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shadow-sm"
                >
                  <Eye className="w-3.5 h-3.5" />
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

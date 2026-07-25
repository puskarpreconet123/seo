"use client";

import React, { useState } from "react";
import { Sparkles, Send, Bot, User, Loader2, RefreshCw } from "lucide-react";
import { useSeo } from "@/context/SeoContext";

export default function WritingAssistantPage() {
  const { currentDomain } = useSeo();
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: `Hello! I am your AI SEO Assistant. Ask me questions about optimizing **${currentDomain}**, generating title tags, meta descriptions, FAQ schemas, or resolving technical SEO errors.`
    }
  ]);
  const [inputMsg, setInputMsg] = useState("");
  const [isSending, setIsSending] = useState(false);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5000";

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMsg.trim()) return;

    const userMessage = { role: "user", content: inputMsg };
    const updatedMessages = [...messages, userMessage];

    setMessages(updatedMessages);
    setInputMsg("");
    setIsSending(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/assistant/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updatedMessages }),
      });

      if (!res.ok) {
        throw new Error("AI Assistant query failed.");
      }

      const data = await res.json();
      setMessages([...updatedMessages, { role: "assistant", content: data.response }]);
    } catch (err) {
      setMessages([...updatedMessages, { role: "assistant", content: "Sorry, I encountered an error answering your question." }]);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-purple-600" />
            <h2 className="text-xl font-bold text-slate-800">AI SEO Copywriting Assistant</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Interact with GPT-4o for title rewrites, meta descriptions, FAQ schema additions, and SEO advice.
          </p>
        </div>
      </div>

      {/* Chat Container */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-[600px] overflow-hidden">
        {/* Messages History */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-50/50">
          {messages.map((msg, idx) => {
            const isUser = msg.role === "user";
            return (
              <div key={idx} className={`flex items-start gap-3 ${isUser ? "flex-row-reverse" : ""}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  isUser ? "bg-purple-600 text-white" : "bg-slate-800 text-purple-400"
                }`}>
                  {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>
                <div className={`p-4 rounded-xl max-w-[80%] text-xs font-medium leading-relaxed whitespace-pre-wrap ${
                  isUser ? "bg-purple-600 text-white shadow-sm" : "bg-white border border-slate-200 text-slate-800 shadow-xs"
                }`}>
                  {msg.content}
                </div>
              </div>
            );
          })}

          {isSending && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-slate-800 text-purple-400 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-3 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-500 flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-purple-600" /> Thinking...
              </div>
            </div>
          )}
        </div>

        {/* Input Form */}
        <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-slate-200 flex items-center gap-3">
          <input
            type="text"
            value={inputMsg}
            onChange={(e) => setInputMsg(e.target.value)}
            placeholder="Ask AI Assistant e.g. 'Rewrite my title tag' or 'Why is my SEO score low?'"
            className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
          />
          <button
            type="submit"
            disabled={isSending || !inputMsg.trim()}
            className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white text-xs font-bold rounded-lg shadow transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <Send className="w-4 h-4" /> Send
          </button>
        </form>
      </div>
    </div>
  );
}

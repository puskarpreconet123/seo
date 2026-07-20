import React, { useState, useEffect } from "react";
import { Star, MessageSquare, Phone, Calendar, ArrowUpRight, CheckCircle, ExternalLink, MapPin } from "lucide-react";

export default function GBPWidget({ gbpData }) {
  const [reviews, setReviews] = useState(gbpData?.recentReviews || []);
  const [replyInput, setReplyInput] = useState("");
  const [activeReplyIdx, setActiveReplyIdx] = useState(null);

  useEffect(() => {
    setReviews(gbpData?.recentReviews || []);
  }, [gbpData]);

  if (!gbpData) return null;

  const handleAddReply = async (idx) => {
    if (!replyInput.trim()) return;
    const review = reviews[idx];
    try {
      const res = await fetch("http://127.0.0.1:5000/api/seo-data/gbp/reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          domain: gbpData.domain || "example.com",
          author: review.author,
          replyText: replyInput,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          const updatedReviews = [...reviews];
          updatedReviews[idx].reply = replyInput;
          setReviews(updatedReviews);
        }
      }
    } catch (err) {
      console.error("Failed to submit review reply:", err);
    }
    setReplyInput("");
    setActiveReplyIdx(null);
  };

  // Star drawing logic
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<Star key={i} className="w-4.5 h-4.5 fill-amber-400 text-amber-400" />);
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(
          <div key={i} className="relative inline-block w-4.5 h-4.5">
            <Star className="absolute w-full h-full text-slate-200 fill-slate-200" />
            <div className="absolute w-1/2 overflow-hidden h-full">
              <Star className="w-4.5 h-4.5 fill-amber-400 text-amber-400" />
            </div>
          </div>
        );
      } else {
        stars.push(<Star key={i} className="w-4.5 h-4.5 text-slate-200 fill-slate-200" />);
      }
    }
    return stars;
  };

  const mapPercent = Math.round((gbpData.impressions.maps / gbpData.impressions.total) * 100);
  const searchPercent = 100 - mapPercent;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* GBP Overview & Insights Card */}
      <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between">
        <div>
          {/* Header */}
          <div className="flex justify-between items-start border-b border-slate-100 pb-4">
            <div className="flex gap-3">
              <div className="p-3 bg-blue-50 text-rankgenie-blue rounded-xl h-12 w-12 flex items-center justify-center shrink-0">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-base tracking-tight">{gbpData.businessName}</h3>
                <p className="text-xs font-semibold text-slate-400 flex items-center gap-1 mt-0.5">
                  Google Business Profile Managed Listing
                </p>
              </div>
            </div>
            <a
              href="https://business.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-rankgenie-blue hover:text-blue-700 text-xs font-bold flex items-center gap-1 bg-blue-50/50 hover:bg-blue-50 px-2.5 py-1.5 rounded-lg transition-colors shrink-0"
            >
              Manage
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {/* Rating Summary block */}
          <div className="flex items-center gap-6 mt-5 bg-slate-50 p-4 rounded-xl border border-slate-100">
            <div className="text-center shrink-0 pr-6 border-r border-slate-200">
              <div className="text-3xl font-extrabold text-slate-800">{gbpData.rating}</div>
              <div className="flex gap-0.5 mt-1 justify-center">
                {renderStars(gbpData.rating)}
              </div>
              <div className="text-[10px] text-slate-400 font-bold mt-1.5 uppercase tracking-wider">
                {gbpData.reviewsCount} Reviews
              </div>
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex justify-between text-xs font-semibold text-slate-600">
                <span>Google Maps Profile Views</span>
                <span>{gbpData.impressions.maps.toLocaleString()} ({mapPercent}%)</span>
              </div>
              {/* Comparative Progress Bar */}
              <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden flex">
                <div className="bg-rankgenie-blue h-full" style={{ width: `${mapPercent}%` }}></div>
                <div className="bg-rankgenie-orange h-full" style={{ width: `${searchPercent}%` }}></div>
              </div>
              <div className="flex justify-between text-xs font-semibold text-slate-600 pt-0.5">
                <span>Google Search Views</span>
                <span>{gbpData.impressions.search.toLocaleString()} ({searchPercent}%)</span>
              </div>
            </div>
          </div>

          {/* Customer Interactions Grid */}
          <div className="mt-6">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Customer Actions (30 days)</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-center hover:border-slate-200 transition-colors">
                <div className="text-xs font-bold text-slate-400">Call Actions</div>
                <div className="text-xl font-bold text-slate-800 mt-1 flex items-center justify-center gap-1.5">
                  <Phone className="w-4 h-4 text-emerald-500" />
                  {gbpData.interactions.calls}
                </div>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-center hover:border-slate-200 transition-colors">
                <div className="text-xs font-bold text-slate-400">Messages</div>
                <div className="text-xl font-bold text-slate-800 mt-1 flex items-center justify-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-cyan-500" />
                  {gbpData.interactions.messages}
                </div>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-center hover:border-slate-200 transition-colors">
                <div className="text-xs font-bold text-slate-400">Bookings</div>
                <div className="text-xl font-bold text-slate-800 mt-1 flex items-center justify-center gap-1.5">
                  <Calendar className="w-4 h-4 text-purple-500" />
                  {gbpData.interactions.bookings}
                </div>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-center hover:border-slate-200 transition-colors">
                <div className="text-xs font-bold text-slate-400">Website Clicks</div>
                <div className="text-xl font-bold text-slate-800 mt-1 flex items-center justify-center gap-1.5">
                  <ArrowUpRight className="w-4 h-4 text-rankgenie-orange" />
                  {gbpData.interactions.websiteClicks}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="text-[10px] text-slate-400 font-medium mt-4 pt-3 border-t border-slate-100 text-right">
          Insights pulled from Google Business Profile API
        </div>
      </div>

      {/* GBP Local Reviews Stream Card */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between">
        <div>
          <h3 className="font-bold text-slate-700 text-sm tracking-tight border-b border-slate-100 pb-3 mb-4">
            Recent Local Reviews
          </h3>
          <div className="space-y-4 max-h-[310px] overflow-y-auto pr-1">
            {reviews.map((rev, idx) => (
              <div key={idx} className="border-b border-slate-100 last:border-0 pb-3 last:pb-0 space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-xs text-slate-800">{rev.author}</span>
                  <span className="text-[10px] text-slate-400 font-semibold">{rev.time}</span>
                </div>
                <div className="flex gap-0.5">
                  {renderStars(rev.rating)}
                </div>
                <p className="text-xs text-slate-500 leading-relaxed italic">
                  &ldquo;{rev.text}&rdquo;
                </p>

                {/* Reply display / toggle */}
                {rev.reply ? (
                  <div className="bg-emerald-50/50 border border-emerald-100 p-2 rounded-lg mt-1 text-[11px] text-slate-600">
                    <span className="font-bold text-emerald-700 flex items-center gap-1 mb-0.5">
                      <CheckCircle className="w-3.5 h-3.5 fill-emerald-500 text-white" />
                      Replied
                    </span>
                    <span className="italic">&ldquo;{rev.reply}&rdquo;</span>
                  </div>
                ) : (
                  <div className="pt-1">
                    {activeReplyIdx === idx ? (
                      <div className="space-y-1.5 mt-1.5">
                        <textarea
                          rows={2}
                          value={replyInput}
                          onChange={(e) => setReplyInput(e.target.value)}
                          placeholder="Type customer reply..."
                          className="w-full text-xs p-1.5 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-orange-500/20 focus:border-rankgenie-orange"
                        />
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => setActiveReplyIdx(null)}
                            className="px-2 py-1 text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-600 rounded font-semibold transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleAddReply(idx)}
                            className="px-2.5 py-1 text-[10px] bg-rankgenie-orange hover:bg-rankgenie-orange/95 text-white rounded font-bold shadow-sm transition-colors"
                          >
                            Send Reply
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setActiveReplyIdx(idx);
                          setReplyInput("");
                        }}
                        className="text-rankgenie-orange hover:text-rankgenie-orange/90 text-[10px] font-bold tracking-wide uppercase hover:underline"
                      >
                        Reply to Review
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        <div className="text-[10px] text-slate-400 font-semibold mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
          <span>Active Listings: 1/1</span>
          <span className="text-rankgenie-success font-bold flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-rankgenie-success rounded-full animate-pulse"></span>
            Sync Active
          </span>
        </div>
      </div>
    </div>
  );
}

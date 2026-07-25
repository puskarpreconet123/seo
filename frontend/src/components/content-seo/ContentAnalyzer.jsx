"use client";

import React, { useState } from 'react';
import { 
  Sparkles, FileText, BookOpen, AlertTriangle, Search, Key, Layout, 
  HelpCircle, AlignLeft, Edit3, ClipboardList, CheckCircle2, ChevronRight,
  Info, ShieldAlert, Globe, Lightbulb
} from 'lucide-react';
import { useSeo } from '@/context/SeoContext';

export default function ContentAnalyzer() {
  const { seoData, currentDomain } = useSeo();
  const [activeSubTab, setActiveSubTab] = useState('detections');

  const contentAnalysis = seoData?.website?.fullAudit?.content_analysis || {};
  const aiOptimization = seoData?.website?.fullAudit?.ai_content_optimization || {};

  const wordCount = contentAnalysis.word_count ?? 430;
  const readabilityScore = contentAnalysis.readability_score ?? 65;
  const isThinContent = contentAnalysis.thin_content ?? (wordCount < 300);

  const subTabs = [
    { id: 'detections', label: 'Detections', icon: Search },
    { id: 'content-ideas', label: 'Content Ideas', icon: Sparkles },
    { id: 'topic-suggestions', label: 'Topic Suggestions', icon: ClipboardList },
    { id: 'faq-suggestions', label: 'FAQ Suggestions', icon: HelpCircle },
    { id: 'headings', label: 'Headings', icon: Layout },
    { id: 'rewrites', label: 'Rewrites', icon: Edit3 },
  ];

  return (
    <div className="w-full space-y-6">
      
      {/* Content Analyzer Header Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100 mb-6">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-500" />
            <h2 className="text-lg font-bold text-slate-800 tracking-tight">
              Content Analyzer: {currentDomain}
            </h2>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-slate-100 text-xs font-semibold text-slate-600">
              Word Count: <span className="font-bold text-slate-800">{wordCount}</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-sky-50 border border-sky-100 text-xs font-semibold text-sky-600">
              Readability: <span className="font-bold text-sky-700">{readabilityScore} / 100</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-slate-100 text-xs font-semibold text-slate-600">
              Semantic: <span className="font-bold text-slate-800">Moderate</span>
            </div>
            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold ${
              isThinContent ? "bg-rose-50 border border-rose-100 text-rose-600" : "bg-emerald-50 border border-emerald-100 text-emerald-600"
            }`}>
              <ShieldAlert className="w-3.5 h-3.5" /> {isThinContent ? "Thin Content" : "Sufficient Length"}
            </div>
          </div>
        </div>

        {/* Readability & Semantic Progress Bars */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Readability */}
          <div className="bg-slate-50 border border-slate-100 rounded-xl p-5 flex flex-col justify-between">
            <div className="flex justify-between items-center mb-3">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Readability Score</span>
              <span className="text-sm font-bold text-indigo-600">{readabilityScore} / 100</span>
            </div>
            <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden mb-3">
              <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full" style={{ width: `${readabilityScore}%` }}></div>
            </div>
            <span className="text-sm font-semibold text-slate-700">Standard Readability</span>
          </div>

          {/* Semantic Coverage */}
          <div className="bg-slate-50 border border-slate-100 rounded-xl p-5 flex flex-col justify-between">
            <div className="flex justify-between items-center mb-3">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Semantic Coverage</span>
              <span className="text-sm font-bold text-pink-600">55 / 100</span>
            </div>
            <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden mb-3">
              <div className="h-full bg-gradient-to-r from-pink-500 to-rose-500 rounded-full" style={{ width: '55%' }}></div>
            </div>
            <span className="text-sm font-semibold text-slate-700">Moderate Coverage</span>
          </div>
        </div>

        {/* Tabs Row */}
        <div className="flex flex-wrap justify-start gap-2 p-1.5 bg-slate-100/80 border border-slate-200 rounded-xl mt-6">
          {subTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-[12px] font-bold tracking-wide transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-white hover:text-slate-800'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                {tab.label.toUpperCase()}
              </button>
            );
          })}
        </div>

        {/* Tab Specific Content */}
        <div className="mt-6">
          {activeSubTab === 'detections' && (
            <div className="space-y-6">
              
              {/* Detections Core Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Missing Topics */}
                <div className="bg-slate-50/50 border border-slate-100 rounded-xl p-5 flex flex-col">
                  <div className="flex items-center gap-2 mb-4">
                    <Search className="w-4 h-4 text-blue-500" />
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                      Missing Topics
                    </h3>
                  </div>
                  <ul className="space-y-2 text-sm font-medium text-slate-700">
                    {['Search Engine Optimization', 'Cloud Computing Services', 'Artificial Intelligence Solutions', 'Blockchain Development', 'Cybersecurity Measures'].map((topic, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                        {topic}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Missing Keywords */}
                <div className="bg-slate-50/50 border border-slate-100 rounded-xl p-5 flex flex-col">
                  <div className="flex items-center gap-2 mb-4">
                    <Key className="w-4 h-4 text-amber-500" />
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                      Missing Keywords
                    </h3>
                  </div>
                  <ul className="space-y-2 text-sm font-medium text-slate-700">
                    {['digital transformation', 'custom software solutions', 'mobile app development services', 'website design company', 'IT consulting services', 'technology innovation'].map((kw, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                        {kw}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Weak Headings */}
                <div className="bg-slate-50/50 border border-slate-100 rounded-xl p-5 flex flex-col">
                  <div className="flex items-center gap-2 mb-4">
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                      Weak Headings
                    </h3>
                  </div>
                  <div className="space-y-3">
                    <div className="bg-white p-3 rounded-lg border border-slate-100">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 font-bold text-[10px]">h2</span>
                        <span className="font-bold text-slate-800 text-sm">CAREERS</span>
                      </div>
                      <p className="text-xs text-slate-500 font-medium">Generic heading without context or keywords.</p>
                    </div>
                    <div className="bg-white p-3 rounded-lg border border-slate-100">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 font-bold text-[10px]">h3</span>
                        <span className="font-bold text-slate-800 text-sm">How does Preconet works?</span>
                      </div>
                      <p className="text-xs text-slate-500 font-medium">Grammatically incorrect and lacks target keywords.</p>
                    </div>
                  </div>
                </div>

                {/* Duplicate Paragraphs */}
                <div className="bg-slate-50/50 border border-slate-100 rounded-xl p-5 flex flex-col">
                  <div className="flex items-center gap-2 mb-4">
                    <AlignLeft className="w-4 h-4 text-blue-500" />
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                      Duplicate Paragraphs
                    </h3>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-slate-100 flex items-start gap-3">
                    <span className="px-1.5 py-0.5 rounded bg-rose-100 text-rose-600 font-bold text-[10px] shrink-0 mt-0.5">x2</span>
                    <p className="text-xs text-slate-500 font-medium leading-relaxed">
                      "We share your passion for giving your best to those you care about. With solutions that are secure, compliant and stand the test of time- you can enable better living for people and communities."
                    </p>
                  </div>
                </div>

              </div>

              {/* Semantic Gaps full width card */}
              <div className="bg-slate-50/50 border border-slate-100 rounded-xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Globe className="w-4 h-4 text-indigo-500" />
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                    Semantic Gaps
                  </h3>
                </div>
                <ul className="space-y-2 text-sm font-medium text-slate-700">
                  {['Lack of detailed service descriptions.', 'Limited information on industry-specific solutions.', 'Missing case studies or success stories.'].map((gap, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                      {gap}
                    </li>
                  ))}
                </ul>
              </div>

            </div>
          )}

          {activeSubTab === 'content-ideas' && (
            <div className="space-y-4">
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-5 flex items-start gap-4">
                <div className="p-2 bg-amber-50 rounded-lg border border-amber-100 shrink-0">
                  <Lightbulb className="w-5 h-5 text-amber-500" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-slate-800 text-sm">
                    The Future of Digital Marketing: Trends to Watch
                  </h4>
                  <p className="text-xs text-slate-500 leading-relaxed font-medium">
                    Introduction to digital marketing trends, emerging technologies, impact on businesses, and future predictions.
                  </p>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-100 rounded-xl p-5 flex items-start gap-4">
                <div className="p-2 bg-amber-50 rounded-lg border border-amber-100 shrink-0">
                  <Lightbulb className="w-5 h-5 text-amber-500" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-slate-800 text-sm">
                    Comprehensive Guide to Custom Software Development
                  </h4>
                  <p className="text-xs text-slate-500 leading-relaxed font-medium">
                    Overview of custom software, benefits, development process, and choosing the right partner.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeSubTab === 'topic-suggestions' && (
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-6">
              <ul className="space-y-3.5 text-sm font-semibold text-slate-600">
                {['Emerging Technologies in IT', 'Sustainable IT Solutions', 'Customer-Centric Digital Strategies', 'Data Privacy and Security', 'The Role of AI in Business Growth'].map((topic, idx) => (
                  <li key={idx} className="flex items-center gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0"></span>
                    <span>{topic}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {activeSubTab === 'faq-suggestions' && (
            <div className="space-y-4">
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-5 flex items-start gap-4">
                <div className="p-2 bg-blue-50 rounded-lg border border-blue-100 shrink-0">
                  <HelpCircle className="w-5 h-5 text-blue-500" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-slate-800 text-sm">
                    What services does Preconet offer?
                  </h4>
                  <p className="text-xs text-slate-500 leading-relaxed font-medium">
                    Preconet offers mobile app development, website development, eCommerce solutions, and digital marketing services.
                  </p>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-100 rounded-xl p-5 flex items-start gap-4">
                <div className="p-2 bg-blue-50 rounded-lg border border-blue-100 shrink-0">
                  <HelpCircle className="w-5 h-5 text-blue-500" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-slate-800 text-sm">
                    How can Preconet help my business grow?
                  </h4>
                  <p className="text-xs text-slate-500 leading-relaxed font-medium">
                    Preconet uses data-driven strategies to optimize ads, increase sales, and improve ROI for businesses.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeSubTab === 'headings' && (
            <div className="space-y-3">
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 flex items-center gap-3">
                <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-700 font-bold text-xs">h3</span>
                <span className="font-bold text-slate-800 text-[14px]">Our Approach to Digital Transformation</span>
              </div>
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 flex items-center gap-3">
                <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-700 font-bold text-xs">h3</span>
                <span className="font-bold text-slate-800 text-[14px]">Client Success Stories</span>
              </div>
            </div>
          )}

          {activeSubTab === 'rewrites' && (
            <div className="space-y-4">
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-5 space-y-3">
                <div className="flex items-center gap-3">
                  <span className="px-2 py-0.5 rounded bg-rose-500 text-white font-bold text-[10px] uppercase">Before</span>
                  <span className="text-slate-500 italic text-sm font-medium">How does Preconet works?</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-2 py-0.5 rounded bg-emerald-600 text-white font-bold text-[10px] uppercase">After</span>
                  <span className="text-slate-800 font-bold text-sm">How Preconet Works: A Comprehensive Overview</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-400 pl-1">
                  <Info className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-[11px] font-semibold">Improves grammar and clarity while adding context.</span>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-100 rounded-xl p-5 space-y-3">
                <div className="flex items-center gap-3">
                  <span className="px-2 py-0.5 rounded bg-rose-500 text-white font-bold text-[10px] uppercase">Before</span>
                  <span className="text-slate-500 italic text-sm font-medium">CAREERS</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-2 py-0.5 rounded bg-emerald-600 text-white font-bold text-[10px] uppercase">After</span>
                  <span className="text-slate-800 font-bold text-sm">Join Our Team: Careers at Preconet</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-400 pl-1">
                  <Info className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-[11px] font-semibold">Provides a call to action and context.</span>
                </div>
              </div>
            </div>
          )}

          {activeSubTab !== 'detections' && activeSubTab !== 'content-ideas' && activeSubTab !== 'topic-suggestions' && activeSubTab !== 'faq-suggestions' && activeSubTab !== 'headings' && activeSubTab !== 'rewrites' && (
            <div className="text-center py-12 text-slate-400 font-medium text-sm">
              All optimizations are loaded. No further improvements needed for this section.
            </div>
          )}
        </div>
      </div>

      {/* Critical Deficiencies, Warnings, Passed Audits */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Critical Deficiencies */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs">!</span>
            <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider">
              Critical Deficiencies ( 1 )
            </h3>
          </div>
          <div className="bg-white p-4 rounded-xl border border-rose-100 bg-rose-50/30 flex flex-col mt-2">
            <span className="text-xs font-bold text-rose-600 uppercase tracking-wider mb-2">Broken Links</span>
            <p className="text-[13px] text-slate-500 font-medium leading-relaxed">
              Broken internal link(s) detected: <span className="text-blue-600 break-all">https://preconetindia.com/career.html</span> returned status 404. Total broken internal links: 1.
            </p>
          </div>
        </div>

        {/* Warnings & Advisories */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex flex-col space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs">▲</span>
            <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider">
              Warnings & Advisories ( 2 )
            </h3>
          </div>
          <div className="bg-white p-4 rounded-xl border border-amber-100 bg-amber-50/30 flex flex-col">
            <span className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-2">Twitter Cards</span>
            <p className="text-[13px] text-slate-500 font-medium leading-relaxed">
              Twitter Card tags are missing. Adding them ensures correct page previews on Twitter/X.
            </p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-amber-100 bg-amber-50/30 flex flex-col">
            <span className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-2">Schema</span>
            <p className="text-[13px] text-slate-500 font-medium leading-relaxed">
              JSON-LD schema structured data is missing. Add structured markup to gain rich search engine snippets.
            </p>
          </div>
        </div>

        {/* Passed Audits */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle2 className="w-5 h-5 text-slate-900" />
            <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider">
              Passed Audits ( 13 )
            </h3>
          </div>
          
          {/* Scrollable Container */}
          <div className="max-h-[320px] overflow-y-auto space-y-3 pr-2 scrollbar-thin">
            {[
              { title: 'HTTPS', desc: 'Website connection is secure (HTTPS).' },
              { title: 'ROBOTS.TXT', desc: 'robots.txt is accessible (HTTP status 200).' },
              { title: 'SITEMAP.XML', desc: 'sitemap.xml was successfully located (HTTP status 200).' },
              { title: 'CANONICAL', desc: 'Canonical link tag matches current page URL correctly.' },
            ].map((audit, i) => (
              <div key={i} className="bg-white p-4 rounded-xl border border-emerald-100 bg-emerald-50/30 flex flex-col">
                <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1">{audit.title}</span>
                <p className="text-[13px] text-slate-500 font-medium leading-relaxed">{audit.desc}</p>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { ListChecks, CheckCircle2, XCircle } from 'lucide-react';

const CHECKLIST_DATA = [
  // Technical SEO (5/5)
  { status: 'success', check: 'HTTPS/SSL Security', category: 'Technical SEO', recommendation: 'Site is secured over HTTPS using SSL.', priority: 'Low' },
  { status: 'success', check: 'Robots.txt File Configuration', category: 'Technical SEO', recommendation: 'Robots.txt is correctly configured.', priority: 'Low' },
  { status: 'success', check: 'XML Sitemap', category: 'Technical SEO', recommendation: 'XML sitemap exists and is valid.', priority: 'Low' },
  { status: 'success', check: 'Canonical Tag Configuration', category: 'Technical SEO', recommendation: 'Canonical tag is correctly declared: https://preconetindia.com/', priority: 'Low' },
  { status: 'success', check: 'Search Engine Indexability', category: 'Technical SEO', recommendation: 'Page indexation is not blocked by search engines.', priority: 'Low' },
  
  // On Page SEO (5/5)
  { status: 'success', check: 'Page Title Length (30-60 chars)', category: 'On Page SEO', recommendation: 'Page title length is optimal (59 chars).', priority: 'Low' },
  { status: 'success', check: 'Meta Description Length (50-160 chars)', category: 'On Page SEO', recommendation: 'Meta description length is optimal (142 chars).', priority: 'Low' },
  { status: 'success', check: 'Single H1 Header Tag', category: 'On Page SEO', recommendation: 'Exactly one H1 tag is configured.', priority: 'Low' },
  { status: 'success', check: 'H2/H3 Subheadings Structure', category: 'On Page SEO', recommendation: 'Subheadings exist to structure content.', priority: 'Low' },
  { status: 'success', check: 'Friendly URL Slug', category: 'On Page SEO', recommendation: 'URL slug is SEO friendly.', priority: 'Low' },
  
  // Content SEO (2/5)
  { status: 'success', check: 'Content Word Count (>= 300)', category: 'Content SEO', recommendation: 'Page has a solid word count (430 words).', priority: 'Low' },
  { status: 'success', check: 'Content Readability', category: 'Content SEO', recommendation: 'Flesch Reading Ease score is readable (65).', priority: 'Low' },
  { status: 'error', check: 'Semantic Topical Coverage', category: 'Content SEO', recommendation: 'Add related LSI keyword concepts to enrich content depth.', priority: 'Medium' },
  { status: 'error', check: 'Unique Content (No Duplicate Text)', category: 'Content SEO', recommendation: 'Rewrite repetitive or copy-pasted paragraph blocks.', priority: 'Medium' },
  { status: 'error', check: 'Optimal Headings (No Keyword Stuffing)', category: 'Content SEO', recommendation: 'Refactor unnatural keyword-stuffed headings.', priority: 'Low' },
  
  // Image SEO (3/3)
  { status: 'success', check: 'Image Alt Attributes', category: 'Image SEO', recommendation: 'All image elements have ALT attributes.', priority: 'Low' },
  { status: 'success', check: 'Optimized Image Payloads', category: 'Image SEO', recommendation: 'All images are compressed and optimized.', priority: 'Low' },
  { status: 'success', check: 'Broken Image Elements', category: 'Image SEO', recommendation: 'No broken image assets detected.', priority: 'Low' },
  
  // Schema (0/3)
  { status: 'error', check: 'JSON-LD Schema Markup', category: 'Schema', recommendation: 'Add JSON-LD structure metadata to support rich snippets.', priority: 'Medium' },
  { status: 'error', check: 'Valid Schema Syntax', category: 'Schema', recommendation: 'Resolve syntax warnings and errors in your schema declarations.', priority: 'High' },
  { status: 'error', check: 'Recommended Schema Entity Types', category: 'Schema', recommendation: 'Configure recommended schema entities (Organization, Website, or Article).', priority: 'Medium' },
  
  // Performance (0/5)
  { status: 'error', check: 'First Contentful Paint (FCP <= 2.5s)', category: 'Performance', recommendation: 'Improve FCP (3412.86 ms). Optimize render-blocking CSS/JS resources.', priority: 'Medium' },
  { status: 'error', check: 'Largest Contentful Paint (LCP <= 3.0s)', category: 'Performance', recommendation: 'Improve LCP (4912.86 ms). Defer offscreen images and preload critical elements.', priority: 'High' },
  { status: 'error', check: 'Cumulative Layout Shift (CLS <= 0.1)', category: 'Performance', recommendation: 'Improve CLS (0.8). Set explicit height and width on dynamic frames.', priority: 'High' },
  { status: 'error', check: 'Time To First Byte (TTFB <= 800ms)', category: 'Performance', recommendation: 'Improve TTFB server latency (2602.86 ms). Enable edge-caching.', priority: 'Medium' },
  { status: 'error', check: 'Page Load Time (<= 4.0s)', category: 'Performance', recommendation: 'Reduce heavy payloads to lower load time (8000.0 ms).', priority: 'Medium' },
  
  // Links (2/4)
  { status: 'error', check: 'Dead/Broken Internal & External Links', category: 'Links', recommendation: 'Fix the 2 dead links returning error status codes.', priority: 'High' },
  { status: 'success', check: 'Redirect Chains Optimization', category: 'Links', recommendation: 'No redirect chain links found.', priority: 'Low' },
  { status: 'error', check: 'Descriptive Link Anchors (No Empty Anchors)', category: 'Links', recommendation: 'Add descriptive texts to the 1 links with empty anchors.', priority: 'Medium' },
  { status: 'success', check: 'Unique Anchor Destinations', category: 'Links', recommendation: 'Anchor texts are distinct per destination.', priority: 'Low' },
];

const priorityConfig = {
  'High': 'bg-rose-500 text-white',
  'Medium': 'bg-amber-400 text-white',
  'Low': 'bg-slate-500 text-white',
};

const filterTabs = [
  'All (30)',
  'Technical SEO (5/5)',
  'On Page SEO (5/5)',
  'Content SEO (2/5)',
  'Image SEO (3/3)',
  'Schema (0/3)',
  'Performance (0/5)',
  'Links (2/4)'
];

export default function ConsolidatedSeoChecklist() {
  const [activeTab, setActiveTab] = useState('All (30)');

  const getFilteredData = () => {
    if (activeTab === 'All (30)') return CHECKLIST_DATA;
    // Extract base category name (e.g. 'Technical SEO' from 'Technical SEO (5/5)')
    const categoryName = activeTab.replace(/\s\(\d+\/\d+\)$/, '');
    return CHECKLIST_DATA.filter(item => item.category === categoryName);
  };

  const filteredData = getFilteredData();

  return (
    <>
    <style dangerouslySetInnerHTML={{__html: `
      @keyframes moveStripes {
        from { background-position: 0 0; }
        to { background-position: 1rem 0; }
      }
      .animate-stripes {
        background-image: linear-gradient(
          45deg,
          rgba(255, 255, 255, 0.25) 25%,
          transparent 25%,
          transparent 50%,
          rgba(255, 255, 255, 0.25) 50%,
          rgba(255, 255, 255, 0.25) 75%,
          transparent 75%,
          transparent
        );
        background-size: 1rem 1rem;
        animation: moveStripes 1s linear infinite;
      }
    `}} />
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden flex flex-col w-full mt-6">
      {/* Header and Progress */}
      <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <ListChecks className="w-5 h-5 text-slate-500" strokeWidth={1.5} />
          <h3 className="font-semibold text-slate-600 text-sm tracking-wide uppercase">
            Consolidated SEO Checklist
          </h3>
        </div>
        
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="w-full sm:w-48 h-2.5 bg-slate-100 rounded-full overflow-hidden relative shadow-inner">
            <div 
              className="absolute top-0 left-0 h-full bg-blue-500 rounded-full" 
              style={{ width: `56%` }}
            >
              {/* Continuous barber pole background animation */}
              <div className="absolute inset-0 animate-stripes" />
            </div>
          </div>
          <span className="text-sm font-bold text-blue-600 whitespace-nowrap w-24 text-right">
            56% Completed
          </span>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="px-6 py-4 border-b border-slate-100 flex overflow-x-auto gap-1 hide-scrollbar">
        {filterTabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-md text-[13px] font-medium whitespace-nowrap transition-colors ${
              activeTab === tab 
                ? 'border border-slate-300 text-slate-800 bg-white shadow-sm'
                : 'text-slate-500 hover:text-slate-800 border border-transparent'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>
      
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[900px]">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/50">
              <th className="py-4 px-6 text-xs font-bold text-slate-800 uppercase tracking-wider w-[80px]">Status</th>
              <th className="py-4 px-6 text-xs font-bold text-slate-800 uppercase tracking-wider w-[280px]">Audit Check</th>
              <th className="py-4 px-6 text-xs font-bold text-slate-800 uppercase tracking-wider w-[140px]">Category</th>
              <th className="py-4 px-6 text-xs font-bold text-slate-800 uppercase tracking-wider">Actionable Recommendation</th>
              <th className="py-4 px-6 text-xs font-bold text-slate-800 uppercase tracking-wider text-right w-[100px]">Priority</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredData.map((item, index) => (
              <tr key={index} className="hover:bg-slate-50/50 transition-colors">
                <td className="py-5 px-6">
                  <div className="flex justify-center">
                    {item.status === 'success' ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-50" strokeWidth={2} />
                    ) : (
                      <XCircle className="w-5 h-5 text-rose-500 fill-rose-50" strokeWidth={2} />
                    )}
                  </div>
                </td>
                <td className="py-5 px-6 text-[13px] font-bold text-slate-700">
                  {item.check}
                </td>
                <td className="py-5 px-6">
                  <span className="inline-block text-center px-2.5 py-1 bg-slate-100 text-slate-500 rounded-full text-[10px] font-bold uppercase tracking-wider">
                    {item.category}
                  </span>
                </td>
                <td className="py-5 px-6 text-[13px] text-slate-500 font-medium">
                  {item.recommendation}
                </td>
                <td className="py-5 px-6 text-right">
                  <span className={`inline-block px-2.5 py-0.5 w-full text-center rounded text-[11px] font-bold ${priorityConfig[item.priority]}`}>
                    {item.priority}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
    </>
  );
}

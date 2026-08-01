import React, { useState, useEffect } from 'react';
import { useSeo } from '@/context/SeoContext';
import { ListChecks, CheckCircle2, XCircle } from 'lucide-react';

const priorityConfig = {
  'CRITICAL': 'bg-rose-600 text-white',
  'HIGH': 'bg-rose-500 text-white',
  'MEDIUM': 'bg-amber-500 text-white',
  'LOW': 'bg-slate-400 text-white'
};

export default function ConsolidatedSeoChecklist() {
  const { seoData } = useSeo();
  
  const checklist = seoData?.website?.fullAudit?.seo_checklist || seoData?.fullAudit?.seo_checklist || null;

  // Flatten categories into checklistItems format
  const checklistItems = [];
  const filterTabs = ['All'];
  let totalCompleted = 0;
  let totalCount = 0;

  if (checklist && Array.isArray(checklist.categories)) {
    totalCompleted = checklist.categories.reduce((acc, cat) => acc + (cat.completed_count || 0), 0);
    totalCount = checklist.categories.reduce((acc, cat) => acc + (cat.total_count || 0), 0);

    checklist.categories.forEach(cat => {
      filterTabs.push(`${cat.category_name} (${cat.completed_count}/${cat.total_count})`);

      if (Array.isArray(cat.items)) {
        cat.items.forEach(item => {
          checklistItems.push({
            status: item.status === 'Completed' ? 'success' : 'fail',
            check: item.name || '',
            category: cat.category_name,
            recommendation: item.recommendation || '',
            priority: (item.priority || 'LOW').toUpperCase()
          });
        });
      }
    });

    filterTabs[0] = `All (${totalCompleted}/${totalCount})`;
  } else {
    // Default fallback values if no checklist data is present yet
    filterTabs.push(
      'Technical SEO (0/0)',
      'On Page SEO (0/0)',
      'Content SEO (0/0)',
      'Image SEO (0/0)',
      'Schema (0/0)',
      'Performance (0/0)',
      'Links (0/0)'
    );
  }

  const [activeTab, setActiveTab] = useState(null);

  useEffect(() => {
    if (filterTabs.length > 0) {
      const exists = filterTabs.includes(activeTab);
      if (!exists) {
        setActiveTab(filterTabs[0]);
      }
    }
  }, [seoData, activeTab]);

  const getFilteredData = () => {
    if (!activeTab || activeTab.startsWith('All')) return checklistItems;
    // Extract base category name (e.g. 'Technical SEO' from 'Technical SEO (5/5)')
    const categoryName = activeTab.replace(/\s\(\d+\/\d+\)$/, '');
    return checklistItems.filter(item => item.category === categoryName);
  };

  const filteredData = getFilteredData();
  const progressPercent = totalCount > 0 ? Math.round((totalCompleted / totalCount) * 100) : 0;

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
              style={{ width: `${progressPercent}%` }}
            >
              {/* Continuous barber pole background animation */}
              <div className="absolute inset-0 animate-stripes" />
            </div>
          </div>
          <span className="text-sm font-bold text-blue-600 whitespace-nowrap w-24 text-right">
            {progressPercent}% Completed
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

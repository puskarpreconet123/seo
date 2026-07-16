import React, { useState } from 'react';
import { 
  ClipboardList, Calendar, Trophy, Zap, Rocket, TrendingUp, Clock, Check
} from 'lucide-react';

const ALL_TASKS = [
  // TODAY
  { id: 1, tab: 'TODAY', priority: 'CRITICAL', difficulty: 'Easy', time: '45 mins', title: 'Fix Broken Internal Hyperlink', desc: 'Correct internal URLs to active, indexable resources.', completed: false },
  { id: 2, tab: 'TODAY', priority: 'HIGH', difficulty: 'Easy', time: '15 mins', title: 'Add Keyword to Title Tag', desc: 'Revise title tag to include primary keyword.', completed: false },
  { id: 3, tab: 'TODAY', priority: 'HIGH', difficulty: 'Easy', time: '15 mins', title: 'Add Keyword to H1 Heading', desc: 'Edit H1 heading to include the focus keyword.', completed: false },
  
  // THIS WEEK
  { id: 4, tab: 'THIS WEEK', priority: 'HIGH', difficulty: 'Medium', time: '2 hours', title: 'Resolve Broken Links', desc: 'Audit and fix broken internal link(s) on the site.', completed: false },
  { id: 5, tab: 'THIS WEEK', priority: 'HIGH', difficulty: 'Medium', time: '1 hour', title: 'Fix Schema Structured Data Errors', desc: 'Correct schema fields to conform to Schema.org standards.', completed: false },
  { id: 6, tab: 'THIS WEEK', priority: 'HIGH', difficulty: 'Easy', time: '30 mins', title: 'Fix Broken Outbound Links', desc: 'Replace or remove broken external links.', completed: false },
  
  // THIS MONTH
  { id: 7, tab: 'THIS MONTH', priority: 'HIGH', difficulty: 'Hard', time: '2 hours', title: 'Fix Render-Blocking Resources', desc: 'Add async/defer to scripts and inline critical styles.', completed: true },
  { id: 8, tab: 'THIS MONTH', priority: 'HIGH', difficulty: 'Medium', time: '2 hours', title: 'Add Structured Data', desc: 'Implement JSON-LD or Microdata for rich snippets.', completed: false },
  { id: 9, tab: 'THIS MONTH', priority: 'HIGH', difficulty: 'Easy', time: '30 mins', title: 'Fix Broken URLs in Sitemap', desc: 'Remove non-200 URLs from the XML sitemap.', completed: false },

  // TOP 10 FIXES
  { id: 10, tab: 'TOP 10 FIXES', priority: 'CRITICAL', difficulty: 'Easy', time: '45 mins', title: 'Fix Broken Internal Hyperlink', desc: 'Correct internal URLs to active, indexable resources.', completed: false },
  { id: 11, tab: 'TOP 10 FIXES', priority: 'HIGH', difficulty: 'Medium', time: '2 hours', title: 'Resolve Broken Links', desc: 'Audit and fix broken internal link(s) on the site.', completed: false },
  { id: 12, tab: 'TOP 10 FIXES', priority: 'HIGH', difficulty: 'Medium', time: '1 hour', title: 'Fix Schema Structured Data Errors', desc: 'Correct schema fields to conform to Schema.org standards.', completed: false },
  { id: 13, tab: 'TOP 10 FIXES', priority: 'HIGH', difficulty: 'Easy', time: '15 mins', title: 'Add Keyword to Title Tag', desc: 'Revise title tag to include primary keyword.', completed: false },

  // HIGH IMPACT
  { id: 14, tab: 'HIGH IMPACT', priority: 'CRITICAL', difficulty: 'Easy', time: '45 mins', title: 'Fix Broken Internal Hyperlink', desc: 'Correct internal URLs to active, indexable resources.', completed: false },
  { id: 15, tab: 'HIGH IMPACT', priority: 'HIGH', difficulty: 'Medium', time: '2 hours', title: 'Resolve Broken Links', desc: 'Audit and fix broken internal link(s) on the site.', completed: false },
  { id: 16, tab: 'HIGH IMPACT', priority: 'HIGH', difficulty: 'Medium', time: '1 hour', title: 'Fix Schema Structured Data Errors', desc: 'Correct schema fields to conform to Schema.org standards.', completed: false },
  { id: 17, tab: 'HIGH IMPACT', priority: 'HIGH', difficulty: 'Easy', time: '15 mins', title: 'Add Keyword to Title Tag', desc: 'Revise title tag to include primary keyword.', completed: false },

  // LONG TERM
  { id: 18, tab: 'LONG TERM', priority: 'MEDIUM', difficulty: 'Hard', time: '2 hours', title: 'Optimize Unused CSS', desc: 'Prune unused CSS using tools like PurgeCSS.', completed: false },
  { id: 19, tab: 'LONG TERM', priority: 'MEDIUM', difficulty: 'Hard', time: '3 hours', title: 'Optimize Unused JavaScript', desc: 'Split code libraries into dynamic modules.', completed: false },
  { id: 20, tab: 'LONG TERM', priority: 'MEDIUM', difficulty: 'Medium', time: '30 mins', title: 'Implement Browser Cache Policy', desc: 'Add cache-control to static assets.', completed: false },
  { id: 21, tab: 'LONG TERM', priority: 'HIGH', difficulty: 'Hard', time: 'Ongoing', title: 'Link Building Strategy', desc: 'Develop a robust backlink acquisition strategy to build domain authority.', completed: false },

  // QUICK WINS
  { id: 22, tab: 'QUICK WINS', priority: 'CRITICAL', difficulty: 'Easy', time: '45 mins', title: 'Fix Broken Internal Hyperlink', desc: 'Correct internal URLs to active, indexable resources.', completed: false },
  { id: 23, tab: 'QUICK WINS', priority: 'HIGH', difficulty: 'Easy', time: '15 mins', title: 'Add Keyword to Title Tag', desc: 'Revise title tag to include primary keyword.', completed: false },
  { id: 24, tab: 'QUICK WINS', priority: 'HIGH', difficulty: 'Easy', time: '15 mins', title: 'Add Keyword to H1 Heading', desc: 'Edit H1 heading to include the focus keyword.', completed: false },
  { id: 25, tab: 'QUICK WINS', priority: 'HIGH', difficulty: 'Easy', time: '30 mins', title: 'Fix Broken Outbound Links', desc: 'Replace or remove broken external links.', completed: false },
  { id: 26, tab: 'QUICK WINS', priority: 'HIGH', difficulty: 'Easy', time: '30 mins', title: 'Fix Broken URLs in Sitemap', desc: 'Remove non-200 URLs from the XML sitemap.', completed: false },
];

const TABS = [
  { id: 'TODAY', label: 'TODAY', icon: Calendar },
  { id: 'THIS WEEK', label: 'THIS WEEK', icon: Calendar },
  { id: 'THIS MONTH', label: 'THIS MONTH', icon: Calendar },
  { id: 'TOP 10 FIXES', label: 'TOP 10 FIXES', icon: Trophy },
  { id: 'QUICK WINS', label: 'QUICK WINS', icon: Zap },
  { id: 'HIGH IMPACT', label: 'HIGH IMPACT', icon: Rocket },
  { id: 'LONG TERM', label: 'LONG TERM', icon: TrendingUp },
];

export default function SeoPriorityActionPlan() {
  const [activeTab, setActiveTab] = useState('TODAY');
  const [tasks, setTasks] = useState(ALL_TASKS);
  
  const displayTasks = tasks.filter(t => t.tab === activeTab);
  
  // Calculate progress based on unique task titles to avoid double counting duplicates across tabs
  const uniqueTitles = new Set(tasks.map(t => t.title));
  const totalTasks = uniqueTitles.size;
  const completedUniqueTitles = new Set(tasks.filter(t => t.completed).map(t => t.title));
  const completedTasks = completedUniqueTitles.size;
  const progressPercent = Math.round((completedTasks / totalTasks) * 100) || 0;

  const toggleTaskCompletion = (taskTitle) => {
    setTasks(prevTasks => prevTasks.map(t => 
      t.title === taskTitle ? { ...t, completed: !t.completed } : t
    ));
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] overflow-hidden w-full mt-6">
      {/* Header */}
      <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <ClipboardList className="w-5 h-5 text-emerald-600" strokeWidth={2} />
          <h3 className="font-bold text-slate-800 text-[13px] tracking-wide uppercase">
            Personalized SEO Action Plan
          </h3>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-[13px] font-medium text-slate-500">Improvement:</span>
            <span className="px-3 py-1 rounded-md bg-emerald-600 text-white font-bold text-[12px]">
              +20-25% Search Traffic Potential
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[13px] font-medium text-slate-500">Est. Effort:</span>
            <span className="font-bold text-slate-800 text-[13px]">
              8-10 hours total
            </span>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6 bg-slate-50/50">
        
        {/* Progress Bar */}
        <div className="bg-slate-100/50 border border-slate-200 rounded-xl p-4">
          <div className="flex justify-between items-center mb-3">
            <span className="text-[13px] font-bold text-slate-500">Action Plan Implementation Progress</span>
            <span className="text-[13px] font-bold text-emerald-600">{progressPercent}% Completed ({completedTasks}/{totalTasks} Tasks)</span>
          </div>
          <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-emerald-500 rounded-full transition-all duration-500" 
              style={{ width: `${progressPercent}%` }}
            >
              {/* Optional stripe effect */}
              <div className="w-full h-full opacity-20" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, #000 10px, #000 20px)' }}></div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap justify-center gap-1.5 p-1 bg-slate-100 rounded-lg mx-auto w-fit border border-slate-200">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-md text-[12px] font-bold tracking-wide uppercase transition-colors ${
                  isActive 
                    ? 'bg-blue-600 text-white shadow-sm' 
                    : 'text-slate-600 hover:bg-white hover:text-slate-800'
                }`}
              >
                <Icon className={`w-4 h-4 ${
                  isActive ? 'text-white' : 
                  tab.id === 'TOP 10 FIXES' ? 'text-amber-500' : 
                  tab.id === 'QUICK WINS' ? 'text-orange-500' : 
                  tab.id === 'HIGH IMPACT' ? 'text-rose-500' :
                  tab.id === 'LONG TERM' ? 'text-indigo-500' :
                  'text-blue-400'
                }`} strokeWidth={2.5} />
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* Task List */}
        <div className="space-y-3">
          {displayTasks.map((task) => (
            <div 
              key={task.id} 
              onClick={() => toggleTaskCompletion(task.title)}
              className={`bg-white border rounded-xl p-4 flex items-start gap-4 transition-all cursor-pointer select-none ${
                task.completed ? 'border-slate-200 opacity-60' : 'border-slate-200 hover:border-slate-300 shadow-sm'
              }`}
            >
              <div className="pt-1">
                <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                  task.completed ? 'bg-blue-500 border-blue-500 text-white' : 'border-slate-300 bg-white hover:border-blue-400'
                }`}>
                  {task.completed && <Check className="w-3.5 h-3.5" strokeWidth={3} />}
                </div>
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider ${
                    task.priority === 'CRITICAL' ? 'bg-rose-500 text-white' : 
                    task.priority === 'HIGH' ? 'bg-amber-400 text-white' : 'bg-cyan-500 text-white'
                  }`}>
                    {task.priority}
                  </span>
                  <span className={`px-2 py-0.5 rounded border text-[11px] font-bold ${
                    task.difficulty === 'Easy' ? 'border-emerald-500 text-emerald-600' : 
                    task.difficulty === 'Medium' ? 'border-amber-400 text-amber-500' : 
                    'border-rose-300 text-rose-400'
                  }`}>
                    {task.difficulty}
                  </span>
                </div>
                <h4 className={`font-bold text-[14px] ${task.completed ? 'text-slate-500 line-through' : 'text-slate-800'}`}>
                  {task.title}
                </h4>
                <p className={`text-[13px] mt-0.5 ${task.completed ? 'text-slate-400' : 'text-slate-500'}`}>
                  {task.desc}
                </p>
              </div>

              <div className={`flex items-center gap-1.5 pt-1 ${task.completed ? 'text-slate-400' : 'text-slate-500'}`}>
                <Clock className="w-4 h-4" strokeWidth={2} />
                <span className="text-[13px] font-medium font-mono">{task.time}</span>
              </div>
            </div>
          ))}

          {displayTasks.length === 0 && (
            <div className="text-center py-12 text-slate-400 font-medium text-sm">
              No tasks available for this section.
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

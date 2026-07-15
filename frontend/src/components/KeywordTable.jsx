import React, { useState } from "react";
import { ArrowUpDown, Search, ArrowUp, ArrowDown, HelpCircle } from "lucide-react";

export default function KeywordTable({ keywords = [] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("volume");
  const [sortAsc, setSortAsc] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Intent colors mapping
  const intentBadge = (intent) => {
    switch (intent) {
      case "Transactional":
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-red-50 text-red-600 border border-red-100">T</span>;
      case "Commercial":
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-blue-50 text-blue-600 border border-blue-100">C</span>;
      case "Informational":
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-green-50 text-green-600 border border-green-100">I</span>;
      case "Navigational":
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-amber-50 text-amber-600 border border-amber-100">N</span>;
      default:
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-slate-50 text-slate-500 border border-slate-100">-</span>;
    }
  };

  // Keyword Difficulty indicator color
  const getKdColorClass = (kd) => {
    if (kd <= 30) return { bg: "bg-emerald-500", text: "text-emerald-700" };
    if (kd <= 49) return { bg: "bg-amber-400", text: "text-amber-700" };
    if (kd <= 79) return { bg: "bg-orange-500", text: "text-orange-700" };
    return { bg: "bg-red-500", text: "text-red-700" };
  };

  // Handle sort toggle
  const handleSort = (field) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false); // default to descending
    }
  };

  // Filter
  const filteredKeywords = keywords.filter((item) =>
    item.keyword.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sort logic
  const sortedKeywords = [...filteredKeywords].sort((a, b) => {
    let valA = a[sortField];
    let valB = b[sortField];

    if (typeof valA === "string") {
      valA = valA.toLowerCase();
      valB = valB.toLowerCase();
    }

    if (valA < valB) return sortAsc ? -1 : 1;
    if (valA > valB) return sortAsc ? 1 : -1;
    return 0;
  });

  // Paginate logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedKeywords.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sortedKeywords.length / itemsPerPage);

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-all duration-200">
      {/* Header Panel */}
      <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="font-bold text-slate-700 text-sm tracking-tight">Top Organic Keywords</h3>
          <p className="text-xs text-slate-400 font-medium mt-0.5">Top performing queries bringing visitors to the site</p>
        </div>
        <div className="relative w-full sm:w-64">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <input
            type="text"
            placeholder="Search keywords..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="block w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-slate-50 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-1 focus:ring-orange-500/20 focus:border-semrush-orange transition-all"
          />
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
          <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider">
            <tr>
              <th scope="col" className="px-6 py-3.5 select-none cursor-pointer hover:bg-slate-100" onClick={() => handleSort("keyword")}>
                <div className="flex items-center gap-1">
                  Keyword
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th scope="col" className="px-6 py-3.5 select-none cursor-pointer hover:bg-slate-100" onClick={() => handleSort("intent")}>
                <div className="flex items-center gap-1">
                  Intent
                  <span className="group relative">
                    <HelpCircle className="w-3 h-3 text-slate-400 cursor-help" />
                    <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 w-44 bg-slate-800 text-white text-[9px] normal-case rounded p-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-20 shadow-md leading-relaxed font-normal">
                      Search intent: (T)ransactional, (C)ommercial, (I)nformational, (N)avigational
                    </span>
                  </span>
                </div>
              </th>
              <th scope="col" className="px-6 py-3.5 select-none cursor-pointer hover:bg-slate-100" onClick={() => handleSort("position")}>
                <div className="flex items-center gap-1">
                  Pos.
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th scope="col" className="px-6 py-3.5 select-none cursor-pointer hover:bg-slate-100" onClick={() => handleSort("volume")}>
                <div className="flex items-center gap-1">
                  Volume
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th scope="col" className="px-6 py-3.5 select-none cursor-pointer hover:bg-slate-100" onClick={() => handleSort("kd")}>
                <div className="flex items-center gap-1">
                  KD %
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th scope="col" className="px-6 py-3.5 select-none cursor-pointer hover:bg-slate-100" onClick={() => handleSort("trafficPercent")}>
                <div className="flex items-center gap-1">
                  Traffic %
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-100 text-slate-600">
            {currentItems.length > 0 ? (
              currentItems.map((item, idx) => {
                const kdTheme = getKdColorClass(item.kd);
                return (
                  <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-6 py-3.5 font-bold text-slate-800">{item.keyword}</td>
                    <td className="px-6 py-3.5">{intentBadge(item.intent)}</td>
                    <td className="px-6 py-3.5">
                      <span className="font-semibold text-slate-700">{item.position}</span>
                    </td>
                    <td className="px-6 py-3.5 font-semibold">{item.volume.toLocaleString()}</td>
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-slate-700 w-8">{item.kd}%</span>
                        <div className="w-12 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                          <div className={`h-full ${kdTheme.bg}`} style={{ width: `${item.kd}%` }}></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-3.5 font-semibold text-slate-700">{item.trafficPercent}%</td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="6" className="px-6 py-8 text-center text-slate-400 font-semibold">
                  No matching keywords found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between mt-auto">
          <span className="text-xs text-slate-400 font-semibold">
            Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredKeywords.length)} of {filteredKeywords.length} keywords
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 border border-slate-300 rounded text-xs font-semibold bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:pointer-events-none transition-colors"
            >
              Prev
            </button>
            {Array.from({ length: totalPages }).map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentPage(idx + 1)}
                className={`w-8 h-8 rounded text-xs font-bold transition-colors ${
                  currentPage === idx + 1
                    ? "bg-semrush-orange text-white"
                    : "border border-slate-300 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                {idx + 1}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 border border-slate-300 rounded text-xs font-semibold bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:pointer-events-none transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

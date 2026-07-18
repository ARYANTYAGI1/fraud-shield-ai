'use client';

import React, { useEffect, useState, useCallback } from 'react';
import api from '../../utils/api';
import { History, Search, Filter, Loader2, ChevronLeft, ChevronRight, X, AlertTriangle, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Scan {
  _id: string;
  scanType: string;
  inputData: string;
  result: {
    riskScore: number;
    category: string;
    confidence: number;
    reasons: string[];
    recommendation: string;
    redFlags: string[];
  };
  createdAt: string;
}

const riskColor = (score: number) => {
  if (score < 20) return '#10b981';
  if (score < 50) return '#f59e0b';
  if (score < 75) return '#ef4444';
  return '#dc2626';
};

const scanTypeColors: Record<string, string> = {
  text: '#00f0ff', url: '#a855f7', image: '#f59e0b', pdf: '#10b981', audio: '#ef4444',
};

export default function HistoryPage() {
  const [scans, setScans] = useState<Scan[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [scanTypeFilter, setScanTypeFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedScan, setSelectedScan] = useState<Scan | null>(null);

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: '12',
        ...(search && { search }),
        ...(scanTypeFilter && { scanType: scanTypeFilter }),
        ...(categoryFilter && { category: categoryFilter }),
      });
      const res = await api.get(`/history?${params}`);
      setScans(res.data.scans || []);
      setTotalPages(res.data.pagination?.pages || 1);
      setTotal(res.data.pagination?.total || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, search, scanTypeFilter, categoryFilter]);

  useEffect(() => { fetchHistory(); }, [fetchHistory]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchHistory();
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-white">Scan History</h2>
          <p className="text-sm text-gray-400">{total} total records</p>
        </div>
      </div>

      {/* Filters */}
      <div className="cyber-card p-4 rounded-xl flex flex-col sm:flex-row gap-3">
        <form onSubmit={handleSearch} className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              id="history-search"
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search scans..."
              className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-[#0a1628] border border-[rgba(255,255,255,0.07)] text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-[#00f0ff] transition-all"
            />
          </div>
          <button
            type="submit"
            id="history-search-btn"
            className="cyber-button px-4 py-2 rounded-lg text-sm"
          >
            Search
          </button>
        </form>

        <div className="flex gap-2">
          <select
            id="history-type-filter"
            value={scanTypeFilter}
            onChange={(e) => { setScanTypeFilter(e.target.value); setPage(1); }}
            className="px-3 py-2 rounded-lg bg-[#0a1628] border border-[rgba(255,255,255,0.07)] text-sm text-gray-300 focus:outline-none focus:border-[#00f0ff]"
          >
            <option value="">All Types</option>
            <option value="text">Text</option>
            <option value="url">URL</option>
            <option value="image">Image</option>
            <option value="pdf">PDF</option>
          </select>
          <select
            id="history-category-filter"
            value={categoryFilter}
            onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
            className="px-3 py-2 rounded-lg bg-[#0a1628] border border-[rgba(255,255,255,0.07)] text-sm text-gray-300 focus:outline-none focus:border-[#00f0ff]"
          >
            <option value="">All Risk Levels</option>
            <option value="Safe">Safe</option>
            <option value="Suspicious">Suspicious</option>
            <option value="Fraud">Fraud</option>
            <option value="High Risk Scam">High Risk Scam</option>
          </select>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center h-48">
          <Loader2 className="w-8 h-8 text-[#00f0ff] animate-spin" />
        </div>
      ) : scans.length === 0 ? (
        <div className="cyber-card p-12 rounded-2xl text-center">
          <History className="w-10 h-10 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400">No scans found. Adjust your filters or run a new scan.</p>
        </div>
      ) : (
        <div className="cyber-card rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.02)]">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Preview</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Risk</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(255,255,255,0.03)]">
                {scans.map((scan) => (
                  <tr
                    key={scan._id}
                    onClick={() => setSelectedScan(scan)}
                    className="hover:bg-[rgba(0,240,255,0.03)] cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-3 text-gray-400 text-xs font-mono whitespace-nowrap">
                      {new Date(scan.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="text-xs font-mono uppercase px-2 py-1 rounded"
                        style={{ background: `${scanTypeColors[scan.scanType] || '#fff'}15`, color: scanTypeColors[scan.scanType] || '#ccc' }}
                      >
                        {scan.scanType}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-300 max-w-[280px]">
                      <p className="truncate">{scan.inputData}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-bold font-mono" style={{ color: riskColor(scan.result?.riskScore) }}>
                        {scan.result?.riskScore ?? '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="text-xs px-2 py-1 rounded-full border font-semibold"
                        style={{
                          background: `${riskColor(scan.result?.riskScore)}15`,
                          borderColor: `${riskColor(scan.result?.riskScore)}40`,
                          color: riskColor(scan.result?.riskScore),
                        }}
                      >
                        {scan.result?.category}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-4 py-4 border-t border-[rgba(255,255,255,0.05)] flex items-center justify-between">
            <p className="text-xs text-gray-500">Page {page} of {totalPages}</p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 rounded-lg border border-[rgba(255,255,255,0.07)] text-gray-400 hover:text-white disabled:opacity-30"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 rounded-lg border border-[rgba(255,255,255,0.07)] text-gray-400 hover:text-white disabled:opacity-30"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedScan && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            onClick={() => setSelectedScan(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="cyber-card w-full max-w-lg p-6 rounded-2xl max-h-[80vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-white">Scan Detail</h3>
                <button onClick={() => setSelectedScan(null)} className="text-gray-500 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div
                className="text-3xl font-bold font-mono mb-1"
                style={{ color: riskColor(selectedScan.result?.riskScore) }}
              >
                {selectedScan.result?.riskScore} / 100
              </div>
              <p className="text-xs text-gray-500 mb-4">Risk Score — {selectedScan.result?.category} ({selectedScan.result?.confidence}% confidence)</p>

              <div className="space-y-4">
                <div>
                  <p className="text-xs font-mono text-gray-500 uppercase mb-2">Input</p>
                  <p className="text-sm text-gray-300 bg-[#0a1628] p-3 rounded-lg font-mono break-all">{selectedScan.inputData}</p>
                </div>

                {selectedScan.result?.redFlags?.length > 0 && (
                  <div>
                    <p className="text-xs font-mono text-red-400 uppercase mb-2 flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" /> Red Flags
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {selectedScan.result.redFlags.map((f, i) => (
                        <span key={i} className="text-xs px-2 py-1 rounded bg-red-950/40 text-red-400 border border-red-800/40">{f}</span>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <p className="text-xs font-mono text-gray-500 uppercase mb-2">Analysis</p>
                  <ul className="space-y-1.5">
                    {selectedScan.result?.reasons?.map((r, i) => (
                      <li key={i} className="text-sm text-gray-300 flex gap-2">
                        <span className="text-[#00f0ff]">•</span>{r}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-3 rounded-xl bg-[rgba(0,240,255,0.04)] border border-[rgba(0,240,255,0.12)]">
                  <p className="text-xs font-mono text-[#00f0ff] uppercase mb-1 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> Recommendation
                  </p>
                  <p className="text-sm text-gray-200">{selectedScan.result?.recommendation}</p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

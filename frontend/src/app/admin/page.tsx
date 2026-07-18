'use client';

import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck,
  Users,
  Scan,
  Activity,
  Trash2,
  Loader2,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react';
import { motion } from 'framer-motion';

interface AdminStats {
  totalUsers: number;
  totalScans: number;
  totalAuditLogs: number;
  scanTypes: Record<string, number>;
  riskCategories: Record<string, number>;
}

const riskColor = (category: string) => {
  const map: Record<string, string> = {
    Safe: '#10b981', Suspicious: '#f59e0b', Fraud: '#ef4444', 'High Risk Scam': '#dc2626', Critical: '#dc2626',
  };
  return map[category] || '#9ca3af';
};

export default function AdminPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [scans, setScans] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'stats' | 'users' | 'scans'>('stats');
  const [loading, setLoading] = useState(true);
  const [scanPage, setScanPage] = useState(1);
  const [scanTotalPages, setScanTotalPages] = useState(1);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  // Redirect non-admins
  useEffect(() => {
    if (user && user.role !== 'admin') {
      router.push('/dashboard');
    }
  }, [user, router]);

  useEffect(() => {
    fetchStats();
    fetchUsers();
    fetchScans();
  }, []);

  useEffect(() => {
    fetchScans();
  }, [scanPage]);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/stats');
      setStats(res.data);
    } catch (err) {
      console.error('Admin stats error', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await api.get('/admin/users?limit=20');
      setUsers(res.data.users || []);
    } catch (err) { console.error(err); }
  };

  const fetchScans = async () => {
    try {
      const res = await api.get(`/admin/scans?page=${scanPage}&limit=15`);
      setScans(res.data.scans || []);
      setScanTotalPages(res.data.pagination?.pages || 1);
    } catch (err) { console.error(err); }
  };

  const handleDeleteScan = async (id: string) => {
    setDeletingId(id);
    try {
      await api.delete(`/admin/scans/${id}`);
      setScans(prev => prev.filter(s => s._id !== id));
      setConfirmDelete(null);
    } catch (err) { console.error(err); }
    finally { setDeletingId(null); }
  };

  if (!user || user.role !== 'admin') return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <ShieldCheck className="w-7 h-7 text-[#00f0ff]" />
        <div>
          <h2 className="text-xl font-bold text-white">Admin Console</h2>
          <p className="text-sm text-gray-400">Platform-wide management and oversight</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-[rgba(255,255,255,0.07)] pb-1">
        {([
          { id: 'stats', label: 'Statistics', icon: Activity },
          { id: 'users', label: 'Users', icon: Users },
          { id: 'scans', label: 'Scan Logs', icon: Scan },
        ] as const).map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            id={`admin-tab-${id}`}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg transition-all ${
              activeTab === id
                ? 'text-[#00f0ff] border-b-2 border-[#00f0ff] bg-[rgba(0,240,255,0.05)]'
                : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            <Icon className="w-4 h-4" /> {label}
          </button>
        ))}
      </div>

      {/* Stats Tab */}
      {activeTab === 'stats' && (
        <div className="space-y-5">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 text-[#00f0ff] animate-spin" />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: 'Total Users', value: stats?.totalUsers, color: '#00f0ff', icon: Users },
                  { label: 'Total Scans', value: stats?.totalScans, color: '#a855f7', icon: Scan },
                  { label: 'Audit Events', value: stats?.totalAuditLogs, color: '#f59e0b', icon: Activity },
                  { label: 'Threat Types', value: Object.keys(stats?.riskCategories || {}).length, color: '#10b981', icon: ShieldCheck },
                ].map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <motion.div
                      key={item.label}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.08 }}
                      className="cyber-card p-5 rounded-xl"
                    >
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-3"
                        style={{ background: `${item.color}1a`, border: `1px solid ${item.color}40` }}>
                        <Icon className="w-5 h-5" style={{ color: item.color }} />
                      </div>
                      <p className="text-3xl font-bold mb-1" style={{ color: item.color }}>{item.value ?? '—'}</p>
                      <p className="text-xs text-gray-500 uppercase tracking-wider font-mono">{item.label}</p>
                    </motion.div>
                  );
                })}
              </div>

              {/* Risk Category Distribution */}
              <div className="cyber-card p-6 rounded-xl">
                <h3 className="font-bold text-gray-200 mb-4">Risk Distribution</h3>
                <div className="space-y-3">
                  {Object.entries(stats?.riskCategories || {}).map(([cat, count]) => {
                    const maxVal = Math.max(...Object.values(stats?.riskCategories || {}), 1);
                    return (
                      <div key={cat} className="flex items-center gap-3">
                        <span className="text-sm text-gray-400 w-28">{cat}</span>
                        <div className="flex-1 h-2 bg-[rgba(255,255,255,0.05)] rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${((count as number) / maxVal) * 100}%` }}
                            transition={{ duration: 0.8, delay: 0.1 }}
                            className="h-full rounded-full"
                            style={{ background: riskColor(cat) }}
                          />
                        </div>
                        <span className="text-sm font-mono font-bold w-8 text-right" style={{ color: riskColor(cat) }}>
                          {count as number}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="cyber-card rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.02)]">
                <tr>
                  <th className="px-4 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-4 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-4 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-4 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">Verified</th>
                  <th className="px-4 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(255,255,255,0.03)]">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-[rgba(255,255,255,0.02)]">
                    <td className="px-4 py-3 text-gray-200 font-medium">{u.name}</td>
                    <td className="px-4 py-3 text-gray-400 font-mono text-xs">{u.email}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded font-mono ${u.role === 'admin' ? 'bg-[rgba(0,240,255,0.1)] text-[#00f0ff]' : 'bg-[rgba(255,255,255,0.05)] text-gray-400'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold ${u.isVerified ? 'text-[#10b981]' : 'text-gray-600'}`}>
                        {u.isVerified ? '✓ Verified' : 'Unverified'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs font-mono">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Scans Tab */}
      {activeTab === 'scans' && (
        <div className="space-y-3">
          <div className="cyber-card rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.02)]">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs text-gray-500 uppercase">Date</th>
                    <th className="px-4 py-3 text-left text-xs text-gray-500 uppercase">User</th>
                    <th className="px-4 py-3 text-left text-xs text-gray-500 uppercase">Type</th>
                    <th className="px-4 py-3 text-left text-xs text-gray-500 uppercase">Risk</th>
                    <th className="px-4 py-3 text-left text-xs text-gray-500 uppercase">Category</th>
                    <th className="px-4 py-3 text-left text-xs text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[rgba(255,255,255,0.03)]">
                  {scans.map((scan) => (
                    <tr key={scan._id} className="hover:bg-[rgba(255,255,255,0.02)]">
                      <td className="px-4 py-3 text-gray-500 text-xs font-mono">{new Date(scan.createdAt).toLocaleDateString()}</td>
                      <td className="px-4 py-3 text-gray-400 text-xs">{(scan.userId as any)?.email || 'Unknown'}</td>
                      <td className="px-4 py-3">
                        <span className="text-xs font-mono uppercase px-1.5 py-0.5 rounded bg-[rgba(0,240,255,0.08)] text-[#00f0ff]">
                          {scan.scanType}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-bold font-mono text-sm" style={{ color: riskColor(scan.result?.category) }}>
                        {scan.result?.riskScore}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs font-semibold" style={{ color: riskColor(scan.result?.category) }}>
                          {scan.result?.category}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          id={`delete-scan-${scan._id}`}
                          onClick={() => setConfirmDelete(scan._id)}
                          className="text-red-500 hover:text-red-400 p-1.5 rounded hover:bg-red-950/20"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-4 py-3 border-t border-[rgba(255,255,255,0.05)] flex items-center justify-between">
              <p className="text-xs text-gray-500">Page {scanPage} of {scanTotalPages}</p>
              <div className="flex gap-2">
                <button onClick={() => setScanPage(p => Math.max(1, p - 1))} disabled={scanPage === 1}
                  className="p-1.5 rounded border border-[rgba(255,255,255,0.07)] text-gray-400 hover:text-white disabled:opacity-30">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button onClick={() => setScanPage(p => Math.min(scanTotalPages, p + 1))} disabled={scanPage === scanTotalPages}
                  className="p-1.5 rounded border border-[rgba(255,255,255,0.07)] text-gray-400 hover:text-white disabled:opacity-30">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Confirm Delete Modal */}
          {confirmDelete && (
            <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center">
              <div className="cyber-card p-6 rounded-2xl w-full max-w-sm text-center">
                <Trash2 className="w-10 h-10 text-red-400 mx-auto mb-3" />
                <h3 className="font-bold text-white mb-2">Delete This Scan?</h3>
                <p className="text-sm text-gray-400 mb-5">This action cannot be undone.</p>
                <div className="flex gap-3">
                  <button onClick={() => setConfirmDelete(null)} className="flex-1 py-2.5 rounded-lg border border-[rgba(255,255,255,0.1)] text-gray-400 hover:text-white text-sm">
                    Cancel
                  </button>
                  <button
                    onClick={() => handleDeleteScan(confirmDelete)}
                    disabled={!!deletingId}
                    className="flex-1 py-2.5 rounded-lg bg-red-700 hover:bg-red-600 text-white text-sm flex items-center justify-center gap-2"
                  >
                    {deletingId ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

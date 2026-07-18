'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import {
  Shield,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Scan,
  Loader2,
  RefreshCw,
  Activity,
} from 'lucide-react';
import { motion } from 'framer-motion';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

interface DashboardData {
  totalScans: number;
  categoryCounts: {
    Safe: number;
    Suspicious: number;
    Fraud: number;
    'High Risk Scam': number;
    Critical: number;
  };
  recentScans: any[];
  trendData: { _id: string; averageRisk: number; count: number }[];
}

const categoryConfig = [
  { key: 'Safe', color: '#10b981', icon: CheckCircle, label: 'Safe' },
  { key: 'Suspicious', color: '#f59e0b', icon: AlertTriangle, label: 'Suspicious' },
  { key: 'Fraud', color: '#ef4444', icon: Shield, label: 'Fraud' },
  { key: 'High Risk Scam', color: '#dc2626', icon: AlertTriangle, label: 'High Risk' },
];

const scanTypeColors: Record<string, string> = {
  text: '#00f0ff',
  url: '#a855f7',
  image: '#f59e0b',
  pdf: '#10b981',
  audio: '#ef4444',
};

const riskColor = (score: number) => {
  if (score < 20) return '#10b981';
  if (score < 50) return '#f59e0b';
  if (score < 75) return '#ef4444';
  return '#dc2626';
};

export default function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboard = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/dashboard');
      setData(res.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load dashboard stats');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDashboard(); }, []);

  const trendChartData = data?.trendData.map(d => ({
    date: d._id,
    risk: Math.round(d.averageRisk),
    scans: d.count,
  })) || [];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-[#00f0ff] mx-auto mb-3 animate-spin" />
          <p className="text-gray-400 text-sm">Loading intelligence dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="cyber-card p-6 rounded-2xl flex items-center justify-between"
      >
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">
            Welcome back, <span className="text-[#00f0ff] glow-text-primary">{user?.name}</span>
          </h2>
          <p className="text-gray-400 text-sm">
            Your account has performed{' '}
            <span className="text-white font-semibold">{data?.totalScans || 0}</span> scans
          </p>
        </div>
        <button
          onClick={fetchDashboard}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm text-gray-400 hover:text-[#00f0ff] border border-[rgba(255,255,255,0.07)] hover:border-[rgba(0,240,255,0.2)] transition-all"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {categoryConfig.map((cat, i) => {
          const Icon = cat.icon;
          const count = data?.categoryCounts[cat.key as keyof typeof data.categoryCounts] || 0;
          return (
            <motion.div
              key={cat.key}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.08 }}
              className="cyber-card p-5 rounded-xl"
            >
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center mb-3"
                style={{ background: `${cat.color}1a`, border: `1px solid ${cat.color}40` }}
              >
                <Icon className="w-5 h-5" style={{ color: cat.color }} />
              </div>
              <p
                className="text-3xl font-bold mb-1"
                style={{ color: cat.color }}
              >
                {count}
              </p>
              <p className="text-xs text-gray-500 uppercase tracking-wider font-mono">{cat.label}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Trend Chart */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="cyber-card p-6 rounded-2xl"
      >
        <div className="flex items-center gap-2 mb-6">
          <Activity className="w-5 h-5 text-[#00f0ff]" />
          <h3 className="font-bold text-gray-200">Risk Trend — Last 7 Days</h3>
        </div>

        {trendChartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={trendChartData}>
              <defs>
                <linearGradient id="riskGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00f0ff" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#00f0ff" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis
                dataKey="date"
                tick={{ fill: '#6b7280', fontSize: 11 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fill: '#6b7280', fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                domain={[0, 100]}
              />
              <Tooltip
                contentStyle={{
                  background: '#0d1e36',
                  border: '1px solid rgba(0,240,255,0.2)',
                  borderRadius: '8px',
                  color: '#f3f4f6',
                  fontSize: '12px',
                }}
                labelStyle={{ color: '#00f0ff' }}
              />
              <Area
                type="monotone"
                dataKey="risk"
                stroke="#00f0ff"
                strokeWidth={2}
                fill="url(#riskGrad)"
                name="Avg. Risk Score"
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[220px] flex items-center justify-center text-gray-500 text-sm">
            <div className="text-center">
              <TrendingUp className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p>No scan data yet. Perform a scan to see trend data.</p>
            </div>
          </div>
        )}
      </motion.div>

      {/* Recent Scans Table */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
        className="cyber-card p-6 rounded-2xl"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Scan className="w-5 h-5 text-[#00f0ff]" />
            <h3 className="font-bold text-gray-200">Recent Scans</h3>
          </div>
          <a href="/history" className="text-xs text-[#00f0ff] hover:underline">
            View All →
          </a>
        </div>

        {error && (
          <p className="text-red-400 text-sm text-center py-4">{error}</p>
        )}

        {data?.recentScans?.length === 0 && (
          <p className="text-gray-500 text-sm text-center py-8">
            No scans yet. Go to the Scanner tab to analyze your first message.
          </p>
        )}

        <div className="space-y-2 overflow-hidden">
          {data?.recentScans?.slice(0, 8).map((scan: any) => (
            <div
              key={scan._id}
              className="flex items-center gap-4 p-3 rounded-lg bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.03)] hover:bg-[rgba(255,255,255,0.04)] transition-colors"
            >
              {/* Risk Score Badge */}
              <div className="flex-shrink-0 w-11 h-11 rounded-lg flex items-center justify-center border text-sm font-bold font-mono"
                style={{
                  background: `${riskColor(scan.result?.riskScore)}15`,
                  borderColor: `${riskColor(scan.result?.riskScore)}40`,
                  color: riskColor(scan.result?.riskScore),
                }}
              >
                {scan.result?.riskScore}
              </div>

              {/* Type Badge + Input Preview */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span
                    className="text-xs font-mono uppercase px-1.5 py-0.5 rounded"
                    style={{
                      background: `${scanTypeColors[scan.scanType] || '#fff'}15`,
                      color: scanTypeColors[scan.scanType] || '#ccc',
                    }}
                  >
                    {scan.scanType}
                  </span>
                  <span className="text-xs text-gray-500 font-mono">
                    {new Date(scan.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm text-gray-300 truncate">{scan.inputData}</p>
              </div>

              {/* Category */}
              <span
                className="flex-shrink-0 text-xs font-semibold px-2 py-1 rounded-full border font-mono"
                style={{
                  background: `${riskColor(scan.result?.riskScore)}15`,
                  borderColor: `${riskColor(scan.result?.riskScore)}40`,
                  color: riskColor(scan.result?.riskScore),
                }}
              >
                {scan.result?.category}
              </span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

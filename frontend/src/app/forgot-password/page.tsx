'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import api from '../../utils/api';
import { Shield, Mail, Loader2, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSuccess('');
    setLoading(true);
    try {
      const res = await api.post('/auth/forgot-password', { email });
      setSuccess(res.data.message || 'Reset link has been sent. Check the backend console logs for the link (test mode).');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send reset instructions.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#030712] cyber-grid-bg px-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="cyber-card w-full max-w-md p-8 rounded-2xl"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[rgba(245,158,11,0.1)] border border-[rgba(245,158,11,0.3)] mb-4">
            <Mail className="w-8 h-8 text-[#f59e0b]" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">Forgot Password</h1>
          <p className="text-sm text-gray-400">Enter your email to receive reset instructions</p>
        </div>

        {success && (
          <div className="mb-5 p-3 rounded-lg bg-green-950/30 border border-green-800/40 text-sm text-green-400">
            {success}
          </div>
        )}
        {error && (
          <div className="mb-5 p-3 rounded-lg bg-red-950/30 border border-red-800/40 text-sm text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="forgot-email" className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">
              Email Address
            </label>
            <input
              id="forgot-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
              className="w-full px-4 py-3 rounded-lg bg-[#0a1628] border border-[rgba(255,255,255,0.1)] text-gray-200 placeholder-gray-600 focus:outline-none focus:border-[#f59e0b] transition-all text-sm"
            />
          </div>
          <button
            type="submit"
            id="forgot-submit-btn"
            disabled={loading}
            className="w-full py-3 rounded-lg text-sm flex items-center justify-center gap-2 font-semibold bg-gradient-to-r from-[#f59e0b] to-[#d97706] text-[#050b14] hover:shadow-[0_0_20px_rgba(245,158,11,0.4)] transition-all disabled:opacity-60"
          >
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" />Sending...</> : <><Mail className="w-4 h-4" />Send Reset Link</>}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link href="/login" className="text-sm text-gray-500 hover:text-gray-300 flex items-center justify-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Login
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

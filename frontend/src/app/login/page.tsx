'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import { Shield, Eye, EyeOff, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message || 'Login failed. Check credentials and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#030712] cyber-grid-bg relative overflow-hidden px-4">
      {/* Ambient glow */}
      <div className="absolute top-1/4 left-1/3 w-96 h-96 rounded-full bg-[#00f0ff]/5 blur-[100px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="cyber-card w-full max-w-md p-8 rounded-2xl border border-[rgba(0,240,255,0.15)]"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#00f0ff]/20 to-[#0072ff]/20 border border-[rgba(0,240,255,0.3)] mb-4">
            <Shield className="w-8 h-8 text-[#00f0ff]" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">Welcome Back</h1>
          <p className="text-sm text-gray-400">Sign in to Fraud Shield AI</p>
        </div>

        {/* Demo Credentials Hint */}
        <div className="mb-6 p-3 rounded-lg bg-[rgba(0,240,255,0.05)] border border-[rgba(0,240,255,0.1)]">
          <p className="text-xs font-mono text-[#00f0ff] text-center">
            Demo: user@fraudshield.ai / UserPass123!
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-5 p-3 rounded-lg bg-red-950/30 border border-red-800/40 text-sm text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="login-email" className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">
              Email Address
            </label>
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="w-full px-4 py-3 rounded-lg bg-[#0a1628] border border-[rgba(255,255,255,0.1)] text-gray-200 placeholder-gray-600 focus:outline-none focus:border-[#00f0ff] focus:ring-1 focus:ring-[rgba(0,240,255,0.3)] transition-all text-sm"
            />
          </div>

          <div>
            <label htmlFor="login-password" className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">
              Password
            </label>
            <div className="relative">
              <input
                id="login-password"
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-4 py-3 pr-12 rounded-lg bg-[#0a1628] border border-[rgba(255,255,255,0.1)] text-gray-200 placeholder-gray-600 focus:outline-none focus:border-[#00f0ff] focus:ring-1 focus:ring-[rgba(0,240,255,0.3)] transition-all text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
              >
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex justify-end">
            <Link href="/forgot-password" className="text-xs text-[#00f0ff] hover:underline">
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            id="login-submit-btn"
            disabled={loading}
            className="cyber-button w-full py-3 rounded-lg text-sm flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Authenticating...
              </>
            ) : (
              'Authorize Access'
            )}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          No account yet?{' '}
          <Link href="/register" className="text-[#00f0ff] hover:underline font-medium">
            Create one
          </Link>
        </p>
      </motion.div>
    </div>
  );
}

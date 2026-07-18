'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import { Shield, Eye, EyeOff, Loader2, UserPlus } from 'lucide-react';
import { motion } from 'framer-motion';

export default function RegisterPage() {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      await register(name, email, password);
    } catch (err: any) {
      setError(err.message || 'Registration failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#030712] cyber-grid-bg relative overflow-hidden px-4">
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-[#a855f7]/5 blur-[100px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="cyber-card w-full max-w-md p-8 rounded-2xl"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#a855f7]/20 to-[#0072ff]/20 border border-[rgba(168,85,247,0.3)] mb-4">
            <UserPlus className="w-8 h-8 text-[#a855f7]" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">Create Account</h1>
          <p className="text-sm text-gray-400">Join Fraud Shield AI — it&apos;s free</p>
        </div>

        {error && (
          <div className="mb-5 p-3 rounded-lg bg-red-950/30 border border-red-800/40 text-sm text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="reg-name" className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">
              Full Name
            </label>
            <input
              id="reg-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              required
              className="w-full px-4 py-3 rounded-lg bg-[#0a1628] border border-[rgba(255,255,255,0.1)] text-gray-200 placeholder-gray-600 focus:outline-none focus:border-[#a855f7] focus:ring-1 focus:ring-[rgba(168,85,247,0.3)] transition-all text-sm"
            />
          </div>

          <div>
            <label htmlFor="reg-email" className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">
              Email Address
            </label>
            <input
              id="reg-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="w-full px-4 py-3 rounded-lg bg-[#0a1628] border border-[rgba(255,255,255,0.1)] text-gray-200 placeholder-gray-600 focus:outline-none focus:border-[#a855f7] focus:ring-1 focus:ring-[rgba(168,85,247,0.3)] transition-all text-sm"
            />
          </div>

          <div>
            <label htmlFor="reg-password" className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">
              Password
            </label>
            <div className="relative">
              <input
                id="reg-password"
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 6 characters"
                required
                className="w-full px-4 py-3 pr-12 rounded-lg bg-[#0a1628] border border-[rgba(255,255,255,0.1)] text-gray-200 placeholder-gray-600 focus:outline-none focus:border-[#a855f7] focus:ring-1 focus:ring-[rgba(168,85,247,0.3)] transition-all text-sm"
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

          <button
            type="submit"
            id="register-submit-btn"
            disabled={loading}
            className="w-full py-3 rounded-lg text-sm flex items-center justify-center gap-2 font-semibold disabled:opacity-60 bg-gradient-to-r from-[#a855f7] to-[#6d28d9] text-white hover:shadow-[0_0_20px_rgba(168,85,247,0.4)] transition-all"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Creating Account...
              </>
            ) : (
              <>
                <Shield className="w-4 h-4" />
                Create Secure Account
              </>
            )}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{' '}
          <Link href="/login" className="text-[#a855f7] hover:underline font-medium">
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}

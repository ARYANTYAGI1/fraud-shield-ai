'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Shield,
  Scan,
  Globe,
  Image,
  FileText,
  ArrowRight,
  CheckCircle,
  Zap,
  Brain,
  Lock,
  Eye,
  TrendingUp,
} from 'lucide-react';

const features = [
  {
    icon: Scan,
    title: 'Text & SMS Analysis',
    desc: 'Detect phishing, OTP scams, bank impersonations, and lottery fraud in any message.',
    color: '#00f0ff',
  },
  {
    icon: Globe,
    title: 'URL Intelligence',
    desc: 'Analyze links for typosquatting, fake login pages, shortened URLs, and malicious domains.',
    color: '#a855f7',
  },
  {
    icon: Image,
    title: 'Image OCR Scanner',
    desc: 'Upload screenshots of chat conversations and emails. AI extracts and analyzes the text.',
    color: '#f59e0b',
  },
  {
    icon: FileText,
    title: 'PDF Document Scan',
    desc: 'Parse full PDF documents for hidden scam content, loan fraud, and identity theft attempts.',
    color: '#10b981',
  },
  {
    icon: Brain,
    title: 'AI Fraud Assistant',
    desc: 'Conversational AI cybersecurity expert you can ask about any suspicious communication.',
    color: '#ef4444',
  },
  {
    icon: TrendingUp,
    title: 'Risk Analytics',
    desc: 'Track all your scans over time on a rich analytics dashboard with live trend charts.',
    color: '#00f0ff',
  },
];

const categories = [
  { label: 'Lottery Scams', color: '#ef4444' },
  { label: 'OTP Theft', color: '#f59e0b' },
  { label: 'Bank Impersonation', color: '#a855f7' },
  { label: 'Crypto Fraud', color: '#00f0ff' },
  { label: 'KYC Scams', color: '#10b981' },
  { label: 'Romance Scams', color: '#ef4444' },
  { label: 'Job Fraud', color: '#f59e0b' },
  { label: 'Phishing URLs', color: '#a855f7' },
  { label: 'Investment Scams', color: '#00f0ff' },
  { label: 'Parcel Scams', color: '#10b981' },
];

export default function LandingPage() {
  return (
    <div className="relative min-h-screen bg-[#030712] cyber-grid-bg overflow-hidden">
      {/* Ambient Glow */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full bg-[#00f0ff]/5 blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 right-0 w-[400px] h-[400px] rounded-full bg-[#a855f7]/5 blur-[120px] pointer-events-none" />

      {/* Navbar */}
      <nav className="flex items-center justify-between px-6 md:px-12 py-5 border-b border-[rgba(0,240,255,0.08)] sticky top-0 z-50 bg-[#030712]/80 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <Shield className="w-7 h-7 text-[#00f0ff]" />
          <span className="text-xl font-extrabold tracking-widest text-[#00f0ff] font-mono glow-text-primary">
            FRAUD SHIELD AI
          </span>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="px-5 py-2 text-sm font-semibold text-gray-300 hover:text-white transition-colors border border-[rgba(255,255,255,0.1)] rounded-lg hover:border-[rgba(0,240,255,0.3)]"
          >
            Sign In
          </Link>
          <Link
            href="/register"
            className="cyber-button px-5 py-2 text-sm rounded-lg text-[#050b14]"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="px-6 md:px-12 pt-24 pb-16 text-center max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[rgba(0,240,255,0.08)] border border-[rgba(0,240,255,0.2)] rounded-full text-xs font-mono text-[#00f0ff] mb-8">
            <Zap className="w-3 h-3" />
            POWERED BY GOOGLE GEMINI & OPENAI
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white mb-6 leading-tight">
            Detect Scams{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00f0ff] to-[#a855f7] glow-text-primary">
              Before They Strike
            </span>
          </h1>

          <p className="text-lg md:text-xl text-gray-400 max-w-3xl mx-auto mb-10 leading-relaxed">
            AI-powered fraud intelligence platform scanning emails, SMS, URLs, images, and documents.
            Protect yourself from phishing, impersonation, OTP theft, and financial scams.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="cyber-button inline-flex items-center gap-2 px-8 py-3.5 text-base rounded-xl"
            >
              Start Scanning Free
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-8 py-3.5 text-base rounded-xl border border-[rgba(0,240,255,0.2)] text-gray-200 hover:border-[rgba(0,240,255,0.4)] hover:bg-[rgba(0,240,255,0.03)] transition-all"
            >
              View Demo
              <Eye className="w-4 h-4" />
            </Link>
          </div>
        </motion.div>

        {/* Scanning Categories */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="mt-14 flex flex-wrap gap-2 justify-center"
        >
          {categories.map((cat) => (
            <span
              key={cat.label}
              className="px-3 py-1 text-xs font-semibold rounded-full border"
              style={{
                color: cat.color,
                borderColor: `${cat.color}40`,
                background: `${cat.color}0d`,
              }}
            >
              {cat.label}
            </span>
          ))}
        </motion.div>
      </section>

      {/* Mock scan result preview card */}
      <section className="px-6 md:px-12 pb-20 max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.7 }}
          className="cyber-card p-6 border-red-500/30 rounded-2xl scan-overlay"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-red-950/30 border border-red-700/40 flex-shrink-0">
              <Shield className="w-6 h-6 text-red-400" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-xs font-mono text-gray-400">ANALYSIS COMPLETE</span>
                <span className="px-2 py-0.5 text-xs rounded bg-red-950 text-red-400 border border-red-800 font-semibold">HIGH RISK SCAM</span>
              </div>
              <p className="text-sm text-gray-200 font-mono mb-4 italic">
                "Your SBI account has been suspended. Click http://sbi-secure-updt.com to re-verify KYC immediately."
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Risk Score</p>
                  <p className="text-2xl font-bold text-red-400 glow-text-danger">94<span className="text-sm text-gray-500">/100</span></p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Confidence</p>
                  <p className="text-2xl font-bold text-[#00f0ff] glow-text-primary">98%</p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-gray-500 mb-1">Red Flags</p>
                  <div className="flex flex-wrap gap-1">
                    {['KYC Request', 'Suspicious URL', 'Bank Impersonation', 'Urgency Language'].map(f => (
                      <span key={f} className="px-1.5 py-0.5 text-xs bg-red-950/40 text-red-400 border border-red-800/40 rounded">{f}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section className="px-6 md:px-12 py-20 max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Every Attack Vector Covered
          </h2>
          <p className="text-gray-400 max-w-xl mx-auto">
            Multi-modal threat detection trained on thousands of real-world scam patterns.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feat, i) => {
            const Icon = feat.icon;
            return (
              <motion.div
                key={feat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="cyber-card p-6 rounded-xl"
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: `${feat.color}1a`, border: `1px solid ${feat.color}40` }}
                >
                  <Icon className="w-6 h-6" style={{ color: feat.color }} />
                </div>
                <h3 className="font-bold text-gray-100 mb-2">{feat.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{feat.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 md:px-12 py-20 text-center">
        <div className="cyber-card max-w-2xl mx-auto p-12 rounded-3xl border-[rgba(0,240,255,0.2)]">
          <Lock className="w-12 h-12 text-[#00f0ff] mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-white mb-4">Stay One Step Ahead</h2>
          <p className="text-gray-400 mb-8">
            Join thousands of users protecting themselves with AI-powered fraud detection. Free to start.
          </p>
          <Link href="/register" className="cyber-button inline-flex items-center gap-2 px-8 py-3.5 text-base rounded-xl">
            Create Free Account <ArrowRight className="w-4 h-4" />
          </Link>
          <div className="flex items-center justify-center gap-6 mt-8">
            {['AI-Powered', 'No Card Required', 'Real-time Results'].map(t => (
              <div key={t} className="flex items-center gap-1.5 text-xs text-gray-400">
                <CheckCircle className="w-3.5 h-3.5 text-[#10b981]" /> {t}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[rgba(255,255,255,0.05)] py-8 text-center text-xs text-gray-500">
        <p>© 2026 Fraud Shield AI — Cybersecurity Intelligence Platform</p>
      </footer>
    </div>
  );
}

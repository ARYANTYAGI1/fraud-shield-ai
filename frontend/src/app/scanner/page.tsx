'use client';

import React, { useState, useRef } from 'react';
import api from '../../utils/api';
import {
  Scan,
  Globe,
  Image as ImageIcon,
  FileText,
  Mic,
  Loader2,
  AlertTriangle,
  CheckCircle,
  Shield,
  Upload,
  X,
  RotateCcw,
  MicOff,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type Tab = 'text' | 'url' | 'file' | 'voice';

interface ScanResult {
  riskScore: number;
  category: string;
  confidence: number;
  reasons: string[];
  recommendation: string;
  redFlags: string[];
}

const tabConfig = [
  { id: 'text' as Tab, label: 'Text / SMS', icon: Scan, desc: 'Paste emails, WhatsApp, SMS' },
  { id: 'url' as Tab, label: 'URL Scanner', icon: Globe, desc: 'Check suspicious links' },
  { id: 'file' as Tab, label: 'Image / PDF', icon: ImageIcon, desc: 'Upload screenshots & docs' },
  { id: 'voice' as Tab, label: 'Voice Scan', icon: Mic, desc: 'Speak to analyze' },
];

const riskColor = (score: number) => {
  if (score < 20) return '#10b981';
  if (score < 50) return '#f59e0b';
  if (score < 75) return '#ef4444';
  return '#dc2626';
};

const categoryBg: Record<string, string> = {
  Safe: 'bg-green-950/30 border-green-800/30 text-green-400',
  Suspicious: 'bg-amber-950/30 border-amber-800/30 text-amber-400',
  Fraud: 'bg-red-950/30 border-red-800/30 text-red-400',
  'High Risk Scam': 'bg-red-950/50 border-red-700/40 text-red-300',
  Critical: 'bg-red-950/70 border-red-600/50 text-red-200',
};

export default function ScannerPage() {
  const [tab, setTab] = useState<Tab>('text');
  const [textInput, setTextInput] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [fileType, setFileType] = useState<'image' | 'pdf'>('image');
  const [voiceText, setVoiceText] = useState('');
  const [listening, setListening] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [extractedText, setExtractedText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  const reset = () => {
    setResult(null);
    setError('');
    setExtractedText('');
  };

  // Voice recognition
  const toggleVoice = () => {
    if (typeof window === 'undefined') return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError('Speech recognition is not supported in your browser. Use Chrome for best results.');
      return;
    }

    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }

    const rec = new SpeechRecognition();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = 'en-US';

    rec.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((r: any) => r[0].transcript)
        .join('');
      setVoiceText(transcript);
    };

    rec.onerror = () => setListening(false);
    rec.onend = () => setListening(false);

    rec.start();
    recognitionRef.current = rec;
    setListening(true);
  };

  const handleScan = async () => {
    reset();
    setLoading(true);
    try {
      let res;
      if (tab === 'text') {
        if (!textInput.trim()) throw new Error('Please enter some text to analyze.');
        res = await api.post('/scan/text', { text: textInput });
      } else if (tab === 'url') {
        if (!urlInput.trim()) throw new Error('Please enter a URL to scan.');
        res = await api.post('/scan/url', { url: urlInput });
      } else if (tab === 'file') {
        if (!file) throw new Error('Please upload a file to scan.');
        const formData = new FormData();
        formData.append(fileType, file);
        res = await api.post(`/scan/${fileType}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        if (res.data.extractedText) setExtractedText(res.data.extractedText);
      } else if (tab === 'voice') {
        if (!voiceText.trim()) throw new Error('Please record some voice input first.');
        res = await api.post('/scan/text', { text: voiceText });
      }
      setResult(res?.data?.scan?.result || null);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Scan failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Tabs */}
      <div className="cyber-card p-2 rounded-2xl flex gap-1 overflow-x-auto">
        {tabConfig.map((t) => {
          const Icon = t.icon;
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              id={`tab-${t.id}`}
              onClick={() => { setTab(t.id); reset(); }}
              className={`flex-1 min-w-[100px] flex flex-col items-center gap-1 px-3 py-3 rounded-xl text-xs font-semibold transition-all ${
                active
                  ? 'bg-gradient-to-b from-[rgba(0,240,255,0.15)] to-[rgba(0,114,255,0.05)] text-[#00f0ff] border border-[rgba(0,240,255,0.3)]'
                  : 'text-gray-500 hover:text-gray-300 hover:bg-[rgba(255,255,255,0.03)]'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:block">{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Input Panel */}
      <div className="cyber-card p-6 rounded-2xl">
        {/* Text Tab */}
        {tab === 'text' && (
          <div className="space-y-4">
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Paste Email, SMS, WhatsApp message, or any text
            </label>
            <textarea
              id="text-scan-input"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              rows={7}
              placeholder="e.g. Your bank account has been suspended. Click here to verify KYC..."
              className="w-full px-4 py-3 rounded-xl bg-[#0a1628] border border-[rgba(255,255,255,0.08)] text-gray-200 placeholder-gray-600 focus:outline-none focus:border-[#00f0ff] transition-all text-sm resize-none font-mono"
            />
          </div>
        )}

        {/* URL Tab */}
        {tab === 'url' && (
          <div className="space-y-4">
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Enter suspicious URL or link to scan
            </label>
            <input
              id="url-scan-input"
              type="url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://suspicious-link-example.com/login"
              className="w-full px-4 py-3 rounded-xl bg-[#0a1628] border border-[rgba(255,255,255,0.08)] text-gray-200 placeholder-gray-600 focus:outline-none focus:border-[#a855f7] transition-all text-sm font-mono"
            />
          </div>
        )}

        {/* File Tab */}
        {tab === 'file' && (
          <div className="space-y-4">
            <div className="flex gap-3">
              {['image', 'pdf'].map((type) => (
                <button
                  key={type}
                  id={`file-type-${type}`}
                  onClick={() => { setFileType(type as 'image' | 'pdf'); setFile(null); }}
                  className={`flex-1 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all border ${
                    fileType === type
                      ? 'border-[rgba(0,240,255,0.4)] bg-[rgba(0,240,255,0.08)] text-[#00f0ff]'
                      : 'border-[rgba(255,255,255,0.07)] text-gray-500 hover:text-gray-300'
                  }`}
                >
                  {type === 'image' ? <ImageIcon className="w-3.5 h-3.5" /> : <FileText className="w-3.5 h-3.5" />}
                  {type === 'image' ? 'Image / Screenshot' : 'PDF Document'}
                </button>
              ))}
            </div>

            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-[rgba(0,240,255,0.2)] rounded-xl p-10 text-center cursor-pointer hover:border-[rgba(0,240,255,0.4)] transition-colors"
            >
              {file ? (
                <div className="flex items-center justify-center gap-3">
                  <Upload className="w-5 h-5 text-[#00f0ff]" />
                  <span className="text-sm text-gray-300">{file.name}</span>
                  <button
                    onClick={(e) => { e.stopPropagation(); setFile(null); }}
                    className="text-gray-500 hover:text-red-400"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <>
                  <Upload className="w-8 h-8 text-gray-500 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">
                    Click to upload {fileType === 'image' ? 'a screenshot or image (JPG, PNG)' : 'a PDF document'}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">Max size: 10 MB</p>
                </>
              )}
              <input
                id="file-upload-input"
                ref={fileInputRef}
                type="file"
                hidden
                accept={fileType === 'image' ? 'image/*' : 'application/pdf'}
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
            </div>
          </div>
        )}

        {/* Voice Tab */}
        {tab === 'voice' && (
          <div className="space-y-4">
            <div className="text-center py-6">
              <motion.button
                id="voice-record-btn"
                onClick={toggleVoice}
                animate={listening ? { scale: [1, 1.08, 1] } : { scale: 1 }}
                transition={{ repeat: listening ? Infinity : 0, duration: 1.2 }}
                className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors ${
                  listening
                    ? 'bg-red-600 shadow-[0_0_30px_rgba(239,68,68,0.6)]'
                    : 'bg-[rgba(0,240,255,0.1)] border border-[rgba(0,240,255,0.3)] hover:bg-[rgba(0,240,255,0.15)]'
                }`}
              >
                {listening ? (
                  <MicOff className="w-8 h-8 text-white" />
                ) : (
                  <Mic className="w-8 h-8 text-[#00f0ff]" />
                )}
              </motion.button>
              <p className="text-sm text-gray-400">
                {listening ? 'Listening... speak now' : 'Press to start voice recording'}
              </p>
            </div>

            {voiceText && (
              <div className="p-4 rounded-xl bg-[#0a1628] border border-[rgba(255,255,255,0.08)]">
                <p className="text-xs text-gray-500 mb-2 uppercase font-mono tracking-wider">Transcription</p>
                <p className="text-sm text-gray-200 font-mono">{voiceText}</p>
              </div>
            )}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mt-4 p-3 rounded-lg bg-red-950/30 border border-red-800/40 text-sm text-red-400 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            {error}
          </div>
        )}

        {/* Scan Button */}
        <button
          id="scan-submit-btn"
          onClick={handleScan}
          disabled={loading}
          className="cyber-button w-full mt-5 py-3.5 rounded-xl text-sm flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Analyzing threats...
            </>
          ) : (
            <>
              <Shield className="w-5 h-5" />
              Run Threat Analysis
            </>
          )}
        </button>
      </div>

      {/* Extracted text (for file scans) */}
      {extractedText && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="cyber-card p-5 rounded-xl"
        >
          <p className="text-xs font-mono text-gray-500 mb-2 uppercase tracking-wider">Extracted Text (OCR/PDF)</p>
          <p className="text-sm text-gray-300 font-mono leading-relaxed whitespace-pre-wrap max-h-32 overflow-y-auto">
            {extractedText}
          </p>
        </motion.div>
      )}

      {/* Result Panel */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="cyber-card rounded-2xl overflow-hidden"
          >
            {/* Category Header */}
            <div
              className="p-5 border-b border-[rgba(255,255,255,0.05)] flex items-center gap-4"
              style={{ background: `${riskColor(result.riskScore)}10` }}
            >
              <div
                className="w-16 h-16 rounded-xl flex items-center justify-center font-bold text-2xl font-mono"
                style={{
                  background: `${riskColor(result.riskScore)}20`,
                  border: `2px solid ${riskColor(result.riskScore)}60`,
                  color: riskColor(result.riskScore),
                }}
              >
                {result.riskScore}
              </div>
              <div>
                <p className="text-xs text-gray-500 font-mono mb-1">THREAT ASSESSMENT</p>
                <span
                  className={`inline-block px-3 py-1 rounded-full text-sm font-bold border ${categoryBg[result.category] || 'bg-gray-800 text-gray-300 border-gray-700'}`}
                >
                  {result.category}
                </span>
                <p className="text-xs text-gray-500 mt-1">Confidence: {result.confidence}%</p>
              </div>
              <button
                onClick={reset}
                className="ml-auto text-gray-500 hover:text-gray-300 p-2 rounded-lg hover:bg-[rgba(255,255,255,0.05)]"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Red Flags */}
              {result.redFlags.length > 0 && (
                <div>
                  <p className="text-xs font-mono text-red-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" /> Red Flags Detected
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {result.redFlags.map((f, i) => (
                      <span key={i} className="px-2 py-1 text-xs rounded-lg bg-red-950/40 text-red-400 border border-red-800/40">
                        {f}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Reasons */}
              <div>
                <p className="text-xs font-mono text-gray-400 uppercase tracking-wider mb-2">Analysis Details</p>
                <ul className="space-y-2">
                  {result.reasons.map((r, i) => (
                    <li key={i} className="flex gap-2 text-sm text-gray-300">
                      <span className="text-[#00f0ff] mt-0.5 flex-shrink-0">•</span>
                      {r}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Recommendation */}
              <div className="p-4 rounded-xl bg-[rgba(0,240,255,0.04)] border border-[rgba(0,240,255,0.12)]">
                <p className="text-xs font-mono text-[#00f0ff] uppercase tracking-wider mb-1 flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" /> Recommended Action
                </p>
                <p className="text-sm text-gray-200">{result.recommendation}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

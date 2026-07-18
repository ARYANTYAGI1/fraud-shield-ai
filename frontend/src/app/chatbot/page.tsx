'use client';

import React, { useState, useRef, useEffect } from 'react';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { MessageSquare, Send, Loader2, Shield, Bot, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  result?: {
    riskScore: number;
    category: string;
    confidence: number;
    redFlags: string[];
    recommendation: string;
  };
  timestamp: Date;
}

const riskColor = (score: number) => {
  if (score < 20) return '#10b981';
  if (score < 50) return '#f59e0b';
  if (score < 75) return '#ef4444';
  return '#dc2626';
};

const starterPrompts = [
  'Is this a scam: "You won a lottery! Send your bank details."',
  'Analyze: Your HDFC account will be blocked. Update KYC now.',
  'Check this URL: http://paypal-security-verify.net/update',
  'Is this suspicious: Job offer - Earn ₹50,000/day from home!',
];

export default function ChatbotPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      role: 'assistant',
      content: 'Hello! I\'m your AI Fraud Intelligence Assistant. I can analyze any suspicious message, link, or content for scam indicators. Just paste the suspicious content and I\'ll assess it for you.',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text?: string) => {
    const content = text || input.trim();
    if (!content || loading) return;

    setInput('');
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await api.post('/scan/text', { text: content });
      const result = res.data?.scan?.result;

      const assistantContent = result
        ? `**Analysis Complete**\n\nRisk Score: **${result.riskScore}/100** — **${result.category}** (${result.confidence}% confidence)\n\n**Why:**\n${result.reasons?.map((r: string) => `• ${r}`).join('\n')}\n\n**My Recommendation:**\n${result.recommendation}`
        : 'I was unable to analyze this content. Please try again.';

      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: assistantContent,
        result: result
          ? {
              riskScore: result.riskScore,
              category: result.category,
              confidence: result.confidence,
              redFlags: result.redFlags || [],
              recommendation: result.recommendation,
            }
          : undefined,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (err: any) {
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: `Error: ${err.response?.data?.message || 'Failed to analyze. Try again.'}`,
          timestamp: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] max-w-3xl mx-auto">
      {/* Header */}
      <div className="cyber-card p-4 rounded-xl mb-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#00f0ff]/20 to-[#a855f7]/20 border border-[rgba(0,240,255,0.3)] flex items-center justify-center">
          <Bot className="w-5 h-5 text-[#00f0ff]" />
        </div>
        <div>
          <h3 className="font-bold text-white text-sm">AI Fraud Intelligence Assistant</h3>
          <p className="text-xs text-gray-500 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] inline-block" />
            Online — Powered by Gemini / OpenAI
          </p>
        </div>
      </div>

      {/* Message Thread */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1 pb-2">
        {/* Starter Prompts (only when just 1 message) */}
        {messages.length === 1 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
            {starterPrompts.map((p, i) => (
              <button
                key={i}
                onClick={() => sendMessage(p)}
                className="text-left text-xs p-3 rounded-xl border border-[rgba(0,240,255,0.15)] bg-[rgba(0,240,255,0.03)] text-gray-400 hover:text-gray-200 hover:border-[rgba(0,240,255,0.3)] transition-all"
              >
                {p}
              </button>
            ))}
          </div>
        )}

        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {/* Avatar */}
              <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-sm ${
                msg.role === 'user'
                  ? 'bg-gradient-to-tr from-[#00f0ff] to-[#0072ff] text-[#050b14]'
                  : 'bg-[rgba(168,85,247,0.15)] border border-[rgba(168,85,247,0.3)]'
              }`}>
                {msg.role === 'user' ? (user?.name?.charAt(0) || 'U') : <Bot className="w-4 h-4 text-[#a855f7]" />}
              </div>

              <div className={`max-w-[75%] ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                  msg.role === 'user'
                    ? 'bg-gradient-to-r from-[#00f0ff]/20 to-[#0072ff]/10 border border-[rgba(0,240,255,0.2)] text-gray-100 rounded-tr-sm'
                    : 'bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.07)] text-gray-200 rounded-tl-sm'
                }`}>
                  {msg.content}
                </div>

                {/* Result Badge */}
                {msg.result && (
                  <div className="flex items-center gap-2 flex-wrap mt-1">
                    <span
                      className="text-xs font-bold font-mono px-2 py-0.5 rounded-full border"
                      style={{
                        color: riskColor(msg.result.riskScore),
                        borderColor: `${riskColor(msg.result.riskScore)}50`,
                        background: `${riskColor(msg.result.riskScore)}10`,
                      }}
                    >
                      Score: {msg.result.riskScore}
                    </span>
                    {msg.result.redFlags.slice(0, 3).map((f, i) => (
                      <span key={i} className="text-xs px-1.5 py-0.5 bg-red-950/40 text-red-400 border border-red-800/40 rounded">
                        {f}
                      </span>
                    ))}
                  </div>
                )}

                <p className="text-[10px] text-gray-600">
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Loading */}
        {loading && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[rgba(168,85,247,0.15)] border border-[rgba(168,85,247,0.3)] flex items-center justify-center">
              <Bot className="w-4 h-4 text-[#a855f7]" />
            </div>
            <div className="px-4 py-3 rounded-2xl rounded-tl-sm bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.07)] flex items-center gap-2">
              <Loader2 className="w-4 h-4 text-[#00f0ff] animate-spin" />
              <span className="text-sm text-gray-400">Analyzing...</span>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input Bar */}
      <div className="cyber-card p-3 rounded-xl mt-4 flex gap-2">
        <input
          id="chatbot-input"
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
          placeholder="Paste suspicious message or ask about any scam..."
          className="flex-1 px-3 py-2 bg-transparent text-sm text-gray-200 placeholder-gray-600 focus:outline-none"
        />
        <button
          id="chatbot-send-btn"
          onClick={() => sendMessage()}
          disabled={!input.trim() || loading}
          className="cyber-button px-4 py-2 rounded-lg flex items-center gap-2 text-sm disabled:opacity-40"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import {
  Shield,
  LayoutDashboard,
  Scan,
  History,
  MessageSquare,
  User,
  ShieldCheck,
  LogOut,
  Menu,
  X,
  Bell
} from 'lucide-react';

export default function CyberNavigation({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  // If user is not logged in, don't show navigation wrapper
  if (!user) {
    return <>{children}</>;
  }

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Scam Scanner', path: '/scanner', icon: Scan },
    { name: 'Scan History', path: '/history', icon: History },
    { name: 'AI Fraud Chat', path: '/chatbot', icon: MessageSquare },
  ];

  if (user.role === 'admin') {
    menuItems.push({ name: 'Admin Console', path: '/admin', icon: ShieldCheck });
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#030712] cyber-grid-bg">
      {/* Mobile Top Bar */}
      <header className="flex md:hidden items-center justify-between px-6 py-4 bg-[#070f1e]/90 border-b border-[rgba(0,240,255,0.15)] sticky top-0 z-50 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <Shield className="w-6 h-6 text-[#00f0ff] animate-pulse" />
          <span className="font-bold text-lg tracking-wider text-[#00f0ff] glow-text-primary font-mono">
            FRAUD SHIELD
          </span>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="text-gray-400 hover:text-[#00f0ff] focus:outline-none"
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* Sidebar Navigation */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-[#070f1e]/95 border-r border-[rgba(0,240,255,0.15)] flex flex-col justify-between transform transition-transform duration-300 md:translate-x-0 md:static ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col">
          {/* Sidebar Logo */}
          <div className="hidden md:flex items-center gap-3 px-6 py-8 border-b border-[rgba(255,255,255,0.05)]">
            <Shield className="w-8 h-8 text-[#00f0ff] animate-pulse" />
            <span className="font-extrabold text-xl tracking-widest text-[#00f0ff] glow-text-primary font-mono">
              FRAUD SHIELD
            </span>
          </div>

          {/* User profile widget */}
          <div className="px-6 py-6 border-b border-[rgba(255,255,255,0.05)] bg-[rgba(0,240,255,0.02)]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#00f0ff] to-[#0072ff] flex items-center justify-center font-bold text-[#050b14]">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="overflow-hidden">
                <p className="font-semibold text-sm text-gray-100 truncate">{user.name}</p>
                <p className="text-xs text-gray-400 capitalize font-mono">{user.role} ACC</p>
              </div>
            </div>
          </div>

          {/* Nav Items */}
          <nav className="px-4 py-6 space-y-2">
            {menuItems.map((item) => {
              const isActive = pathname === item.path;
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-[rgba(0,240,255,0.15)] to-[rgba(0,114,255,0.05)] text-[#00f0ff] border-l-2 border-[#00f0ff] shadow-[0_0_15px_rgba(0,240,255,0.05)]'
                      : 'text-gray-400 hover:text-gray-100 hover:bg-[rgba(255,255,255,0.03)]'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-[#00f0ff]' : ''}`} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-[rgba(255,255,255,0.05)]">
          <button
            onClick={() => {
              logout();
              setMobileOpen(false);
            }}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-950/20 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>Terminate Session</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Navbar */}
        <header className="hidden md:flex items-center justify-between px-8 py-4 bg-[#070f1e]/40 border-b border-[rgba(255,255,255,0.05)] sticky top-0 z-30 backdrop-blur-md">
          <div>
            <h1 className="text-xl font-bold text-gray-200">
              {pathname === '/dashboard' && 'Security Overview'}
              {pathname === '/scanner' && 'Threat Intelligence Terminal'}
              {pathname === '/history' && 'Audit Repository'}
              {pathname === '/chatbot' && 'AI Security Assistant'}
              {pathname === '/admin' && 'Central Administration'}
            </h1>
            <p className="text-xs text-gray-400">
              Logged in as <span className="font-mono text-gray-300">{user.email}</span>
            </p>
          </div>

          <div className="flex items-center gap-4">
            {/* Status Indicator */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-950/20 border border-emerald-900/30">
              <span className="w-2 h-2 rounded-full bg-[#10b981] animate-ping" />
              <span className="text-xs font-semibold text-[#10b981] uppercase font-mono">NODE ACTIVE</span>
            </div>

            <button className="p-2 text-gray-400 hover:text-white rounded-full hover:bg-[rgba(255,255,255,0.03)] relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#00f0ff]" />
            </button>
          </div>
        </header>

        {/* Content Page Container */}
        <main className="flex-1 p-6 md:p-8">{children}</main>
      </div>
    </div>
  );
}

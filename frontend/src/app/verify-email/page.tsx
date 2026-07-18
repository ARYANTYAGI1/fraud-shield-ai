'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import api from '../../utils/api';
import { Shield, CheckCircle, XCircle, Loader2 } from 'lucide-react';

export default function VerifyEmailPage() {
  const params = useSearchParams();
  const router = useRouter();
  const token = params.get('token');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verify = async () => {
      if (!token) {
        setStatus('error');
        setMessage('Invalid or missing verification token.');
        return;
      }
      try {
        const res = await api.get(`/auth/verify?token=${token}`);
        setStatus('success');
        setMessage(res.data.message || 'Email verified successfully!');
        setTimeout(() => router.push('/login'), 3000);
      } catch (err: any) {
        setStatus('error');
        setMessage(err.response?.data?.message || 'Verification failed. Link may be expired.');
      }
    };
    verify();
  }, [token, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#030712] cyber-grid-bg px-4">
      <div className="cyber-card w-full max-w-md p-10 rounded-2xl text-center">
        {status === 'loading' && (
          <>
            <Loader2 className="w-14 h-14 text-[#00f0ff] mx-auto mb-4 animate-spin" />
            <h2 className="text-xl font-bold text-white mb-2">Verifying Email</h2>
            <p className="text-sm text-gray-400">Please wait...</p>
          </>
        )}
        {status === 'success' && (
          <>
            <CheckCircle className="w-14 h-14 text-[#10b981] mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Email Verified!</h2>
            <p className="text-sm text-gray-400">{message}</p>
            <p className="text-xs text-gray-500 mt-2">Redirecting to login...</p>
          </>
        )}
        {status === 'error' && (
          <>
            <XCircle className="w-14 h-14 text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Verification Failed</h2>
            <p className="text-sm text-gray-400">{message}</p>
          </>
        )}
        <div className="mt-4 inline-flex items-center gap-2">
          <Shield className="w-4 h-4 text-[#00f0ff]" />
          <span className="text-xs font-mono text-gray-500">FRAUD SHIELD AI</span>
        </div>
      </div>
    </div>
  );
}

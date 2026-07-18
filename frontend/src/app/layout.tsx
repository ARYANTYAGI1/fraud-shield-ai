import type { Metadata } from 'next';
import { Outfit, Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '../context/AuthContext';
import CyberNavigation from '../components/CyberNavigation';

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'Fraud Shield AI | Intelligent Cybersecurity Scam Detection',
  description: 'AI-powered cybersecurity scanner identifying email scams, phishing URLs, chat screenshots, and fraud documents in real-time.',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${outfit.variable} ${inter.variable} dark`}>
      <body className="bg-[#050b14] text-[#f3f4f6] min-h-screen font-sans antialiased">
        <AuthProvider>
          <CyberNavigation>
            {children}
          </CyberNavigation>
        </AuthProvider>
      </body>
    </html>
  );
}

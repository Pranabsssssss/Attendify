import type { Metadata } from 'next';
import { Outfit } from 'next/font/google';
import './globals.css';
import { ReactNode } from 'react';
import { LenisProvider } from '@/components/providers/lenis-provider';
import { Toaster } from 'sonner';

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Attendify | Smart Attendance Platform',
  description: 'Next-gen automated attendance management system.',
  icons: {
    icon: '/icons/icon.svg',
  },
};

import { ServiceWorkerRegister } from '@/components/providers/ServiceWorkerRegister';
import NextTopLoader from 'nextjs-toploader';

// ... (imports)

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en" className={outfit.variable}>
      <body className="antialiased bg-bg-primary text-text-primary min-h-screen selection:bg-primary/30">
        <LenisProvider>
          <NextTopLoader color="#8b5cf6" showSpinner={false} />
          <ServiceWorkerRegister />
          {children}
          <Toaster
            position="top-right"
            theme="dark"
            toastOptions={{
              style: {
                background: 'rgba(30, 30, 50, 0.8)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#fff',
              }
            }}
          />
        </LenisProvider>
      </body>
    </html>
  );
}

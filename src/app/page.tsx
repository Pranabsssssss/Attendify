import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/ui/glass-card';
import AttendanceMachine from '@/components/3d/AttendanceMachine';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, ShieldCheck, Zap, Globe } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen relative flex flex-col overflow-x-hidden w-full">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] rounded-full bg-primary/20 blur-[120px]" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-blue-500/10 blur-[100px]" />
      </div>

      {/* Navbar - Z-Index 50 */}
      <nav className="w-full py-6 px-6 md:px-12 flex justify-between items-center z-50 relative pointer-events-auto">
        <div className="flex items-center gap-2">
          <div className="relative w-8 h-8 flex items-center justify-center">
            <Image
              src="/icons/icon.svg"
              alt="Attendify Logo"
              width={32}
              height={32}
              className="object-contain"
            />
          </div>
          <span className="text-xl font-bold tracking-tight">Attendify</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login">
            <Button className="bg-primary text-white hover:bg-primary/90 font-bold shadow-[0_0_20px_rgba(124,58,237,0.6)]">Log In</Button>
          </Link>
          <Link href="/register">
            <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 hover:text-white">Register</Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col md:flex-row items-center px-6 md:px-12 lg:px-20 py-12 gap-12 relative">

        {/* Left Content - Z-Index 10 */}
        <div className="flex-1 space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-700 relative z-10">

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight text-center md:text-left">
            The Future of <br />
            <span className="text-primary-light drop-shadow-[0_0_15px_rgba(124,58,237,0.5)]">Smart Attendance</span>
          </h1>

          <p className="text-lg text-text-secondary max-w-xl leading-relaxed">
            Seamlessly integrate RFID technology, real-time analytics, and automated reporting into your educational institution.
            Experience the next generation of Institution management.
          </p>

          <div className="flex flex-wrap gap-4">
            <Link href="/login">
              <Button size="lg" className="gap-2 bg-primary hover:bg-primary-hover text-white shadow-lg shadow-primary/25">
                Log In <ArrowRight size={18} />
              </Button>
            </Link>
            <Link href="/register">
              <Button size="lg" variant="secondary">
                Register
              </Button>
            </Link>
          </div>

          <div className="pt-8 flex gap-8 text-text-muted">
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-white">99.9%</span>
              <span className="text-sm">Uptime</span>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-white">50k+</span>
              <span className="text-sm">Users</span>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-white">Zero</span>
              <span className="text-sm">Latency</span>
            </div>
          </div>
        </div>

        {/* Right Content - 3D Scene - Z-Index 100 !! SUPER HIGH !! */}
        <div className="flex-1 w-full relative z-[100] md:-mr-20 pointer-events-none md:pointer-events-auto h-[400px] md:h-auto">
          <div className="relative w-full h-full md:aspect-auto md:h-[700px]">
            <AttendanceMachine />
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="w-full py-8 text-center text-text-muted text-sm border-t border-white/5 relative z-10">
        <div className="flex justify-center gap-6 mb-4">
          {/* Links removed */}
        </div>
        <p>© 2026 Attendify. All rights reserved. Developed by Pranab Saini.</p>
      </footer>
    </div>
  );
}

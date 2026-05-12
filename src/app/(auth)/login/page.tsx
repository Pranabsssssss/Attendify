'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { ShieldCheck, Loader2 } from 'lucide-react';

export default function LoginPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        identifier: '', // Can be studentId or email
        password: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const payload = {
                identifier: formData.identifier,
                password: formData.password,
            };

            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Login failed');
            }

            toast.success('Welcome back!', { description: `Logged in as ${data.user.name}` });

            // Redirect based on role (placeholder routes for now)
            const role = data.user.role;
            router.push(`/dashboard/${role}`);

        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-0 left-0 w-full h-full -z-10 bg-bg-primary">
                <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-primary/20 blur-[100px]" />
            </div>

            <GlassCard className="w-full max-w-md p-8 border-t border-white/10">
                <div className="flex flex-col items-center mb-8">
                    <div className="w-16 h-16 flex items-center justify-center mb-4">
                        <Image
                            src="/icons/icon.svg"
                            alt="Attendify Logo"
                            width={64}
                            height={64}
                            className="object-contain drop-shadow-[0_0_15px_rgba(124,58,237,0.5)]"
                        />
                    </div>
                    <h1 className="text-3xl font-bold text-white">Welcome Back</h1>
                    <p className="text-text-secondary mt-2">Sign in to access your dashboard</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-text-secondary">Email, Phone or Student ID</label>
                        <input
                            type="text"
                            required
                            className="w-full bg-bg-input border border-white/5 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 text-white placeholder-text-muted transition-all"
                            placeholder="e.g., john@school.com, 9876543210, or STV2026001"
                            value={formData.identifier}
                            onChange={(e) => setFormData({ ...formData, identifier: e.target.value })}
                        />
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <label className="text-sm font-medium text-text-secondary">Password</label>
                        </div>
                        <input
                            type="password"
                            required
                            className="w-full bg-bg-input border border-white/5 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 text-white placeholder-text-muted transition-all"
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        />
                    </div>

                    <Button type="submit" className="w-full py-6 text-lg bg-primary hover:bg-primary-hover text-white font-bold shadow-lg shadow-primary/25" disabled={loading}>
                        {loading ? <Loader2 className="animate-spin" /> : 'Sign In'}
                    </Button>
                </form>

                <div className="mt-8 text-center text-sm text-text-muted">
                    Don't have an account?{' '}
                    <Link href="/register" className="text-primary hover:text-primary-light font-medium">
                        Register via Access Code
                    </Link>
                </div>
            </GlassCard>
        </div>
    );
}

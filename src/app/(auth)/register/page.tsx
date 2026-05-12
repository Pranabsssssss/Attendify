'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { ShieldCheck, Loader2, User, School, BookOpen, ArrowRight, Lock, Phone, IdCard } from 'lucide-react';
import { cn } from '@/lib/utils';

type Role = 'student' | 'teacher' | 'principal' | 'it_admin';
type Step = 'code' | 'details';

// Fix: Explicitly access env vars for client bundle
const CODE_MAP: Record<Role, string | undefined> = {
    student: process.env.NEXT_PUBLIC_ACCESS_CODE_STUDENT,
    teacher: process.env.NEXT_PUBLIC_ACCESS_CODE_TEACHER,
    principal: process.env.NEXT_PUBLIC_ACCESS_CODE_PRINCIPAL,
    it_admin: process.env.NEXT_PUBLIC_ACCESS_CODE_IT_ADMIN,
};

const ROLES: { id: Role; label: string; icon: any }[] = [
    { id: 'student', label: 'Student', icon: User },
    { id: 'teacher', label: 'Teacher', icon: BookOpen },
    { id: 'principal', label: 'Principal', icon: School },
    { id: 'it_admin', label: 'IT Admin', icon: ShieldCheck },
];

// Generate dropdown options: 6-A to 12-E, filtering out restricted ones
const RESTRICTED_SECTIONS = (process.env.NEXT_PUBLIC_RESTRICTED_SECTIONS || '').split(',').map(s => s.trim().toUpperCase());

const CLASS_OPTIONS: string[] = [];
for (let i = 6; i <= 12; i++) {
    ['A', 'B', 'C', 'D', 'E'].forEach(sec => {
        const option = `${i}-${sec}`;
        // Check if specific "6-C" or generic "C" is restricted
        const isRestricted = RESTRICTED_SECTIONS.includes(option) || RESTRICTED_SECTIONS.includes(sec);
        if (!isRestricted) {
            CLASS_OPTIONS.push(option);
        }
    });
}

export default function RegisterPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState<Step>('code');
    const [role, setRole] = useState<Role | null>(null);
    const [accessCode, setAccessCode] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phoneNumber: '',
        password: '',
        studentId: '',
        classId: '',
        rfidUid: '',
    });

    const handleCodeSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Check which role this code belongs to
        const matchedRole = ROLES.find(r => {
            const correctCode = CODE_MAP[r.id];
            return correctCode === accessCode;
        });

        if (matchedRole) {
            setRole(matchedRole.id);
            setStep('details');
            toast.success(`Access granted: Registering as ${matchedRole.label}`);
        } else {
            toast.error('Invalid Access Code');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!role) return;
        setLoading(true);

        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    role,
                    accessCode // Send code again for server verification
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Registration failed');
            }

            let successMsg = 'Account created successfully!';
            if (role === 'student') successMsg += ' Password is last 8 digits of Student ID.';
            if (role === 'teacher' || role === 'principal') successMsg += ' Password is last 8 digits of Phone No.';

            toast.success(successMsg, { duration: 5000 });
            router.push('/login');

        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 -z-10 bg-bg-primary">
                <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-primary/20 blur-[100px] animate-pulse" />
                <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-blue-500/10 blur-[100px]" />
            </div>

            <GlassCard className="w-full max-w-md p-8 border-t border-white/10 relative z-10 transition-all duration-500">
                <div className="text-center mb-8">
                    <div className="w-12 h-12 mx-auto mb-4 flex items-center justify-center">
                        <Image
                            src="/icons/icon.svg"
                            alt="Attendify Logo"
                            width={48}
                            height={48}
                            className="object-contain"
                        />
                    </div>
                    <h1 className="text-3xl font-bold text-white">
                        {step === 'code' ? 'Join Attendify' : 'Create Account'}
                    </h1>
                    <p className="text-text-secondary mt-2">
                        {step === 'code' ? 'Enter Access Code to Begin' : 'Fill in your details'}
                    </p>
                </div>

                {step === 'code' && (
                    <form onSubmit={handleCodeSubmit} className="space-y-6 animate-in fade-in slide-in-from-right-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-text-secondary">Access Code</label>
                            <div className="relative">
                                <ShieldCheck className="absolute left-4 top-3.5 w-5 h-5 text-text-muted" />
                                <input
                                    type="text"
                                    required
                                    className="w-full bg-bg-input border border-white/5 rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 text-white placeholder-text-muted/50"
                                    placeholder="Enter your secure code..."
                                    value={accessCode}
                                    onChange={(e) => setAccessCode(e.target.value)}
                                />
                            </div>
                            <p className="text-xs text-text-muted">
                                Ask your administrator for the code.
                            </p>
                        </div>
                        <Button type="submit" size="lg" className="w-full bg-primary hover:bg-primary-hover text-white font-bold shadow-lg shadow-primary/25">
                            Continue <ArrowRight className="ml-2 w-4 h-4" />
                        </Button>
                    </form>
                )}

                {step === 'details' && role && (
                    <form onSubmit={handleSubmit} className="space-y-6 animate-in fade-in slide-in-from-right-4">

                        <div className="text-center mb-6">
                            <div className="inline-block p-2 bg-white/5 rounded-lg border border-white/10">
                                <span className="text-sm text-text-muted">Registering as:</span>
                                <div className="text-lg font-bold text-primary">{ROLES.find(r => r.id === role)?.label}</div>
                            </div>
                            <button onClick={() => { setStep('code'); setAccessCode(''); }} className="block w-full text-xs text-text-muted mt-2 hover:text-white underline">
                                Use different code
                            </button>
                        </div>

                        {/* --- STUDENT FORM --- */}
                        {role === 'student' && (
                            <>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-text-secondary">Full Name *</label>
                                    <input type="text" required placeholder="Enter your full name" className="w-full bg-bg-input border border-white/5 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-primary/50 outline-none"
                                        value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-text-secondary">Student ID *</label>
                                    <input type="text" required placeholder="Enter your student ID (min 8 digits)" className="w-full bg-bg-input border border-white/5 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-primary/50 outline-none"
                                        value={formData.studentId} onChange={e => setFormData({ ...formData, studentId: e.target.value })} />
                                    <p className="text-[10px] text-yellow-400/80">Your password will be the last 8 digits of your Student ID</p>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-text-secondary">Class *</label>
                                    <select required className="w-full bg-bg-input border border-white/5 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-primary/50 outline-none appearance-none"
                                        value={formData.classId} onChange={e => setFormData({ ...formData, classId: e.target.value })} >
                                        <option value="" disabled className="text-gray-500">Select your class</option>
                                        {CLASS_OPTIONS.map(opt => (
                                            <option key={opt} value={opt} className="bg-bg-card text-white">{opt}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-text-secondary">RFID Card ID *</label>
                                    <input type="text" required placeholder="Enter your RFID card ID" className="w-full bg-bg-input border border-white/5 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-primary/50 outline-none"
                                        value={formData.rfidUid} onChange={e => setFormData({ ...formData, rfidUid: e.target.value })} />
                                    <p className="text-[10px] text-text-muted">This ID should match your RFID card</p>
                                </div>
                            </>
                        )}

                        {/* --- TEACHER FORM --- */}
                        {role === 'teacher' && (
                            <>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-text-secondary">Full Name *</label>
                                    <input type="text" required placeholder="Enter your full name" className="w-full bg-bg-input border border-white/5 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-primary/50 outline-none"
                                        value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-text-secondary">Phone No. *</label>
                                    <input type="tel" required placeholder="Enter your PHONE NO. (min 8 digits)" className="w-full bg-bg-input border border-white/5 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-primary/50 outline-none"
                                        value={formData.phoneNumber} onChange={e => setFormData({ ...formData, phoneNumber: e.target.value })} />
                                    <p className="text-[10px] text-yellow-400/80">Your password will be the last 8 digits of your PHONE you will be able to change it later</p>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-text-secondary">Email ID *</label>
                                    <input type="email" required placeholder="emailid@email.com" className="w-full bg-bg-input border border-white/5 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-primary/50 outline-none"
                                        value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-text-secondary">Select class to manage *</label>
                                    <select required className="w-full bg-bg-input border border-white/5 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-primary/50 outline-none appearance-none"
                                        value={formData.classId} onChange={e => setFormData({ ...formData, classId: e.target.value })} >
                                        <option value="" disabled className="text-gray-500">Select the class you will be managing attendance for</option>
                                        {CLASS_OPTIONS.map(opt => (
                                            <option key={opt} value={opt} className="bg-bg-card text-white">{opt}</option>
                                        ))}
                                    </select>
                                </div>
                            </>
                        )}

                        {/* --- PRINCIPAL FORM --- */}
                        {role === 'principal' && (
                            <>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-text-secondary">Full Name</label>
                                    <input type="text" required className="w-full bg-bg-input border border-white/5 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-primary/50 outline-none"
                                        value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-text-secondary">Email</label>
                                    <input type="email" required className="w-full bg-bg-input border border-white/5 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-primary/50 outline-none"
                                        value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-text-secondary">Phone No. *</label>
                                    <input type="tel" required placeholder="Enter your PHONE NO. (min 8 digits)" className="w-full bg-bg-input border border-white/5 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-primary/50 outline-none"
                                        value={formData.phoneNumber} onChange={e => setFormData({ ...formData, phoneNumber: e.target.value })} />
                                    <p className="text-[10px] text-yellow-400/80">Your password will be the last 8 digits of your PHONE.</p>
                                </div>
                            </>
                        )}

                        {/* --- IT ADMIN FORM --- */}
                        {role === 'it_admin' && (
                            <>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-text-secondary">Full Name</label>
                                    <input type="text" required className="w-full bg-bg-input border border-white/5 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-primary/50 outline-none"
                                        value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-text-secondary">Email</label>
                                    <input type="email" required className="w-full bg-bg-input border border-white/5 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-primary/50 outline-none"
                                        value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-text-secondary">Password</label>
                                    <input type="password" required className="w-full bg-bg-input border border-white/5 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-primary/50 outline-none"
                                        value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} />
                                </div>
                            </>
                        )}

                        <div className="flex gap-3 pt-2">
                            <Button type="submit" size="lg" className="w-full bg-primary hover:bg-primary-hover text-white font-bold shadow-lg shadow-primary/25" disabled={loading}>
                                {loading ? <Loader2 className="animate-spin" /> : 'Create Account'}
                            </Button>
                        </div>
                    </form>
                )}

                <div className="mt-8 text-center text-sm text-text-muted">
                    Already have an account?{' '}
                    <Link href="/login" className="text-primary hover:text-primary-light font-medium">
                        Sign In
                    </Link>
                </div>
            </GlassCard>
        </div>
    );
}

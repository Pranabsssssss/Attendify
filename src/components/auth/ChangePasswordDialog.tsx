'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Lock, Mail, Loader2, KeyRound } from 'lucide-react';

interface ChangePasswordDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    userEmail?: string;
}

export function ChangePasswordDialog({ open, onOpenChange, userEmail }: ChangePasswordDialogProps) {
    const [step, setStep] = useState<'request' | 'verify'>('request');
    const [loading, setLoading] = useState(false);
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');

    const handleRequestOtp = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/auth/otp/send', { method: 'POST' });
            const data = await res.json();

            if (!res.ok) throw new Error(data.error || 'Failed to send OTP');

            toast.success("OTP sent to your email!");
            setStep('verify');
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        if (!otp || !newPassword) {
            toast.error("Please fill all fields");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch('/api/auth/change-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ otp, newPassword })
            });
            const data = await res.json();

            if (!res.ok) throw new Error(data.error || 'Failed to update password');

            toast.success("Password changed successfully!");
            onOpenChange(false);
            // Reset state
            setStep('request');
            setOtp('');
            setNewPassword('');
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md bg-bg-secondary border border-white/10 text-white">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Lock className="w-5 h-5 text-primary" />
                        Secure Password Change
                    </DialogTitle>
                    <DialogDescription className="text-text-secondary">
                        {step === 'request'
                            ? "For security, we need to verify your identity via OTP sent to your registered email."
                            : `Enter the OTP sent to ${userEmail || 'your email'} and your new password.`
                        }
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4 space-y-4">
                    {step === 'request' ? (
                        <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-white/10 rounded-xl bg-white/5">
                            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mb-3">
                                <Mail className="w-6 h-6 text-primary-light" />
                            </div>
                            <p className="text-sm text-center text-text-muted mb-4">
                                Click below to receive a One-Time Password (OTP).
                            </p>
                            <Button onClick={handleRequestOtp} disabled={loading} className="w-full">
                                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Mail className="w-4 h-4 mr-2" />}
                                Send OTP
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-4 animate-in slide-in-from-right-4 fade-in">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-text-secondary">Enter OTP</label>
                                <div className="relative">
                                    <KeyRound className="absolute left-3 top-2.5 h-5 w-5 text-text-muted" />
                                    <Input
                                        placeholder="6-digit code"
                                        className="pl-10 bg-white/5 border-white/10 text-white"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                        maxLength={6}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-text-secondary">New Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-2.5 h-5 w-5 text-text-muted" />
                                    <Input
                                        type="password"
                                        placeholder="New secure password"
                                        className="pl-10 bg-white/5 border-white/10 text-white"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter className="flex-row justify-end space-x-2">
                    <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
                    {step === 'verify' && (
                        <Button onClick={handleSubmit} disabled={loading}>
                            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : 'Change Password'}
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

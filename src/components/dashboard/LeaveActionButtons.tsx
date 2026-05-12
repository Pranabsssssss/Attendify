'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { updateLeaveStatus } from '@/lib/actions/teacher';
import { toast } from 'sonner';
import { Loader2, MessageSquare } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
    DialogDescription
} from "@/components/ui/dialog";

interface LeaveActionButtonsProps {
    leaveId: string;
    studentName: string;
}

export function LeaveActionButtons({ leaveId, studentName }: LeaveActionButtonsProps) {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [action, setAction] = useState<'Approved' | 'Rejected' | null>(null);
    const [open, setOpen] = useState(false);

    const handleAction = (status: 'Approved' | 'Rejected') => {
        setAction(status);
        setOpen(true);
    };

    const confirmAction = async () => {
        if (!action) return;
        setLoading(true);
        try {
            await updateLeaveStatus(leaveId, action, message);
            toast.success(`Request ${action} successfully`);
            setOpen(false);
        } catch (error: any) {
            toast.error(error.message || 'Failed to update status');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className="flex gap-2">
                <Button
                    size="sm"
                    className="bg-green-500/10 text-green-400 hover:bg-green-500/20 border border-green-500/20"
                    onClick={() => handleAction('Approved')}
                >
                    Approve
                </Button>
                <Button
                    size="sm"
                    className="bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20"
                    onClick={() => handleAction('Rejected')}
                >
                    Reject
                </Button>
            </div>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="bg-bg-card border-white/10 text-white">
                    <DialogHeader>
                        <DialogTitle>{action} Leave Request</DialogTitle>
                        <DialogDescription className="text-text-secondary">
                            Are you sure you want to {action?.toLowerCase()} the request for <span className="text-white font-medium">{studentName}</span>?
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-2 py-4">
                        <label className="text-sm font-medium text-text-secondary flex items-center gap-2">
                            <MessageSquare size={14} />
                            Optional Message
                        </label>
                        <textarea
                            className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-sm focus:outline-none focus:border-primary/50 min-h-[80px]"
                            placeholder={`Reason for ${action?.toLowerCase()}...`}
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                        />
                    </div>

                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setOpen(false)} disabled={loading}>
                            Cancel
                        </Button>
                        <Button
                            className={action === 'Approved' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
                            onClick={confirmAction}
                            disabled={loading}
                        >
                            {loading ? <Loader2 className="animate-spin" size={16} /> : `Confirm ${action}`}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

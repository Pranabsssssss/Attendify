'use client';

import { useState, useEffect } from 'react';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { Loader2, Search, Edit2, Save, X, Trash2, Check } from 'lucide-react';
import { getAllUsers } from '@/lib/actions/admin';
import { toast } from 'sonner';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export default function AdminDashboard() {
    const [users, setUsers] = useState<any[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [roleFilter, setRoleFilter] = useState('all');

    // Edit State
    const [editingUser, setEditingUser] = useState<any>(null);
    const [editValue, setEditValue] = useState('');

    // Delete State
    const [deletingUser, setDeletingUser] = useState<any>(null);

    useEffect(() => {
        loadUsers();
    }, []);

    useEffect(() => {
        filterUsers();
    }, [users, search, roleFilter]);

    const loadUsers = async () => {
        setLoading(true);
        try {
            const data = await getAllUsers('');
            setUsers(data);
        } catch (error) {
            toast.error('Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    const filterUsers = () => {
        let filtered = users;

        if (roleFilter !== 'all') {
            filtered = filtered.filter(u => u.role === roleFilter);
        }

        if (search) {
            const lowerSearch = search.toLowerCase();
            filtered = filtered.filter(u =>
                u.name.toLowerCase().includes(lowerSearch) ||
                (u.email && u.email.toLowerCase().includes(lowerSearch)) ||
                (u.studentId && u.studentId.toLowerCase().includes(lowerSearch))
            );
        }

        setFilteredUsers(filtered);
    };

    const handleDelete = async () => {
        if (!deletingUser) return;
        try {
            const res = await fetch(`/api/users/${deletingUser._id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Failed to delete');

            setUsers(users.filter(u => u._id !== deletingUser._id));
            toast.success('User deleted successfully');
            setDeletingUser(null);
        } catch (error) {
            toast.error('Failed to delete user');
        }
    };

    const handleUpdate = async () => {
        if (!editingUser) return;
        try {
            const body: any = {};
            if (editingUser.role === 'student') body.studentId = editValue;
            else body.email = editValue;

            const res = await fetch(`/api/users/${editingUser._id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            if (!res.ok) throw new Error('Failed to update');

            setUsers(users.map(u => u._id === editingUser._id ? { ...u, ...body } : u));
            toast.success('User updated successfully');
            setEditingUser(null);
        } catch (error) {
            toast.error('Failed to update user');
        }
    };

    return (
        <div className="p-8 space-y-6 animate-in fade-in duration-500 max-w-7xl mx-auto">

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white">User Management</h1>
                    <p className="text-text-secondary">Manage accounts, update IDs, and remove users.</p>
                </div>

                <div className="flex gap-2 bg-white/5 p-1 rounded-lg">
                    {['all', 'principal', 'teacher', 'student'].map((role) => (
                        <button
                            key={role}
                            onClick={() => setRoleFilter(role)}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${roleFilter === role
                                ? 'bg-primary text-white shadow-lg'
                                : 'text-text-secondary hover:text-white hover:bg-white/5'
                                }`}
                        >
                            {role.charAt(0).toUpperCase() + role.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            <GlassCard className="min-h-[600px] flex flex-col">
                <div className="mb-6 relative">
                    <Search className="absolute left-3 top-3 w-5 h-5 text-text-muted" />
                    <Input
                        placeholder="Search by name, email, or ID..."
                        className="pl-10 h-12 bg-white/5 border-white/10 text-lg hover:border-white/20 focus:border-primary/50 transition-all"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <div className="overflow-x-auto flex-1">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-white/5 text-text-secondary text-sm bg-white/5 rounded-t-lg">
                                <th className="p-4 rounded-tl-lg">Name</th>
                                <th className="p-4">Role</th>
                                <th className="p-4">Identifier (Email / Student ID)</th>
                                <th className="p-4 rounded-tr-lg text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="text-white">
                            {loading ? (
                                <tr><td colSpan={4} className="p-8 text-center text-text-muted">Loading users...</td></tr>
                            ) : filteredUsers.length === 0 ? (
                                <tr><td colSpan={4} className="p-8 text-center text-text-muted">No users found matching your filters.</td></tr>
                            ) : (
                                filteredUsers.map((user) => (
                                    <tr key={user._id} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                                        <td className="p-4 font-medium flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary-light">
                                                {user.name[0]}
                                            </div>
                                            {user.name}
                                        </td>
                                        <td className="p-4">
                                            <Badge variant={user.role === 'student' ? 'secondary' : 'default'} className="capitalize">
                                                {user.role}
                                            </Badge>
                                        </td>
                                        <td className="p-4 font-mono text-sm text-text-secondary">
                                            {user.role === 'student' ? (
                                                <span className="text-blue-300">ID: {user.studentId}</span>
                                            ) : (
                                                <span className="text-orange-300">{user.email || 'No Email'}</span>
                                            )}
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex justify-end gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="hover:bg-blue-500/20 hover:text-blue-400"
                                                    onClick={() => {
                                                        setEditingUser(user);
                                                        setEditValue(user.role === 'student' ? user.studentId : user.email);
                                                    }}
                                                >
                                                    <Edit2 size={16} />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="hover:bg-red-500/20 hover:text-red-400"
                                                    onClick={() => setDeletingUser(user)}
                                                >
                                                    <Trash2 size={16} />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </GlassCard>

            {/* Edit Dialog */}
            <Dialog open={!!editingUser} onOpenChange={(open) => !open && setEditingUser(null)}>
                <DialogContent className="bg-[#1a1a2e] border-white/10 text-white">
                    <DialogHeader>
                        <DialogTitle>Edit User</DialogTitle>
                        <DialogDescription>
                            Update {editingUser?.role === 'student' ? 'Student ID' : 'Email Address'} for {editingUser?.name}.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <label className="text-sm text-text-secondary mb-2 block">
                            {editingUser?.role === 'student' ? 'Student ID' : 'Email Address'}
                        </label>
                        <Input
                            value={editValue || ''}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="bg-black/20 border-white/10"
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setEditingUser(null)}>Cancel</Button>
                        <Button onClick={handleUpdate} className="bg-primary hover:bg-primary/90">Save Changes</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Dialog */}
            <Dialog open={!!deletingUser} onOpenChange={(open) => !open && setDeletingUser(null)}>
                <DialogContent className="bg-[#1a1a2e] border-white/10 text-white">
                    <DialogHeader>
                        <DialogTitle className="text-red-400">Delete User</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete <strong>{deletingUser?.name}</strong>? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setDeletingUser(null)}>Cancel</Button>
                        <Button variant="destructive" onClick={handleDelete}>Delete User</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

        </div>
    );
}

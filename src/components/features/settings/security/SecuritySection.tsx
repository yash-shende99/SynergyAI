// components/features/settings/security/SecuritySection.tsx
'use client';

import { useState } from 'react';
import { supabase } from '../../../../lib/supabaseClient';
import {Button} from '../../../ui/button';
import { KeyRound, Shield, Loader2, CheckCircle, AlertTriangle } from 'lucide-react';

export default function SecuritySection() {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const handleUpdatePassword = async () => {
        setError('');
        setSuccessMessage('');

        if (newPassword !== confirmPassword) {
            setError("New passwords do not match.");
            return;
        }
        if (newPassword.length < 6) {
            setError("New password must be at least 6 characters long.");
            return;
        }

        setIsLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) { alert("Please log in"); return; }

        try {
            const response = await fetch('http://localhost:8000/api/users/me/change-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session.access_token}` },
                body: JSON.stringify({
                    current_password: currentPassword,
                    new_password: newPassword,
                    confirm_password: confirmPassword
                })
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.detail || "Failed to update password.");
            }

            setSuccessMessage(data.message);
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');

        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="p-6 rounded-xl border border-border bg-surface/50">
                <div className="flex items-center gap-3 mb-4">
                    <KeyRound className="h-6 w-6 text-primary"/>
                    <h3 className="text-lg font-bold text-white">Change Password</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                        <label className="text-xs text-secondary">Current Password</label>
                        <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} placeholder="••••••••" className="w-full mt-1 bg-background border border-border rounded-md p-2"/>
                    </div>
                    <div></div> {/* Spacer */}
                    <div>
                        <label className="text-xs text-secondary">New Password</label>
                        <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="••••••••" className="w-full mt-1 bg-background border border-border rounded-md p-2"/>
                    </div>
                     <div>
                        <label className="text-xs text-secondary">Confirm New Password</label>
                        <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="••••••••" className="w-full mt-1 bg-background border border-border rounded-md p-2"/>
                    </div>
                </div>
                
                {error && <div className="mt-4 p-3 text-sm flex items-center gap-2 bg-red-500/10 text-red-400 rounded-md border border-red-500/30"><AlertTriangle size={16}/>{error}</div>}
                {successMessage && <div className="mt-4 p-3 text-sm flex items-center gap-2 bg-green-500/10 text-green-400 rounded-md border border-green-500/30"><CheckCircle size={16}/>{successMessage}</div>}
                
                <div className="mt-4 flex justify-end">
                    <Button onClick={handleUpdatePassword} disabled={isLoading} variant="default" size="sm">
                        {isLoading ? <><Loader2 size={16} className="mr-2 animate-spin"/>Updating...</> : 'Update Password'}
                    </Button>
                </div>
            </div>
        </div>
    );
}
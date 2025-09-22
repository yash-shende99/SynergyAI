'use client';

import {Button} from '../../../ui/button';
import { Shield, KeyRound, Smartphone } from 'lucide-react';

export default function SecuritySection() {
  return (
    <div className="space-y-6">
      {/* Change Password Section */}
      <div className="p-6 rounded-xl border border-border bg-surface/50">
        <div className="flex items-center gap-3 mb-4">
            <KeyRound className="h-6 w-6 text-primary"/>
            <h3 className="text-lg font-bold text-white">Change Password</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
                <label className="text-xs text-secondary">Current Password</label>
                <input type="password" placeholder="••••••••" className="w-full mt-1 bg-background border border-border rounded-md p-2"/>
            </div>
            <div></div> {/* Spacer */}
            <div>
                <label className="text-xs text-secondary">New Password</label>
                <input type="password" placeholder="••••••••" className="w-full mt-1 bg-background border border-border rounded-md p-2"/>
            </div>
             <div>
                <label className="text-xs text-secondary">Confirm New Password</label>
                <input type="password" placeholder="••••••••" className="w-full mt-1 bg-background border border-border rounded-md p-2"/>
            </div>
        </div>
        <div className="mt-4 text-right">
            <Button variant="default" size="sm">Update Password</Button>
        </div>
      </div>

      {/* Multi-Factor Authentication Section */}
      <div className="p-6 rounded-xl border border-border bg-surface/50">
        <div className="flex items-center gap-3 mb-4">
            <Smartphone className="h-6 w-6 text-primary"/>
            <h3 className="text-lg font-bold text-white">Multi-Factor Authentication (MFA)</h3>
        </div>
        <div className="flex items-center justify-between p-4 rounded-lg bg-background/50">
            <div>
                <p className="font-medium text-white">Authenticator App</p>
                <p className="text-xs text-secondary">Use an app like Google Authenticator or Authy.</p>
            </div>
            <Button variant="secondary" size="sm">Enable MFA</Button>
        </div>
      </div>
    </div>
  );
}
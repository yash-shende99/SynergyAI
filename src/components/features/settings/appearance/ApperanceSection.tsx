'use client';

import { Palette, Sun, Moon } from 'lucide-react';

const accentColors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

export default function AppearanceSection() {
  return (
    <div className="p-6 rounded-xl border border-border bg-surface/50">
        <div className="flex items-center gap-3 mb-6">
            <Palette className="h-6 w-6 text-primary"/>
            <h3 className="text-lg font-bold text-white">Theme & Appearance</h3>
        </div>

        {/* Theme Selection */}
        <div>
            <h4 className="text-sm font-semibold text-secondary mb-2">Mode</h4>
            <div className="grid grid-cols-2 gap-4">
                <button className="p-4 rounded-lg border-2 border-primary bg-surface text-white">
                    <Moon className="mx-auto mb-2"/> Dark Mode
                </button>
                <button className="p-4 rounded-lg border border-border bg-background/50 text-secondary hover:border-secondary">
                    <Sun className="mx-auto mb-2"/> Light Mode
                </button>
            </div>
        </div>
        
        {/* Accent Color Selection */}
        <div className="mt-6">
             <h4 className="text-sm font-semibold text-secondary mb-2">Accent Color</h4>
             <div className="flex gap-3">
                {accentColors.map(color => (
                    <button key={color} style={{ backgroundColor: color }} className={`h-8 w-8 rounded-full transition-transform hover:scale-110 ${color === '#3B82F6' ? 'ring-2 ring-offset-2 ring-offset-surface ring-white' : ''}`}/>
                ))}
             </div>
        </div>
    </div>
  );
}
'use client';

import { FC, useState, useEffect } from 'react';
import { Project, DealStatus } from '../../../../types';
import { supabase } from '../../../../lib/supabaseClient';
import {Button} from '../../../ui/button';
import { Settings, Loader2 } from 'lucide-react';

interface GeneralSettingsSectionProps {
  project: Project;
  onUpdate: () => void;
}

const GeneralSettingsSection: FC<GeneralSettingsSectionProps> = ({ project, onUpdate }) => {
  const [name, setName] = useState(project.name);
  const [status, setStatus] = useState<DealStatus>(project.status);
  const [isSaving, setIsSaving] = useState(false);

  const hasChanges = name !== project.name || status !== project.status;

  const handleSave = async () => {
    setIsSaving(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { alert("Please log in"); return; }
    try {
      const response = await fetch(`http://localhost:8000/api/projects/${project.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session.access_token}` },
        body: JSON.stringify({ name, status })
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.detail || "Failed to save changes.");
      }
      alert("Project updated successfully!");
      onUpdate(); // Trigger a refetch in the parent
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
            <Settings className="h-8 w-8 text-primary"/>
            <div>
                <h2 className="text-2xl font-bold text-white">General Project Settings</h2>
                <p className="text-secondary">Update the core details and status of this project.</p>
            </div>
        </div>
        <div className="p-6 rounded-xl border border-border bg-surface/50 space-y-4">
            <div>
                <label className="text-xs text-secondary">Project Name</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full mt-1 bg-background border border-border rounded-md p-2"/>
            </div>
            <div>
                <label className="text-xs text-secondary">Project Status</label>
                <select value={status} onChange={e => setStatus(e.target.value as DealStatus)} className="w-full mt-1 bg-background border border-border rounded-md p-2">
                    <option>Sourcing</option>
                    <option>Diligence</option>
                    <option>Negotiation</option>
                    <option>Completed</option>
                </select>
            </div>
        </div>
        <div className="flex justify-end">
            <Button onClick={handleSave} disabled={!hasChanges || isSaving}>
                {isSaving ? <><Loader2 size={16} className="animate-spin mr-2"/>Saving...</> : 'Save Changes'}
            </Button>
        </div>
    </div>
  );
};
export default GeneralSettingsSection;

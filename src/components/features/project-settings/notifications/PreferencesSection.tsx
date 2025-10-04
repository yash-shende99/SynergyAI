'use client';

import { FC, useState, useEffect } from 'react';
import { ProjectNotificationSettings } from '../../../../types';
import {Button} from '../../../ui/button';
import { Bell, Mail, MessageSquare, ClipboardCheck, Loader2 } from 'lucide-react';
import SettingsToggle from './SettingsToggle';

interface PreferencesSectionProps {
  settings: ProjectNotificationSettings;
  onSave: (settings: ProjectNotificationSettings) => Promise<void>;
}

const PreferencesSection: FC<PreferencesSectionProps> = ({ settings, onSave }) => {
  const [currentSettings, setCurrentSettings] = useState(settings);
  const [isSaving, setIsSaving] = useState(false);

  // This effect ensures that if the parent component re-fetches the data,
  // our local form state is updated to match.
  useEffect(() => {
    setCurrentSettings(settings);
  }, [settings]);

  // A generic handler for our toggle switches
  const handleToggle = (key: keyof ProjectNotificationSettings, value: boolean) => {
    setCurrentSettings(prev => ({...prev, [key]: value}));
  };

  // A handler for our radio-style buttons
  const handleFrequencyChange = (value: 'Instantly' | 'Daily' | 'None') => {
    setCurrentSettings(prev => ({...prev, email_frequency: value}));
  };
  
  const handleSaveClick = async () => {
    setIsSaving(true);
    await onSave(currentSettings);
    setIsSaving(false);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
            <Bell className="h-8 w-8 text-primary"/>
            <div>
                <h2 className="text-2xl font-bold text-white">My Notification Preferences</h2>
                <p className="text-secondary">Manage how you are notified about events within this project.</p>
            </div>
        </div>
        <div className="p-6 rounded-xl border border-border bg-surface/50 space-y-6">
            
            {/* --- THIS IS THE DEFINITIVE FIX: The complete UI is now built --- */}
            
            {/* In-App Alerts Section */}
            <div>
                <h3 className="font-semibold text-white mb-2">In-App Alerts</h3>
                <div className="space-y-1">
                    <SettingsToggle 
                        icon={<Mail size={20}/>} 
                        label="New Document Alerts" 
                        description="Notify me when a new document is uploaded to the VDR." 
                        isChecked={currentSettings.in_app_new_document} 
                        onToggle={() => handleToggle('in_app_new_document', !currentSettings.in_app_new_document)} 
                    />
                    <SettingsToggle 
                        icon={<MessageSquare size={20}/>} 
                        label="Comment Mentions" 
                        description="Notify me when a team member @mentions me in a comment." 
                        isChecked={currentSettings.in_app_mention} 
                        onToggle={() => handleToggle('in_app_mention', !currentSettings.in_app_mention)} 
                    />
                    <SettingsToggle 
                        icon={<ClipboardCheck size={20}/>} 
                        label="Task Assignments" 
                        description="Notify me when a task is assigned to me." 
                        isChecked={currentSettings.in_app_task_assigned} 
                        onToggle={() => handleToggle('in_app_task_assigned', !currentSettings.in_app_task_assigned)} 
                    />
                </div>
            </div>

            {/* Email Frequency Section */}
            <div>
                <h3 className="font-semibold text-white mb-2">Email Frequency</h3>
                 <div className="flex gap-2">
                    {(['Instantly', 'Daily', 'None'] as const).map(freq => (
                        <button 
                            key={freq} 
                            onClick={() => handleFrequencyChange(freq)}
                            className={`px-3 py-1 text-sm rounded-md border transition-colors ${
                                currentSettings.email_frequency === freq 
                                    ? 'bg-primary text-white border-primary' 
                                    : 'bg-surface text-secondary border-border hover:border-secondary'
                            }`}
                        >
                            {freq}
                        </button>
                    ))}
                 </div>
            </div>
            {/* --- END OF FIX --- */}
        </div>
        <div className="flex justify-end">
            <Button onClick={handleSaveClick} disabled={isSaving}>
                {isSaving ? <><Loader2 size={16} className="animate-spin mr-2"/>Saving...</> : 'Save Preferences'}
            </Button>
        </div>
    </div>
  );
};
export default PreferencesSection;


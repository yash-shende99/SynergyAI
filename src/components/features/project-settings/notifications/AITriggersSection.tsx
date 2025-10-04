'use client';

import { FC, useState, useEffect } from 'react';
import { ProjectNotificationSettings } from '../../../../types';
import {Button} from '../../../ui/button';
import { Bot, AlertTriangle, Newspaper, BarChart, Loader2 } from 'lucide-react';
import SettingsToggle from './SettingsToggle';

interface AITriggersSectionProps {
  settings: ProjectNotificationSettings;
  onSave: (settings: ProjectNotificationSettings) => Promise<void>;
}

const AITriggersSection: FC<AITriggersSectionProps> = ({ settings, onSave }) => {
  const [currentSettings, setCurrentSettings] = useState(settings);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setCurrentSettings(settings);
  }, [settings]);

  const handleToggle = (key: keyof ProjectNotificationSettings, value: boolean) => {
    setCurrentSettings(prev => ({...prev, [key]: value}));
  };
  
  const handleSaveClick = async () => {
    setIsSaving(true);
    await onSave(currentSettings);
    setIsSaving(false);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
            <Bot className="h-8 w-8 text-primary"/>
            <div>
                <h2 className="text-2xl font-bold text-white">AI Alert Triggers</h2>
                <p className="text-secondary">Configure the AI Watchdog to proactively monitor this project.</p>
            </div>
        </div>
        <div className="p-6 rounded-xl border border-border bg-surface/50 space-y-1">
            <SettingsToggle 
                icon={<AlertTriangle size={20}/>} 
                label="Critical Risk Detection" 
                description="Notify me if the AI detects a new Critical or High severity risk in the VDR." 
                isChecked={currentSettings.ai_critical_risk} 
                onToggle={() => handleToggle('ai_critical_risk', !currentSettings.ai_critical_risk)} 
            />
            <SettingsToggle 
                icon={<Newspaper size={20}/>} 
                label="Negative News Alerts" 
                description="Notify me if there is significant negative news about the target or its key competitors." 
                isChecked={currentSettings.ai_negative_news} 
                onToggle={() => handleToggle('ai_negative_news', !currentSettings.ai_negative_news)} 
            />
            <SettingsToggle 
                icon={<BarChart size={20}/>} 
                label="Valuation Metric Shifts" 
                description="Notify me if a key valuation metric (e.g., peer P/E ratio) changes by more than 5%." 
                isChecked={currentSettings.ai_valuation_change} 
                onToggle={() => handleToggle('ai_valuation_change', !currentSettings.ai_valuation_change)} 
            />
        </div>
        <div className="flex justify-end">
            <Button onClick={handleSaveClick} disabled={isSaving}>
                {isSaving ? <><Loader2 size={16} className="animate-spin mr-2"/>Saving...</> : 'Save AI Triggers'}
            </Button>
        </div>
    </div>
  );
};
export default AITriggersSection;

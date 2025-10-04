'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { ProjectNotificationSettings } from '../../../../../../types';
import { Loader2, AlertTriangle } from 'lucide-react';
import { supabase } from '../../../../../../lib/supabaseClient';
import PreferencesSection from '../../../../../../components/features/project-settings/notifications/PreferencesSection';
import AITriggersSection from '../../../../../../components/features/project-settings/notifications/AITriggersSection';

export default function ProjectNotificationsPage() {
  const [settings, setSettings] = useState<ProjectNotificationSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeSection, setActiveSection] = useState<'preferences' | 'ai-triggers'>('preferences');
  const params = useParams();
  const projectId = params.projectId as string;

  const fetchSettings = useCallback(async () => {
    if (!projectId) return;
    setIsLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { 
      setError("Not authenticated");
      setIsLoading(false); 
      return; 
    }
    
    try {
      const response = await fetch(`http://localhost:8000/api/projects/${projectId}/notifications/settings`, {
        headers: { 'Authorization': `Bearer ${session.access_token}` }
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || "Failed to fetch settings.");
      }
      const data = await response.json();
      setSettings(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleSave = async (updatedSettings: ProjectNotificationSettings) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { 
      alert("Please log in to save settings.");
      return; 
    }
    try {
      const response = await fetch(`http://localhost:8000/api/projects/${projectId}/notifications/settings`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}` 
        },
        body: JSON.stringify(updatedSettings)
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || "Failed to save preferences.");
      }
      setSettings(updatedSettings);
      alert("Settings saved successfully!");
    } catch (error: any) {
      alert(`Error saving settings: ${error.message}`);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-full"><Loader2 className="h-8 w-8 animate-spin text-primary"/></div>;
  }
  
  if (error || !settings) {
    return <div className="flex flex-col justify-center items-center h-full text-red-400"><AlertTriangle className="h-8 w-8 mb-2"/><p>{error || "Could not load settings."}</p></div>;
  }

  return (
    <div className="space-y-8">
      {/* Section Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveSection('preferences')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeSection === 'preferences'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            My Preferences
          </button>
          <button
            onClick={() => setActiveSection('ai-triggers')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeSection === 'ai-triggers'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            AI Triggers
          </button>
        </nav>
      </div>

      {/* Content Section */}
      <div>
        {activeSection === 'preferences' && (
          <PreferencesSection 
            settings={settings}
            onSave={handleSave}
          />
        )}
        
        {activeSection === 'ai-triggers' && (
          <AITriggersSection 
            settings={settings}
            onSave={handleSave}
          />
        )}
      </div>
    </div>
  );
}
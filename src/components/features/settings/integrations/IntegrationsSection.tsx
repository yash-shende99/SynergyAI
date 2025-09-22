'use client';

import { Plug } from 'lucide-react';
import IntegrationCard from '../integrations/IntegrationCard';

export default function IntegrationsSection() {
  return (
    <div className="p-6 rounded-xl border border-border bg-surface/50">
      <div className="flex items-center gap-3 mb-4">
        <Plug className="h-6 w-6 text-primary"/>
        <h3 className="text-lg font-bold text-white">Integrations Hub</h3>
      </div>
      <p className="text-secondary text-sm mb-6">Connect SynergyAI with your favorite tools to streamline your workflow.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <IntegrationCard name="Slack" description="Send real-time alerts and notifications to your Slack channels." logoUrl="/logos/slack.svg" isConnected={true} />
        <IntegrationCard name="MS Teams" description="Integrate with your Microsoft Teams workspace for deal updates." logoUrl="/logos/teams.svg" isConnected={false} />
        <IntegrationCard name="Salesforce" description="Sync deal data and company profiles with your Salesforce CRM." logoUrl="/logos/salesforce.svg" isConnected={false} />
      </div>
    </div>
  );
}
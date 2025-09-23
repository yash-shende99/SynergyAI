import { NavItem, FeatureConfig } from '../types';
import { LayoutDashboard, Lightbulb, Search, MessageCircle, BookOpen, Users, Bell, Settings, Rocket, ShieldCheck, BarChart, Calculator, FileText, ClipboardList } from 'lucide-react';

// --- DEFINITIVE SIDEBAR NAVIGATION ---

export const globalNavItems: NavItem[] = [
  { id: 'dashboard', name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { id: 'recommendations', name: 'AI Recommendations', href: '/dashboard/recommendations', icon: Lightbulb },
  { id: 'sourcing', name: 'Deal Sourcing', href: '/dashboard/sourcing', icon: Search },
  { id: 'chat', name: 'Global AI Co-Pilot', href: '/dashboard/chat', icon: MessageCircle },
  { id: 'library', name: 'Knowledge Library', href: '/dashboard/knowledge-library', icon: BookOpen },
  { id: 'team-chat', name: 'Team Chat', href: '/dashboard/team-chat', icon: Users }
];

// Update projectNavItems to have proper base paths
export const projectNavItems: NavItem[] = [
  { id: 'mission-control', name: 'Mission Control', href: '', icon: Rocket },
  { id: 'vdr', name: 'Project VDR', href: '/vdr', icon: ShieldCheck },
  { id: 'analytics', name: 'Analytics & Risk', href: '/analytics', icon: BarChart },
  { id: 'valuation', name: 'Valuation', href: '/valuation', icon: Calculator },
  { id: 'reports', name: 'Reports', href: '/reports', icon: FileText },
  { id: 'chat', name: 'Project AI Co-Pilot', href: '/chat', icon: MessageCircle },
  { id: 'team', name: 'Team & Permissions', href: '/team', icon: Users }
];

// --- DEFINITIVE HORIZONTAL FEATURE HEADERS ---

export const featureConfig: Record<string, FeatureConfig> = {
  'dashboard': { 
    title: 'Dashboard', 
    subFeatures: [
      { name: 'Pipeline', href: '/dashboard' }, 
      { name: 'AI Summary', href: '/dashboard/summary' },
      { name: 'Next Actions', href: '/project/actions' }
    ]
  },
  'recommendations': {
    title: 'AI Recommendations',
    subFeatures: [
      { name: 'Suggested Companies', href: '/dashboard/recommendations' },
      { name: 'Screening Filters', href: '/dashboard/recommendations/filters' },
      { name: 'Saved Picks', href: '/dashboard/recommendations/saved' },
    ],
  },
  'sourcing': { 
    title: 'Deal Sourcing', 
    subFeatures: [
      { name: 'Search', href: '/dashboard/sourcing' },
      { name: 'Filters', href: '/dashboard/sourcing/filters' },
      { name: 'Watchlists', href: '/dashboard/sourcing/watchlists' },
      { name: 'Market Maps', href: '/dashboard/sourcing/maps' },
      { name: 'Strategic Engine', href: '/dashboard/sourcing/engine' },
    ]
  },
  'chat': {
    title: 'AI Co-Pilot',
    subFeatures: [
      { name: 'Ask', href: '/dashboard/chat' },
      { name: 'History', href: '/dashboard/chat/history' },
      { name: 'Suggested Questions', href: '/dashboard/chat/suggestions' },
      { name: 'Knowledge Retrieval', href: '/dashboard/chat/knowledge' },
    ],
  },
  'library': {
    title: 'Knowledge Library',
    subFeatures: [
      { name: 'Browse Docs', href: '/dashboard/knowledge-library' },
      { name: 'Tags & Topics', href: '/dashboard/knowledge-library/tags' },
      { name: 'Upload', href: '/dashboard/knowledge-library/upload' },
    ],
  },
  'team-chat': {
    title: 'Team Chat',
    subFeatures: [
      { name: 'Channels', href: '/dashboard/team-chat' },
      { name: 'Direct Messages', href: '/dashboard/team-chat/dm' },
      { name: 'Files', href: '/dashboard/team-chat/files' },
    ],
  },
  'notifications': {
    title: 'Notifications',
    subFeatures: [
      { name: 'All', href: '/dashboard/notifications' },
      { name: 'Deal Updates', href: '/dashboard/notifications/deals' },
      { name: 'Risk Alerts', href: '/dashboard/notifications/risks' },
      { name: 'Comments', href: '/dashboard/notifications/comments' },
      { name: 'System', href: '/dashboard/notifications/system' },
    ],
  },
  'settings': {
    title: 'Settings & Preferences',
    subFeatures: [
      { name: 'Profile', href: '/dashboard/settings' },
      { name: 'Security', href: '/dashboard/settings/security' },
      { name: 'Appearance', href: '/dashboard/settings/appearance' },
      { name: 'Team', href: '/dashboard/settings/team' },
      { name: 'Integrations', href: '/dashboard/settings/integrations' },
    ],
  },
  'mission-control': {
    title: 'Mission Control',
    subFeatures: [
      { name: 'Overview', href: '/project' },
      { name: 'AI Summary', href: '/project/summary' },
      { name: 'Key Risks', href: '/project/risks' },
      { name: 'Next Actions', href: '/project/actions' },
    ],
  },
  'vdr': { 
    title: 'Virtual Data Room', 
    subFeatures: [
      { name: 'Upload', href: '/vdr' }, 
      { name: 'Categories', href: '/vdr/categories' },
      { name: 'Search', href: '/vdr/search' }, 
      { name: 'Annotations', href: '/vdr/annotations' }, 
      { name: 'Q&A', href: '/vdr/qa' },
    ]
  },
  'analytics': {
    title: 'Analytics & Risk',
    subFeatures: [
      { name: 'Risk Score', href: '/analytics' },
      { name: 'Synergy Score', href: '/analytics/synergy' },
      { name: 'Knowledge Graph', href: '/analytics/graph' },
      { name: 'Alerts', href: '/analytics/alerts' },
    ],
  },
  'valuation': {
    title: 'Valuation & Models',
    subFeatures: [
      { name: 'Templates', href: '/valuation' },
      { name: 'Live Models', href: '/valuation/models' },
      { name: 'Scenarios', href: '/valuation/scenarios' },
      { name: 'Monte Carlo', href: '/valuation/mc' },
      { name: 'Synergies', href: '/valuation/synergies' },
    ],
  },
  'reports': {
    title: 'Reports & Memos',
    subFeatures: [
      { name: 'Drafts', href: '/reports' },
      { name: 'Templates', href: '/reports/templates' },
      { name: 'Export', href: '/reports/export' },
      { name: 'One-Click Memo', href: '/reports/generate' },
    ],
  },
  'team': {
    title: 'Team & Permissions',
    subFeatures: [
      { name: 'Members', href: '/team' },
      { name: 'Roles', href: '/team/roles' },
      { name: 'Invitations', href: '/team/invite' },
    ],
  },
};

// --- DEFINITIVE HELPER FUNCTIONS ---

export const findActiveFeature = (pathname: string, navItems: NavItem[], baseHref: string = '') => {
  let bestMatch: NavItem | null = null;
  for (const item of navItems) {
    const fullHref = `${baseHref}${item.href}`;
    if (pathname.startsWith(fullHref)) {
      if (!bestMatch || fullHref.length > (bestMatch.href || '').length) {
        bestMatch = { ...item, href: fullHref };
      }
    }
  }
  return bestMatch || { ...navItems[0], href: `${baseHref}${navItems[0].href}` };
};

// Export the original sub-feature objects for backward compatibility
export const globalSubFeatures = {
  dashboard: {
    title: 'Dashboard',
    subFeatures: [
      { name: 'Overview', href: '/dashboard' },
      { name: 'Pipeline', href: '/dashboard/projects' },
      { name: 'AI Insights', href: '/dashboard/insights' },
    ],
  },
  recommendations: {
    title: 'AI Recommendations',
    subFeatures: [
      { name: 'Suggested Companies', href: '/dashboard/recommendations' },
      { name: 'Screening Filters', href: '/dashboard/recommendations/filters' },
      { name: 'Saved Picks', href: '/dashboard/recommendations/saved' },
    ],
  },
  sourcing: {
    title: 'Deal Sourcing',
    subFeatures: [
      { name: 'Search', href: '/dashboard/sourcing' },
      { name: 'Filters', href: '/dashboard/sourcing/filters' },
      { name: 'Watchlists', href: '/dashboard/sourcing/watchlists' },
      { name: 'Market Maps', href: '/dashboard/sourcing/maps' },
      { name: 'Strategic Engine', href: '/dashboard/sourcing/engine' },
    ],
  },
  chat: {
    title: 'AI Co-Pilot',
    subFeatures: [
      { name: 'Ask', href: '/dashboard/chat' },
      { name: 'History', href: '/dashboard/chat/history' },
      { name: 'Suggested Questions', href: '/dashboard/chat/suggestions' },
      { name: 'Knowledge Retrieval', href: '/dashboard/chat/knowledge' },
    ],
  },
  library: {
    title: 'Knowledge Library',
    subFeatures: [
      { name: 'Browse Docs', href: '/dashboard/knowledge-library' },
      { name: 'Tags & Topics', href: '/dashboard/knowledge-library/tags' },
      { name: 'Upload', href: '/dashboard/knowledge-library/upload' },
    ],
  },
  teamChat: {
    title: 'Team Chat',
    subFeatures: [
      { name: 'Channels', href: '/dashboard/team-chat' },
      { name: 'Direct Messages', href: '/dashboard/team-chat/dm' },
      { name: 'Files', href: '/dashboard/team-chat/files' },
    ],
  },
  notifications: {
    title: 'Notifications',
    subFeatures: [
      { name: 'All', href: '/dashboard/notifications' },
      { name: 'Deal Updates', href: '/dashboard/notifications/deals' },
      { name: 'Risk Alerts', href: '/dashboard/notifications/risks' },
      { name: 'Comments', href: '/dashboard/notifications/comments' },
      { name: 'System', href: '/dashboard/notifications/system' },
    ],
  },
  settings: {
    title: 'Settings & Preferences',
    subFeatures: [
      { name: 'Profile', href: '/dashboard/settings' },
      { name: 'Security', href: '/dashboard/settings/security' },
      { name: 'Appearance', href: '/dashboard/settings/appearance' },
      { name: 'Team', href: '/dashboard/settings/team' },
      { name: 'Integrations', href: '/dashboard/settings/integrations' },
    ],
  },
};

export const projectSubFeatures = {
  missionControl: {
    title: 'Mission Control',
    subFeatures: [
      { name: 'Overview', href: '/project' },
      { name: 'AI Summary', href: '/project/summary' },
      { name: 'Key Risks', href: '/project/risks' },
      { name: 'Next Actions', href: '/project/actions' },
    ],
  },
  vdr: {
    title: 'Virtual Data Room',
    subFeatures: [
      { name: 'Upload', href: '/project/vdr' },
      { name: 'Categories', href: '/project/vdr/categories' },
      { name: 'Search', href: '/project/vdr/search' },
      { name: 'Annotations', href: '/project/vdr/annotations' },
      { name: 'Q&A', href: '/project/vdr/qa' },
    ],
  },
  chat: {
    title: 'AI Co-Pilot',
    subFeatures: [
      { name: 'Ask', href: '/project/chat' },
      { name: 'History', href: '/project/chat/history' },
      { name: 'Suggested Questions', href: '/project/chat/suggestions' },
      { name: 'Knowledge Retrieval', href: '/project/chat/knowledge' },
    ],
  },
  analytics: {
    title: 'Analytics & Risk',
    subFeatures: [
      { name: 'Risk Score', href: '/project/analytics' },
      { name: 'Synergy Score', href: '/project/analytics/synergy' },
      { name: 'Knowledge Graph', href: '/project/analytics/graph' },
      { name: 'Alerts', href: '/project/analytics/alerts' },
    ],
  },
  valuation: {
    title: 'Valuation & Models',
    subFeatures: [
      { name: 'Templates', href: '/project/valuation' },
      { name: 'Live Models', href: '/project/valuation/models' },
      { name: 'Scenarios', href: '/project/valuation/scenarios' },
      { name: 'Monte Carlo', href: '/project/valuation/mc' },
      { name: 'Synergies', href: '/project/valuation/synergies' },
    ],
  },
  reports: {
    title: 'Reports & Memos',
    subFeatures: [
      { name: 'Drafts', href: '/project/reports' },
      { name: 'Templates', href: '/project/reports/templates' },
      { name: 'Export', href: '/project/reports/export' },
      { name: 'One-Click Memo', href: '/project/reports/generate' },
    ],
  },
  team: {
    title: 'Team & Permissions',
    subFeatures: [
      { name: 'Members', href: '/project/team' },
      { name: 'Roles', href: '/project/team/roles' },
      { name: 'Invitations', href: '/project/team/invite' },
    ],
  },
  notifications: {
    title: 'Notifications',
    subFeatures: [
      { name: 'All', href: '/project/notifications' },
      { name: 'Deal Updates', href: '/project/notifications/deals' },
      { name: 'Risk Alerts', href: '/project/notifications/risks' },
      { name: 'Comments', href: '/project/notifications/comments' },
      { name: 'System', href: '/project/notifications/system' },
    ],
  },
  settings: {
    title: 'Settings',
    subFeatures: [
      { name: 'Project Info', href: '/project/settings' },
      { name: 'Security', href: '/project/settings/security' },
      { name: 'Integrations', href: '/project/settings/integrations' },
    ],
  },
};
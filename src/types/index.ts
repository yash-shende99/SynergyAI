// types/index.ts
import { LucideIcon } from 'lucide-react';

export interface DocumentVersion {
  id: string;
  documentId: string;
  version: string;
  content: string;
  createdAt: string;
  createdBy: {
    userId: string;
    userName: string;
    avatarUrl?: string;
  };
  changes: string[];
  wordCount: number;
  characterCount: number;
}

export interface VersionHistory {
  documentId: string;
  versions: DocumentVersion[];
  currentVersionId: string;
  autoSaveEnabled: boolean;
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  avatarUrl?: string;
  text: string;
  timestamp: string;
  type: 'comment';
  resolved?: boolean;
  replies?: Comment[];
}

export interface DocumentAnnotation {
  id: string;
  documentId: string;
  projectId: string;
  createdByUserId: string;
  highlightedText: string;
  commentThread: Comment[];
  pageNumber?: number;
  xPosition?: number;
  yPosition?: number;
  resolved: boolean;
  createdAt: string;
  updatedAt: string;
}

// types/index.ts - Add these types
export interface ProjectAiChat {
  id: string | null;
  project_id: string;
  title: string;
  messages: ChatMessage[];
  updated_at: string;
  created_at?: string;
}

export interface ProjectChatQuery {
  question: string;
  existing_messages: ChatMessage[];
  chat_id?: string;
}
export interface AnnotationComment {
  id: string;
  userId: string;
  userName: string | null;
  avatarUrl: string | null;
  text: string;
  timestamp: string;
  type: 'comment';
}

export interface AnnotationThread {
  id: string;
  documentId: string;
  highlightedText: string;
  pageNumber?: number | null;
  xPosition?: number | null;
  yPosition?: number | null;
  resolved: boolean;
  createdBy: {
    id: string;
    name: string | null;
    avatarUrl: string | null;
  };
  createdAt: string;
  comments: AnnotationComment[];
}

// types/index.ts
export interface AnnotatedDocument {
  id: string;
  name: string;
  comment_count: number;  // Match backend field name
  unresolved_count: number;  // Match backend field name
  uploaded_at?: string;
  category?: string;
}

export interface ProjectAccessSummary {
  totalMembers: number;
  adminCount: number;
}

export interface ProjectNotificationSettings {
  email_frequency: 'Instantly' | 'Daily' | 'None';
  in_app_new_document: boolean;
  in_app_mention: boolean;
  in_app_task_assigned: boolean;
  ai_critical_risk: boolean; // <-- NEW
  ai_negative_news: boolean; // <-- NEW
  ai_valuation_change: boolean; // <-- NEW
}
// Add these new types to your existing types
export interface RealMissionControlData {
  project: EnhancedProject;
  keyMetrics: {
    financial: {
      revenue: string;
      ebitdaMargin: string;
      valuation: string;
      employees: string;
    };
    dealHealth: {
      riskScore: string;
      riskLevel: string;
      synergyScore: string;
      synergyValue: string;
    };
    execution: {
      taskCompletion: string;
      milestoneProgress: string;
      highPriorityTasks: number;
    };
  };
  aiRecommendation: {
    recommendation: string;
    confidence: string;
    rationale: string;
  };
  nextActions: ProjectTask[];
  upcomingMilestones: ProjectMilestone[];
  riskIndicators: {
    criticalEvents: number;
    financialHealth: string;
    dealComplexity: string;
  };
  lastUpdated: string;
  dataSources: string[];
}

export interface EnhancedProject {
  id: string;
  name: string;
  status: DealStatus;
  companies: {
    name: string;
    financial_summary?: any;
    industry?: any;
    location?: any;
  };
  company_details?: {
    name: string;
    financial_summary: FinancialSummary;
    industry: Industry;
    location: Location;
  };
  team?: TeamMember[];
}

export interface FinancialSummary {
  revenue_cr?: number;
  ebitda_cr?: number;
  net_income_cr?: number;
  employee_count?: number;
  ebitda_margin_pct?: number;
}

export interface Industry {
  sector?: string;
  sub_sector?: string;
}

export interface Location {
  headquarters?: string;
}

export interface ProjectMilestone {
  id: string;
  title: string;
  due_date: string;
  status: string;
  description?: string;
}

export interface ProjectTaskWithAnalytics {
  tasks: ProjectTask[];
  analytics: {
    total: number;
    completed: number;
    completion_rate: number;
    high_priority: number;
  };
}

export interface MissionControlData {
  project: Project;
  keyMetrics: {
    riskScore: number;
    synergyScore: number;
    valuationRange: string;
    aiRecommendation: 'BUY' | 'HOLD' | 'REJECT';
  };
  nextActions: ProjectTask[];
}


export type TaskStatus = 'To Do' | 'In Progress' | 'Done';
export type TaskPriority = 'High' | 'Medium' | 'Low';

export interface ProjectTask {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignedTo?: {
    name: string;
    avatarUrl: string;
  };
}

export interface KeyRisk {
  category: RiskCategory;
  severity: number; // A score from 0-100
  risk: string;
  mitigation: string;
  evidence: string[]; // Excerpts from VDR documents
}

export interface BriefingCardData {
  id: 'recommendation' | 'valuation' | 'synergy' | 'risk';
  title: string;
  value: string;
  subValue: string;
  color: string; 
  aiInsight: string;
}

export interface InvestmentMemo {
  projectName: string;
  briefingCards: BriefingCardData[];
  executiveSummary: string;
  valuationSection: string;
  synergySection: string;
  riskSection: string;
}
// Add these to your existing types in types/index.ts
export interface Scenario {
  id: string;
  name: string;
  projectId: string; // Add projectId
  projectName: string;
  summary: string;
  variables: {
    revenueChange: number;
    cogsChange: number;
    taxRate: number;
    discountRate: number;
  }
}

export type DistributionType = 'Normal' | 'Lognormal' | 'Uniform';

export interface MonteCarloVariables {
  revenueGrowth: number;
  ebitdaMargin: number;
  costOfCapital: number;
  iterations: number;
  distribution: DistributionType;
}

export interface MonteCarloResult {
  meanValuation: number;
  medianValuation: number;
  stdDeviation: number;
  confidenceInterval90: [number, number];
  distribution: number[];
  aiRationale: string;
}

export interface MonteCarloSimulation {
  id: string;
  name: string;
  projectId: string;
  projectName: string;
  summary: string;
  variables: MonteCarloVariables;
  results_summary?: MonteCarloResult; // Add this optional property
  created_at?: string;
  last_run_at?: string;
}

export interface UserProfile {
  id: string;
  name: string | null;
  email: string;
  job_title: string | null;
  contact_number: string | null;
  avatar_url: string | null; // <-- Corrected to use snake_case
}

export interface ProjectUserProfile extends UserProfile {
  project_role: string;
}

export interface Invitation {
  id: string;
  invited_email: string;
  role: 'Editor' | 'Viewer';
  status: 'Pending' | 'Accepted' | 'Revoked';
  created_at: string;
}
export interface Permission {
  feature: string; // e.g., "VDR", "Valuation Models"
  access: 'Full' | 'Edit' | 'View Only' | 'None';
}

export interface Role {
  name: 'Admin' | 'Editor' | 'Viewer';
  description: string;
  permissions: Permission[];
}



export interface ProjectSummary {
  executiveSummary: string; // The main narrative
  keyStrengths: string[];   // A bulleted list of strengths
  keyRisks: string[];       // A bulleted list of risks
  keyData: {
    revenue: number;
    ebitdaMargin: number;
    roe: number;
  };
}


export interface IndustryUpdate {
  id: string;
  title: string;
  source: string;
  timestamp: string;
  url?: string;
}

export interface IndustryIntelligenceData {
  sector: string;
  subSector: string;
  marketTrends: string; // AI-generated narrative
  industryNews: IndustryUpdate[];
  regulatoryUpdates: IndustryUpdate[];
  competitorActivity: IndustryUpdate[];
}


export interface MarketIndicator {
  name: string;
  value: string;
  change: string;
  isPositive: boolean;
}

export interface SectorTrend {
  sector: string;
  trend: string; // AI-generated summary
}

export interface MarketMover {
  name: string;
  logoUrl: string;
  changePercent: number;
}

export interface MarketIntelligenceData {
  indicators: MarketIndicator[];
  sectorTrends: SectorTrend[];
  topGainers: MarketMover[];
  topLosers: MarketMover[];
}


export interface AiRecommendation {
  company: Company;
  triggerEvent: {
    type: string;
    summary: string;
  };
  aiThesis: {
    headline: string;
    rationale: string;
  };
}

export type NewsPriority = 'Critical' | 'High' | 'Medium' | 'Low';

export interface NewsItem {
  id: string;
  title: string;
  source: string;
  timestamp: string;
  url: string;
  companyName: string;
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  projectId?: string;
  isLive?: boolean;
  dealRelevance?: number;
}

export interface NewsResponse {
  market_news: NewsItem[];
  project_news: NewsItem[];
  last_updated: string;
}


export interface ProjectInsight {
  headline: string;
  rationale: string;
  recommendation: string; // e.g., "Update Valuation Model"
}

export interface ProjectIntelligenceData {
  projectNews: NewsItem[];
  competitorNews: NewsItem[];
  aiRecommendations: ProjectInsight[];
}

export interface VdrSource {
  docId: string;
  docName: string;
  excerpt: string;
}

export interface VdrChatMessage {
  role: 'user' | 'assistant';
  content: string;
  sources?: VdrSource[];
}

// This new type represents the full conversation object from our database
export interface VdrConversation {
  id: string | null; // The ID can be null for a new, unsaved chat
  messages: VdrChatMessage[];
}

export interface VdrSearchResult {
  docId: string;
  docName: string;
  excerpt: string; // This will contain the highlighted text snippet
  source: string; // Filename
}


// Add to your existing types
export interface ValuationModel {
  id: string;
  name: string;
  type: 'DCF' | 'LBO' | 'CCA' | 'Precedent Transactions';
  lastModified: string;
  projectId?: string; // NEW: Make it project-specific
  createdBy?: string; // NEW: Track creator
}

// NEW: Project-specific template interface
export interface ValuationTemplate {
  id: string;
  name: string;
  description: string;
  lastUsed: string;
  thumbnailUrl?: string;
  projectId: string; // Link to specific project
}

export type GraphCategory = 'Target' | 'Executive' | 'Competitor' | 'Subsidiary' | 'Partner';

export interface GraphNode {
  id: string; // cin or a generated unique ID
  name: string;
  category: GraphCategory;
  symbolSize: number; // To control the size of the bubble
  value: string; // e.g., Revenue for a company, Role for an executive
}

export interface GraphLink {
  source: string; // id of the source node
  target: string; // id of the target node
}

export interface KnowledgeGraphData {
  nodes: GraphNode[];
  links: GraphLink[];
  categories: { name: GraphCategory }[];
}


export interface SynergySubScore {
  category: 'Financial Synergy' | 'Strategic Fit' | 'Risk Profile';
  score: number;
  summary: string;
}

export interface SynergyAiScore {
  overallScore: number;
  subScores: SynergySubScore[];
  rationale: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  sources?: any[];
}

export interface Conversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  lastUpdated: string;
}


export type DocumentFolderKey = 'Financials' | 'Legal & Compliance' | 'Human Resources' | 'Intellectual Property' | string;

export interface Document {
  id: string;
  name: string;
  uploader: string;
  date: string;
  file_path: string;
  category: string;
  analysis_status: string;
  uploaded_by_user_id: string;
  project_id: string;
}

export interface Category {
  name: string;
  document_count: number;
}

export type UploadStatus = 'Success' | 'Processing' | 'Failed' | 'Pending' | 'Error';

export interface UploadedFile {
  name: string;
  status: UploadStatus;
  category: string;
  uploaded_at?: string;
  file_path?: string;
  id?: string;
}

export interface TeamMember {
  id: string;
  name: string;
  avatarUrl: string; // Will be a placeholder for now
}

export interface AISummary {
  narrative: string;
  dealCount: number;
  distribution: {
    bySector: { name: string; value: number }[];
    byStatus: { name: string; value: number }[];
  };
}

export interface Project {
  id: string;
  name: string;
  status: DealStatus;
  targetCompany: Company;
  team: TeamMember[];
}

export interface StrategicSearchResult {
  company: Company;
  fitScore: number;
  rationale: string;
}

export interface CompanyMapProfile {
  cin: string;
  name: string;
  logoUrl: string;
  sector: string;
  revenue: number;
  growth: number;
  employees: number;
  ebitdaMargin: number;
  roe: number; // Added for filtering
}

export interface Watchlist {
  id: string;
  name: string;
  created_at: string;
  user_id?: string;
  watchlist_companies?: Array<{ count: number }>;
  company_count?: number; // Alternative approach
}
export interface WatchlistWithCount extends Watchlist {
  company_count: number;
  watchlist_companies?: Array<{ count: number }>;
}

// --- NEW TYPE for our filter state ---
export interface MarketMapFilters {
  sector: string;
  hqState: string;
  revenueMin: number;
  growthMin: number;
  ebitdaMarginMin: number;
  roeMin: number;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  role: 'Admin' | 'Editor' | 'Viewer';
}

export type NotificationType = 'Deal Update' | 'Risk Alert' | 'Comment' | 'System';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  timestamp: string;
  isRead: boolean;
  priority?: 'Critical' | 'High'; // Optional for special highlighting
}

export interface BriefingCard {
  id: 'recommendation' | 'valuation' | 'synergy' | 'risk';
  title: string;
  value: string;
  subValue: string;
  color: string; 
  aiInsight: string;
}

export interface ExportOptions {
  format: 'PDF' | 'PowerPoint' | 'Word';
  includeBranding: boolean;
  includeCharts: boolean;
}

export type RowType = 'INPUT' | 'FORMULA' | 'PERCENTAGE';
export interface ModelRow {
  id: string; // A unique ID for calculations (e.g., 'rev', 'cogs')
  label: string;
  type: RowType;
  values: (number | null)[];
}

export type TemplateCategory = 'Financial' | 'Legal' | 'Risk' | 'Strategic' | 'Investment Memo';

export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  category: TemplateCategory;
  createdBy: string;
  sections: string[];
  lastUsed?: string;
  thumbnailUrl?: string;
}

// Enhanced types
export interface ReportDraft {
  id: string;
  project_id: string;
  created_by_user_id: string;
  title: string;
  status: 'Draft' | 'Review' | 'Final';
  content: any;
  created_at: string;
  last_modified: string;
  users?: {
    name: string;
    avatar_url: string;
  };
}

// Make sure these types are consistent
export type DraftStatus = 'Draft' | 'In Review' | 'Published' | 'Archived';

export interface Draft {
  id: string;
  title: string;
  content?: {
    html?: string;
    lastUpdated?: string;
  };
  createdBy: {
    name: string;
    avatarUrl?: string;
  };
  status: DraftStatus; // Use the same type
  lastModified: string;
  projectId: string;
  createdAt?: string;
}



export interface SynergyProfile {
  id: string;
  name: string; // e.g., "Reliance + Delhivery Analysis"
  acquirer: Company;
  target: Company;
  summary: string; // e.g., "$50M Cost, $70M Revenue"
  variables: {
    costReduction: number;
    revenueGrowth: number;
    integrationCosts: number;
    timeToRealize: number;
  }
}


export type AlertPriority = 'Critical' | 'High' | 'Medium' | 'Low';
export type AlertType = 'Financial' | 'Legal' | 'Market' | 'Reputational' | 'Operational' | 'Leadership' | 'Results' | 'News';

export interface Alert {
  id: string; // Will be the event ID
  priority: AlertPriority;
  title: string;
  type: AlertType;
  source: string;
  timestamp: string;
  description: string;
  aiInsight: string;
}



export type SynergyCategory = 'Cost' | 'Revenue';

export interface SynergyItem {
  name: string;
  value: number; // in $M
  confidence: 'High' | 'Medium' | 'Low';
}

export type DealStatus = 'Sourcing' | 'Diligence' | 'Negotiation' | 'Completed'| 'Archived';

export interface Deal {
  id: string;
  name: string;
  status: DealStatus;
  aiSummary: string;
  keyRisks: { id: string; text: string }[];
  nextActions: { id: string; text: string }[];
}

export interface Message {
  from: 'user' | 'ai';
  text: string;
}

export interface Company {
  id: string;
  name: string;
  logoUrl: string;
  sector: string;
  location: string;
  revenue: number; // in Cr INR
  employees: number;
}

export type RiskCategory = 'Financial' | 'Legal' | 'Operational' | 'Reputational' | 'Cultural';

export interface RiskItem {
  category: RiskCategory;
  score: number;
  insights: string[];
}

export interface TargetCompanyRiskProfile {
  id: string;
  name: string;
  overallScore: number;
  // This is now an array of objects, each with a risk and a mitigation
  topRisks: {
    risk: string;
    mitigation: string;
  }[];
  detailedBreakdown: RiskItem[];
}

export type FeatureKey = 
  | 'dashboard' 
  | 'sourcing' 
  | 'vdr' 
  | 'chat' 
  | 'analytics' 
  | 'valuation' 
  | 'reports'
  | 'analytics' | 'valuation' | 'reports' | 'notifications' | 'settings';

export interface NavItem {
  id: string;
  name: string;
  href: string;
  icon: LucideIcon;
}

export interface SubFeature {
  name: string;
  href: string;
}

export interface FeatureConfig {
  title: string;
  subFeatures: SubFeature[];
}


export const featureConfig: Record<FeatureKey, { title: string; subFeatures: SubFeature[] }> = {
  dashboard: { title: 'Mission Control', subFeatures: [
      { name: 'Pipeline', href: '/dashboard' },
      { name: 'AI Summary', href: '/dashboard/summary' },
      { name: 'Key Risks', href: '/dashboard/risks' },
      { name: 'Next Actions', href: '/dashboard/actions' },
    ]
  },
  sourcing: { title: 'Deal Sourcing', subFeatures: [
      { name: 'Search', href: '/dashboard/sourcing' },
      { name: 'Filters', href: '/dashboard/sourcing/filters' },
      { name: 'Watchlists', href: '/dashboard/sourcing/watchlist' },
      { name: 'Market Maps', href: '/dashboard/sourcing/maps' },
      { name: 'Strategic Engine', href: '/dashboard/sourcing/engine' },
    ]
  },
  vdr: { title: 'Virtual Data Room', subFeatures: [
      { name: 'Upload', href: '/dashboard/vdr' },
      { name: 'Categories', href: '/dashboard/vdr/categories' },
      { name: 'Search', href: '/dashboard/vdr/search' },
      { name: 'Annotations', href: '/dashboard/vdr/annotations' },
      { name: 'Q&A', href: '/dashboard/vdr/qa' },
    ]
  },
  chat: { title: 'AI Co-Pilot', subFeatures: [
      { name: 'Ask', href: '/dashboard/chat' },
      { name: 'History', href: '/dashboard/chat/history' },
      { name: 'Suggested Questions', href: '/dashboard/chat/suggestions' },
      { name: 'Knowledge Retrieval', href: '/dashboard/chat/knowledge' },
    ]
  },
  analytics: { title: 'Analytics & Risk', subFeatures: [
      { name: 'Risk Score', href: '/dashboard/analytics' },
      { name: 'Synergy Score', href: '/dashboard/analytics/synergy' },
      { name: 'Knowledge Graph', href: '/dashboard/analytics/graph' },
      { name: 'Alerts', href: '/dashboard/analytics/alerts' },
    ]
  },
  valuation: { title: 'Valuation & Models', subFeatures: [
      { name: 'Templates', href: '/dashboard/valuation' },
      { name: 'Live Models', href: '/dashboard/valuation/models' },
      { name: 'Scenarios', href: '/dashboard/valuation/scenarios' },
      { name: 'Monte Carlo', href: '/dashboard/valuation/mc' },
      { name: 'Synergies', href: '/dashboard/valuation/synergies' },
    ]
  },
  reports: { title: 'Reports / Memos', subFeatures: [
      { name: 'Drafts', href: '/dashboard/reports' },
      { name: 'Templates', href: '/dashboard/reports/templates' },
      { name: 'Export', href: '/dashboard/reports/export' },
      { name: 'One-Click Memo', href: '/dashboard/reports/generate' },
    ]
  },
  notifications: { title: 'Notifications', subFeatures: [
      { name: 'All', href: '/dashboard/notifications' },
      { name: 'Deal Updates', href: '/dashboard/notifications/deals' },
      { name: 'Risk Alerts', href: '/dashboard/notifications/risks' },
      { name: 'Comments', href: '/dashboard/notifications/comments' },
      { name: 'System', href: '/dashboard/notifications/system' },
    ]
  },
  settings: { title: 'Settings & Preferences', subFeatures: [
      { name: 'Profile', href: '/dashboard/settings' },
      { name: 'Security', href: '/dashboard/settings/security' },
      { name: 'Appearance', href: '/dashboard/settings/appearance' },
      { name: 'Team', href: '/dashboard/settings/team' },
      { name: 'Integrations', href: '/dashboard/settings/integrations' },
    ]
  },
};


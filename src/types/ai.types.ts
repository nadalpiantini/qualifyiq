// ============================================
// TIPOS PARA INTEGRACIÓN IA - QualifyIQ
// ============================================

// Company Intelligence
export interface CompanyIntelligenceRequest {
  companyName: string;
  industry?: string;
  additionalContext?: string;
}

export interface CompanyIntelligenceResponse {
  companySize: 'startup' | 'pyme' | 'midmarket' | 'enterprise' | 'unknown';
  employeeEstimate: string;
  industry: string[];
  revenueEstimate: string;
  buyingSignals: string[];
  potentialRedFlags: string[];
  suggestedBANT: {
    budget: number | null;
    authority: number | null;
    need: number | null;
    timeline: number | null;
    technicalFit: number | null;
  };
  discoveryQuestions: string[];
  confidence: number;
  sources?: string[];
}

// Discovery Questions
export type BANTCategory = 'budget' | 'authority' | 'need' | 'timeline' | 'technical';

export interface DiscoveryQuestionsRequest {
  companyName: string;
  companySize?: string;
  industry?: string;
  bantCategory: BANTCategory;
  currentScore?: number;
  contextNotes?: string;
}

export interface DiscoveryQuestion {
  question: string;
  purpose: string;
  followUp: string;
}

export interface DiscoveryQuestionsResponse {
  questions: DiscoveryQuestion[];
  proTip: string;
  categoryInsight: string;
}

// Follow-up Generator
export interface FollowupRequest {
  lead: {
    company: string;
    contact: string;
    email?: string;
    position?: string;
  };
  scorecard: {
    budget: number;
    authority: number;
    need: number;
    timeline: number;
    technicalFit: number;
    totalScore: number;
    status: 'GO' | 'REVIEW' | 'NO_GO';
    redFlags: string[];
    notes?: string;
  };
  context: {
    painPoints?: string;
    nextSteps?: string;
    lastInteraction?: string;
    competitorsMentioned?: string[];
  };
  preferences: {
    tone: 'formal' | 'casual' | 'friendly';
    goal: 'demo' | 'meeting' | 'info' | 'proposal' | 'closing';
    length: 'short' | 'medium' | 'detailed';
  };
}

export interface FollowupResponse {
  subject: string;
  body: string;
  callToAction: string;
  suggestedSendTime: string;
  alternativeSubjects: string[];
  estimatedReadTime: string;
}

// Red Flag Analyzer
export interface RedFlagAnalysisRequest {
  notes: string;
  currentRedFlags?: string[];
  leadContext?: {
    company?: string;
    industry?: string;
    dealSize?: string;
  };
}

export interface DetectedRedFlag {
  category: string;
  severity: 'low' | 'medium' | 'high';
  quote: string;
  explanation: string;
  suggestion: string;
  icon: string;
}

export interface RedFlagAnalysisResponse {
  redFlags: DetectedRedFlag[];
  positiveSignals: string[];
  overallRisk: 'low' | 'medium' | 'high';
  riskScore: number;
  recommendedAction: string;
  summary: string;
}

// AI Credits & Usage
export interface AIUsage {
  creditsUsed: number;
  creditsRemaining: number;
  resetDate: string;
}

// Generic AI Response wrapper
export interface AIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  tokensUsed?: number;
  processingTime?: number;
}

// Error types
export interface AIError {
  code: 'RATE_LIMIT' | 'API_ERROR' | 'INVALID_INPUT' | 'NO_CREDITS' | 'PARSE_ERROR';
  message: string;
  retryAfter?: number;
}

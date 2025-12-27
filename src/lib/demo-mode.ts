// Demo mode utilities for QualifyIQ
// Allows users to explore the app without authentication

const DEMO_MODE_COOKIE = 'qualifyiq-demo-mode'

export function isDemoMode(): boolean {
  if (typeof window === 'undefined') return false
  return document.cookie.includes(`${DEMO_MODE_COOKIE}=true`)
}

export function enableDemoMode(): void {
  // Set cookie for 24 hours
  const expires = new Date()
  expires.setTime(expires.getTime() + 24 * 60 * 60 * 1000)
  document.cookie = `${DEMO_MODE_COOKIE}=true; expires=${expires.toUTCString()}; path=/; SameSite=Lax`
}

export function disableDemoMode(): void {
  document.cookie = `${DEMO_MODE_COOKIE}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
}

// Demo user data for display
export const DEMO_USER = {
  id: 'demo-user-id',
  email: 'demo@qualifyiq.app',
  full_name: 'Demo User',
  organization: {
    id: 'demo-org-id',
    name: 'Demo Organization',
    slug: 'demo-org',
  },
} as const

// Demo leads data
export const DEMO_LEADS = [
  {
    id: '1',
    company_name: 'Acme Solutions',
    contact_name: 'María López',
    contact_email: 'maria@acmesolutions.com',
    status: 'qualified',
    recommendation: 'go',
    score: 92,
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '2',
    company_name: 'TechStart Inc',
    contact_name: 'John Smith',
    contact_email: 'john@techstart.io',
    status: 'pending',
    recommendation: 'review',
    score: 68,
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '3',
    company_name: 'Budget Tight LLC',
    contact_name: 'Alex Chen',
    contact_email: 'alex@budgettight.com',
    status: 'disqualified',
    recommendation: 'no_go',
    score: 35,
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
] as const

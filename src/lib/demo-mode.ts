// Demo mode utilities for QualifyIQ
// Allows users to explore the app without authentication

const DEMO_MODE_COOKIE = 'qualifyiq-demo-mode'

// Client-side only check (for 'use client' components)
export function isDemoMode(): boolean {
  if (typeof window === 'undefined') {
    // On server, always return false - use isDemoModeServer for server components
    return false
  }
  return document.cookie.includes(`${DEMO_MODE_COOKIE}=true`)
}

// Export cookie name for server-side usage
export const DEMO_COOKIE_NAME = DEMO_MODE_COOKIE

// Client-side only
export function enableDemoMode(): void {
  if (typeof window === 'undefined') return
  // Set cookie for 24 hours
  const expires = new Date()
  expires.setTime(expires.getTime() + 24 * 60 * 60 * 1000)
  document.cookie = `${DEMO_MODE_COOKIE}=true; expires=${expires.toUTCString()}; path=/; SameSite=Lax`
}

export function disableDemoMode(): void {
  if (typeof window === 'undefined') return
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

// Demo leads data (matching María's 2-week experience)
export const DEMO_LEADS = [
  {
    id: 'demo-lead-1',
    companyName: 'GlobalTech Solutions',
    contactName: 'Roberto Méndez',
    contactEmail: 'roberto@globaltech.com',
    source: 'Website',
    status: 'qualified' as const,
    recommendation: 'go' as const,
    score: 85,
    createdAt: '2025-01-15',
  },
  {
    id: 'demo-lead-2',
    companyName: 'StartupRápida',
    contactName: 'Lucía Fernández',
    contactEmail: 'lucia@startuprapida.io',
    source: 'Referral',
    status: 'disqualified' as const,
    recommendation: 'no_go' as const,
    score: 42,
    createdAt: '2025-01-14',
  },
  {
    id: 'demo-lead-3',
    companyName: 'Industrias del Norte',
    contactName: 'Carlos Gutiérrez',
    contactEmail: 'carlos@industriasnorte.com',
    source: 'LinkedIn',
    status: 'pending' as const,
    recommendation: 'review' as const,
    score: 55,
    createdAt: '2025-01-13',
  },
  {
    id: 'demo-lead-4',
    companyName: 'E-Commerce Plus',
    contactName: 'Ana Martínez',
    contactEmail: 'ana@ecommerceplus.com',
    source: 'Conference',
    status: 'qualified' as const,
    recommendation: 'go' as const,
    score: 92,
    createdAt: '2025-01-10',
  },
  {
    id: 'demo-lead-5',
    companyName: 'ConsultoraXYZ',
    contactName: 'Pedro Sánchez',
    contactEmail: 'pedro@consultoraxyz.com',
    source: 'Cold Email',
    status: 'disqualified' as const,
    recommendation: 'no_go' as const,
    score: 48,
    createdAt: '2025-01-17',
  },
  {
    id: 'demo-lead-6',
    companyName: 'Farmacéutica Nacional',
    contactName: 'Dr. Ramírez',
    contactEmail: 'ramirez@farmanacional.com',
    source: 'Website',
    status: 'pending' as const,
    recommendation: 'review' as const,
    score: 52,
    createdAt: '2025-01-20',
  },
  {
    id: 'demo-lead-7',
    companyName: 'RetailMax',
    contactName: 'Gabriela López',
    contactEmail: 'gabriela@retailmax.com',
    source: 'Referral',
    status: 'qualified' as const,
    recommendation: 'go' as const,
    score: 88,
    createdAt: '2025-01-21',
  },
  {
    id: 'demo-lead-8',
    companyName: 'AgenciaTodo',
    contactName: 'Martín Ruiz',
    contactEmail: 'martin@agenciatodo.com',
    source: 'LinkedIn',
    status: 'disqualified' as const,
    recommendation: 'no_go' as const,
    score: 38,
    createdAt: '2025-01-22',
  },
  {
    id: 'demo-lead-9',
    companyName: 'LogísticaPro',
    contactName: 'Fernando Torres',
    contactEmail: 'fernando@logisticapro.com',
    source: 'Conference',
    status: 'qualified' as const,
    recommendation: 'go' as const,
    score: 72,
    createdAt: '2025-01-23',
  },
  {
    id: 'demo-lead-10',
    companyName: 'EventosMega',
    contactName: 'Sandra Vega',
    contactEmail: 'sandra@eventosmega.com',
    source: 'Website',
    status: 'disqualified' as const,
    recommendation: 'no_go' as const,
    score: 45,
    createdAt: '2025-01-24',
  },
]

// Demo scorecards with BANT scores
export const DEMO_SCORECARDS = [
  {
    id: 'demo-scorecard-1',
    leadId: 'demo-lead-1',
    budget: 4,
    authority: 5,
    need: 4,
    timeline: 3,
    technicalFit: 5,
    redFlags: [],
    budgetNotes: 'Mencionó presupuesto de $15,000-20,000 USD. Ya tiene aprobación.',
    authorityNotes: 'Es el Director, reporta directo al CEO, puede firmar contratos.',
    needNotes: 'Necesitan rediseño web + SEO urgente. Sitio actual de 2018.',
    timelineNotes: '"Para Q2" - son 3 meses, alcanzable pero ajustado.',
    technicalFitNotes: 'Es exactamente lo que hacemos.',
  },
  {
    id: 'demo-scorecard-2',
    leadId: 'demo-lead-2',
    budget: 2,
    authority: 4,
    need: 5,
    timeline: 1,
    technicalFit: 4,
    redFlags: ['unrealistic_timeline', 'budget_unclear', 'price_focused'],
    budgetNotes: '"Estamos levantando ronda, cuando cerremos..."',
    authorityNotes: 'Es co-fundadora, pero necesita alinear con su socio.',
    needNotes: 'Urgente: lanzamiento en 2 meses sin landing page.',
    timelineNotes: 'Quieren TODO para ayer. Imposible.',
    technicalFitNotes: 'Landing page es básico, pero quieren 20 features.',
  },
  {
    id: 'demo-scorecard-3',
    leadId: 'demo-lead-3',
    budget: 3,
    authority: 2,
    need: 4,
    timeline: 3,
    technicalFit: 3,
    redFlags: ['multiple_decision_makers'],
    budgetNotes: '"Tendría que consultarlo con compras..."',
    authorityNotes: 'Es gerente de ventas, pero marketing decide.',
    needNotes: 'Quieren CRM y automatización. Lo necesitan.',
    timelineNotes: '6 meses es razonable.',
    technicalFitNotes: 'Hacemos marketing, no implementación de CRM.',
  },
  {
    id: 'demo-scorecard-4',
    leadId: 'demo-lead-4',
    budget: 5,
    authority: 5,
    need: 5,
    timeline: 4,
    technicalFit: 5,
    redFlags: [],
    budgetNotes: '$50,000 aprobado para este año en marketing digital.',
    authorityNotes: 'Es la CEO. Ella decide.',
    needNotes: 'Están perdiendo market share. Necesitan campaña YA.',
    timelineNotes: 'Q1, pero flexible a Q2 si es necesario.',
    technicalFitNotes: 'Performance marketing + contenido. Nuestro pan de cada día.',
  },
  {
    id: 'demo-scorecard-5',
    leadId: 'demo-lead-5',
    budget: 2,
    authority: 3,
    need: 3,
    timeline: 2,
    technicalFit: 3,
    redFlags: ['budget_unclear', 'scope_creep_history'],
    budgetNotes: '"Depende de los resultados que prometan"',
    authorityNotes: 'Socio junior, necesita aprobación de Managing Partner.',
    needNotes: '"Queremos explorar opciones de marketing digital"',
    timelineNotes: '"Sin prisa, cuando ustedes puedan"',
    technicalFitNotes: 'Consultoras son complicadas...',
  },
]

// Red flags definitions
export const RED_FLAGS = [
  { id: 'unrealistic_timeline', label: 'Unrealistic timeline expectations' },
  { id: 'budget_unclear', label: 'Budget unclear or undefined' },
  { id: 'multiple_decision_makers', label: 'Too many decision makers' },
  { id: 'scope_creep_history', label: 'History of scope creep' },
  { id: 'poor_communication', label: 'Poor communication in initial contact' },
  { id: 'unrealistic_expectations', label: 'Unrealistic outcome expectations' },
  { id: 'price_focused', label: 'Primarily price-focused' },
  { id: 'previous_vendor_issues', label: 'Issues with previous vendors' },
]

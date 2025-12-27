// Onboarding system for QualifyIQ
// Manages first-time user experience and guided tours

export const ONBOARDING_COOKIE = 'qualifyiq-onboarding-completed'
export const TOUR_COOKIE = 'qualifyiq-tour-completed'

export interface OnboardingStep {
  id: string
  title: string
  description: string
  target?: string // CSS selector for highlight
  position?: 'top' | 'bottom' | 'left' | 'right'
  action?: 'click' | 'input' | 'observe'
}

export const WELCOME_STEPS: OnboardingStep[] = [
  {
    id: 'welcome',
    title: '¡Bienvenido a QualifyIQ!',
    description: 'Te ayudaremos a calificar leads en menos de 2 minutos usando el método BANT.',
  },
  {
    id: 'what-is-bant',
    title: '¿Qué es BANT?',
    description: 'BANT es un framework de calificación: Budget (Presupuesto), Authority (Autoridad), Need (Necesidad), Timeline (Tiempo). Cada lead recibe un score de 1-5 en cada categoría.',
  },
  {
    id: 'how-scoring-works',
    title: '¿Cómo funciona el scoring?',
    description: 'Score 70+: GO (proceder) | Score 50-69: REVIEW (evaluar más) | Score <50: NO GO (declinar). Simple y efectivo.',
  },
]

export const DASHBOARD_TOUR: OnboardingStep[] = [
  {
    id: 'sidebar',
    title: 'Navegación',
    description: 'Accede a Dashboard, Leads, Scorecard y Settings desde aquí.',
    target: '[data-tour="sidebar"]',
    position: 'right',
  },
  {
    id: 'follow-up-widget',
    title: 'Leads pendientes',
    description: 'Aquí verás leads que necesitan seguimiento. Los REVIEW requieren tu atención.',
    target: '[data-tour="follow-up-widget"]',
    position: 'bottom',
  },
  {
    id: 'stats',
    title: 'Métricas clave',
    description: 'Vista rápida de tus leads totales, calificados y rechazados.',
    target: '[data-tour="stats-grid"]',
    position: 'top',
  },
  {
    id: 'new-scorecard',
    title: 'Crear Scorecard',
    description: 'Haz click aquí para calificar un nuevo lead. ¡Toma solo 2 minutos!',
    target: '[data-tour="new-scorecard"]',
    position: 'left',
  },
]

export const SCORECARD_TOUR: OnboardingStep[] = [
  {
    id: 'lead-info',
    title: 'Información del Lead',
    description: 'Ingresa los datos básicos: empresa, contacto, email y fuente.',
    target: '[data-tour="lead-info"]',
    position: 'right',
  },
  {
    id: 'bant-scores',
    title: 'Scoring BANT',
    description: 'Califica de 1-5 cada dimensión. Lee las etiquetas para entender qué significa cada número.',
    target: '[data-tour="bant-section"]',
    position: 'left',
  },
  {
    id: 'red-flags',
    title: 'Red Flags',
    description: 'Marca señales de alerta. Cada red flag reduce el score final en 5 puntos.',
    target: '[data-tour="red-flags"]',
    position: 'top',
  },
  {
    id: 'live-score',
    title: 'Score en tiempo real',
    description: 'Ve cómo cambia la recomendación mientras ajustas los scores.',
    target: '[data-tour="live-score"]',
    position: 'left',
  },
]

// Client-side only functions
export function isOnboardingCompleted(): boolean {
  if (typeof window === 'undefined') return true
  return document.cookie.includes(`${ONBOARDING_COOKIE}=true`)
}

export function isTourCompleted(tourId: string): boolean {
  if (typeof window === 'undefined') return true
  return document.cookie.includes(`${TOUR_COOKIE}-${tourId}=true`)
}

export function completeOnboarding(): void {
  if (typeof window === 'undefined') return
  const expires = new Date()
  expires.setFullYear(expires.getFullYear() + 1)
  document.cookie = `${ONBOARDING_COOKIE}=true; expires=${expires.toUTCString()}; path=/; SameSite=Lax`
}

export function completeTour(tourId: string): void {
  if (typeof window === 'undefined') return
  const expires = new Date()
  expires.setFullYear(expires.getFullYear() + 1)
  document.cookie = `${TOUR_COOKIE}-${tourId}=true; expires=${expires.toUTCString()}; path=/; SameSite=Lax`
}

export function resetOnboarding(): void {
  if (typeof window === 'undefined') return
  document.cookie = `${ONBOARDING_COOKIE}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
  document.cookie = `${TOUR_COOKIE}-dashboard=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
  document.cookie = `${TOUR_COOKIE}-scorecard=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
}

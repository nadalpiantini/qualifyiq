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
    title: 'Welcome to QualifyIQ!',
    description: 'We will help you qualify leads in less than 2 minutes using the BANT method.',
  },
  {
    id: 'what-is-bant',
    title: 'What is BANT?',
    description: 'BANT is a qualification framework: Budget, Authority, Need, Timeline. Each lead receives a score from 1-5 in each category.',
  },
  {
    id: 'how-scoring-works',
    title: 'How does scoring work?',
    description: 'Score 70+: GO (proceed) | Score 50-69: REVIEW (evaluate more) | Score <50: NO GO (decline). Simple and effective.',
  },
]

export const DASHBOARD_TOUR: OnboardingStep[] = [
  {
    id: 'sidebar',
    title: 'Navigation',
    description: 'Access Dashboard, Leads, Scorecard and Settings from here.',
    target: '[data-tour="sidebar"]',
    position: 'right',
  },
  {
    id: 'follow-up-widget',
    title: 'Pending Leads',
    description: 'Here you will see leads that need follow-up. REVIEW leads require your attention.',
    target: '[data-tour="follow-up-widget"]',
    position: 'bottom',
  },
  {
    id: 'stats',
    title: 'Key Metrics',
    description: 'Quick view of your total, qualified and rejected leads.',
    target: '[data-tour="stats-grid"]',
    position: 'top',
  },
  {
    id: 'new-scorecard',
    title: 'Create Scorecard',
    description: 'Click here to qualify a new lead. It only takes 2 minutes!',
    target: '[data-tour="new-scorecard"]',
    position: 'left',
  },
]

export const SCORECARD_TOUR: OnboardingStep[] = [
  {
    id: 'lead-info',
    title: 'Lead Information',
    description: 'Enter basic data: company, contact, email and source.',
    target: '[data-tour="lead-info"]',
    position: 'right',
  },
  {
    id: 'bant-scores',
    title: 'BANT Scoring',
    description: 'Rate 1-5 for each dimension. Read the labels to understand what each number means.',
    target: '[data-tour="bant-section"]',
    position: 'left',
  },
  {
    id: 'red-flags',
    title: 'Red Flags',
    description: 'Mark warning signs. Each red flag reduces the final score by 5 points.',
    target: '[data-tour="red-flags"]',
    position: 'top',
  },
  {
    id: 'live-score',
    title: 'Real-time Score',
    description: 'See how the recommendation changes as you adjust the scores.',
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

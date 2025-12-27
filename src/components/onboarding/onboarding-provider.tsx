'use client'

import { WelcomeModal } from './welcome-modal'
import { Tour } from './tour'
import { DASHBOARD_TOUR } from '@/lib/onboarding'
import { useState } from 'react'
import { usePathname } from 'next/navigation'

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const [showDashboardTour, setShowDashboardTour] = useState(false)
  const pathname = usePathname()

  const handleWelcomeComplete = () => {
    // Start dashboard tour after welcome modal closes
    if (pathname === '/dashboard') {
      setTimeout(() => setShowDashboardTour(true), 300)
    }
  }

  return (
    <>
      {children}
      <WelcomeModal onComplete={handleWelcomeComplete} />
      {showDashboardTour && pathname === '/dashboard' && (
        <Tour
          tourId="dashboard"
          steps={DASHBOARD_TOUR}
          onComplete={() => setShowDashboardTour(false)}
          autoStart={true}
        />
      )}
    </>
  )
}

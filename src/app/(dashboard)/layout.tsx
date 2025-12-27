import { Sidebar } from '@/components/layout/sidebar'
import { OnboardingProvider } from '@/components/onboarding'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <OnboardingProvider>
          {children}
        </OnboardingProvider>
      </main>
    </div>
  )
}

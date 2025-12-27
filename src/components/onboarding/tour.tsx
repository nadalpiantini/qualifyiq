'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import { OnboardingStep, completeTour, isTourCompleted } from '@/lib/onboarding'

interface TourProps {
  tourId: string
  steps: OnboardingStep[]
  onComplete?: () => void
  autoStart?: boolean
}

export function Tour({ tourId, steps, onComplete, autoStart = true }: TourProps) {
  const [isActive, setIsActive] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 })
  const [highlightRect, setHighlightRect] = useState<DOMRect | null>(null)

  const step = steps[currentStep]

  const updatePosition = useCallback(() => {
    if (!step?.target) {
      // Center in viewport if no target
      setTooltipPosition({
        top: window.innerHeight / 2 - 100,
        left: window.innerWidth / 2 - 200
      })
      setHighlightRect(null)
      return
    }

    const element = document.querySelector(step.target)
    if (!element) {
      setHighlightRect(null)
      return
    }

    const rect = element.getBoundingClientRect()
    setHighlightRect(rect)

    // Calculate tooltip position based on step.position
    const padding = 16
    let top = 0
    let left = 0

    switch (step.position) {
      case 'top':
        top = rect.top - 120 - padding
        left = rect.left + rect.width / 2 - 200
        break
      case 'bottom':
        top = rect.bottom + padding
        left = rect.left + rect.width / 2 - 200
        break
      case 'left':
        top = rect.top + rect.height / 2 - 60
        left = rect.left - 420 - padding
        break
      case 'right':
        top = rect.top + rect.height / 2 - 60
        left = rect.right + padding
        break
      default:
        top = rect.bottom + padding
        left = rect.left
    }

    // Keep tooltip in viewport
    top = Math.max(padding, Math.min(top, window.innerHeight - 200))
    left = Math.max(padding, Math.min(left, window.innerWidth - 420))

    setTooltipPosition({ top, left })
  }, [step])

  useEffect(() => {
    if (autoStart && !isTourCompleted(tourId)) {
      // Delay to allow page to render
      const timer = setTimeout(() => setIsActive(true), 500)
      return () => clearTimeout(timer)
    }
  }, [autoStart, tourId])

  useEffect(() => {
    if (!isActive) return

    updatePosition()
    window.addEventListener('resize', updatePosition)
    window.addEventListener('scroll', updatePosition)

    return () => {
      window.removeEventListener('resize', updatePosition)
      window.removeEventListener('scroll', updatePosition)
    }
  }, [isActive, currentStep, updatePosition])

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      handleComplete()
    }
  }

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleComplete = () => {
    completeTour(tourId)
    setIsActive(false)
    onComplete?.()
  }

  const handleSkip = () => {
    completeTour(tourId)
    setIsActive(false)
  }

  if (!isActive || !step) return null

  return (
    <div className="fixed inset-0 z-[100] pointer-events-none">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50 pointer-events-auto" onClick={handleSkip} />

      {/* Highlight cutout */}
      {highlightRect && (
        <div
          className="absolute bg-transparent pointer-events-none"
          style={{
            top: highlightRect.top - 4,
            left: highlightRect.left - 4,
            width: highlightRect.width + 8,
            height: highlightRect.height + 8,
            boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)',
            borderRadius: '8px',
            border: '2px solid #8b5cf6',
            zIndex: 101
          }}
        />
      )}

      {/* Tooltip */}
      <Card
        className="absolute w-[400px] shadow-2xl border-violet-200 pointer-events-auto z-[102]"
        style={{
          top: tooltipPosition.top,
          left: tooltipPosition.left
        }}
      >
        <button
          onClick={handleSkip}
          className="absolute top-3 right-3 p-1 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <CardContent className="p-5">
          <div className="mb-1 text-xs text-violet-600 font-medium">
            Paso {currentStep + 1} de {steps.length}
          </div>

          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {step.title}
          </h3>

          <p className="text-sm text-gray-600 mb-4">
            {step.description}
          </p>

          {/* Progress dots */}
          <div className="flex items-center justify-center gap-1.5 mb-4">
            {steps.map((_, idx) => (
              <div
                key={idx}
                className={`w-2 h-2 rounded-full transition-all ${
                  idx === currentStep
                    ? 'w-6 bg-violet-600'
                    : idx < currentStep
                    ? 'bg-violet-400'
                    : 'bg-gray-300'
                }`}
              />
            ))}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <button
              onClick={handleSkip}
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              Saltar tour
            </button>

            <div className="flex gap-2">
              {currentStep > 0 && (
                <Button variant="outline" size="sm" onClick={handlePrev}>
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Anterior
                </Button>
              )}
              <Button size="sm" onClick={handleNext}>
                {currentStep < steps.length - 1 ? (
                  <>
                    Siguiente
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </>
                ) : (
                  '¡Entendido!'
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Hook to manually trigger tour
export function useTour(tourId: string) {
  const [shouldShow, setShouldShow] = useState(false)

  const startTour = useCallback(() => {
    setShouldShow(true)
  }, [])

  const endTour = useCallback(() => {
    setShouldShow(false)
  }, [])

  const resetTour = useCallback(() => {
    if (typeof window !== 'undefined') {
      document.cookie = `qualifyiq-tour-completed-${tourId}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
    }
    setShouldShow(true)
  }, [tourId])

  return { shouldShow, startTour, endTour, resetTour }
}

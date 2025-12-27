'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Target,
  DollarSign,
  User,
  Crosshair,
  Clock,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  X,
  Sparkles
} from 'lucide-react'
import { isOnboardingCompleted, completeOnboarding, WELCOME_STEPS } from '@/lib/onboarding'

interface WelcomeModalProps {
  onComplete?: () => void
}

export function WelcomeModal({ onComplete }: WelcomeModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)

  useEffect(() => {
    // Check if onboarding was already completed
    if (!isOnboardingCompleted()) {
      setIsOpen(true)
    }
  }, [])

  const handleNext = () => {
    if (currentStep < 2) {
      setCurrentStep(currentStep + 1)
    } else {
      handleComplete()
    }
  }

  const handleComplete = () => {
    completeOnboarding()
    setIsOpen(false)
    onComplete?.()
  }

  const handleSkip = () => {
    completeOnboarding()
    setIsOpen(false)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Modal */}
      <Card className="relative z-10 w-full max-w-2xl mx-4 shadow-2xl border-0">
        <button
          onClick={handleSkip}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <CardContent className="p-8">
          {/* Step 0: Welcome */}
          {currentStep === 0 && (
            <div className="text-center">
              <div className="w-20 h-20 bg-violet-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Target className="w-10 h-10 text-violet-600" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                ¡Bienvenido a QualifyIQ!
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Te ayudaremos a calificar leads en menos de 2 minutos usando el método BANT.
                <br />
                <span className="text-violet-600 font-medium">Di "no" con confianza. Di "sí" con certeza.</span>
              </p>

              {/* Quick stats preview */}
              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="p-4 bg-green-50 rounded-xl">
                  <CheckCircle2 className="w-8 h-8 text-green-500 mx-auto mb-2" />
                  <p className="text-sm font-medium text-green-700">GO</p>
                  <p className="text-xs text-green-600">Score 70+</p>
                </div>
                <div className="p-4 bg-yellow-50 rounded-xl">
                  <AlertTriangle className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                  <p className="text-sm font-medium text-yellow-700">REVIEW</p>
                  <p className="text-xs text-yellow-600">Score 50-69</p>
                </div>
                <div className="p-4 bg-red-50 rounded-xl">
                  <XCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
                  <p className="text-sm font-medium text-red-700">NO GO</p>
                  <p className="text-xs text-red-600">Score &lt;50</p>
                </div>
              </div>
            </div>
          )}

          {/* Step 1: What is BANT */}
          {currentStep === 1 && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-violet-100 rounded-xl flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-violet-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">¿Qué es BANT?</h2>
                  <p className="text-gray-500">El framework que usan los mejores equipos de ventas</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-4 border border-gray-200 rounded-xl hover:border-violet-200 transition-colors">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <DollarSign className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Budget</p>
                      <p className="text-xs text-gray-500">Presupuesto</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">¿Tienen dinero para comprar?</p>
                </div>

                <div className="p-4 border border-gray-200 rounded-xl hover:border-violet-200 transition-colors">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <User className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Authority</p>
                      <p className="text-xs text-gray-500">Autoridad</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">¿Pueden tomar la decisión?</p>
                </div>

                <div className="p-4 border border-gray-200 rounded-xl hover:border-violet-200 transition-colors">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                      <Crosshair className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Need</p>
                      <p className="text-xs text-gray-500">Necesidad</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">¿Tienen un problema real?</p>
                </div>

                <div className="p-4 border border-gray-200 rounded-xl hover:border-violet-200 transition-colors">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Clock className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Timeline</p>
                      <p className="text-xs text-gray-500">Tiempo</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">¿Cuándo necesitan solucionarlo?</p>
                </div>
              </div>

              <div className="p-4 bg-violet-50 rounded-xl">
                <p className="text-sm text-violet-700">
                  <strong>💡 Tip:</strong> También evaluamos <strong>Technical Fit</strong> (Ajuste Técnico) -
                  ¿Podemos realmente resolver su problema con nuestra solución?
                </p>
              </div>
            </div>
          )}

          {/* Step 2: How to use */}
          {currentStep === 2 && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-violet-100 rounded-xl flex items-center justify-center">
                  <Target className="w-6 h-6 text-violet-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">¿Cómo empezar?</h2>
                  <p className="text-gray-500">3 pasos simples</p>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex gap-4 items-start p-4 bg-gray-50 rounded-xl">
                  <div className="w-8 h-8 bg-violet-600 rounded-full flex items-center justify-center text-white font-bold shrink-0">
                    1
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Crea un Scorecard</p>
                    <p className="text-sm text-gray-600">
                      Después de hablar con un lead, ve a "Scorecard" y llena la información básica.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 items-start p-4 bg-gray-50 rounded-xl">
                  <div className="w-8 h-8 bg-violet-600 rounded-full flex items-center justify-center text-white font-bold shrink-0">
                    2
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Califica con BANT</p>
                    <p className="text-sm text-gray-600">
                      Asigna scores de 1-5 en cada categoría. Las etiquetas te guían.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 items-start p-4 bg-gray-50 rounded-xl">
                  <div className="w-8 h-8 bg-violet-600 rounded-full flex items-center justify-center text-white font-bold shrink-0">
                    3
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Obtén la recomendación</p>
                    <p className="text-sm text-gray-600">
                      QualifyIQ calcula el score y te dice: GO, REVIEW, o NO GO.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
                <p className="text-sm text-green-700 text-center">
                  <strong>✨ ¡Listo!</strong> Ahora estás preparado para calificar leads como un profesional.
                </p>
              </div>
            </div>
          )}

          {/* Progress dots */}
          <div className="flex items-center justify-center gap-2 mt-6 mb-6">
            {[0, 1, 2].map((step) => (
              <button
                key={step}
                onClick={() => setCurrentStep(step)}
                className={`w-2 h-2 rounded-full transition-all ${
                  currentStep === step
                    ? 'w-8 bg-violet-600'
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
              />
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between">
            <button
              onClick={handleSkip}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Saltar intro
            </button>
            <Button onClick={handleNext} size="lg">
              {currentStep < 2 ? (
                <>
                  Siguiente
                  <ArrowRight className="ml-2 w-4 h-4" />
                </>
              ) : (
                <>
                  ¡Empezar!
                  <Sparkles className="ml-2 w-4 h-4" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

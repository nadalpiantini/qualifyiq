'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Header } from '@/components/layout/header'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { ScoreSlider } from '@/components/ui/score-slider'
import { AlertTriangle, CheckCircle2, XCircle, ArrowRight, ArrowLeft, Save, Loader2, Info } from 'lucide-react'
import { saveScorecard } from '@/app/actions/scorecard'

const RED_FLAGS = [
  { id: 'unrealistic_timeline', label: 'Expectativas de timeline poco realistas' },
  { id: 'budget_unclear', label: 'Presupuesto no definido o poco claro' },
  { id: 'multiple_decision_makers', label: 'Demasiados tomadores de decisión' },
  { id: 'scope_creep_history', label: 'Historial de cambios de alcance' },
  { id: 'poor_communication', label: 'Comunicación deficiente en contacto inicial' },
  { id: 'unrealistic_expectations', label: 'Expectativas de resultados poco realistas' },
  { id: 'price_focused', label: 'Enfocado principalmente en precio' },
  { id: 'previous_vendor_issues', label: 'Problemas con proveedores anteriores' },
]

export default function ScorecardPage() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [step, setStep] = useState(1)
  const [leadInfo, setLeadInfo] = useState({
    companyName: '',
    contactName: '',
    contactEmail: '',
    source: '',
  })
  const [scores, setScores] = useState({
    budget: 3,
    authority: 3,
    need: 3,
    timeline: 3,
    technicalFit: 3,
  })
  const [notes, setNotes] = useState({
    budget: '',
    authority: '',
    need: '',
    timeline: '',
    technicalFit: '',
  })
  const [redFlags, setRedFlags] = useState<string[]>([])
  const [redFlagNotes, setRedFlagNotes] = useState('')

  // Calculate total score (weighted) - weights MUST sum to 1.0
  const calculateScore = () => {
    const weights = {
      budget: 0.20,
      authority: 0.20,
      need: 0.25,
      timeline: 0.15,
      technicalFit: 0.20,
    }

    const baseScore = (
      scores.budget * weights.budget +
      scores.authority * weights.authority +
      scores.need * weights.need +
      scores.timeline * weights.timeline +
      scores.technicalFit * weights.technicalFit
    ) * 20

    const redFlagPenalty = redFlags.length * 5
    return Math.max(0, Math.round(baseScore - redFlagPenalty))
  }

  const totalScore = calculateScore()

  const getRecommendation = (score: number) => {
    if (score >= 70) return { label: 'GO', color: 'green', icon: CheckCircle2, description: 'Proceder con confianza' }
    if (score >= 50) return { label: 'REVIEW', color: 'yellow', icon: AlertTriangle, description: 'Requiere más evaluación' }
    return { label: 'NO GO', color: 'red', icon: XCircle, description: 'Declinar o negociar' }
  }

  const recommendation = getRecommendation(totalScore)

  const toggleRedFlag = (id: string) => {
    setRedFlags(prev =>
      prev.includes(id)
        ? prev.filter(f => f !== id)
        : [...prev, id]
    )
  }

  const handleSubmit = () => {
    setError(null)

    startTransition(async () => {
      const result = await saveScorecard({
        leadInfo,
        scores,
        notes,
        redFlags,
        redFlagNotes: redFlagNotes || '',
        totalScore,
        recommendation: recommendation.label.toLowerCase() as 'go' | 'review' | 'no_go',
      })

      if (result.success) {
        toast.success('¡Scorecard guardado!', {
          description: `${leadInfo.companyName || 'Lead'} calificado con recomendación ${recommendation.label}.`,
        })
        router.push(`/leads?created=${result.leadId}`)
      } else {
        const errorMsg = result.error || 'Error al guardar scorecard'
        setError(errorMsg)
        toast.error('Error al guardar', {
          description: errorMsg,
        })
      }
    })
  }

  const canProceed = leadInfo.companyName.trim() !== ''

  return (
    <div className="min-h-screen">
      <Header
        title="Nuevo Scorecard"
        subtitle="Califica tu lead con el método BANT en 2 minutos"
      />

      <div className="p-6">
        <div className="max-w-5xl mx-auto">
          {/* Progress Steps - Now just 2 steps */}
          <div className="flex items-center justify-center mb-8">
            {[1, 2].map((s) => (
              <div key={s} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors ${
                      step >= s
                        ? 'bg-violet-600 text-white'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {s}
                  </div>
                  <span className={`text-xs mt-1 ${step >= s ? 'text-violet-600 font-medium' : 'text-gray-500'}`}>
                    {s === 1 ? 'Info del Lead' : 'Calificación BANT'}
                  </span>
                </div>
                {s < 2 && (
                  <div
                    className={`w-24 h-1 mx-4 ${
                      step > s ? 'bg-violet-600' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Step 1: Lead Info */}
          {step === 1 && (
            <Card data-tour="lead-info">
              <CardHeader>
                <CardTitle>Información del Lead</CardTitle>
                <CardDescription>
                  Datos básicos del prospecto que estás calificando
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  label="Nombre de la Empresa *"
                  value={leadInfo.companyName}
                  onChange={(e) => setLeadInfo({ ...leadInfo, companyName: e.target.value })}
                  placeholder="ej. TechCorp Inc."
                />
                <Input
                  label="Nombre del Contacto"
                  value={leadInfo.contactName}
                  onChange={(e) => setLeadInfo({ ...leadInfo, contactName: e.target.value })}
                  placeholder="ej. Juan Pérez"
                />
                <Input
                  label="Email del Contacto"
                  type="email"
                  value={leadInfo.contactEmail}
                  onChange={(e) => setLeadInfo({ ...leadInfo, contactEmail: e.target.value })}
                  placeholder="ej. juan@techcorp.com"
                />
                <Input
                  label="Fuente del Lead"
                  value={leadInfo.source}
                  onChange={(e) => setLeadInfo({ ...leadInfo, source: e.target.value })}
                  placeholder="ej. LinkedIn, Referido, Web"
                />
                <div className="flex justify-end pt-4">
                  <Button onClick={() => setStep(2)} disabled={!canProceed}>
                    Continuar a Calificación <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Combined BANT + Technical Fit + Red Flags with Live Score */}
          {step === 2 && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Scoring Form */}
              <div className="lg:col-span-2 space-y-6">
                {/* BANT Section */}
                <Card data-tour="bant-section">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2">
                      Calificación BANT
                      <span className="text-sm font-normal text-gray-500">(Budget, Authority, Need, Timeline)</span>
                    </CardTitle>
                    <CardDescription>
                      Asigna un puntaje de 1-5 en cada categoría. Las etiquetas te ayudan a decidir.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <ScoreSlider
                        label="💰 Budget (Presupuesto)"
                        value={scores.budget}
                        onChange={(v) => setScores({ ...scores, budget: v })}
                        description="¿Tienen presupuesto asignado para esta solución?"
                        labels={[
                          '1 - Sin presupuesto',
                          '2 - Explorando',
                          '3 - Presupuesto tentativo',
                          '4 - Aprobado internamente',
                          '5 - Listos para invertir'
                        ]}
                      />
                    </div>

                    <div className="space-y-2">
                      <ScoreSlider
                        label="👤 Authority (Autoridad)"
                        value={scores.authority}
                        onChange={(v) => setScores({ ...scores, authority: v })}
                        description="¿Estás hablando con quien toma la decisión?"
                        labels={[
                          '1 - Sin acceso',
                          '2 - Influenciador',
                          '3 - Recomienda',
                          '4 - Co-decide',
                          '5 - Decisor final'
                        ]}
                      />
                    </div>

                    <div className="space-y-2">
                      <ScoreSlider
                        label="🎯 Need (Necesidad)"
                        value={scores.need}
                        onChange={(v) => setScores({ ...scores, need: v })}
                        description="¿Qué tan urgente y real es su necesidad?"
                        labels={[
                          '1 - Sin necesidad',
                          '2 - Nice to have',
                          '3 - Importante',
                          '4 - Urgente',
                          '5 - Crítico'
                        ]}
                      />
                    </div>

                    <div className="space-y-2">
                      <ScoreSlider
                        label="⏰ Timeline (Tiempo)"
                        value={scores.timeline}
                        onChange={(v) => setScores({ ...scores, timeline: v })}
                        description="¿Cuándo necesitan una solución?"
                        labels={[
                          '1 - Sin timeline',
                          '2 - 12+ meses',
                          '3 - 6-12 meses',
                          '4 - 3-6 meses',
                          '5 - Inmediato'
                        ]}
                      />
                    </div>

                    <div className="space-y-2">
                      <ScoreSlider
                        label="🔧 Technical Fit (Ajuste Técnico)"
                        value={scores.technicalFit}
                        onChange={(v) => setScores({ ...scores, technicalFit: v })}
                        description="¿Podemos resolver su problema con nuestra solución?"
                        labels={[
                          '1 - No podemos',
                          '2 - Brechas grandes',
                          '3 - Ajuste parcial',
                          '4 - Buen ajuste',
                          '5 - Ajuste perfecto'
                        ]}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Red Flags Section */}
                <Card data-tour="red-flags">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2">
                      🚩 Red Flags
                      <span className="text-sm font-normal text-gray-500">(-5 puntos cada una)</span>
                    </CardTitle>
                    <CardDescription>
                      Selecciona las señales de alerta que detectaste. Cada una reduce el score final.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                      {RED_FLAGS.map((flag) => (
                        <button
                          key={flag.id}
                          type="button"
                          onClick={() => toggleRedFlag(flag.id)}
                          className={`p-3 rounded-lg border-2 text-left transition-all ${
                            redFlags.includes(flag.id)
                              ? 'border-red-500 bg-red-50 text-red-700'
                              : 'border-gray-200 hover:border-gray-300 text-gray-600'
                          }`}
                        >
                          <span className="text-sm font-medium">{flag.label}</span>
                        </button>
                      ))}
                    </div>
                    <Textarea
                      placeholder="Notas adicionales sobre red flags..."
                      value={redFlagNotes}
                      onChange={(e) => setRedFlagNotes(e.target.value)}
                      className="mt-2"
                    />
                  </CardContent>
                </Card>

                {/* Navigation */}
                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setStep(1)}>
                    <ArrowLeft className="mr-2 w-4 h-4" />
                    Volver
                  </Button>
                  <Button onClick={handleSubmit} disabled={isPending}>
                    {isPending ? (
                      <>
                        <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                        Guardando...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 w-4 h-4" />
                        Guardar Scorecard
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Live Score Panel - Sticky on right */}
              <div className="lg:col-span-1">
                <div className="sticky top-6 space-y-4">
                  <Card data-tour="live-score" className={`border-2 ${
                    recommendation.color === 'green' ? 'border-green-200 bg-green-50' :
                    recommendation.color === 'yellow' ? 'border-yellow-200 bg-yellow-50' :
                    'border-red-200 bg-red-50'
                  }`}>
                    <CardContent className="p-6 text-center">
                      <div className="text-sm text-gray-500 mb-2">Score en tiempo real</div>
                      <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full bg-white shadow-lg mb-3 ${
                        recommendation.color === 'green' ? 'ring-4 ring-green-200' :
                        recommendation.color === 'yellow' ? 'ring-4 ring-yellow-200' :
                        'ring-4 ring-red-200'
                      }`}>
                        <span className={`text-3xl font-bold ${
                          recommendation.color === 'green' ? 'text-green-600' :
                          recommendation.color === 'yellow' ? 'text-yellow-600' :
                          'text-red-600'
                        }`}>
                          {totalScore}
                        </span>
                      </div>
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <recommendation.icon className={`w-5 h-5 ${
                          recommendation.color === 'green' ? 'text-green-600' :
                          recommendation.color === 'yellow' ? 'text-yellow-600' :
                          'text-red-600'
                        }`} />
                        <span className={`text-xl font-bold ${
                          recommendation.color === 'green' ? 'text-green-600' :
                          recommendation.color === 'yellow' ? 'text-yellow-600' :
                          'text-red-600'
                        }`}>
                          {recommendation.label}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{recommendation.description}</p>
                    </CardContent>
                  </Card>

                  {/* Score Breakdown */}
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-1">
                        <Info className="w-4 h-4" />
                        Desglose del Score
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Budget</span>
                          <span className="font-medium">{scores.budget}/5</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Authority</span>
                          <span className="font-medium">{scores.authority}/5</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Need</span>
                          <span className="font-medium">{scores.need}/5</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Timeline</span>
                          <span className="font-medium">{scores.timeline}/5</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Technical Fit</span>
                          <span className="font-medium">{scores.technicalFit}/5</span>
                        </div>
                        {redFlags.length > 0 && (
                          <>
                            <div className="border-t pt-2 mt-2" />
                            <div className="flex justify-between text-sm text-red-600">
                              <span>Red Flags ({redFlags.length})</span>
                              <span className="font-medium">-{redFlags.length * 5}</span>
                            </div>
                          </>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Lead Summary */}
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-sm font-medium text-gray-700 mb-2">Lead</div>
                      <p className="font-semibold text-gray-900">{leadInfo.companyName || 'Sin nombre'}</p>
                      {leadInfo.contactName && (
                        <p className="text-sm text-gray-500">{leadInfo.contactName}</p>
                      )}
                      {leadInfo.source && (
                        <p className="text-xs text-gray-400 mt-1">Fuente: {leadInfo.source}</p>
                      )}
                    </CardContent>
                  </Card>

                  {/* Error Display */}
                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

'use client'

import { useState } from 'react'
import { AlertTriangle, Loader2, ChevronDown, ChevronUp, CheckCircle2, Search, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { toast } from 'sonner'
import type { RedFlagAnalysisResponse, DetectedRedFlag } from '@/types/ai.types'

interface RedFlagAnalyzerProps {
  notes: string
  currentRedFlags?: string[]
  leadContext?: {
    company?: string
    industry?: string
    dealSize?: string
  }
  onAddRedFlags?: (flags: string[]) => void
  language?: 'es' | 'en'
}

const severityColors: Record<string, { bg: string; text: string; border: string }> = {
  low: { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200' },
  medium: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
  high: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' }
}

const severityLabels: Record<string, { es: string; en: string }> = {
  low: { es: 'Bajo', en: 'Low' },
  medium: { es: 'Medio', en: 'Medium' },
  high: { es: 'Alto', en: 'High' }
}

const texts = {
  es: {
    analyze: 'Analizar notas',
    analyzing: 'Analizando...',
    redFlagsDetected: 'Red Flags Detectadas',
    positiveSignals: 'Señales Positivas',
    overallRisk: 'Riesgo General',
    recommendedAction: 'Acción Recomendada',
    addToScorecard: 'Añadir al Scorecard',
    summary: 'Resumen',
    quote: 'Cita',
    suggestion: 'Sugerencia',
    noFlags: 'No se detectaron red flags',
    needMoreText: 'Necesitas al menos 20 caracteres para analizar'
  },
  en: {
    analyze: 'Analyze notes',
    analyzing: 'Analyzing...',
    redFlagsDetected: 'Red Flags Detected',
    positiveSignals: 'Positive Signals',
    overallRisk: 'Overall Risk',
    recommendedAction: 'Recommended Action',
    addToScorecard: 'Add to Scorecard',
    summary: 'Summary',
    quote: 'Quote',
    suggestion: 'Suggestion',
    noFlags: 'No red flags detected',
    needMoreText: 'You need at least 20 characters to analyze'
  }
}

export function RedFlagAnalyzer({
  notes,
  currentRedFlags = [],
  leadContext,
  onAddRedFlags,
  language = 'es'
}: RedFlagAnalyzerProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [data, setData] = useState<RedFlagAnalysisResponse | null>(null)
  const [isExpanded, setIsExpanded] = useState(true)
  const [selectedFlags, setSelectedFlags] = useState<string[]>([])

  const t = texts[language]

  const handleAnalyze = async () => {
    if (!notes || notes.trim().length < 20) {
      toast.error(t.needMoreText)
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/ai/analyze-conversation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notes,
          currentRedFlags,
          leadContext
        })
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Error analyzing conversation')
      }

      setData(result.data)
      setIsExpanded(true)
    } catch (error) {
      toast.error(language === 'es' ? 'Error al analizar' : 'Analysis error', {
        description: error instanceof Error ? error.message : 'Unknown error'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const toggleFlag = (category: string) => {
    setSelectedFlags(prev =>
      prev.includes(category)
        ? prev.filter(f => f !== category)
        : [...prev, category]
    )
  }

  const handleAddFlags = () => {
    if (onAddRedFlags && selectedFlags.length > 0) {
      onAddRedFlags(selectedFlags)
      toast.success(language === 'es' ? 'Red flags añadidas' : 'Red flags added')
      setSelectedFlags([])
    }
  }

  if (!notes || notes.length < 10) {
    return null
  }

  return (
    <div className="mt-3">
      {!data && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAnalyze}
          disabled={isLoading || notes.length < 20}
          className="gap-2 text-amber-600 border-amber-200 hover:bg-amber-50"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              {t.analyzing}
            </>
          ) : (
            <>
              <Search className="w-4 h-4" />
              {t.analyze}
            </>
          )}
        </Button>
      )}

      {data && (
        <Card className="border-amber-200 bg-gradient-to-br from-amber-50/50 to-white">
          <div
            className="flex items-center justify-between px-4 py-3 border-b border-amber-100 cursor-pointer"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span className="font-semibold text-sm text-amber-900">
                {t.redFlagsDetected} ({data.redFlags.length})
              </span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${severityColors[data.overallRisk].bg} ${severityColors[data.overallRisk].text}`}>
                {t.overallRisk}: {severityLabels[data.overallRisk][language]}
              </span>
            </div>
            {isExpanded ? (
              <ChevronUp className="w-4 h-4 text-gray-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-400" />
            )}
          </div>

          {isExpanded && (
            <CardContent className="p-4 space-y-4">
              {/* Red Flags */}
              {data.redFlags.length > 0 ? (
                <div className="space-y-3">
                  {data.redFlags.map((flag, index) => (
                    <RedFlagCard
                      key={index}
                      flag={flag}
                      isSelected={selectedFlags.includes(flag.category)}
                      onToggle={() => toggleFlag(flag.category)}
                      language={language}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">{t.noFlags}</p>
              )}

              {/* Positive Signals */}
              {data.positiveSignals.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-medium text-green-700 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {t.positiveSignals}
                  </h4>
                  <ul className="space-y-1">
                    {data.positiveSignals.map((signal, i) => (
                      <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-green-500 mt-0.5 shrink-0" />
                        {signal}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Summary */}
              {data.summary && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <h4 className="text-xs font-medium text-gray-700 mb-1">{t.summary}</h4>
                  <p className="text-sm text-gray-600">{data.summary}</p>
                </div>
              )}

              {/* Recommended Action */}
              {data.recommendedAction && (
                <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                  <h4 className="text-xs font-medium text-blue-700 mb-1">{t.recommendedAction}</h4>
                  <p className="text-sm text-blue-800">{data.recommendedAction}</p>
                </div>
              )}

              {/* Add to Scorecard Button */}
              {selectedFlags.length > 0 && onAddRedFlags && (
                <Button
                  type="button"
                  onClick={handleAddFlags}
                  className="w-full gap-2 bg-amber-600 hover:bg-amber-700"
                >
                  <Plus className="w-4 h-4" />
                  {t.addToScorecard} ({selectedFlags.length})
                </Button>
              )}

              {/* Re-analyze button */}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleAnalyze}
                disabled={isLoading}
                className="w-full text-xs text-gray-500 hover:text-amber-600"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                    {t.analyzing}
                  </>
                ) : (
                  <>
                    <Search className="w-3 h-3 mr-1" />
                    {language === 'es' ? 'Volver a analizar' : 'Re-analyze'}
                  </>
                )}
              </Button>
            </CardContent>
          )}
        </Card>
      )}
    </div>
  )
}

function RedFlagCard({
  flag,
  isSelected,
  onToggle,
  language
}: {
  flag: DetectedRedFlag
  isSelected: boolean
  onToggle: () => void
  language: 'es' | 'en'
}) {
  const colors = severityColors[flag.severity]
  const t = texts[language]

  return (
    <div
      className={`rounded-lg p-3 border cursor-pointer transition-all ${colors.bg} ${colors.border} ${isSelected ? 'ring-2 ring-amber-400' : ''}`}
      onClick={onToggle}
    >
      <div className="flex items-start gap-2">
        <span className="text-lg">{flag.icon}</span>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <span className={`font-medium text-sm ${colors.text}`}>{flag.category}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full ${colors.bg} ${colors.text} border ${colors.border}`}>
              {severityLabels[flag.severity][language]}
            </span>
          </div>
          <p className="text-sm text-gray-700 mt-1">{flag.explanation}</p>
          {flag.quote && (
            <p className="text-xs text-gray-500 mt-2 italic border-l-2 border-gray-300 pl-2">
              &ldquo;{flag.quote}&rdquo;
            </p>
          )}
          {flag.suggestion && (
            <p className="text-xs text-gray-600 mt-2">
              <span className="font-medium">{t.suggestion}:</span> {flag.suggestion}
            </p>
          )}
        </div>
        <input
          type="checkbox"
          checked={isSelected}
          onChange={onToggle}
          className="mt-1"
          onClick={(e) => e.stopPropagation()}
        />
      </div>
    </div>
  )
}

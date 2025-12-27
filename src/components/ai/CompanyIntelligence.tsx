'use client'

import { useState } from 'react'
import { Sparkles, Building2, Users, DollarSign, Target, AlertTriangle, Lightbulb, HelpCircle, Loader2, ChevronDown, ChevronUp, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { toast } from 'sonner'
import type { AICompanyAnalysis } from '@/types/database'

interface CompanyIntelligenceProps {
  companyName: string
  onApplySuggestions?: (suggestions: AICompanyAnalysis['suggestedBANT']) => void
  language?: 'es' | 'en'
}

const companySizeLabels: Record<string, { es: string; en: string }> = {
  startup: { es: 'Startup', en: 'Startup' },
  pyme: { es: 'PyME', en: 'SMB' },
  midmarket: { es: 'Mediana empresa', en: 'Mid-Market' },
  enterprise: { es: 'Enterprise', en: 'Enterprise' },
  unknown: { es: 'Desconocido', en: 'Unknown' },
}

export function CompanyIntelligence({ companyName, onApplySuggestions, language = 'es' }: CompanyIntelligenceProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [analysis, setAnalysis] = useState<AICompanyAnalysis | null>(null)
  const [isExpanded, setIsExpanded] = useState(true)
  const [isCached, setIsCached] = useState(false)

  const texts = {
    es: {
      analyze: 'Analizar con IA',
      analyzing: 'Investigando empresa...',
      reAnalyze: 'Volver a analizar',
      companyIntel: 'COMPANY INTELLIGENCE',
      poweredBy: 'powered by AI',
      size: 'Tamaño',
      employees: 'empleados',
      industry: 'Industria',
      revenue: 'Revenue estimado',
      buyingSignals: 'Señales de compra detectadas',
      redFlags: 'Posibles red flags',
      suggestedBant: 'BANT sugerido',
      discoveryQuestions: 'Preguntas de discovery',
      applySuggestions: 'Aplicar sugerencias BANT',
      confidence: 'Confianza',
      cached: 'Desde caché',
      budget: 'Budget',
      authority: 'Authority',
      need: 'Need',
      timeline: 'Timeline',
      technicalFit: 'Technical Fit',
    },
    en: {
      analyze: 'Analyze with AI',
      analyzing: 'Researching company...',
      reAnalyze: 'Re-analyze',
      companyIntel: 'COMPANY INTELLIGENCE',
      poweredBy: 'powered by AI',
      size: 'Size',
      employees: 'employees',
      industry: 'Industry',
      revenue: 'Est. Revenue',
      buyingSignals: 'Buying signals detected',
      redFlags: 'Potential red flags',
      suggestedBant: 'Suggested BANT',
      discoveryQuestions: 'Discovery questions',
      applySuggestions: 'Apply BANT suggestions',
      confidence: 'Confidence',
      cached: 'From cache',
      budget: 'Budget',
      authority: 'Authority',
      need: 'Need',
      timeline: 'Timeline',
      technicalFit: 'Technical Fit',
    },
  }

  const t = texts[language]

  const handleAnalyze = async () => {
    if (!companyName.trim()) return

    setIsLoading(true)
    setAnalysis(null)

    try {
      const response = await fetch('/api/ai/company-intelligence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyName, language }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to analyze company')
      }

      if (data.success && data.data) {
        setAnalysis(data.data)
        setIsCached(data.cached || false)
        setIsExpanded(true)
      } else {
        throw new Error('Invalid response from AI')
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error analyzing company'
      toast.error(language === 'es' ? 'Error al analizar' : 'Analysis error', {
        description: message,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleApplySuggestions = () => {
    if (analysis?.suggestedBANT && onApplySuggestions) {
      onApplySuggestions(analysis.suggestedBANT)
      toast.success(language === 'es' ? 'Sugerencias aplicadas' : 'Suggestions applied', {
        description: language === 'es'
          ? 'Los scores BANT han sido actualizados'
          : 'BANT scores have been updated',
      })
    }
  }

  // Only show button if company name is at least 2 characters
  if (companyName.length < 2) {
    return null
  }

  return (
    <div className="mt-3 space-y-3">
      {/* Analyze Button */}
      {!analysis && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAnalyze}
          disabled={isLoading}
          className="gap-2 text-violet-600 border-violet-200 hover:bg-violet-50 hover:border-violet-300"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              {t.analyzing}
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              {t.analyze}
            </>
          )}
        </Button>
      )}

      {/* Analysis Results Panel */}
      {analysis && (
        <Card className="border-violet-200 bg-gradient-to-br from-violet-50/50 to-white">
          {/* Header */}
          <div
            className="flex items-center justify-between px-4 py-3 border-b border-violet-100 cursor-pointer"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-violet-600" />
              <span className="font-semibold text-sm text-violet-900">{t.companyIntel}</span>
              <span className="text-xs text-violet-400">{t.poweredBy}</span>
              {isCached && (
                <span className="text-xs bg-violet-100 text-violet-600 px-2 py-0.5 rounded-full">
                  {t.cached}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">
                {t.confidence}: {Math.round(analysis.confidence * 100)}%
              </span>
              {isExpanded ? (
                <ChevronUp className="w-4 h-4 text-gray-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-400" />
              )}
            </div>
          </div>

          {/* Content */}
          {isExpanded && (
            <CardContent className="p-4 space-y-4">
              {/* Company Overview */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <Users className="w-3.5 h-3.5" />
                    {t.size}
                  </div>
                  <div className="font-medium text-sm">
                    {companySizeLabels[analysis.companySize]?.[language] || analysis.companySize}
                    <span className="text-gray-400 ml-1">(~{analysis.employeeEstimate} {t.employees})</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <Building2 className="w-3.5 h-3.5" />
                    {t.industry}
                  </div>
                  <div className="font-medium text-sm">
                    {analysis.industry.join(', ')}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <DollarSign className="w-3.5 h-3.5" />
                    {t.revenue}
                  </div>
                  <div className="font-medium text-sm">{analysis.revenueEstimate}</div>
                </div>
              </div>

              {/* Buying Signals */}
              {analysis.buyingSignals.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-green-700">
                    <Target className="w-3.5 h-3.5" />
                    {t.buyingSignals}
                  </div>
                  <ul className="space-y-1">
                    {analysis.buyingSignals.map((signal, i) => (
                      <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-green-500 mt-0.5 shrink-0" />
                        {signal}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Potential Red Flags */}
              {analysis.potentialRedFlags.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-amber-700">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    {t.redFlags}
                  </div>
                  <ul className="space-y-1">
                    {analysis.potentialRedFlags.map((flag, i) => (
                      <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-500 mt-0.5 shrink-0" />
                        {flag}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Suggested BANT Scores */}
              {Object.values(analysis.suggestedBANT).some(v => v !== null) && (
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-violet-700">
                    <Lightbulb className="w-3.5 h-3.5" />
                    {t.suggestedBant}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {analysis.suggestedBANT.budget !== null && (
                      <span className="px-2 py-1 bg-violet-100 text-violet-700 text-xs rounded-full">
                        {t.budget}: {analysis.suggestedBANT.budget}/5
                      </span>
                    )}
                    {analysis.suggestedBANT.need !== null && (
                      <span className="px-2 py-1 bg-violet-100 text-violet-700 text-xs rounded-full">
                        {t.need}: {analysis.suggestedBANT.need}/5
                      </span>
                    )}
                    {analysis.suggestedBANT.technicalFit !== null && (
                      <span className="px-2 py-1 bg-violet-100 text-violet-700 text-xs rounded-full">
                        {t.technicalFit}: {analysis.suggestedBANT.technicalFit}/5
                      </span>
                    )}
                  </div>
                  {onApplySuggestions && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleApplySuggestions}
                      className="mt-2 gap-2 text-violet-600 border-violet-200 hover:bg-violet-50"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      {t.applySuggestions}
                    </Button>
                  )}
                </div>
              )}

              {/* Discovery Questions */}
              {analysis.discoveryQuestions.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-blue-700">
                    <HelpCircle className="w-3.5 h-3.5" />
                    {t.discoveryQuestions}
                  </div>
                  <ul className="space-y-1">
                    {analysis.discoveryQuestions.map((question, i) => (
                      <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                        <span className="text-blue-500 font-medium shrink-0">{i + 1}.</span>
                        {question}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Re-analyze button */}
              <div className="pt-2 border-t border-violet-100">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleAnalyze}
                  disabled={isLoading}
                  className="text-xs text-gray-500 hover:text-violet-600"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                      {t.analyzing}
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3 h-3 mr-1" />
                      {t.reAnalyze}
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          )}
        </Card>
      )}
    </div>
  )
}

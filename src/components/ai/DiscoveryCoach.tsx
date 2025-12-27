'use client'

import { useState } from 'react'
import { Lightbulb, Loader2, Copy, Check, ChevronDown, ChevronUp, HelpCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { toast } from 'sonner'
import type { BANTCategory, DiscoveryQuestionsResponse } from '@/types/ai.types'

interface DiscoveryCoachProps {
  companyName: string
  bantCategory: BANTCategory
  companySize?: string
  industry?: string
  currentScore?: number
  contextNotes?: string
  language?: 'es' | 'en'
}

const categoryLabels: Record<BANTCategory, { es: string; en: string; icon: string }> = {
  budget: { es: 'Budget', en: 'Budget', icon: '💰' },
  authority: { es: 'Authority', en: 'Authority', icon: '👤' },
  need: { es: 'Need', en: 'Need', icon: '🎯' },
  timeline: { es: 'Timeline', en: 'Timeline', icon: '📅' },
  technical: { es: 'Technical Fit', en: 'Technical Fit', icon: '⚙️' }
}

const texts = {
  es: {
    getQuestions: 'Obtener preguntas',
    loading: 'Generando...',
    proTip: 'Pro Tip',
    copyAll: 'Copiar todas',
    copied: 'Copiado',
    questions: 'Preguntas',
    purpose: 'Propósito',
    followUp: 'Seguimiento',
    insight: 'Insight'
  },
  en: {
    getQuestions: 'Get questions',
    loading: 'Generating...',
    proTip: 'Pro Tip',
    copyAll: 'Copy all',
    copied: 'Copied',
    questions: 'Questions',
    purpose: 'Purpose',
    followUp: 'Follow-up',
    insight: 'Insight'
  }
}

export function DiscoveryCoach({
  companyName,
  bantCategory,
  companySize,
  industry,
  currentScore,
  contextNotes,
  language = 'es'
}: DiscoveryCoachProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [data, setData] = useState<DiscoveryQuestionsResponse | null>(null)
  const [isExpanded, setIsExpanded] = useState(true)
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)

  const t = texts[language]
  const categoryInfo = categoryLabels[bantCategory]

  const handleGetQuestions = async () => {
    if (!companyName.trim()) return

    setIsLoading(true)
    try {
      const response = await fetch('/api/ai/discovery-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName,
          bantCategory,
          companySize,
          industry,
          currentScore,
          contextNotes
        })
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Error generating questions')
      }

      setData(result.data)
      setIsExpanded(true)
    } catch (error) {
      toast.error(language === 'es' ? 'Error al generar' : 'Generation error', {
        description: error instanceof Error ? error.message : 'Unknown error'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const copyQuestion = async (question: string, index: number) => {
    await navigator.clipboard.writeText(question)
    setCopiedIndex(index)
    toast.success(t.copied)
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  const copyAll = async () => {
    if (!data) return
    const allQuestions = data.questions.map((q, i) => `${i + 1}. ${q.question}`).join('\n\n')
    await navigator.clipboard.writeText(allQuestions)
    toast.success(t.copied)
  }

  if (!companyName || companyName.length < 2) {
    return null
  }

  return (
    <div className="mt-2">
      {!data && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleGetQuestions}
          disabled={isLoading}
          className="gap-1.5 text-xs text-blue-600 hover:bg-blue-50 hover:text-blue-700 h-7 px-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-3 h-3 animate-spin" />
              {t.loading}
            </>
          ) : (
            <>
              <Lightbulb className="w-3 h-3" />
              {t.getQuestions}
            </>
          )}
        </Button>
      )}

      {data && (
        <Card className="border-blue-200 bg-gradient-to-br from-blue-50/50 to-white mt-2">
          <div
            className="flex items-center justify-between px-3 py-2 border-b border-blue-100 cursor-pointer"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <div className="flex items-center gap-2">
              <span>{categoryInfo.icon}</span>
              <span className="font-medium text-xs text-blue-900">
                {t.questions} - {categoryInfo[language]}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={(e) => { e.stopPropagation(); copyAll(); }}
                className="h-6 px-2 text-xs"
              >
                <Copy className="w-3 h-3 mr-1" />
                {t.copyAll}
              </Button>
              {isExpanded ? (
                <ChevronUp className="w-4 h-4 text-gray-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-400" />
              )}
            </div>
          </div>

          {isExpanded && (
            <CardContent className="p-3 space-y-3">
              {data.questions.map((q, index) => (
                <div key={index} className="bg-white rounded-lg p-3 border border-blue-100">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <p className="font-medium text-sm text-gray-800">{q.question}</p>
                      <div className="mt-2 space-y-1">
                        <p className="text-xs text-gray-500">
                          <span className="font-medium text-blue-600">{t.purpose}:</span> {q.purpose}
                        </p>
                        <p className="text-xs text-gray-500">
                          <span className="font-medium text-green-600">{t.followUp}:</span> {q.followUp}
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => copyQuestion(q.question, index)}
                      className="h-7 w-7 p-0 shrink-0"
                    >
                      {copiedIndex === index ? (
                        <Check className="w-3.5 h-3.5 text-green-500" />
                      ) : (
                        <Copy className="w-3.5 h-3.5 text-gray-400" />
                      )}
                    </Button>
                  </div>
                </div>
              ))}

              {data.proTip && (
                <div className="bg-amber-50 rounded-lg p-3 border border-amber-200">
                  <div className="flex items-start gap-2">
                    <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-xs text-amber-800">{t.proTip}</p>
                      <p className="text-xs text-amber-700 mt-1">{data.proTip}</p>
                    </div>
                  </div>
                </div>
              )}

              {data.categoryInsight && (
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <div className="flex items-start gap-2">
                    <HelpCircle className="w-4 h-4 text-gray-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-xs text-gray-700">{t.insight}</p>
                      <p className="text-xs text-gray-600 mt-1">{data.categoryInsight}</p>
                    </div>
                  </div>
                </div>
              )}

              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleGetQuestions}
                disabled={isLoading}
                className="w-full text-xs text-gray-500 hover:text-blue-600"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                    {t.loading}
                  </>
                ) : (
                  <>
                    <Lightbulb className="w-3 h-3 mr-1" />
                    {language === 'es' ? 'Regenerar preguntas' : 'Regenerate questions'}
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

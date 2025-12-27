'use client'

import { useState } from 'react'
import { Mail, Loader2, Copy, Check, RefreshCw, Clock, ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { toast } from 'sonner'
import type { FollowupRequest, FollowupResponse } from '@/types/ai.types'

interface FollowupGeneratorProps {
  lead: {
    company: string
    contact: string
    email?: string
    position?: string
  }
  scorecard: {
    budget: number
    authority: number
    need: number
    timeline: number
    technicalFit: number
    totalScore: number
    status: 'GO' | 'REVIEW' | 'NO_GO'
    redFlags: string[]
    notes?: string
  }
  context?: {
    painPoints?: string
    nextSteps?: string
    lastInteraction?: string
  }
  language?: 'es' | 'en'
}

const toneOptions = [
  { value: 'formal', labelEs: 'Formal', labelEn: 'Formal' },
  { value: 'casual', labelEs: 'Casual', labelEn: 'Casual' },
  { value: 'friendly', labelEs: 'Amigable', labelEn: 'Friendly' }
] as const

const goalOptions = [
  { value: 'demo', labelEs: 'Agendar Demo', labelEn: 'Schedule Demo' },
  { value: 'meeting', labelEs: 'Reunión', labelEn: 'Meeting' },
  { value: 'info', labelEs: 'Compartir Info', labelEn: 'Share Info' },
  { value: 'proposal', labelEs: 'Propuesta', labelEn: 'Proposal' },
  { value: 'closing', labelEs: 'Cierre', labelEn: 'Closing' }
] as const

const texts = {
  es: {
    generate: 'Generar Follow-up',
    generating: 'Generando...',
    subject: 'Asunto',
    body: 'Cuerpo',
    suggestedTime: 'Mejor momento para enviar',
    alternativeSubjects: 'Asuntos alternativos',
    readTime: 'Tiempo de lectura',
    copyEmail: 'Copiar email',
    regenerate: 'Regenerar',
    copied: 'Copiado',
    tone: 'Tono',
    goal: 'Objetivo',
    length: 'Longitud',
    short: 'Corto',
    medium: 'Medio',
    detailed: 'Detallado'
  },
  en: {
    generate: 'Generate Follow-up',
    generating: 'Generating...',
    subject: 'Subject',
    body: 'Body',
    suggestedTime: 'Best time to send',
    alternativeSubjects: 'Alternative subjects',
    readTime: 'Read time',
    copyEmail: 'Copy email',
    regenerate: 'Regenerate',
    copied: 'Copied',
    tone: 'Tone',
    goal: 'Goal',
    length: 'Length',
    short: 'Short',
    medium: 'Medium',
    detailed: 'Detailed'
  }
}

export function FollowupGenerator({
  lead,
  scorecard,
  context = {},
  language = 'es'
}: FollowupGeneratorProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [data, setData] = useState<FollowupResponse | null>(null)
  const [isExpanded, setIsExpanded] = useState(true)
  const [copied, setCopied] = useState(false)

  // Preferences
  const [tone, setTone] = useState<'formal' | 'casual' | 'friendly'>('formal')
  const [goal, setGoal] = useState<'demo' | 'meeting' | 'info' | 'proposal' | 'closing'>('demo')
  const [length, setLength] = useState<'short' | 'medium' | 'detailed'>('medium')

  const t = texts[language]

  const handleGenerate = async () => {
    if (!lead.company || !lead.contact) {
      toast.error(language === 'es' ? 'Información del lead requerida' : 'Lead information required')
      return
    }

    setIsLoading(true)
    try {
      const request: FollowupRequest = {
        lead,
        scorecard,
        context,
        preferences: { tone, goal, length }
      }

      const response = await fetch('/api/ai/generate-followup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request)
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Error generating follow-up')
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

  const copyEmail = async () => {
    if (!data) return
    const fullEmail = `${t.subject}: ${data.subject}\n\n${data.body}`
    await navigator.clipboard.writeText(fullEmail)
    setCopied(true)
    toast.success(t.copied)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-4">
      {/* Preferences */}
      {!data && (
        <div className="flex flex-wrap gap-4">
          {/* Tone */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-600">{t.tone}</label>
            <div className="flex gap-1">
              {toneOptions.map(option => (
                <Button
                  key={option.value}
                  type="button"
                  variant={tone === option.value ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTone(option.value)}
                  className="text-xs h-7"
                >
                  {language === 'es' ? option.labelEs : option.labelEn}
                </Button>
              ))}
            </div>
          </div>

          {/* Goal */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-600">{t.goal}</label>
            <select
              value={goal}
              onChange={(e) => setGoal(e.target.value as typeof goal)}
              className="h-7 text-xs border rounded px-2"
            >
              {goalOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {language === 'es' ? option.labelEs : option.labelEn}
                </option>
              ))}
            </select>
          </div>

          {/* Length */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-600">{t.length}</label>
            <div className="flex gap-1">
              {(['short', 'medium', 'detailed'] as const).map(l => (
                <Button
                  key={l}
                  type="button"
                  variant={length === l ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setLength(l)}
                  className="text-xs h-7"
                >
                  {t[l]}
                </Button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Generate Button */}
      {!data && (
        <Button
          type="button"
          onClick={handleGenerate}
          disabled={isLoading}
          className="gap-2 bg-green-600 hover:bg-green-700"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              {t.generating}
            </>
          ) : (
            <>
              <Mail className="w-4 h-4" />
              {t.generate}
            </>
          )}
        </Button>
      )}

      {/* Generated Email */}
      {data && (
        <Card className="border-green-200 bg-gradient-to-br from-green-50/50 to-white">
          <div
            className="flex items-center justify-between px-4 py-3 border-b border-green-100 cursor-pointer"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-green-600" />
              <span className="font-semibold text-sm text-green-900">Follow-up Email</span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={(e) => { e.stopPropagation(); copyEmail(); }}
                className="h-7 gap-1"
              >
                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                {t.copyEmail}
              </Button>
              {isExpanded ? (
                <ChevronUp className="w-4 h-4 text-gray-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-400" />
              )}
            </div>
          </div>

          {isExpanded && (
            <CardContent className="p-4 space-y-4">
              {/* Subject */}
              <div>
                <label className="text-xs font-medium text-gray-600">{t.subject}</label>
                <div className="mt-1 p-2 bg-white border rounded text-sm font-medium">
                  {data.subject}
                </div>
              </div>

              {/* Body */}
              <div>
                <label className="text-xs font-medium text-gray-600">{t.body}</label>
                <div className="mt-1 p-3 bg-white border rounded text-sm whitespace-pre-wrap">
                  {data.body}
                </div>
              </div>

              {/* Metadata */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                {data.suggestedSendTime && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{t.suggestedTime}: {data.suggestedSendTime}</span>
                  </div>
                )}
                {data.estimatedReadTime && (
                  <div className="text-gray-600">
                    {t.readTime}: {data.estimatedReadTime}
                  </div>
                )}
              </div>

              {/* Alternative Subjects */}
              {data.alternativeSubjects.length > 0 && (
                <div>
                  <label className="text-xs font-medium text-gray-600">{t.alternativeSubjects}</label>
                  <ul className="mt-1 space-y-1">
                    {data.alternativeSubjects.map((subject, i) => (
                      <li key={i} className="text-xs text-gray-500 flex items-center gap-2">
                        <span className="text-gray-400">•</span>
                        {subject}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Regenerate */}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleGenerate}
                disabled={isLoading}
                className="w-full gap-2"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
                {t.regenerate}
              </Button>
            </CardContent>
          )}
        </Card>
      )}
    </div>
  )
}

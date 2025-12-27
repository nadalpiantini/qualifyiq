'use client'

import { AlertCircle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { AIError } from '@/types/ai.types'

interface AIErrorBoundaryProps {
  error: AIError | null
  onRetry?: () => void
  language?: 'es' | 'en'
}

const errorMessages: Record<string, { es: string; en: string }> = {
  RATE_LIMIT: {
    es: 'Has alcanzado el límite de análisis. Intenta de nuevo más tarde.',
    en: 'You have reached the analysis limit. Try again later.'
  },
  API_ERROR: {
    es: 'Error al conectar con el servicio de IA. Intenta de nuevo.',
    en: 'Error connecting to AI service. Please try again.'
  },
  INVALID_INPUT: {
    es: 'Los datos proporcionados no son válidos.',
    en: 'The provided data is not valid.'
  },
  NO_CREDITS: {
    es: 'No tienes créditos de IA disponibles.',
    en: 'No AI credits available.'
  },
  PARSE_ERROR: {
    es: 'Error al procesar la respuesta de IA.',
    en: 'Error processing AI response.'
  }
}

export function AIErrorBoundary({
  error,
  onRetry,
  language = 'es'
}: AIErrorBoundaryProps) {
  if (!error) return null

  const getMessage = () => {
    const messages = errorMessages[error.code]
    if (messages) {
      return messages[language]
    }
    return error.message || (language === 'es' ? 'Error desconocido' : 'Unknown error')
  }

  return (
    <div className="flex flex-col items-center justify-center py-4 px-4 bg-red-50 border border-red-200 rounded-lg">
      <AlertCircle className="w-8 h-8 text-red-500 mb-2" />
      <p className="text-sm text-red-700 text-center mb-3">{getMessage()}</p>
      {onRetry && (
        <Button
          variant="outline"
          size="sm"
          onClick={onRetry}
          className="gap-2 text-red-600 border-red-200 hover:bg-red-100"
        >
          <RefreshCw className="w-4 h-4" />
          {language === 'es' ? 'Reintentar' : 'Retry'}
        </Button>
      )}
      {error.retryAfter && (
        <p className="text-xs text-red-500 mt-2">
          {language === 'es'
            ? `Disponible en ${Math.ceil(error.retryAfter / 60)} minutos`
            : `Available in ${Math.ceil(error.retryAfter / 60)} minutes`}
        </p>
      )}
    </div>
  )
}

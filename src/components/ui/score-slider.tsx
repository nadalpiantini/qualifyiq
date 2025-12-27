'use client'

import * as React from 'react'
import { cn } from '@/lib/utils/cn'
import { CheckCircle2, AlertTriangle, XCircle } from 'lucide-react'

interface ScoreSliderProps {
  label: string
  value: number
  onChange: (value: number) => void
  description?: string
  labels?: string[]
}

export function ScoreSlider({
  label,
  value,
  onChange,
  description,
  labels = ['1 - Bajo', '2 - Regular', '3 - Bueno', '4 - Muy bueno', '5 - Excelente']
}: ScoreSliderProps) {
  const [hoveredScore, setHoveredScore] = React.useState<number | null>(null)

  const getColor = (val: number) => {
    if (val >= 4) return 'bg-green-500'
    if (val >= 3) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  const getTextColor = (val: number) => {
    if (val >= 4) return 'text-green-700 bg-green-100'
    if (val >= 3) return 'text-yellow-700 bg-yellow-100'
    return 'text-red-700 bg-red-100'
  }

  const getScoreIcon = (val: number) => {
    if (val >= 4) return <CheckCircle2 className="w-4 h-4 text-green-500" />
    if (val >= 3) return <AlertTriangle className="w-4 h-4 text-yellow-500" />
    return <XCircle className="w-4 h-4 text-red-500" />
  }

  const displayScore = hoveredScore ?? value
  const displayLabel = labels[displayScore - 1] || labels[value - 1]

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        <div className="flex items-center gap-2">
          {getScoreIcon(displayScore)}
          <span className={cn(
            'text-sm font-semibold px-2 py-0.5 rounded transition-all',
            getTextColor(displayScore)
          )}>
            {displayLabel}
          </span>
        </div>
      </div>

      {description && (
        <p className="text-xs text-gray-500">{description}</p>
      )}

      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((score) => (
          <button
            key={score}
            type="button"
            onClick={() => onChange(score)}
            onMouseEnter={() => setHoveredScore(score)}
            onMouseLeave={() => setHoveredScore(null)}
            className={cn(
              'flex-1 h-12 rounded-lg font-semibold transition-all relative',
              'border-2 hover:scale-105 hover:shadow-md',
              value === score
                ? cn(getColor(score), 'text-white border-transparent shadow-sm')
                : score >= 4
                  ? 'bg-green-50 text-green-600 border-green-200 hover:border-green-400'
                  : score === 3
                    ? 'bg-yellow-50 text-yellow-600 border-yellow-200 hover:border-yellow-400'
                    : 'bg-red-50 text-red-600 border-red-200 hover:border-red-400'
            )}
          >
            <span className="text-lg">{score}</span>
            {value === score && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full shadow-sm flex items-center justify-center">
                <span className={cn(
                  'w-2 h-2 rounded-full',
                  getColor(score)
                )} />
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Labels row - shows on hover */}
      <div className="flex justify-between text-xs text-gray-400 px-1">
        <span className="text-red-400">← NO GO</span>
        <span className="text-yellow-500">REVIEW</span>
        <span className="text-green-400">GO →</span>
      </div>
    </div>
  )
}

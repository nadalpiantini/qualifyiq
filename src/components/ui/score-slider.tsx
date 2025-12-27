'use client'

import * as React from 'react'
import { cn } from '@/lib/utils/cn'

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
  labels = ['Poor', 'Fair', 'Good', 'Very Good', 'Excellent']
}: ScoreSliderProps) {
  const getColor = (val: number) => {
    if (val >= 4) return 'bg-green-500'
    if (val >= 3) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        <span className={cn(
          'text-sm font-semibold px-2 py-0.5 rounded',
          value >= 4 ? 'bg-green-100 text-green-700' :
          value >= 3 ? 'bg-yellow-100 text-yellow-700' :
          'bg-red-100 text-red-700'
        )}>
          {value}/5 - {labels[value - 1]}
        </span>
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
            className={cn(
              'flex-1 h-10 rounded-lg font-medium transition-all',
              'border-2 hover:scale-105',
              value === score
                ? cn(getColor(score), 'text-white border-transparent')
                : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-gray-300'
            )}
          >
            {score}
          </button>
        ))}
      </div>
    </div>
  )
}

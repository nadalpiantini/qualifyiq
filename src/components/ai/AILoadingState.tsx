'use client'

import { Loader2, Sparkles } from 'lucide-react'

interface AILoadingStateProps {
  message?: string
  subMessage?: string
  size?: 'sm' | 'md' | 'lg'
}

export function AILoadingState({
  message = 'Analizando...',
  subMessage,
  size = 'md'
}: AILoadingStateProps) {
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  }

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  }

  return (
    <div className="flex flex-col items-center justify-center py-6 gap-3">
      <div className="relative">
        <Loader2 className={`${iconSizes[size]} text-violet-600 animate-spin`} />
        <Sparkles className={`${iconSizes[size]} text-violet-400 absolute -top-1 -right-1 animate-pulse`} />
      </div>
      <div className="text-center">
        <p className={`${sizeClasses[size]} font-medium text-gray-700`}>{message}</p>
        {subMessage && (
          <p className="text-xs text-gray-500 mt-1">{subMessage}</p>
        )}
      </div>
    </div>
  )
}

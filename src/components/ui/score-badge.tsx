import { cn } from '@/lib/utils/cn'

interface ScoreBadgeProps {
  score: number
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
}

export function ScoreBadge({ score, size = 'md', showLabel = true }: ScoreBadgeProps) {
  const getColor = (score: number) => {
    if (score >= 70) return { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200' }
    if (score >= 50) return { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-200' }
    return { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200' }
  }

  const getLabel = (score: number) => {
    if (score >= 70) return 'GO'
    if (score >= 50) return 'REVIEW'
    return 'NO GO'
  }

  const colors = getColor(score)
  const label = getLabel(score)

  const sizes = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-1.5',
  }

  return (
    <div className="flex items-center gap-2">
      <span
        className={cn(
          'inline-flex items-center font-bold rounded-full border',
          colors.bg,
          colors.text,
          colors.border,
          sizes[size]
        )}
      >
        {score}
      </span>
      {showLabel && (
        <span
          className={cn(
            'inline-flex items-center font-semibold rounded-md',
            colors.bg,
            colors.text,
            sizes[size]
          )}
        >
          {label}
        </span>
      )}
    </div>
  )
}

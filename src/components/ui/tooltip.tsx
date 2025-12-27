'use client'

import { useState, useRef, useEffect, ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/lib/utils/cn'

interface TooltipProps {
  content: ReactNode
  children: ReactNode
  position?: 'top' | 'bottom' | 'left' | 'right'
  delay?: number
  className?: string
  disabled?: boolean
}

export function Tooltip({
  content,
  children,
  position = 'top',
  delay = 300,
  className,
  disabled = false,
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [coords, setCoords] = useState({ top: 0, left: 0 })
  const triggerRef = useRef<HTMLDivElement>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  const calculatePosition = () => {
    if (!triggerRef.current) return

    const triggerRect = triggerRef.current.getBoundingClientRect()
    const scrollY = window.scrollY
    const scrollX = window.scrollX

    let top = 0
    let left = 0

    switch (position) {
      case 'top':
        top = triggerRect.top + scrollY - 8
        left = triggerRect.left + scrollX + triggerRect.width / 2
        break
      case 'bottom':
        top = triggerRect.bottom + scrollY + 8
        left = triggerRect.left + scrollX + triggerRect.width / 2
        break
      case 'left':
        top = triggerRect.top + scrollY + triggerRect.height / 2
        left = triggerRect.left + scrollX - 8
        break
      case 'right':
        top = triggerRect.top + scrollY + triggerRect.height / 2
        left = triggerRect.right + scrollX + 8
        break
    }

    setCoords({ top, left })
  }

  const showTooltip = () => {
    if (disabled) return
    timeoutRef.current = setTimeout(() => {
      calculatePosition()
      setIsVisible(true)
    }, delay)
  }

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    setIsVisible(false)
  }

  const positionClasses = {
    top: '-translate-x-1/2 -translate-y-full',
    bottom: '-translate-x-1/2',
    left: '-translate-x-full -translate-y-1/2',
    right: '-translate-y-1/2',
  }

  const arrowClasses = {
    top: 'bottom-[-4px] left-1/2 -translate-x-1/2 border-t-gray-900 border-x-transparent border-b-transparent',
    bottom: 'top-[-4px] left-1/2 -translate-x-1/2 border-b-gray-900 border-x-transparent border-t-transparent',
    left: 'right-[-4px] top-1/2 -translate-y-1/2 border-l-gray-900 border-y-transparent border-r-transparent',
    right: 'left-[-4px] top-1/2 -translate-y-1/2 border-r-gray-900 border-y-transparent border-l-transparent',
  }

  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        onFocus={showTooltip}
        onBlur={hideTooltip}
        className="inline-flex"
      >
        {children}
      </div>

      {mounted && isVisible && createPortal(
        <div
          ref={tooltipRef}
          role="tooltip"
          className={cn(
            'fixed z-50 px-3 py-2 text-sm text-white bg-gray-900 rounded-lg shadow-lg',
            'animate-in fade-in-0 zoom-in-95 duration-200',
            'max-w-xs',
            positionClasses[position],
            className
          )}
          style={{
            top: coords.top,
            left: coords.left,
          }}
        >
          {content}
          <div
            className={cn(
              'absolute w-0 h-0 border-4',
              arrowClasses[position]
            )}
          />
        </div>,
        document.body
      )}
    </>
  )
}

// InfoTooltip component for help icons
interface InfoTooltipProps {
  content: ReactNode
  position?: 'top' | 'bottom' | 'left' | 'right'
  iconSize?: 'sm' | 'md' | 'lg'
}

export function InfoTooltip({
  content,
  position = 'top',
  iconSize = 'sm'
}: InfoTooltipProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  }

  return (
    <Tooltip content={content} position={position}>
      <button
        type="button"
        className="inline-flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
        aria-label="More information"
      >
        <svg
          className={sizeClasses[iconSize]}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <circle cx="12" cy="12" r="10" strokeWidth="2" />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M12 16v-4M12 8h.01"
          />
        </svg>
      </button>
    </Tooltip>
  )
}

// HelpText component for inline help
interface HelpTextProps {
  children: ReactNode
  className?: string
}

export function HelpText({ children, className }: HelpTextProps) {
  return (
    <p className={cn('text-xs text-gray-500 mt-1', className)}>
      {children}
    </p>
  )
}

// Feature highlight tooltip for onboarding
interface FeatureHighlightProps {
  title: string
  description: string
  step?: number
  totalSteps?: number
  children: ReactNode
  isActive?: boolean
  onNext?: () => void
  onDismiss?: () => void
}

export function FeatureHighlight({
  title,
  description,
  step,
  totalSteps,
  children,
  isActive = false,
  onNext,
  onDismiss,
}: FeatureHighlightProps) {
  const [mounted, setMounted] = useState(false)
  const triggerRef = useRef<HTMLDivElement>(null)
  const [coords, setCoords] = useState({ top: 0, left: 0 })

  useEffect(() => {
    setMounted(true)
    if (isActive && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect()
      setCoords({
        top: rect.bottom + window.scrollY + 12,
        left: rect.left + window.scrollX + rect.width / 2,
      })
    }
  }, [isActive])

  return (
    <>
      <div
        ref={triggerRef}
        className={cn(
          'relative inline-flex',
          isActive && 'ring-2 ring-violet-500 ring-offset-2 rounded-lg'
        )}
      >
        {children}
      </div>

      {mounted && isActive && createPortal(
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/20 z-40"
            onClick={onDismiss}
          />

          {/* Highlight card */}
          <div
            className="fixed z-50 w-72 p-4 bg-white rounded-lg shadow-xl border border-violet-200 -translate-x-1/2 animate-in fade-in-0 slide-in-from-bottom-2 duration-300"
            style={{
              top: coords.top,
              left: coords.left,
            }}
          >
            {/* Arrow */}
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-b-8 border-l-transparent border-r-transparent border-b-white" />

            {step && totalSteps && (
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-medium text-violet-600 bg-violet-50 px-2 py-0.5 rounded-full">
                  Paso {step} de {totalSteps}
                </span>
              </div>
            )}

            <h4 className="font-semibold text-gray-900 mb-1">{title}</h4>
            <p className="text-sm text-gray-600 mb-4">{description}</p>

            <div className="flex justify-end gap-2">
              {onDismiss && (
                <button
                  onClick={onDismiss}
                  className="text-sm text-gray-500 hover:text-gray-700 px-3 py-1.5"
                >
                  Cerrar
                </button>
              )}
              {onNext && (
                <button
                  onClick={onNext}
                  className="text-sm font-medium text-white bg-violet-600 hover:bg-violet-700 px-3 py-1.5 rounded-lg"
                >
                  Siguiente
                </button>
              )}
            </div>
          </div>
        </>,
        document.body
      )}
    </>
  )
}

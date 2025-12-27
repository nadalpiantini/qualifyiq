'use client'

import { Bell, Search, Plus, X, CheckCircle, AlertCircle, Info } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ReactNode, useState, useCallback, useTransition, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils/cn'

interface HeaderProps {
  title: string
  subtitle?: string
  action?: {
    label: string
    href: string
    icon?: ReactNode
    dataTour?: string
  }
}

// Demo notifications for demo mode
const DEMO_NOTIFICATIONS = [
  {
    id: '1',
    type: 'success' as const,
    title: 'Lead qualified',
    message: 'Acme Corp has reached qualification threshold',
    time: '2 min ago',
    read: false,
  },
  {
    id: '2',
    type: 'warning' as const,
    title: 'Follow-up due',
    message: 'TechStart Inc follow-up scheduled for today',
    time: '1 hour ago',
    read: false,
  },
  {
    id: '3',
    type: 'info' as const,
    title: 'New lead added',
    message: 'Global Retail was added to your pipeline',
    time: '3 hours ago',
    read: true,
  },
]

type NotificationType = 'success' | 'warning' | 'info'

const notificationIcons: Record<NotificationType, typeof CheckCircle> = {
  success: CheckCircle,
  warning: AlertCircle,
  info: Info,
}

const notificationColors: Record<NotificationType, string> = {
  success: 'text-green-500',
  warning: 'text-amber-500',
  info: 'text-blue-500',
}

export function Header({ title, subtitle, action }: HeaderProps) {
  const [showNotifications, setShowNotifications] = useState(false)
  const [notifications, setNotifications] = useState(DEMO_NOTIFICATIONS)
  const [isPending, startTransition] = useTransition()
  const panelRef = useRef<HTMLDivElement>(null)

  const unreadCount = notifications.filter(n => !n.read).length

  const handleToggleNotifications = useCallback(() => {
    startTransition(() => {
      setShowNotifications(prev => !prev)
    })
  }, [])

  const handleMarkAsRead = useCallback((id: string) => {
    startTransition(() => {
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, read: true } : n)
      )
    })
  }, [])

  const handleMarkAllAsRead = useCallback(() => {
    startTransition(() => {
      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    })
  }, [])

  const handleDismiss = useCallback((id: string) => {
    startTransition(() => {
      setNotifications(prev => prev.filter(n => n.id !== id))
    })
  }, [])

  // Close panel when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setShowNotifications(false)
      }
    }

    if (showNotifications) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showNotifications])

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          {subtitle && (
            <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>
          )}
        </div>

        <div className="flex items-center gap-4">
          {action && (
            <Link href={action.href}>
              <Button data-tour={action.dataTour}>
                {action.icon || <Plus className="w-4 h-4 mr-2" />}
                {action.label}
              </Button>
            </Link>
          )}

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search leads..."
              className="pl-10 pr-4 py-2 w-64 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
            />
          </div>

          {/* Notifications */}
          <div className="relative" ref={panelRef}>
            <button
              onClick={handleToggleNotifications}
              disabled={isPending}
              className={cn(
                'relative p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-lg',
                showNotifications && 'bg-gray-100 text-gray-600',
                isPending && 'opacity-50'
              )}
              aria-label="Notifications"
              aria-expanded={showNotifications}
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              )}
            </button>

            {/* Notification Panel */}
            {showNotifications && (
              <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                  <h3 className="font-semibold text-gray-900">Notifications</h3>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllAsRead}
                      className="text-xs text-violet-600 hover:text-violet-700 font-medium"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="px-4 py-8 text-center text-gray-500">
                      <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No notifications</p>
                    </div>
                  ) : (
                    notifications.map(notification => {
                      const Icon = notificationIcons[notification.type]
                      return (
                        <div
                          key={notification.id}
                          className={cn(
                            'px-4 py-3 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors',
                            !notification.read && 'bg-violet-50/50'
                          )}
                        >
                          <div className="flex gap-3">
                            <Icon className={cn('w-5 h-5 shrink-0 mt-0.5', notificationColors[notification.type])} />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <p className={cn(
                                  'text-sm',
                                  notification.read ? 'text-gray-600' : 'text-gray-900 font-medium'
                                )}>
                                  {notification.title}
                                </p>
                                <button
                                  onClick={() => handleDismiss(notification.id)}
                                  className="text-gray-400 hover:text-gray-600 p-0.5"
                                  aria-label="Dismiss"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                              <p className="text-xs text-gray-500 mt-0.5">{notification.message}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs text-gray-400">{notification.time}</span>
                                {!notification.read && (
                                  <button
                                    onClick={() => handleMarkAsRead(notification.id)}
                                    className="text-xs text-violet-600 hover:text-violet-700"
                                  >
                                    Mark as read
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="w-8 h-8 bg-violet-600 rounded-full flex items-center justify-center text-white font-medium text-sm">
            U
          </div>
        </div>
      </div>
    </header>
  )
}

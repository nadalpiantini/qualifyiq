'use client'

import { Bell, Search, Plus } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ReactNode } from 'react'

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

export function Header({ title, subtitle, action }: HeaderProps) {
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

          <button className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          </button>

          <div className="w-8 h-8 bg-violet-600 rounded-full flex items-center justify-center text-white font-medium text-sm">
            U
          </div>
        </div>
      </div>
    </header>
  )
}

'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils/cn'
import {
  LayoutDashboard,
  Users,
  ClipboardCheck,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Target
} from 'lucide-react'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Leads', href: '/leads', icon: Users },
  { name: 'Scorecard', href: '/scorecard', icon: ClipboardCheck },
  { name: 'Settings', href: '/settings', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [collapsed, setCollapsed] = useState(false)
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/auth/login')
    router.refresh()
  }

  return (
    <aside
      data-tour="sidebar"
      className={cn(
        'flex flex-col h-screen bg-gray-900 text-white transition-all duration-300',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Logo */}
      <div className="flex items-center justify-between p-4 border-b border-gray-800">
        {!collapsed && (
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center">
              <Target className="w-5 h-5" />
            </div>
            <span className="font-bold text-lg">QualifyIQ</span>
          </Link>
        )}
        {collapsed && (
          <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center mx-auto">
            <Target className="w-5 h-5" />
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname.startsWith(item.href)
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors',
                isActive
                  ? 'bg-violet-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              )}
            >
              <item.icon className="w-5 h-5 shrink-0" />
              {!collapsed && <span className="font-medium">{item.name}</span>}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-800 space-y-2">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center gap-3 px-3 py-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
        >
          {collapsed ? (
            <ChevronRight className="w-5 h-5 mx-auto" />
          ) : (
            <>
              <ChevronLeft className="w-5 h-5" />
              <span className="font-medium">Collapse</span>
            </>
          )}
        </button>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
        >
          <LogOut className="w-5 h-5 shrink-0" />
          {!collapsed && <span className="font-medium">Logout</span>}
        </button>
      </div>
    </aside>
  )
}

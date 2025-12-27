'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Header } from '@/components/layout/header'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  Download,
  Filter,
  ChevronLeft,
  ChevronRight,
  Building2,
  User,
  Phone
} from 'lucide-react'
import {
  DEMO_FOLLOWUPS,
  sortFollowUps,
  getFollowUpStatus,
  formatFollowUpDate,
  getDaysUntil,
  getFollowUpStats,
  generateGoogleCalendarUrl,
  generateOutlookCalendarUrl,
  downloadICalEvent,
  type FollowUp,
} from '@/lib/services/calendar'

type FilterType = 'all' | 'pending' | 'overdue' | 'today' | 'week'

export default function FollowUpsPage() {
  const [filter, setFilter] = useState<FilterType>('all')
  const [selectedWeekStart, setSelectedWeekStart] = useState(() => {
    const today = new Date()
    const dayOfWeek = today.getDay()
    const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1)
    return new Date(today.setDate(diff))
  })

  // Update follow-up statuses
  const followUps = useMemo(() => {
    return DEMO_FOLLOWUPS.map(f => ({
      ...f,
      status: getFollowUpStatus(f.dueDate, f.status),
    }))
  }, [])

  // Get statistics
  const stats = useMemo(() => getFollowUpStats(followUps), [followUps])

  // Filter follow-ups
  const filteredFollowUps = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const weekEnd = new Date(selectedWeekStart)
    weekEnd.setDate(weekEnd.getDate() + 7)

    let filtered = [...followUps]

    switch (filter) {
      case 'pending':
        filtered = filtered.filter(f => f.status === 'pending')
        break
      case 'overdue':
        filtered = filtered.filter(f => f.status === 'overdue')
        break
      case 'today':
        filtered = filtered.filter(f => {
          const dueDate = new Date(f.dueDate)
          dueDate.setHours(0, 0, 0, 0)
          return dueDate.getTime() === today.getTime()
        })
        break
      case 'week':
        filtered = filtered.filter(f => {
          const dueDate = new Date(f.dueDate)
          return dueDate >= selectedWeekStart && dueDate < weekEnd
        })
        break
    }

    return sortFollowUps(filtered)
  }, [followUps, filter, selectedWeekStart])

  // Week navigation
  const goToNextWeek = () => {
    const nextWeek = new Date(selectedWeekStart)
    nextWeek.setDate(nextWeek.getDate() + 7)
    setSelectedWeekStart(nextWeek)
  }

  const goToPreviousWeek = () => {
    const prevWeek = new Date(selectedWeekStart)
    prevWeek.setDate(prevWeek.getDate() - 7)
    setSelectedWeekStart(prevWeek)
  }

  // Format week range
  const weekRange = useMemo(() => {
    const end = new Date(selectedWeekStart)
    end.setDate(end.getDate() + 6)
    return `${selectedWeekStart.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })} - ${end.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}`
  }, [selectedWeekStart])

  // Get days of the week for calendar view
  const weekDays = useMemo(() => {
    const days = []
    for (let i = 0; i < 7; i++) {
      const date = new Date(selectedWeekStart)
      date.setDate(date.getDate() + i)
      days.push(date)
    }
    return days
  }, [selectedWeekStart])

  // Group follow-ups by day
  const followUpsByDay = useMemo(() => {
    const grouped: Record<string, FollowUp[]> = {}
    weekDays.forEach(day => {
      const dateKey = day.toISOString().split('T')[0]
      grouped[dateKey] = followUps.filter(f => f.dueDate === dateKey)
    })
    return grouped
  }, [followUps, weekDays])

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        title="Follow-ups"
        subtitle="Manage your scheduled follow-ups and reminders"
      />

      <div className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setFilter('all')}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <Calendar className="w-8 h-8 text-violet-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setFilter('today')}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Today</p>
                  <p className="text-2xl font-bold text-amber-600">{stats.dueToday}</p>
                </div>
                <Clock className="w-8 h-8 text-amber-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setFilter('overdue')}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Overdue</p>
                  <p className="text-2xl font-bold text-red-600">{stats.overdue}</p>
                </div>
                <AlertCircle className="w-8 h-8 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setFilter('pending')}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Pending</p>
                  <p className="text-2xl font-bold text-green-600">{stats.pending}</p>
                </div>
                <CheckCircle2 className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          <Filter className="w-4 h-4 text-gray-400 flex-shrink-0" />
          {[
            { key: 'all', label: 'All' },
            { key: 'today', label: 'Today' },
            { key: 'week', label: 'This Week' },
            { key: 'overdue', label: 'Overdue' },
            { key: 'pending', label: 'Pending' },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key as FilterType)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                filter === key
                  ? 'bg-violet-100 text-violet-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Week Calendar View */}
        {filter === 'week' && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <Button variant="outline" size="sm" onClick={goToPreviousWeek}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="font-medium text-gray-900">{weekRange}</span>
                <Button variant="outline" size="sm" onClick={goToNextWeek}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>

              <div className="grid grid-cols-7 gap-2">
                {weekDays.map((day) => {
                  const dateKey = day.toISOString().split('T')[0]
                  const dayFollowUps = followUpsByDay[dateKey] || []
                  const isToday = day.toDateString() === new Date().toDateString()

                  return (
                    <div
                      key={dateKey}
                      className={`min-h-[120px] p-2 rounded-lg border ${
                        isToday ? 'border-violet-300 bg-violet-50' : 'border-gray-200'
                      }`}
                    >
                      <div className="text-center mb-2">
                        <p className="text-xs text-gray-500">
                          {day.toLocaleDateString('en-US', { weekday: 'short' })}
                        </p>
                        <p className={`text-lg font-bold ${isToday ? 'text-violet-600' : 'text-gray-900'}`}>
                          {day.getDate()}
                        </p>
                      </div>

                      <div className="space-y-1">
                        {dayFollowUps.slice(0, 2).map((f) => (
                          <Link
                            key={f.id}
                            href={`/leads/${f.leadId}`}
                            className={`block p-1 rounded text-xs truncate ${
                              f.status === 'overdue'
                                ? 'bg-red-100 text-red-700'
                                : f.priority === 'high'
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {f.dueTime && <span className="font-medium">{f.dueTime} </span>}
                            {f.companyName}
                          </Link>
                        ))}
                        {dayFollowUps.length > 2 && (
                          <p className="text-xs text-gray-500 text-center">
                            +{dayFollowUps.length - 2} more
                          </p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Follow-ups List */}
        <div className="space-y-4">
          {filteredFollowUps.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No follow-ups
                </h3>
                <p className="text-gray-500 mb-4">
                  {filter === 'overdue'
                    ? 'You have no overdue follow-ups'
                    : filter === 'today'
                    ? 'You have no follow-ups for today'
                    : 'Schedule follow-ups from each lead page'}
                </p>
                <Link href="/leads">
                  <Button>View Leads</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            filteredFollowUps.map((followUp) => (
              <Card
                key={followUp.id}
                className={`hover:shadow-md transition-shadow ${
                  followUp.status === 'overdue' ? 'border-red-200 bg-red-50/50' : ''
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <Link
                          href={`/leads/${followUp.leadId}`}
                          className="text-lg font-semibold text-gray-900 hover:text-violet-600 truncate"
                        >
                          {followUp.title}
                        </Link>
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                          followUp.priority === 'high' ? 'bg-red-100 text-red-700' :
                          followUp.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {followUp.priority === 'high' ? 'High' :
                           followUp.priority === 'medium' ? 'Medium' : 'Low'}
                        </span>
                        {followUp.status === 'overdue' && (
                          <span className="flex items-center text-red-600 text-xs">
                            <AlertCircle className="w-3 h-3 mr-1" />
                            Overdue
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                        <span className="flex items-center gap-1">
                          <Building2 className="w-4 h-4" />
                          {followUp.companyName}
                        </span>
                        <span className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          {followUp.contactName}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {formatFollowUpDate(followUp.dueDate)}
                          {followUp.dueTime && ` at ${followUp.dueTime}`}
                        </span>
                      </div>

                      {followUp.description && (
                        <p className="text-sm text-gray-500 line-clamp-2">
                          {followUp.description}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col gap-2">
                      <Link href={`/leads/${followUp.leadId}`}>
                        <Button variant="outline" size="sm">
                          <Phone className="w-4 h-4 mr-1" />
                          View Lead
                        </Button>
                      </Link>

                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs px-2"
                          onClick={() => window.open(generateGoogleCalendarUrl(followUp), '_blank')}
                          title="Add to Google Calendar"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs px-2"
                          onClick={() => window.open(generateOutlookCalendarUrl(followUp), '_blank')}
                          title="Add to Outlook"
                        >
                          <Calendar className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs px-2"
                          onClick={() => downloadICalEvent(followUp)}
                          title="Download .ics"
                        >
                          <Download className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

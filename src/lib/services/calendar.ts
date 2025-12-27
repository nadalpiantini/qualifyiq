/**
 * Calendar Service for QualifyIQ
 * Handles follow-up scheduling and calendar export functionality
 */

export interface FollowUp {
  id: string
  leadId: string
  companyName: string
  contactName: string
  contactEmail?: string
  title: string
  description?: string
  dueDate: string // ISO format
  dueTime?: string // 24h format "HH:MM"
  priority: 'high' | 'medium' | 'low'
  status: 'pending' | 'completed' | 'overdue' | 'cancelled'
  reminderDays?: number // Days before to remind
  createdAt: string
  completedAt?: string
}

export interface CalendarEvent {
  id: string
  title: string
  description: string
  start: Date
  end: Date
  location?: string
  url?: string
  attendees?: string[]
}

// Demo follow-ups for testing
export const DEMO_FOLLOWUPS: FollowUp[] = [
  {
    id: 'followup-1',
    leadId: 'lead-1',
    companyName: 'TechCorp Solutions',
    contactName: 'María García',
    contactEmail: 'maria@techcorp.com',
    title: 'Follow-up call - Demo presentation',
    description: 'Schedule demo presentation of our platform',
    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    dueTime: '10:00',
    priority: 'high',
    status: 'pending',
    reminderDays: 1,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'followup-2',
    leadId: 'lead-3',
    companyName: 'DataFlow Analytics',
    contactName: 'Carlos Ruiz',
    contactEmail: 'carlos@dataflow.io',
    title: 'Send proposal document',
    description: 'Send pricing proposal based on requirements discussion',
    dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    dueTime: '14:00',
    priority: 'medium',
    status: 'pending',
    reminderDays: 2,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'followup-3',
    leadId: 'lead-5',
    companyName: 'CloudNine Services',
    contactName: 'Ana López',
    contactEmail: 'ana@cloudnine.es',
    title: 'Contract review meeting',
    description: 'Review contract terms with legal team',
    dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    dueTime: '11:30',
    priority: 'high',
    status: 'overdue',
    reminderDays: 1,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
]

/**
 * Get follow-up status based on due date
 */
export function getFollowUpStatus(dueDate: string, currentStatus: FollowUp['status']): FollowUp['status'] {
  if (currentStatus === 'completed' || currentStatus === 'cancelled') {
    return currentStatus
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const due = new Date(dueDate)
  due.setHours(0, 0, 0, 0)

  if (due < today) {
    return 'overdue'
  }
  return 'pending'
}

/**
 * Format date for display
 */
export function formatFollowUpDate(dateStr: string): string {
  const date = new Date(dateStr)
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  today.setHours(0, 0, 0, 0)
  tomorrow.setHours(0, 0, 0, 0)
  date.setHours(0, 0, 0, 0)

  if (date.getTime() === today.getTime()) {
    return 'Hoy'
  }
  if (date.getTime() === tomorrow.getTime()) {
    return 'Mañana'
  }

  return date.toLocaleDateString('es-ES', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  })
}

/**
 * Get days until follow-up
 */
export function getDaysUntil(dateStr: string): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const date = new Date(dateStr)
  date.setHours(0, 0, 0, 0)

  const diffTime = date.getTime() - today.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

/**
 * Sort follow-ups by priority and date
 */
export function sortFollowUps(followUps: FollowUp[]): FollowUp[] {
  const priorityOrder = { high: 0, medium: 1, low: 2 }

  return [...followUps].sort((a, b) => {
    // Overdue first
    if (a.status === 'overdue' && b.status !== 'overdue') return -1
    if (b.status === 'overdue' && a.status !== 'overdue') return 1

    // Then by date
    const dateCompare = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
    if (dateCompare !== 0) return dateCompare

    // Then by priority
    return priorityOrder[a.priority] - priorityOrder[b.priority]
  })
}

/**
 * Filter follow-ups by status
 */
export function filterFollowUpsByStatus(
  followUps: FollowUp[],
  statuses: FollowUp['status'][]
): FollowUp[] {
  return followUps.filter(f => statuses.includes(f.status))
}

/**
 * Get follow-ups due within N days
 */
export function getUpcomingFollowUps(followUps: FollowUp[], days: number): FollowUp[] {
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() + days)
  cutoff.setHours(23, 59, 59, 999)

  return followUps.filter(f => {
    if (f.status === 'completed' || f.status === 'cancelled') return false
    const dueDate = new Date(f.dueDate)
    return dueDate <= cutoff
  })
}

/**
 * Convert follow-up to calendar event
 */
export function followUpToCalendarEvent(followUp: FollowUp): CalendarEvent {
  const startDate = new Date(followUp.dueDate)
  if (followUp.dueTime) {
    const [hours, minutes] = followUp.dueTime.split(':').map(Number)
    startDate.setHours(hours, minutes, 0, 0)
  } else {
    startDate.setHours(9, 0, 0, 0) // Default 9 AM
  }

  const endDate = new Date(startDate)
  endDate.setHours(endDate.getHours() + 1) // Default 1 hour duration

  return {
    id: followUp.id,
    title: followUp.title,
    description: `${followUp.companyName} - ${followUp.contactName}\n\n${followUp.description || ''}`,
    start: startDate,
    end: endDate,
    attendees: followUp.contactEmail ? [followUp.contactEmail] : undefined,
  }
}

/**
 * Generate iCal (.ics) content for a follow-up
 */
export function generateICalEvent(followUp: FollowUp): string {
  const event = followUpToCalendarEvent(followUp)

  const formatDate = (date: Date): string => {
    return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
  }

  const escapeText = (text: string): string => {
    return text
      .replace(/\\/g, '\\\\')
      .replace(/;/g, '\\;')
      .replace(/,/g, '\\,')
      .replace(/\n/g, '\\n')
  }

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//QualifyIQ//Follow-up Calendar//ES',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${event.id}@qualifyiq.com`,
    `DTSTAMP:${formatDate(new Date())}`,
    `DTSTART:${formatDate(event.start)}`,
    `DTEND:${formatDate(event.end)}`,
    `SUMMARY:${escapeText(event.title)}`,
    `DESCRIPTION:${escapeText(event.description)}`,
  ]

  if (event.attendees && event.attendees.length > 0) {
    event.attendees.forEach(email => {
      lines.push(`ATTENDEE:mailto:${email}`)
    })
  }

  // Add reminder
  if (followUp.reminderDays) {
    lines.push('BEGIN:VALARM')
    lines.push('ACTION:DISPLAY')
    lines.push(`DESCRIPTION:Reminder: ${escapeText(event.title)}`)
    lines.push(`TRIGGER:-P${followUp.reminderDays}D`)
    lines.push('END:VALARM')
  }

  lines.push('END:VEVENT')
  lines.push('END:VCALENDAR')

  return lines.join('\r\n')
}

/**
 * Download iCal file for a follow-up
 */
export function downloadICalEvent(followUp: FollowUp): void {
  const icalContent = generateICalEvent(followUp)
  const blob = new Blob([icalContent], { type: 'text/calendar;charset=utf-8' })

  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)

  const filename = `followup-${followUp.companyName.toLowerCase().replace(/\s+/g, '-')}-${followUp.dueDate}.ics`

  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  URL.revokeObjectURL(url)
}

/**
 * Generate Google Calendar URL
 */
export function generateGoogleCalendarUrl(followUp: FollowUp): string {
  const event = followUpToCalendarEvent(followUp)

  const formatDate = (date: Date): string => {
    return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z/, 'Z')
  }

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates: `${formatDate(event.start)}/${formatDate(event.end)}`,
    details: event.description,
  })

  if (event.attendees && event.attendees.length > 0) {
    params.set('add', event.attendees.join(','))
  }

  return `https://calendar.google.com/calendar/render?${params.toString()}`
}

/**
 * Generate Outlook Calendar URL
 */
export function generateOutlookCalendarUrl(followUp: FollowUp): string {
  const event = followUpToCalendarEvent(followUp)

  const params = new URLSearchParams({
    path: '/calendar/action/compose',
    rru: 'addevent',
    subject: event.title,
    body: event.description,
    startdt: event.start.toISOString(),
    enddt: event.end.toISOString(),
  })

  return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`
}

/**
 * Create a new follow-up
 */
export function createFollowUp(
  leadId: string,
  companyName: string,
  contactName: string,
  title: string,
  dueDate: string,
  options?: Partial<FollowUp>
): FollowUp {
  return {
    id: `followup-${Date.now()}`,
    leadId,
    companyName,
    contactName,
    title,
    dueDate,
    priority: 'medium',
    status: 'pending',
    reminderDays: 1,
    createdAt: new Date().toISOString(),
    ...options,
  }
}

/**
 * Get follow-up statistics
 */
export function getFollowUpStats(followUps: FollowUp[]): {
  total: number
  pending: number
  overdue: number
  completed: number
  dueToday: number
  dueThisWeek: number
} {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const weekEnd = new Date(today)
  weekEnd.setDate(weekEnd.getDate() + 7)

  let pending = 0
  let overdue = 0
  let completed = 0
  let dueToday = 0
  let dueThisWeek = 0

  followUps.forEach(f => {
    const status = getFollowUpStatus(f.dueDate, f.status)

    if (status === 'completed') completed++
    else if (status === 'overdue') overdue++
    else if (status === 'pending') pending++

    if (status !== 'completed' && status !== 'cancelled') {
      const dueDate = new Date(f.dueDate)
      dueDate.setHours(0, 0, 0, 0)

      if (dueDate.getTime() === today.getTime()) {
        dueToday++
      }
      if (dueDate <= weekEnd) {
        dueThisWeek++
      }
    }
  })

  return {
    total: followUps.length,
    pending,
    overdue,
    completed,
    dueToday,
    dueThisWeek,
  }
}

'use server'

import { z } from 'zod'
import { cookies } from 'next/headers'
import { DEMO_LEADS, DEMO_SCORECARDS, DEMO_COOKIE_NAME } from '@/lib/demo-mode'

// Server-side demo mode check
async function isDemoModeServer(): Promise<boolean> {
  try {
    const cookieStore = await cookies()
    return cookieStore.get(DEMO_COOKIE_NAME)?.value === 'true'
  } catch {
    return false
  }
}

// Validation schemas
const updateScorecardSchema = z.object({
  leadId: z.string().uuid(),
  scores: z.object({
    budget: z.number().min(1).max(5),
    authority: z.number().min(1).max(5),
    need: z.number().min(1).max(5),
    timeline: z.number().min(1).max(5),
    technicalFit: z.number().min(1).max(5),
  }),
  notes: z.object({
    budget: z.string().optional(),
    authority: z.string().optional(),
    need: z.string().optional(),
    timeline: z.string().optional(),
    technicalFit: z.string().optional(),
  }),
  redFlags: z.array(z.string()),
  redFlagNotes: z.string().optional(),
  totalScore: z.number().min(0).max(100),
  recommendation: z.enum(['go', 'review', 'no_go']),
})

const addNoteSchema = z.object({
  leadId: z.string().uuid(),
  content: z.string().min(1).max(5000),
  noteType: z.enum(['note', 'call', 'email', 'meeting', 'status_change', 'outcome']).default('note'),
})

const updateFollowUpSchema = z.object({
  leadId: z.string().uuid(),
  followUpDate: z.string().nullable(),
  followUpNotes: z.string().optional(),
})

// Get lead with scorecard
export async function getLead(leadId: string) {
  // Demo mode
  if (await isDemoModeServer()) {
    const lead = DEMO_LEADS.find(l => l.id === leadId)
    if (!lead) {
      return { success: false, error: 'Lead not found' }
    }
    const scorecard = DEMO_SCORECARDS.find(s => s.leadId === leadId)
    return {
      success: true,
      lead,
      scorecard: scorecard || null,
      notes: [] as { id: string; content: string; noteType: string; createdAt: string }[],
    }
  }

  // Real implementation would use Supabase
  return { success: false, error: 'Not implemented for real data yet' }
}

// Update scorecard
export async function updateScorecard(data: z.infer<typeof updateScorecardSchema>) {
  const result = updateScorecardSchema.safeParse(data)

  if (!result.success) {
    return { success: false, error: result.error.issues[0].message }
  }

  // Demo mode
  if (await isDemoModeServer()) {
    // In demo mode, we just return success (data won't persist)
    return {
      success: true,
      message: 'Scorecard updated (demo mode - changes not saved)',
    }
  }

  // Real implementation would use Supabase
  return { success: false, error: 'Not implemented for real data yet' }
}

// Add note to lead
export async function addLeadNote(data: z.infer<typeof addNoteSchema>) {
  const result = addNoteSchema.safeParse(data)

  if (!result.success) {
    return { success: false, error: result.error.issues[0].message }
  }

  // Demo mode
  if (await isDemoModeServer()) {
    return {
      success: true,
      note: {
        id: `demo-note-${Date.now()}`,
        leadId: result.data.leadId,
        content: result.data.content,
        noteType: result.data.noteType,
        createdAt: new Date().toISOString(),
      },
      message: 'Note added (demo mode - changes not saved)',
    }
  }

  // Real implementation would use Supabase
  return { success: false, error: 'Not implemented for real data yet' }
}

// Update follow-up date
export async function updateFollowUp(data: z.infer<typeof updateFollowUpSchema>) {
  const result = updateFollowUpSchema.safeParse(data)

  if (!result.success) {
    return { success: false, error: result.error.issues[0].message }
  }

  // Demo mode
  if (await isDemoModeServer()) {
    return {
      success: true,
      message: 'Follow-up updated (demo mode - changes not saved)',
    }
  }

  // Real implementation would use Supabase
  return { success: false, error: 'Not implemented for real data yet' }
}

// Get leads needing follow-up (for dashboard widget)
export async function getLeadsNeedingFollowUp() {
  // Demo mode
  if (await isDemoModeServer()) {
    const reviewLeads = DEMO_LEADS.filter(l => l.recommendation === 'review')
    return {
      success: true,
      leads: reviewLeads.map(l => ({
        ...l,
        urgency: 'upcoming' as const,
      })),
    }
  }

  // Real implementation would use Supabase
  return { success: true, leads: [] }
}

'use server'

import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// Validation schema for scorecard submission
const ScorecardSchema = z.object({
  leadInfo: z.object({
    companyName: z.string().min(1, 'Company name is required').max(200),
    contactName: z.string().min(1, 'Contact name is required').max(200),
    contactEmail: z.string().email('Invalid email address'),
    source: z.string().max(100).optional(),
  }),
  scores: z.object({
    budget: z.number().min(1).max(5),
    authority: z.number().min(1).max(5),
    need: z.number().min(1).max(5),
    timeline: z.number().min(1).max(5),
    technicalFit: z.number().min(1).max(5),
  }),
  notes: z.object({
    budget: z.string().max(2000).optional(),
    authority: z.string().max(2000).optional(),
    need: z.string().max(2000).optional(),
    timeline: z.string().max(2000).optional(),
    technicalFit: z.string().max(2000).optional(),
  }),
  redFlags: z.array(z.string().max(100)).max(20),
  redFlagNotes: z.string().max(2000).optional(),
  totalScore: z.number().min(0).max(100),
  recommendation: z.enum(['go', 'review', 'no_go']),
})

export type ScorecardInput = z.infer<typeof ScorecardSchema>

export type ActionResult =
  | { success: true; leadId: string; scorecardId: string }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> }

export async function saveScorecard(data: ScorecardInput): Promise<ActionResult> {
  // Validate input
  const parsed = ScorecardSchema.safeParse(data)

  if (!parsed.success) {
    return {
      success: false,
      error: 'Validation failed',
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    }
  }

  const { leadInfo, scores, notes, redFlags, redFlagNotes, totalScore, recommendation } = parsed.data

  try {
    const supabase = await createClient()

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return { success: false, error: 'Unauthorized - Please log in' }
    }

    // Get user's organization
    const { data: profile, error: profileError } = await supabase
      .from('qualifyiq_profiles')
      .select('organization_id')
      .eq('id', user.id)
      .single()

    if (profileError || !profile?.organization_id) {
      return { success: false, error: 'User organization not found' }
    }

    // Create lead first
    const { data: lead, error: leadError } = await supabase
      .from('qualifyiq_leads')
      .insert({
        organization_id: profile.organization_id,
        company_name: leadInfo.companyName,
        contact_name: leadInfo.contactName,
        contact_email: leadInfo.contactEmail,
        source: leadInfo.source || null,
        status: 'pending',
        created_by: user.id,
      })
      .select('id')
      .single()

    if (leadError || !lead) {
      return { success: false, error: `Failed to create lead: ${leadError?.message}` }
    }

    // Create scorecard
    const { data: scorecard, error: scorecardError } = await supabase
      .from('qualifyiq_scorecards')
      .insert({
        lead_id: lead.id,
        organization_id: profile.organization_id,
        created_by: user.id,
        budget_score: scores.budget,
        budget_notes: notes.budget || null,
        authority_score: scores.authority,
        authority_notes: notes.authority || null,
        need_score: scores.need,
        need_notes: notes.need || null,
        timeline_score: scores.timeline,
        timeline_notes: notes.timeline || null,
        technical_fit_score: scores.technicalFit,
        technical_fit_notes: notes.technicalFit || null,
        red_flags: redFlags,
        overall_notes: redFlagNotes || null,
        weighted_score: totalScore,
        recommendation,
      })
      .select('id')
      .single()

    if (scorecardError || !scorecard) {
      // Rollback lead if scorecard fails
      await supabase.from('qualifyiq_leads').delete().eq('id', lead.id)
      return { success: false, error: `Failed to create scorecard: ${scorecardError?.message}` }
    }

    // Update lead status based on recommendation
    const newStatus = recommendation === 'go' ? 'qualified' : recommendation === 'no_go' ? 'disqualified' : 'pending'
    await supabase
      .from('qualifyiq_leads')
      .update({ status: newStatus })
      .eq('id', lead.id)

    // Revalidate cache for leads page
    revalidatePath('/leads')
    revalidatePath('/dashboard')

    return { success: true, leadId: lead.id, scorecardId: scorecard.id }
  } catch (error) {
    // Never log sensitive data in production
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred'
    }
  }
}

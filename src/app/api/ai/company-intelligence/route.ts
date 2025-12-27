import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { analyzeCompany } from '@/lib/services/deepseek'
import { createClient } from '@/lib/supabase/server'
import { DEMO_COOKIE_NAME } from '@/lib/demo-mode'

// Request validation schema
const RequestSchema = z.object({
  companyName: z.string().min(1).max(200),
  industry: z.string().max(100).optional(),
  language: z.enum(['es', 'en']).optional(),
})

// Cache duration in milliseconds (7 days)
const CACHE_DURATION_MS = 7 * 24 * 60 * 60 * 1000

// Normalize company name for cache lookup
function normalizeCompanyName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, ' ')
}

// Check if request is in demo mode
function isDemoMode(request: NextRequest): boolean {
  const cookieHeader = request.headers.get('cookie') || ''
  return cookieHeader.includes(`${DEMO_COOKIE_NAME}=true`)
}

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json()
    const validation = RequestSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid request', details: validation.error.flatten() },
        { status: 400 }
      )
    }

    const { companyName, industry, language } = validation.data
    const normalizedName = normalizeCompanyName(companyName)
    const isDemo = isDemoMode(request)

    // Check authentication (skip for demo mode)
    if (!isDemo) {
      const supabase = await createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        return NextResponse.json(
          { success: false, error: 'Unauthorized' },
          { status: 401 }
        )
      }

      // Get user's organization
      const { data: profile } = await supabase
        .from('qualifyiq_profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single()

      if (!profile?.organization_id) {
        return NextResponse.json(
          { success: false, error: 'No organization found' },
          { status: 403 }
        )
      }

      // Check cache: look for recent analysis of the same company
      const cacheThreshold = new Date(Date.now() - CACHE_DURATION_MS).toISOString()

      const { data: cached } = await supabase
        .from('qualifyiq_leads')
        .select(`
          id,
          company_name,
          qualifyiq_scorecards (
            ai_company_analysis,
            ai_analysis_timestamp
          )
        `)
        .eq('organization_id', profile.organization_id)
        .ilike('company_name', `%${normalizedName}%`)
        .not('qualifyiq_scorecards.ai_company_analysis', 'is', null)
        .gte('qualifyiq_scorecards.ai_analysis_timestamp', cacheThreshold)
        .limit(1)
        .single()

      // Return cached result if available
      if (cached?.qualifyiq_scorecards?.[0]?.ai_company_analysis) {
        return NextResponse.json({
          success: true,
          data: cached.qualifyiq_scorecards[0].ai_company_analysis,
          cached: true,
          cachedAt: cached.qualifyiq_scorecards[0].ai_analysis_timestamp,
        })
      }
    }

    // Call DeepSeek API
    const result = await analyzeCompany(companyName, {
      industry,
      language: language || 'es',
    })

    if (result.error) {
      return NextResponse.json(
        { success: false, error: result.error.message, code: result.error.code },
        { status: result.error.code === 'RATE_LIMIT' ? 429 : 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: result.data,
      cached: false,
      tokensUsed: result.tokensUsed,
    })
  } catch (error) {
    console.error('Company Intelligence API Error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

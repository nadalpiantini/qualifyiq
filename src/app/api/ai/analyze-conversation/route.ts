import { NextRequest, NextResponse } from 'next/server';
import { callDeepSeek, safeJSONParse, AI_CONFIG } from '../_shared/deepseek-client';
import { checkRateLimit } from '../_shared/rate-limiter';
import { SYSTEM_PROMPTS, USER_PROMPTS } from '../_shared/prompts';
import { DEMO_COOKIE_NAME } from '@/lib/demo-mode';
import type {
  RedFlagAnalysisRequest,
  RedFlagAnalysisResponse,
  AIResponse
} from '@/types/ai.types';

function isDemoMode(request: NextRequest): boolean {
  const cookieHeader = request.headers.get('cookie') || '';
  return cookieHeader.includes(`${DEMO_COOKIE_NAME}=true`);
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    const isDemo = isDemoMode(request);
    const userId = request.headers.get('x-user-id') || (isDemo ? 'demo-user' : 'anonymous');

    const rateLimit = checkRateLimit(userId, 'free');
    if (!rateLimit.allowed) {
      return NextResponse.json<AIResponse<null>>({
        success: false,
        error: 'Límite de análisis alcanzado',
      }, { status: 429 });
    }

    const body: RedFlagAnalysisRequest = await request.json();

    if (!body.notes || body.notes.trim().length < 20) {
      return NextResponse.json<AIResponse<null>>({
        success: false,
        error: 'Las notas deben tener al menos 20 caracteres',
      }, { status: 400 });
    }

    const { content, usage } = await callDeepSeek(
      [
        { role: 'system', content: SYSTEM_PROMPTS.redFlagAnalyzer },
        {
          role: 'user',
          content: USER_PROMPTS.redFlagAnalysis(
            body.notes,
            body.currentRedFlags,
            body.leadContext
          )
        }
      ],
      {
        temperature: AI_CONFIG.temperatures.analysis,
        maxTokens: AI_CONFIG.maxTokens.redFlagAnalyzer,
      }
    );

    const defaultResponse: RedFlagAnalysisResponse = {
      redFlags: [],
      positiveSignals: [],
      overallRisk: 'low',
      riskScore: 0,
      recommendedAction: '',
      summary: '',
    };

    const aiData = safeJSONParse<RedFlagAnalysisResponse>(content, defaultResponse);

    return NextResponse.json<AIResponse<RedFlagAnalysisResponse>>({
      success: true,
      data: aiData,
      tokensUsed: usage?.total_tokens,
      processingTime: Date.now() - startTime,
    });

  } catch (error) {
    console.error('Red Flag Analyzer API Error:', error);

    return NextResponse.json<AIResponse<null>>({
      success: false,
      error: error instanceof Error ? error.message : 'Error al analizar conversación',
    }, { status: 500 });
  }
}

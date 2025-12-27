import { NextRequest, NextResponse } from 'next/server';
import { callDeepSeek, safeJSONParse, AI_CONFIG } from '../_shared/deepseek-client';
import { checkRateLimit } from '../_shared/rate-limiter';
import { SYSTEM_PROMPTS, USER_PROMPTS } from '../_shared/prompts';
import { DEMO_COOKIE_NAME } from '@/lib/demo-mode';
import type {
  DiscoveryQuestionsRequest,
  DiscoveryQuestionsResponse,
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

    const body: DiscoveryQuestionsRequest = await request.json();

    if (!body.companyName || !body.bantCategory) {
      return NextResponse.json<AIResponse<null>>({
        success: false,
        error: 'Empresa y categoría BANT son requeridos',
      }, { status: 400 });
    }

    const validCategories = ['budget', 'authority', 'need', 'timeline', 'technical'];
    if (!validCategories.includes(body.bantCategory)) {
      return NextResponse.json<AIResponse<null>>({
        success: false,
        error: 'Categoría BANT inválida',
      }, { status: 400 });
    }

    const { content, usage } = await callDeepSeek(
      [
        { role: 'system', content: SYSTEM_PROMPTS.discoveryQuestions },
        {
          role: 'user',
          content: USER_PROMPTS.discoveryQuestions(
            body.companyName,
            body.bantCategory,
            body.companySize,
            body.industry,
            body.currentScore,
            body.contextNotes
          )
        }
      ],
      {
        temperature: AI_CONFIG.temperatures.conversation,
        maxTokens: AI_CONFIG.maxTokens.discoveryQuestions,
      }
    );

    const defaultResponse: DiscoveryQuestionsResponse = {
      questions: [],
      proTip: '',
      categoryInsight: '',
    };

    const aiData = safeJSONParse<DiscoveryQuestionsResponse>(content, defaultResponse);

    return NextResponse.json<AIResponse<DiscoveryQuestionsResponse>>({
      success: true,
      data: aiData,
      tokensUsed: usage?.total_tokens,
      processingTime: Date.now() - startTime,
    });

  } catch (error) {
    console.error('Discovery Questions API Error:', error);

    return NextResponse.json<AIResponse<null>>({
      success: false,
      error: error instanceof Error ? error.message : 'Error al generar preguntas',
    }, { status: 500 });
  }
}

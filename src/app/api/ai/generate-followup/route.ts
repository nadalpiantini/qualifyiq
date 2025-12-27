import { NextRequest, NextResponse } from 'next/server';
import { callDeepSeek, safeJSONParse, AI_CONFIG } from '../_shared/deepseek-client';
import { checkRateLimit } from '../_shared/rate-limiter';
import { SYSTEM_PROMPTS, USER_PROMPTS } from '../_shared/prompts';
import { DEMO_COOKIE_NAME } from '@/lib/demo-mode';
import type {
  FollowupRequest,
  FollowupResponse,
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

    const body: FollowupRequest = await request.json();

    if (!body.lead?.company || !body.lead?.contact) {
      return NextResponse.json<AIResponse<null>>({
        success: false,
        error: 'Información del lead requerida',
      }, { status: 400 });
    }

    // Construir prompt con preferencias de tono
    const toneInstructions: Record<string, string> = {
      formal: 'Usa un tono profesional y corporativo. Evita contracciones y lenguaje casual.',
      casual: 'Usa un tono relajado pero profesional. Puedes usar contracciones.',
      friendly: 'Usa un tono cercano y amigable, como si hablaras con un colega.',
    };

    const goalInstructions: Record<string, string> = {
      demo: 'El objetivo es agendar una demostración del producto.',
      meeting: 'El objetivo es agendar una reunión de seguimiento.',
      info: 'El objetivo es compartir información adicional y mantener el contacto.',
      proposal: 'El objetivo es enviar o discutir una propuesta.',
      closing: 'El objetivo es avanzar hacia el cierre del deal.',
    };

    const enhancedSystemPrompt = `${SYSTEM_PROMPTS.followupGenerator}

TONO ESPECÍFICO: ${toneInstructions[body.preferences.tone] || toneInstructions.formal}
OBJETIVO ESPECÍFICO: ${goalInstructions[body.preferences.goal] || goalInstructions.meeting}`;

    const { content, usage } = await callDeepSeek(
      [
        { role: 'system', content: enhancedSystemPrompt },
        {
          role: 'user',
          content: USER_PROMPTS.followup(
            body.lead,
            body.scorecard,
            body.context,
            body.preferences
          )
        }
      ],
      {
        temperature: AI_CONFIG.temperatures.generation,
        maxTokens: AI_CONFIG.maxTokens.followupGenerator,
      }
    );

    const defaultResponse: FollowupResponse = {
      subject: '',
      body: '',
      callToAction: '',
      suggestedSendTime: '',
      alternativeSubjects: [],
      estimatedReadTime: '1 min',
    };

    const aiData = safeJSONParse<FollowupResponse>(content, defaultResponse);

    return NextResponse.json<AIResponse<FollowupResponse>>({
      success: true,
      data: aiData,
      tokensUsed: usage?.total_tokens,
      processingTime: Date.now() - startTime,
    });

  } catch (error) {
    console.error('Followup Generator API Error:', error);

    return NextResponse.json<AIResponse<null>>({
      success: false,
      error: error instanceof Error ? error.message : 'Error al generar follow-up',
    }, { status: 500 });
  }
}

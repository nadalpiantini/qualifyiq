import OpenAI from 'openai'

// DeepSeek client using OpenAI-compatible API
const client = new OpenAI({
  baseURL: 'https://api.deepseek.com',
  apiKey: process.env.DEEPSEEK_API_KEY,
})

// Types for AI responses
export interface CompanyIntelligence {
  companySize: 'startup' | 'pyme' | 'midmarket' | 'enterprise' | 'unknown'
  employeeEstimate: string
  industry: string[]
  revenueEstimate: string
  buyingSignals: string[]
  potentialRedFlags: string[]
  suggestedBANT: {
    budget: number | null
    authority: number | null
    need: number | null
    timeline: number | null
    technicalFit: number | null
  }
  discoveryQuestions: string[]
  confidence: number
}

export interface AIError {
  code: 'RATE_LIMIT' | 'INVALID_RESPONSE' | 'API_ERROR' | 'TIMEOUT'
  message: string
}

// Safely parse JSON from AI response
function safeParseJSON<T>(text: string): T | null {
  try {
    // Remove markdown code blocks if present
    const cleaned = text
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim()
    return JSON.parse(cleaned) as T
  } catch {
    console.error('Failed to parse AI response:', text)
    return null
  }
}

// Get system prompt based on language preference
function getCompanyIntelligencePrompt(lang: 'es' | 'en'): string {
  if (lang === 'es') {
    return `Eres un asistente de inteligencia de ventas B2B experto.
Tu trabajo es analizar empresas para ayudar a vendedores a calificar leads usando la metodología BANT.

IMPORTANTE: Responde SOLO en JSON válido con esta estructura exacta:
{
  "companySize": "startup|pyme|midmarket|enterprise|unknown",
  "employeeEstimate": "número aproximado o rango (ej: '50-100', '~500', '10,000+')",
  "industry": ["industria1", "industria2"],
  "revenueEstimate": "rango en USD (ej: '$1M-5M', '$100M+', 'Desconocido')",
  "buyingSignals": ["señal positiva 1", "señal positiva 2", "señal positiva 3"],
  "potentialRedFlags": ["posible red flag 1", "posible red flag 2"],
  "suggestedBANT": {
    "budget": null o 1-5 si puedes estimarlo,
    "authority": null (siempre requiere validación en discovery),
    "need": null o 1-5 basado en industry fit,
    "timeline": null (requiere discovery),
    "technicalFit": null o 1-5 si hay info técnica
  },
  "discoveryQuestions": ["pregunta clave 1", "pregunta clave 2", "pregunta clave 3"],
  "confidence": 0.0-1.0 (qué tan seguro estás de esta información)
}

REGLAS:
- Si no conoces la empresa, indica confidence bajo (0.1-0.3) y sugiere preguntas de discovery
- Los scores BANT son 1-5 donde 5 es mejor
- Sé conservador con los scores - es mejor subestimar que sobreestimar
- Las señales de compra deben ser específicas y accionables
- Las preguntas de discovery deben ayudar a validar/descubrir información faltante`
  }

  return `You are an expert B2B sales intelligence assistant.
Your job is to analyze companies to help salespeople qualify leads using the BANT methodology.

IMPORTANT: Respond ONLY in valid JSON with this exact structure:
{
  "companySize": "startup|pyme|midmarket|enterprise|unknown",
  "employeeEstimate": "approximate number or range (e.g., '50-100', '~500', '10,000+')",
  "industry": ["industry1", "industry2"],
  "revenueEstimate": "range in USD (e.g., '$1M-5M', '$100M+', 'Unknown')",
  "buyingSignals": ["positive signal 1", "positive signal 2", "positive signal 3"],
  "potentialRedFlags": ["potential red flag 1", "potential red flag 2"],
  "suggestedBANT": {
    "budget": null or 1-5 if you can estimate,
    "authority": null (always requires validation in discovery),
    "need": null or 1-5 based on industry fit,
    "timeline": null (requires discovery),
    "technicalFit": null or 1-5 if there's technical info
  },
  "discoveryQuestions": ["key question 1", "key question 2", "key question 3"],
  "confidence": 0.0-1.0 (how confident are you in this information)
}

RULES:
- If you don't know the company, indicate low confidence (0.1-0.3) and suggest discovery questions
- BANT scores are 1-5 where 5 is best
- Be conservative with scores - better to underestimate than overestimate
- Buying signals should be specific and actionable
- Discovery questions should help validate/discover missing information`
}

// Main function to analyze a company
export async function analyzeCompany(
  companyName: string,
  options?: {
    industry?: string
    language?: 'es' | 'en'
  }
): Promise<{ data: CompanyIntelligence | null; error: AIError | null; tokensUsed: number }> {
  const lang = options?.language || 'es'
  const systemPrompt = getCompanyIntelligencePrompt(lang)

  const userPrompt = lang === 'es'
    ? `Analiza esta empresa para calificación de lead B2B: "${companyName}"${options?.industry ? ` en la industria ${options.industry}` : ''}`
    : `Analyze this company for B2B lead qualification: "${companyName}"${options?.industry ? ` in the ${options.industry} industry` : ''}`

  try {
    const response = await client.chat.completions.create({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.3, // Low for consistent responses
      max_tokens: 1000,
    })

    const content = response.choices[0]?.message?.content
    if (!content) {
      return {
        data: null,
        error: { code: 'INVALID_RESPONSE', message: 'No response from AI' },
        tokensUsed: response.usage?.total_tokens || 0,
      }
    }

    const parsed = safeParseJSON<CompanyIntelligence>(content)
    if (!parsed) {
      return {
        data: null,
        error: { code: 'INVALID_RESPONSE', message: 'Failed to parse AI response' },
        tokensUsed: response.usage?.total_tokens || 0,
      }
    }

    return {
      data: parsed,
      error: null,
      tokensUsed: response.usage?.total_tokens || 0,
    }
  } catch (err) {
    const error = err as Error & { status?: number }

    if (error.status === 429) {
      return {
        data: null,
        error: { code: 'RATE_LIMIT', message: 'AI rate limit exceeded. Try again later.' },
        tokensUsed: 0,
      }
    }

    return {
      data: null,
      error: { code: 'API_ERROR', message: error.message || 'Unknown error' },
      tokensUsed: 0,
    }
  }
}

// Export types for use in other files
export type { CompanyIntelligence as CompanyIntelligenceResponse }

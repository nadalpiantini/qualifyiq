import OpenAI from 'openai';

// Singleton client para DeepSeek
let deepseekClient: OpenAI | null = null;

export function getDeepSeekClient(): OpenAI {
  if (!deepseekClient) {
    const apiKey = process.env.DEEPSEEK_API_KEY;

    if (!apiKey) {
      throw new Error('DEEPSEEK_API_KEY no está configurada en las variables de entorno');
    }

    deepseekClient = new OpenAI({
      baseURL: 'https://api.deepseek.com',
      apiKey: apiKey,
    });
  }

  return deepseekClient;
}

// Configuración de modelos
export const AI_CONFIG = {
  model: 'deepseek-chat',
  maxRetries: 2,
  timeout: 30000, // 30 segundos

  // Temperaturas por tipo de tarea
  temperatures: {
    analysis: 0.3,      // Bajo para análisis consistente
    generation: 0.7,    // Medio para contenido creativo
    conversation: 0.5,  // Balance para preguntas
  },

  // Límites de tokens por endpoint
  maxTokens: {
    companyIntelligence: 1200,
    discoveryQuestions: 800,
    followupGenerator: 700,
    redFlagAnalyzer: 1000,
  }
};

// Helper para parsear respuestas JSON de forma segura
export function safeJSONParse<T>(text: string, fallback: T): T {
  try {
    // Limpiar posibles markdown code blocks
    const cleaned = text
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    return JSON.parse(cleaned) as T;
  } catch (error) {
    console.error('Error parsing AI response:', error);
    console.error('Raw text:', text);
    return fallback;
  }
}

// Wrapper para llamadas con retry
export async function callDeepSeek(
  messages: OpenAI.Chat.ChatCompletionMessageParam[],
  options: {
    temperature?: number;
    maxTokens?: number;
    retries?: number;
  } = {}
): Promise<{ content: string; usage: OpenAI.Completions.CompletionUsage | undefined }> {
  const client = getDeepSeekClient();
  const { temperature = 0.5, maxTokens = 1000, retries = AI_CONFIG.maxRetries } = options;

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await client.chat.completions.create({
        model: AI_CONFIG.model,
        messages,
        temperature,
        max_tokens: maxTokens,
      });

      const content = response.choices[0]?.message?.content || '';

      return {
        content,
        usage: response.usage,
      };
    } catch (error) {
      lastError = error as Error;
      console.error(`DeepSeek API attempt ${attempt + 1} failed:`, error);

      if (attempt < retries) {
        // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }
  }

  throw lastError || new Error('DeepSeek API call failed after retries');
}

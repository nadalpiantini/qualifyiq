'use client';

import { useState, useCallback } from 'react';
import type {
  DiscoveryQuestionsRequest,
  DiscoveryQuestionsResponse,
  AIResponse,
  AIError
} from '@/types/ai.types';

interface UseDiscoveryQuestionsReturn {
  generate: (request: DiscoveryQuestionsRequest) => Promise<void>;
  data: DiscoveryQuestionsResponse | null;
  isLoading: boolean;
  error: AIError | null;
  reset: () => void;
}

export function useDiscoveryQuestions(): UseDiscoveryQuestionsReturn {
  const [data, setData] = useState<DiscoveryQuestionsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<AIError | null>(null);

  const generate = useCallback(async (request: DiscoveryQuestionsRequest) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ai/discovery-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      });

      const result: AIResponse<DiscoveryQuestionsResponse> = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Error al generar preguntas');
      }

      setData(result.data || null);
    } catch (err) {
      setError({
        code: 'API_ERROR',
        message: err instanceof Error ? err.message : 'Error desconocido',
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
  }, []);

  return { generate, data, isLoading, error, reset };
}

'use client';

import { useState, useCallback } from 'react';
import type {
  RedFlagAnalysisRequest,
  RedFlagAnalysisResponse,
  AIResponse,
  AIError
} from '@/types/ai.types';

interface UseRedFlagAnalyzerReturn {
  analyze: (request: RedFlagAnalysisRequest) => Promise<void>;
  data: RedFlagAnalysisResponse | null;
  isLoading: boolean;
  error: AIError | null;
  reset: () => void;
}

export function useRedFlagAnalyzer(): UseRedFlagAnalyzerReturn {
  const [data, setData] = useState<RedFlagAnalysisResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<AIError | null>(null);

  const analyze = useCallback(async (request: RedFlagAnalysisRequest) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ai/analyze-conversation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      });

      const result: AIResponse<RedFlagAnalysisResponse> = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Error al analizar conversación');
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

  return { analyze, data, isLoading, error, reset };
}

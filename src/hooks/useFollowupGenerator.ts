'use client';

import { useState, useCallback } from 'react';
import type {
  FollowupRequest,
  FollowupResponse,
  AIResponse,
  AIError
} from '@/types/ai.types';

interface UseFollowupGeneratorReturn {
  generate: (request: FollowupRequest) => Promise<void>;
  data: FollowupResponse | null;
  isLoading: boolean;
  error: AIError | null;
  reset: () => void;
  regenerate: () => Promise<void>;
}

export function useFollowupGenerator(): UseFollowupGeneratorReturn {
  const [data, setData] = useState<FollowupResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<AIError | null>(null);
  const [lastRequest, setLastRequest] = useState<FollowupRequest | null>(null);

  const generate = useCallback(async (request: FollowupRequest) => {
    setIsLoading(true);
    setError(null);
    setLastRequest(request);

    try {
      const response = await fetch('/api/ai/generate-followup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      });

      const result: AIResponse<FollowupResponse> = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Error al generar follow-up');
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

  const regenerate = useCallback(async () => {
    if (lastRequest) {
      await generate(lastRequest);
    }
  }, [lastRequest, generate]);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLastRequest(null);
  }, []);

  return { generate, data, isLoading, error, reset, regenerate };
}

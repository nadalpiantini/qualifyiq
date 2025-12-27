'use client';

import { useState, useCallback } from 'react';
import type {
  CompanyIntelligenceRequest,
  CompanyIntelligenceResponse,
  AIResponse,
  AIError
} from '@/types/ai.types';

interface UseCompanyIntelligenceReturn {
  analyze: (request: CompanyIntelligenceRequest) => Promise<void>;
  data: CompanyIntelligenceResponse | null;
  isLoading: boolean;
  error: AIError | null;
  reset: () => void;
}

export function useCompanyIntelligence(): UseCompanyIntelligenceReturn {
  const [data, setData] = useState<CompanyIntelligenceResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<AIError | null>(null);

  const analyze = useCallback(async (request: CompanyIntelligenceRequest) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ai/company-intelligence', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      const result: AIResponse<CompanyIntelligenceResponse> = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Error al analizar empresa');
      }

      setData(result.data || null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError({
        code: 'API_ERROR',
        message: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setIsLoading(false);
  }, []);

  return { analyze, data, isLoading, error, reset };
}

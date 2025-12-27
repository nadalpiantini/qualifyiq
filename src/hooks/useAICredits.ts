'use client';

import { useState, useEffect, useCallback } from 'react';
import type { AIUsage } from '@/types/ai.types';

interface UseAICreditsReturn {
  credits: AIUsage | null;
  isLoading: boolean;
  refresh: () => Promise<void>;
  hasCredits: boolean;
}

// Simulación local de créditos (en producción vendría del backend)
const LOCAL_STORAGE_KEY = 'qualifyiq_ai_credits';

const getDefaultCredits = (): AIUsage => {
  const resetDate = new Date();
  resetDate.setDate(resetDate.getDate() + 1);
  resetDate.setHours(0, 0, 0, 0);

  return {
    creditsUsed: 0,
    creditsRemaining: 10, // Free tier: 10 créditos/día
    resetDate: resetDate.toISOString(),
  };
};

export function useAICredits(): UseAICreditsReturn {
  const [credits, setCredits] = useState<AIUsage | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadCredits = useCallback(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as AIUsage;
        const resetDate = new Date(parsed.resetDate);

        // Si ya pasó la fecha de reset, reiniciar créditos
        if (resetDate < new Date()) {
          const newCredits = getDefaultCredits();
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newCredits));
          setCredits(newCredits);
        } else {
          setCredits(parsed);
        }
      } else {
        const newCredits = getDefaultCredits();
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newCredits));
        setCredits(newCredits);
      }
    } catch {
      setCredits(getDefaultCredits());
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadCredits();
  }, [loadCredits]);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    loadCredits();
  }, [loadCredits]);

  return {
    credits,
    isLoading,
    refresh,
    hasCredits: credits ? credits.creditsRemaining > 0 : false,
  };
}

// Función para decrementar créditos (llamar después de cada uso de IA)
export function decrementAICredits(): void {
  try {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (stored) {
      const credits = JSON.parse(stored) as AIUsage;
      credits.creditsUsed++;
      credits.creditsRemaining = Math.max(0, credits.creditsRemaining - 1);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(credits));
    }
  } catch (error) {
    console.error('Error decrementing AI credits:', error);
  }
}

'use client';

import { useState, useCallback, useSyncExternalStore } from 'react';
import type { AIUsage } from '@/types/ai.types';

interface UseAICreditsReturn {
  credits: AIUsage | null;
  isLoading: boolean;
  refresh: () => void;
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

// Store for external sync
let listeners: Array<() => void> = [];
let cachedCredits: AIUsage | null = null;

function subscribe(listener: () => void) {
  listeners = [...listeners, listener];
  return () => {
    listeners = listeners.filter(l => l !== listener);
  };
}

function getSnapshot(): AIUsage | null {
  return cachedCredits;
}

function getServerSnapshot(): AIUsage | null {
  return null;
}

function loadCreditsFromStorage(): AIUsage {
  if (typeof window === 'undefined') {
    return getDefaultCredits();
  }

  try {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as AIUsage;
      const resetDate = new Date(parsed.resetDate);

      // Si ya pasó la fecha de reset, reiniciar créditos
      if (resetDate < new Date()) {
        const newCredits = getDefaultCredits();
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newCredits));
        return newCredits;
      }
      return parsed;
    }
  } catch {
    // Ignore errors
  }

  const newCredits = getDefaultCredits();
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newCredits));
  return newCredits;
}

// Initialize on client side
if (typeof window !== 'undefined') {
  cachedCredits = loadCreditsFromStorage();
}

function notifyListeners() {
  for (const listener of listeners) {
    listener();
  }
}

export function useAICredits(): UseAICreditsReturn {
  const [isLoading, setIsLoading] = useState(false);

  const credits = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );

  const refresh = useCallback(() => {
    setIsLoading(true);
    cachedCredits = loadCreditsFromStorage();
    notifyListeners();
    setIsLoading(false);
  }, []);

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
      cachedCredits = credits;
      notifyListeners();
    }
  } catch (error) {
    console.error('Error decrementing AI credits:', error);
  }
}

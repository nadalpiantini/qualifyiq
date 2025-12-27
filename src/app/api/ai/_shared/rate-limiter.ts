// Rate limiter simple en memoria (para producción usar Redis)
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number; // en milisegundos
}

export const RATE_LIMITS: Record<string, RateLimitConfig> = {
  free: { maxRequests: 10, windowMs: 24 * 60 * 60 * 1000 },      // 10/día
  pro: { maxRequests: 100, windowMs: 24 * 60 * 60 * 1000 },      // 100/día
  team: { maxRequests: 500, windowMs: 24 * 60 * 60 * 1000 },     // 500/día
  enterprise: { maxRequests: 10000, windowMs: 24 * 60 * 60 * 1000 }, // Prácticamente ilimitado
};

export function checkRateLimit(
  userId: string,
  tier: keyof typeof RATE_LIMITS = 'free'
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const config = RATE_LIMITS[tier];
  const key = `${userId}:ai`;

  let record = rateLimitStore.get(key);

  // Resetear si la ventana expiró
  if (!record || record.resetAt < now) {
    record = {
      count: 0,
      resetAt: now + config.windowMs,
    };
  }

  const allowed = record.count < config.maxRequests;

  if (allowed) {
    record.count++;
    rateLimitStore.set(key, record);
  }

  return {
    allowed,
    remaining: Math.max(0, config.maxRequests - record.count),
    resetAt: record.resetAt,
  };
}

export function getRemainingCredits(
  userId: string,
  tier: keyof typeof RATE_LIMITS = 'free'
): { used: number; remaining: number; total: number; resetAt: number } {
  const now = Date.now();
  const config = RATE_LIMITS[tier];
  const key = `${userId}:ai`;

  const record = rateLimitStore.get(key);

  if (!record || record.resetAt < now) {
    return {
      used: 0,
      remaining: config.maxRequests,
      total: config.maxRequests,
      resetAt: now + config.windowMs,
    };
  }

  return {
    used: record.count,
    remaining: Math.max(0, config.maxRequests - record.count),
    total: config.maxRequests,
    resetAt: record.resetAt,
  };
}

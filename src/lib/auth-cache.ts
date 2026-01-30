import type { Agent } from "@/types";

interface CacheEntry {
  agent: Agent;
  expiresAt: number;
}

const TTL_MS = 60 * 60 * 1000; // 1 hour
const MAX_ENTRIES = 1000;

const cache = new Map<string, CacheEntry>();

export function getCachedAgent(apiKeyHash: string): Agent | null {
  const entry = cache.get(apiKeyHash);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    cache.delete(apiKeyHash);
    return null;
  }
  return entry.agent;
}

export function setCachedAgent(apiKeyHash: string, agent: Agent): void {
  if (cache.size >= MAX_ENTRIES) {
    const firstKey = cache.keys().next().value;
    if (firstKey) cache.delete(firstKey);
  }
  cache.set(apiKeyHash, { agent, expiresAt: Date.now() + TTL_MS });
}

export function invalidateCachedAgent(apiKeyHash: string): void {
  cache.delete(apiKeyHash);
}

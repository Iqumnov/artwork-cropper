/**
 * ARTEI Priority Storage & Quota Management System
 * 
 * Manages browser localStorage and IndexedDB with strict tier-based priority.
 * Guarantees that critical account credentials, tokens, and webhooks (Tier 1)
 * are never evicted and never blocked by volatile history or image caches.
 */

export enum StorageTier {
  TIER_1_CRITICAL = 1, // Social credentials, Bot Tokens, Google Drive scripts, Webhook URLs
  TIER_2_USER_ASSETS = 2, // Custom Lightroom presets, color recipes
  TIER_3_VOLATILE = 3, // History fallbacks, active session caches, temporary UI states
}

// Registry of known storage keys and their assigned priority tiers
const KEY_TIERS: Record<string, StorageTier> = {
  artei_social_automations: StorageTier.TIER_1_CRITICAL,
  artei_custom_presets: StorageTier.TIER_2_USER_ASSETS,
  artei_artwork_history: StorageTier.TIER_3_VOLATILE,
  artei_active_session: StorageTier.TIER_3_VOLATILE,
}

// Low-priority volatile keys that can be safely evicted when storage quota is pressured
const VOLATILE_PURGE_ORDER = [
  'artei_active_session',
  'artei_artwork_history',
]

/**
 * Requests Persistent Storage from the browser engine.
 * When granted, the browser promises NEVER to automatically evict the origin's
 * data under device storage pressure.
 */
export async function requestPersistentStorage(): Promise<boolean> {
  if (typeof navigator === 'undefined' || !navigator.storage || !navigator.storage.persist) {
    return false
  }

  try {
    const isPersisted = await navigator.storage.persisted()
    if (isPersisted) return true

    const granted = await navigator.storage.persist()
    if (granted) {
      console.log('[StorageManager] Persistent storage granted by browser engine.')
    }
    return granted
  } catch (e) {
    console.warn('[StorageManager] Could not request persistent storage:', e)
    return false
  }
}

/**
 * Checks current storage quota usage (if supported by browser)
 */
export async function getStorageQuotaEstimate(): Promise<{ usage: number; quota: number; percent: number } | null> {
  if (typeof navigator === 'undefined' || !navigator.storage || !navigator.storage.estimate) {
    return null
  }

  try {
    const estimate = await navigator.storage.estimate()
    const usage = estimate.usage || 0
    const quota = estimate.quota || 0
    const percent = quota > 0 ? (usage / quota) * 100 : 0
    return { usage, quota, percent }
  } catch {
    return null
  }
}

/**
 * Evicts volatile data (session fallbacks, history fallbacks) to free up space
 * for higher-priority operations.
 */
function evictVolatileKeys(): void {
  if (typeof window === 'undefined' || !window.localStorage) return

  for (const key of VOLATILE_PURGE_ORDER) {
    try {
      if (localStorage.getItem(key)) {
        console.warn(`[StorageManager] Evicting volatile key "${key}" to preserve critical configurations.`)
        localStorage.removeItem(key)
      }
    } catch {}
  }
}

/**
 * Safe wrapper for localStorage.setItem with automatic Priority Quota Management.
 * If QuotaExceededError is thrown, it evicts lower-priority volatile data and retries.
 */
export function safeSetItem(
  key: string,
  value: string,
  tier: StorageTier = KEY_TIERS[key] || StorageTier.TIER_3_VOLATILE
): boolean {
  if (typeof window === 'undefined' || !window.localStorage) return false

  try {
    localStorage.setItem(key, value)
    return true
  } catch (error: any) {
    const isQuota =
      error?.name === 'QuotaExceededError' ||
      error?.name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
      error?.code === 22 ||
      error?.code === 1014

    if (isQuota) {
      console.warn(`[StorageManager] Quota exceeded while saving "${key}" (Tier ${tier}). Attempting smart eviction...`)

      // If this is Tier 1 or Tier 2, we have the right to evict Tier 3 volatile keys
      if (tier <= StorageTier.TIER_2_USER_ASSETS) {
        evictVolatileKeys()

        try {
          // Retry write after volatile eviction
          localStorage.setItem(key, value)
          console.log(`[StorageManager] Successfully saved "${key}" after volatile eviction.`)
          return true
        } catch (retryError) {
          console.error(`[StorageManager] Critical write failed even after volatile eviction:`, retryError)
          return false
        }
      } else {
        // Lower-tier writes fail gracefully without crashing
        console.warn(`[StorageManager] Dropping volatile write for "${key}" to prevent starving critical keys.`)
        return false
      }
    }

    console.error(`[StorageManager] Unexpected error setting key "${key}":`, error)
    return false
  }
}

/**
 * Safe wrapper for localStorage.getItem
 */
export function safeGetItem(key: string): string | null {
  if (typeof window === 'undefined' || !window.localStorage) return null
  try {
    return localStorage.getItem(key)
  } catch (e) {
    console.warn(`[StorageManager] Error reading key "${key}":`, e)
    return null
  }
}

/**
 * Safe wrapper for localStorage.removeItem
 */
export function safeRemoveItem(key: string): void {
  if (typeof window === 'undefined' || !window.localStorage) return
  try {
    localStorage.removeItem(key)
  } catch {}
}

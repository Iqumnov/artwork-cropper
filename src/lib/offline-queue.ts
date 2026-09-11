/**
 * Offline Social Post Queue (IndexedDB)
 * 
 * Securely stores pending social media posts when the user is offline or experiencing network drops.
 * Automatically monitors network connectivity and dispatches queued posts when the connection is restored.
 */

import { ArtworkInfo } from '../types'
import { SocialConfig, executeSocialPublish } from './social-automation'

export interface QueuedOfflinePost {
  id: string
  timestamp: number
  info: ArtworkInfo
  mainDataUrl: string
  detail1DataUrl?: string
  detail2DataUrl?: string
  config: SocialConfig
}

const DB_NAME = 'artei_offline_db'
const DB_VERSION = 1
const STORE_NAME = 'pending_posts'

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)
    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' })
      }
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

/**
 * Saves a post to the offline queue
 */
export async function queueOfflinePost(post: QueuedOfflinePost): Promise<void> {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    const store = tx.objectStore(STORE_NAME)
    const req = store.put(post)
    req.onsuccess = () => resolve()
    req.onerror = () => reject(req.error)
  })
}

/**
 * Retrieves all pending offline posts
 */
export async function getPendingOfflinePosts(): Promise<QueuedOfflinePost[]> {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly')
    const store = tx.objectStore(STORE_NAME)
    const req = store.getAll()
    req.onsuccess = () => resolve(req.result || [])
    req.onerror = () => reject(req.error)
  })
}

/**
 * Removes a post from the offline queue after successful publish
 */
export async function removeOfflinePost(id: string): Promise<void> {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    const store = tx.objectStore(STORE_NAME)
    const req = store.delete(id)
    req.onsuccess = () => resolve()
    req.onerror = () => reject(req.error)
  })
}

/**
 * Helper to convert dataURL to Blob
 */
async function dataUrlToBlob(dataUrl: string): Promise<Blob> {
  const res = await fetch(dataUrl)
  return await res.blob()
}

/**
 * Process all pending offline posts once network is restored
 */
export async function processOfflineQueue(): Promise<{
  processed: number
  successes: number
  errors: string[]
}> {
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return { processed: 0, successes: 0, errors: ['Устройство всё ещё оффлайн'] }
  }

  const posts = await getPendingOfflinePosts()
  if (posts.length === 0) {
    return { processed: 0, successes: 0, errors: [] }
  }

  let successes = 0
  const errors: string[] = []

  for (const post of posts) {
    try {
      const mainBlob = await dataUrlToBlob(post.mainDataUrl)
      const detail1Blob = post.detail1DataUrl ? await dataUrlToBlob(post.detail1DataUrl) : undefined
      const detail2Blob = post.detail2DataUrl ? await dataUrlToBlob(post.detail2DataUrl) : undefined

      const res = await executeSocialPublish(
        post.config,
        mainBlob,
        detail1Blob,
        detail2Blob,
        post.info
      )

      if (res.success) {
        successes++
        await removeOfflinePost(post.id)
      } else {
        errors.push(...res.messages)
      }
    } catch (e: any) {
      errors.push(e.message || 'Ошибка обработки отложенной публикации')
    }
  }

  return { processed: posts.length, successes, errors }
}

/**
 * Global background listener: automatically publishes queued posts when device connects to internet
 */
let isListenerInitialized = false
export function initOfflineQueueListener(onQueueProcessed?: (count: number) => void): void {
  if (isListenerInitialized || typeof window === 'undefined') return
  isListenerInitialized = true

  window.addEventListener('online', async () => {
    const result = await processOfflineQueue()
    if (result.successes > 0 && onQueueProcessed) {
      onQueueProcessed(result.successes)
    }
  })
}

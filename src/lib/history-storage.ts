import { LightroomAdjustments } from '../types'

export interface HistoryArtwork {
  id: string
  title: string
  dataUrl: string
  originalUrl?: string
  adjustments?: LightroomAdjustments
  timestamp: number
  width: number
  height: number
}

const DB_NAME = 'artei_studio_db'
const DB_VERSION = 1
const STORE_NAME = 'artwork_history'

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported'))
      return
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' })
      }
    }

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

export async function saveArtworkToHistory(artwork: HistoryArtwork): Promise<void> {
  try {
    const db = await openDB()
    const tx = db.transaction(STORE_NAME, 'readwrite')
    const store = tx.objectStore(STORE_NAME)
    store.put(artwork)
    await new Promise<void>((res, rej) => {
      tx.oncomplete = () => res()
      tx.onerror = () => rej(tx.error)
    })
  } catch (e) {
    console.warn('IndexedDB save failed, attempting localStorage fallback:', e)
    try {
      const raw = localStorage.getItem('artei_artwork_history') || '[]'
      const list: HistoryArtwork[] = JSON.parse(raw)
      const filtered = list.filter(item => item.id !== artwork.id)
      filtered.unshift(artwork)
      localStorage.setItem('artei_artwork_history', JSON.stringify(filtered.slice(0, 10)))
    } catch {}
  }
}

export async function getArtworkHistory(): Promise<HistoryArtwork[]> {
  try {
    const db = await openDB()
    const tx = db.transaction(STORE_NAME, 'readonly')
    const store = tx.objectStore(STORE_NAME)
    const request = store.getAll()
    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        const results = (request.result as HistoryArtwork[]) || []
        // Sort newest first
        results.sort((a, b) => b.timestamp - a.timestamp)
        resolve(results)
      }
      request.onerror = () => reject(request.error)
    })
  } catch (e) {
    try {
      const raw = localStorage.getItem('artei_artwork_history') || '[]'
      return JSON.parse(raw)
    } catch {
      return []
    }
  }
}

export async function deleteArtworkFromHistory(id: string): Promise<void> {
  try {
    const db = await openDB()
    const tx = db.transaction(STORE_NAME, 'readwrite')
    const store = tx.objectStore(STORE_NAME)
    store.delete(id)
    await new Promise<void>((res, rej) => {
      tx.oncomplete = () => res()
      tx.onerror = () => rej(tx.error)
    })
  } catch (e) {
    try {
      const raw = localStorage.getItem('artei_artwork_history') || '[]'
      const list: HistoryArtwork[] = JSON.parse(raw)
      localStorage.setItem('artei_artwork_history', JSON.stringify(list.filter(i => i.id !== id)))
    } catch {}
  }
}

export async function clearArtworkHistory(): Promise<void> {
  try {
    const db = await openDB()
    const tx = db.transaction(STORE_NAME, 'readwrite')
    const store = tx.objectStore(STORE_NAME)
    store.clear()
    await new Promise<void>((res, rej) => {
      tx.oncomplete = () => res()
      tx.onerror = () => rej(tx.error)
    })
  } catch (e) {
    localStorage.removeItem('artei_artwork_history')
  }
}

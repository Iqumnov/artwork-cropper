/**
 * Multi-Platform Social Media Automation System
 * 
 * Handles configuration storage in localStorage, platform-specific formatting,
 * direct browser Telegram Bot dispatching, and Webhook relay for Instagram,
 * TikTok, Pinterest, Facebook, Threads, X, and YouTube.
 */

import { ArtworkInfo } from '../types'
import { safeSetItem, safeGetItem, StorageTier } from './storage-priority'

export interface SocialConfig {
  websiteUrl: string
  telegram: {
    enabled: boolean
    botToken: string
    channelId: string // e.g. @ourdynastyart or -100xxxxxxxxxx
    separateDetailsPost: boolean // Post details in separate preceding post without text
  }
  webhook: {
    enabled: boolean
    webhookUrl: string // Make.com, Zapier, Cloudflare Worker, or custom relay
  }
  platforms: {
    instagram: boolean
    pinterest: boolean
    facebook: boolean
    threads: boolean
    x: boolean
    tiktok: boolean
    youtube: boolean
  }
  googleDrive: {
    enabled: boolean
    folderId: string // Folder ID or full URL on Google Drive
    scriptUrl: string // Google Apps Script Web App URL (Direct, 0 Make resources)
    customWebhookUrl?: string // Optional fallback webhook URL
  }
}

const STORAGE_KEY = 'artei_social_automations'

export const DEFAULT_SOCIAL_CONFIG: SocialConfig = {
  websiteUrl: 'https://ourdynasty.art',
  telegram: {
    enabled: false,
    botToken: '',
    channelId: '',
    separateDetailsPost: true,
  },
  webhook: {
    enabled: false,
    webhookUrl: '',
  },
  platforms: {
    instagram: false,
    pinterest: false,
    facebook: false,
    threads: false,
    x: false,
    tiktok: false,
    youtube: false,
  },
  googleDrive: {
    enabled: false,
    folderId: '',
    scriptUrl: '',
    customWebhookUrl: '',
  },
}

export function loadSocialConfig(): SocialConfig {
  try {
    const raw = safeGetItem(STORAGE_KEY)
    if (!raw) return DEFAULT_SOCIAL_CONFIG
    const parsed = JSON.parse(raw)
    return {
      ...DEFAULT_SOCIAL_CONFIG,
      ...parsed,
      telegram: { ...DEFAULT_SOCIAL_CONFIG.telegram, ...parsed.telegram },
      webhook: { ...DEFAULT_SOCIAL_CONFIG.webhook, ...parsed.webhook },
      platforms: { ...DEFAULT_SOCIAL_CONFIG.platforms, ...parsed.platforms },
      googleDrive: { ...DEFAULT_SOCIAL_CONFIG.googleDrive, ...parsed.googleDrive },
    }
  } catch {
    return DEFAULT_SOCIAL_CONFIG
  }
}

export function saveSocialConfig(config: SocialConfig): void {
  try {
    // Saved at Tier 1 (CRITICAL) — never evicted, automatically evicts volatile caches if quota is pressured
    safeSetItem(STORAGE_KEY, JSON.stringify(config), StorageTier.TIER_1_CRITICAL)
  } catch (e) {
    console.error('Failed to save social config to storage:', e)
  }
}

export function extractGoogleDriveFolderId(input: string): string {
  if (!input) return ''
  const trimmed = input.trim()
  const match = trimmed.match(/folders\/([a-zA-Z0-9_-]+)/)
  if (match) return match[1]
  return trimmed
}

export function isGoogleDriveConnected(config: SocialConfig): boolean {
  if (!config.googleDrive || !config.googleDrive.enabled) return false
  const hasFolder = Boolean(config.googleDrive.folderId?.trim())
  const hasEndpoint = Boolean(
    config.googleDrive.scriptUrl?.trim() ||
    config.googleDrive.customWebhookUrl?.trim() ||
    config.webhook?.webhookUrl?.trim()
  )
  return hasFolder && hasEndpoint
}

export function isAnySocialConnected(config: SocialConfig): boolean {
  if (config.telegram.enabled && config.telegram.botToken.trim() && config.telegram.channelId.trim()) {
    return true
  }
  if (config.webhook.enabled && config.webhook.webhookUrl.trim()) {
    return Object.values(config.platforms).some(Boolean)
  }
  return false
}

export function getConnectedPlatformsCount(config: SocialConfig): number {
  let count = 0
  if (config.telegram.enabled && config.telegram.botToken.trim() && config.telegram.channelId.trim()) {
    count++
  }
  if (config.webhook.enabled && config.webhook.webhookUrl.trim()) {
    count += Object.values(config.platforms).filter(Boolean).length
  }
  if (isGoogleDriveConnected(config)) {
    count++
  }
  return count
}

/**
 * Normalizes website URL, automatically ensuring https:// scheme if omitted
 */
export function normalizeWebsiteUrl(rawUrl: string): string {
  if (!rawUrl) return ''
  const trimmed = rawUrl.trim()
  if (!trimmed) return ''
  if (!/^https?:\/\//i.test(trimmed)) {
    return `https://${trimmed}`
  }
  return trimmed
}

/**
 * Determines with 100% certainty whether a platform requires 'https://'
 * for a link to function as a working, clickable link.
 * 
 * Verified technical specifications:
 * - Pinterest (API destination link): REQUIRES https:// (API strictly validates URL scheme, rejects without https://).
 * - YouTube (Community Post): REQUIRES https:// (parser only converts text starting with https:// into clickable links).
 * - Telegram (HTML mode): REQUIRES https:// (<a href="..."> requires valid scheme).
 * - Facebook / Threads: REQUIRES https:// (for OpenGraph previews & clickability).
 * 
 * Platforms that do NOT need https://:
 * - Instagram (Captions): DOES NOT NEED https:// (links are 100% non-clickable anyway; adding https:// makes caption cluttered and ugly).
 * - TikTok (Descriptions): DOES NOT NEED https:// (non-clickable; http(s) triggers anti-spam link filters).
 * - X / Twitter: DOES NOT NEED https:// (t.co engine automatically hyperlinks bare domains like ourdynasty.art).
 */
export function doesPlatformRequireHttps(platform: string): boolean {
  const p = platform.toLowerCase().trim()
  switch (p) {
    case 'pinterest':
    case 'youtube':
    case 'telegram':
    case 'facebook':
    case 'threads':
      return true
    case 'instagram':
    case 'tiktok':
    case 'x':
    case 'twitter':
      return false
    default:
      return false
  }
}

/**
 * Returns clean domain (e.g. "ourdynasty.art") by stripping protocol and trailing slash
 */
export function getCleanDomainUrl(rawUrl: string): string {
  if (!rawUrl) return ''
  return rawUrl.trim().replace(/^https?:\/\//i, '').replace(/\/+$/, '')
}

/**
 * Formats website link specifically tailored for a platform.
 * Only adds 'https://' if the platform actually requires it to be a real, functional link.
 * Otherwise returns the clean domain without 'https://'.
 */
export function formatLinkForPlatform(rawUrl: string, platform: string): string {
  if (!rawUrl || !rawUrl.trim()) return ''
  const trimmed = rawUrl.trim()
  if (doesPlatformRequireHttps(platform)) {
    return normalizeWebsiteUrl(trimmed)
  }
  return getCleanDomainUrl(trimmed)
}

/**
 * Formats a caption for a specific platform, intelligently adapting the link format:
 * - Omits empty metadata fields (and orphan middots)
 * - Adds 'https://' only if the platform requires it, otherwise keeps clean domain
 */
export function formatCaptionForPlatform(info: ArtworkInfo, rawWebsiteUrl: string, platform: string): string {
  const parts: string[] = []

  // Row 1: Artist (only if present)
  if (info.artist && info.artist.trim()) {
    parts.push(info.artist.trim())
  }

  // Row 2: Artwork Title (only if present)
  if (info.title && info.title.trim()) {
    parts.push(`«${info.title.trim()}»`)
  }

  // Row 3: Year · Medium · Dimensions (strict middot filter)
  const detailItems: string[] = []
  if (info.year && info.year.trim()) detailItems.push(info.year.trim())
  if (info.medium && info.medium.trim()) detailItems.push(info.medium.trim())
  if (info.dimensions && info.dimensions.trim()) detailItems.push(info.dimensions.trim())
  if (detailItems.length > 0) {
    parts.push(detailItems.join(' · '))
  }

  // Row 4: Link (platform-specific: with https:// only if required)
  const formattedLink = formatLinkForPlatform(rawWebsiteUrl, platform)
  if (formattedLink) {
    parts.push(formattedLink)
  }

  return parts.join('\n')
}

/**
 * Format 4-row compact caption for standard feeds (Instagram, TikTok, FB, Pinterest, Threads, X)
 * Strictly omits any unfilled metadata and eliminates orphan middots.
 * Kept concise to prevent being folded under "Read more" / "...more".
 */
export function formatStandardCaption(info: ArtworkInfo, websiteUrl: string): string {
  const parts: string[] = []

  // Row 1: Artist (only if present)
  if (info.artist && info.artist.trim()) {
    parts.push(info.artist.trim())
  }

  // Row 2: Artwork Title (only if present)
  if (info.title && info.title.trim()) {
    parts.push(`«${info.title.trim()}»`)
  }

  // Row 3: Year · Medium · Dimensions (strict middot filter)
  const detailItems: string[] = []
  if (info.year && info.year.trim()) detailItems.push(info.year.trim())
  if (info.medium && info.medium.trim()) detailItems.push(info.medium.trim())
  if (info.dimensions && info.dimensions.trim()) detailItems.push(info.dimensions.trim())

  if (detailItems.length > 0) {
    parts.push(detailItems.join(' · '))
  }

  // Row 4: Website URL (guaranteed https:// scheme)
  const normalizedUrl = normalizeWebsiteUrl(websiteUrl)
  if (normalizedUrl) {
    parts.push(normalizedUrl)
  }

  return parts.join('\n')
}

/**
 * Format compact caption strictly without links
 * For platforms prohibiting external links in descriptions (e.g. TikTok, Instagram video/carousel captions)
 */
export function formatCaptionWithoutLink(info: ArtworkInfo): string {
  const parts: string[] = []

  // Row 1: Artist (only if present)
  if (info.artist && info.artist.trim()) {
    parts.push(info.artist.trim())
  }

  // Row 2: Artwork Title (only if present)
  if (info.title && info.title.trim()) {
    parts.push(`«${info.title.trim()}»`)
  }

  // Row 3: Year · Medium · Dimensions (strict middot filter)
  const detailItems: string[] = []
  if (info.year && info.year.trim()) detailItems.push(info.year.trim())
  if (info.medium && info.medium.trim()) detailItems.push(info.medium.trim())
  if (info.dimensions && info.dimensions.trim()) detailItems.push(info.dimensions.trim())

  if (detailItems.length > 0) {
    parts.push(detailItems.join(' · '))
  }

  return parts.join('\n')
}

/**
 * Format Telegram HTML Caption
 * Elegant typographical hierarchy: bold author, cursive/italic title in quotes,
 * details with middot, and clickable link. Completely omits empty rows and orphan middots.
 */
export function formatTelegramCaption(info: ArtworkInfo, websiteUrl: string): string {
  const lines: string[] = []

  // 1. Author (Bold)
  if (info.artist && info.artist.trim()) {
    lines.push(`<b>${escapeHtml(info.artist.trim())}</b>`)
  }

  // 2. Title (Cursive / Italic with quotes)
  if (info.title && info.title.trim()) {
    lines.push(`<i>«${escapeHtml(info.title.trim())}»</i>`)
  }

  // 3. Metadata: Year · Medium · Dimensions
  const detailItems: string[] = []
  if (info.year && info.year.trim()) detailItems.push(escapeHtml(info.year.trim()))
  if (info.medium && info.medium.trim()) detailItems.push(escapeHtml(info.medium.trim()))
  if (info.dimensions && info.dimensions.trim()) detailItems.push(escapeHtml(info.dimensions.trim()))

  if (detailItems.length > 0) {
    lines.push(detailItems.join(' · '))
  }

  // 4. Website link
  const normalizedUrl = normalizeWebsiteUrl(websiteUrl)
  if (normalizedUrl) {
    const domain = normalizedUrl.replace(/^https?:\/\//, '').replace(/\/$/, '')
    lines.push(`\n<a href="${normalizedUrl}">${domain}</a>`)
  }

  return lines.join('\n')
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

/**
 * Direct Telegram Bot API Sender
 * Runs 100% in client browser without backend server!
 */
export async function postToTelegram(
  config: SocialConfig['telegram'],
  websiteUrl: string,
  mainBlob: Blob,
  detail1Blob: Blob | undefined,
  detail2Blob: Blob | undefined,
  info: ArtworkInfo
): Promise<{ success: boolean; error?: string; isOffline?: boolean }> {
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return { success: false, error: 'Отсутствует интернет-соединение', isOffline: true }
  }

  if (!config.botToken || !config.channelId) {
    return { success: false, error: 'Токен бота или ID канала не заданы' }
  }

  const token = config.botToken.trim()
  const rawChatId = config.channelId.trim()
  const chatId = rawChatId.startsWith('@') || rawChatId.startsWith('-') ? rawChatId : `@${rawChatId}`
  const apiUrl = `https://api.telegram.org/bot${token}`

  try {
    // Post 1 (Details without text): Send the 2 detail photos first so the main post doesn't get collapsed into an ugly grid
    if (config.separateDetailsPost && detail1Blob && detail2Blob) {
      const mediaFormData = new FormData()
      mediaFormData.append('chat_id', chatId)
      mediaFormData.append(
        'media',
        JSON.stringify([
          { type: 'photo', media: 'attach://det1' },
          { type: 'photo', media: 'attach://det2' },
        ])
      )
      mediaFormData.append('det1', detail1Blob, 'detail1.jpg')
      mediaFormData.append('det2', detail2Blob, 'detail2.jpg')

      const resMedia = await fetch(`${apiUrl}/sendMediaGroup`, {
        method: 'POST',
        body: mediaFormData,
      })
      const mediaData = await resMedia.json()
      if (!mediaData.ok) {
        console.warn('Telegram details media group warning:', mediaData)
      }
      // Brief pause between messages for natural Telegram channel ordering
      await new Promise((r) => setTimeout(r, 400))
    }

    // Post 2 (Main Post Card with elegant formatted Markdown text)
    const captionHtml = formatTelegramCaption(info, websiteUrl)
    const mainFormData = new FormData()
    mainFormData.append('chat_id', chatId)
    mainFormData.append('photo', mainBlob, 'artwork_card.jpg')
    if (captionHtml.trim()) {
      mainFormData.append('caption', captionHtml)
      mainFormData.append('parse_mode', 'HTML')
    }

    const resMain = await fetch(`${apiUrl}/sendPhoto`, {
      method: 'POST',
      body: mainFormData,
    })
    const mainData = await resMain.json()

    if (!mainData.ok) {
      return { success: false, error: mainData.description || 'Ошибка Telegram API' }
    }

    return { success: true }
  } catch (err: any) {
    const isNetwork = !navigator.onLine || err.name === 'TypeError'
    return {
      success: false,
      error: isNetwork ? 'Отсутствует интернет-соединение' : (err.message || 'Ошибка Telegram'),
      isOffline: isNetwork,
    }
  }
}

/**
 * Universal Webhook Dispatcher
 * Sends multi-image carousel payload and Pinterest-specific 3-pin metadata
 * to Make.com, Zapier, Cloudflare Worker, or custom relay.
 */
export async function postToWebhookRelay(
  webhookUrl: string,
  platforms: SocialConfig['platforms'],
  websiteUrl: string,
  mainBlob: Blob,
  detail1Blob: Blob | undefined,
  detail2Blob: Blob | undefined,
  info: ArtworkInfo
): Promise<{ success: boolean; error?: string; isOffline?: boolean }> {
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return { success: false, error: 'Отсутствует интернет-соединение', isOffline: true }
  }

  const normalizedUrl = normalizeWebsiteUrl(websiteUrl)

  try {
    const formData = new FormData()
    formData.append('main_card', mainBlob, 'main_card.jpg')
    if (detail1Blob) formData.append('detail_1', detail1Blob, 'detail_1.jpg')
    if (detail2Blob) formData.append('detail_2', detail2Blob, 'detail_2.jpg')

    const standardCaption = formatStandardCaption(info, normalizedUrl)
    const standardCaptionNoLink = formatCaptionWithoutLink(info)

    formData.append('caption', standardCaption)
    formData.append('caption_with_link', standardCaption)
    formData.append('caption_no_link', standardCaptionNoLink)
    formData.append('artist', info.artist || '')
    formData.append('title', info.title || '')
    formData.append('year', info.year || '')
    formData.append('medium', info.medium || '')
    formData.append('dimensions', info.dimensions || '')
    formData.append('website_url', normalizedUrl)
    formData.append('website_domain', getCleanDomainUrl(websiteUrl))
    formData.append('platforms', JSON.stringify(platforms))

    // Platform-tailored captions (accurately deciding if https:// is needed)
    const captionsByPlatform: Record<string, string> = {
      instagram: formatCaptionForPlatform(info, websiteUrl, 'instagram'),
      tiktok: formatCaptionForPlatform(info, websiteUrl, 'tiktok'),
      pinterest: formatCaptionForPlatform(info, websiteUrl, 'pinterest'),
      x: formatCaptionForPlatform(info, websiteUrl, 'x'),
      youtube: formatCaptionForPlatform(info, websiteUrl, 'youtube'),
      facebook: formatCaptionForPlatform(info, websiteUrl, 'facebook'),
      threads: formatCaptionForPlatform(info, websiteUrl, 'threads'),
    }
    formData.append('caption_by_platform', JSON.stringify(captionsByPlatform))

    // Pinterest-specific structure:
    // Pinterest posts as 3 discrete pins (main card, detail 1, detail 2)
    // each containing the complete metadata description and guaranteed https:// destination link
    if (platforms.pinterest) {
      const pinTitleBase = [info.artist, info.title].filter(Boolean).join(' – ') || 'Произведение искусства'
      const pinterestPins = [
        {
          pinIndex: 1,
          pinType: 'main_artwork',
          title: pinTitleBase,
          description: standardCaption,
          description_clean: standardCaptionNoLink,
          link: normalizedUrl, // Official Pinterest destination link with guaranteed https://
          mediaKey: 'main_card',
        },
        {
          pinIndex: 2,
          pinType: 'detail_1',
          title: `${pinTitleBase} (Деталь 1)`,
          description: standardCaption,
          description_clean: standardCaptionNoLink,
          link: normalizedUrl,
          mediaKey: 'detail_1',
        },
        {
          pinIndex: 3,
          pinType: 'detail_2',
          title: `${pinTitleBase} (Деталь 2)`,
          description: standardCaption,
          description_clean: standardCaptionNoLink,
          link: normalizedUrl,
          mediaKey: 'detail_2',
        },
      ]
      formData.append('pinterest_pins', JSON.stringify(pinterestPins))
    }

    const res = await fetch(webhookUrl, {
      method: 'POST',
      body: formData,
    })

    if (!res.ok) {
      return { success: false, error: `Webhook ответил статусом ${res.status}` }
    }

    return { success: true }
  } catch (err: any) {
    const isNetwork = !navigator.onLine || err.name === 'TypeError'
    return {
      success: false,
      error: isNetwork ? 'Отсутствует интернет-соединение' : (err.message || 'Ошибка Webhook'),
      isOffline: isNetwork,
    }
  }
}

/**
 * Master Publishing Orchestrator
 */
export async function executeSocialPublish(
  config: SocialConfig,
  mainBlob: Blob,
  detail1Blob: Blob | undefined,
  detail2Blob: Blob | undefined,
  info: ArtworkInfo
): Promise<{ success: boolean; messages: string[]; isOffline?: boolean }> {
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return {
      success: false,
      messages: ['Отсутствует интернет-соединение'],
      isOffline: true,
    }
  }

  const messages: string[] = []
  let overallSuccess = true
  let isOfflineDetected = false

  // 1. Telegram
  if (config.telegram.enabled && config.telegram.botToken && config.telegram.channelId) {
    const tgRes = await postToTelegram(
      config.telegram,
      config.websiteUrl,
      mainBlob,
      detail1Blob,
      detail2Blob,
      info
    )
    if (tgRes.success) {
      messages.push('Telegram: Опубликовано!')
    } else {
      overallSuccess = false
      if (tgRes.isOffline) isOfflineDetected = true
      messages.push(`Telegram: ${tgRes.error}`)
    }
  }

  // 2. Webhook Relay (Instagram, TikTok, Pinterest, FB, Threads, X, YouTube)
  if (config.webhook.enabled && config.webhook.webhookUrl) {
    const activeList = Object.entries(config.platforms)
      .filter(([_, active]) => active)
      .map(([p]) => p)

    if (activeList.length > 0) {
      const whRes = await postToWebhookRelay(
        config.webhook.webhookUrl,
        config.platforms,
        config.websiteUrl,
        mainBlob,
        detail1Blob,
        detail2Blob,
        info
      )
      if (whRes.success) {
        messages.push(`Соцсети (${activeList.join(', ')}): Отправлено!`)
      } else {
        overallSuccess = false
        if (whRes.isOffline) isOfflineDetected = true
        messages.push(`Соцсети: ${whRes.error}`)
      }
    }
  }

  return { success: overallSuccess, messages, isOffline: isOfflineDetected }
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => {
      const dataUrl = reader.result as string
      // Extract base64 portion
      const base64 = dataUrl.split(',')[1] || ''
      resolve(base64)
    }
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

/**
 * Uploads artwork directly to Google Drive via Google Apps Script (0 Make operations)
 * or via Webhook relay fallback.
 * Automatically sorts into artist subfolder inside user-specified root folder.
 */
export async function uploadArtworkToGoogleDrive(
  config: SocialConfig,
  imageBlob: Blob,
  fileName: string,
  info: ArtworkInfo
): Promise<{ success: boolean; artistFolder?: string; error?: string; isOffline?: boolean }> {
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return { success: false, error: 'Отсутствует интернет-соединение', isOffline: true }
  }

  const folderId = extractGoogleDriveFolderId(config.googleDrive.folderId)
  if (!folderId) {
    return { success: false, error: 'Не указана папка Google Диска' }
  }

  const artistName = info.artist?.trim() || 'Без автора'

  // Primary mode: Direct Google Apps Script Web App (0 Make.com resources, 100% free)
  if (config.googleDrive.scriptUrl?.trim()) {
    try {
      const base64 = await blobToBase64(imageBlob)
      const payload = {
        folderId,
        artist: artistName,
        filename: fileName,
        mimeType: imageBlob.type || 'image/jpeg',
        base64,
      }

      const res = await fetch(config.googleDrive.scriptUrl.trim(), {
        method: 'POST',
        // text/plain avoids CORS preflight OPTIONS requests on Google Apps Script 302 redirects
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload),
      })

      let data: any = null
      try {
        data = await res.json()
      } catch {
        // Handled if response text or redirect occurred
      }

      if (data && data.success === false) {
        return { success: false, error: data.error || 'Ошибка Google Apps Script' }
      }

      return { success: true, artistFolder: (data && data.folderName) || artistName }
    } catch (err: any) {
      const isNetwork = !navigator.onLine || err.name === 'TypeError'
      return {
        success: false,
        error: isNetwork ? 'Отсутствует интернет-соединение' : (err.message || 'Ошибка отправки в Google Диск'),
        isOffline: isNetwork,
      }
    }
  }

  // Fallback mode: Webhook Relay (Make.com, Zapier, n8n)
  const targetWebhook = config.googleDrive.customWebhookUrl?.trim() || config.webhook.webhookUrl?.trim()
  if (!targetWebhook) {
    return { success: false, error: 'Не указан URL скрипта Google Диска (или Webhook URL)' }
  }

  try {
    const formData = new FormData()
    formData.append('file', imageBlob, fileName)
    formData.append('filename', fileName)
    formData.append('action', 'google_drive_upload')
    formData.append('root_folder_id', folderId)
    formData.append('artist_folder_name', artistName)
    formData.append('artist', artistName)
    formData.append('title', info.title?.trim() || '')
    formData.append('year', info.year?.trim() || '')
    formData.append('medium', info.medium?.trim() || '')
    formData.append('dimensions', info.dimensions?.trim() || '')

    const res = await fetch(targetWebhook, {
      method: 'POST',
      body: formData,
    })

    if (!res.ok) {
      return { success: false, error: `Webhook Google Диска ответил статусом ${res.status}` }
    }

    return { success: true, artistFolder: artistName }
  } catch (err: any) {
    const isNetwork = !navigator.onLine || err.name === 'TypeError'
    return {
      success: false,
      error: isNetwork ? 'Отсутствует интернет-соединение' : (err.message || 'Ошибка загрузки на Google Диск'),
      isOffline: isNetwork,
    }
  }
}

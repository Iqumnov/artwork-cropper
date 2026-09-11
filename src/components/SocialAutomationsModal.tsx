import React, { useState, useEffect } from 'react'
import {
  X,
  Check,
  Globe,
  Share2,
  Link2,
  RotateCcw,
  HardDrive,
  Send,
  Copy,
  ChevronDown,
  ChevronUp,
  FileCode,
  ExternalLink
} from 'lucide-react'
import {
  SocialConfig,
  loadSocialConfig,
  saveSocialConfig,
  normalizeWebsiteUrl,
  isAnySocialConnected,
  extractGoogleDriveFolderId,
  isGoogleDriveConnected,
  DEFAULT_SOCIAL_CONFIG
} from '../lib/social-automation'

interface SocialAutomationsModalProps {
  isOpen: boolean
  onClose: () => void
  onSave?: (config: SocialConfig) => void
}

const GOOGLE_APPS_SCRIPT_CODE = `/**
 * ARTEI Studio — Google Apps Script Web App
 * Прямая загрузка изображений на Google Диск с авто-созданием папок художников.
 * 100% бесплатно, без сторонних сервисов и без ограничений.
 */

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      throw new Error("Нет данных в теле запроса");
    }

    var data = JSON.parse(e.postData.contents);
    var rootFolderId = data.folderId;
    var artistName = (data.artist && data.artist.trim()) ? data.artist.trim() : "Без автора";
    var fileName = data.filename || "artwork.jpg";
    var mimeType = data.mimeType || "image/jpeg";
    var base64Data = data.base64;

    if (!rootFolderId) {
      throw new Error("Не указан ID целевой папки (folderId)");
    }
    if (!base64Data) {
      throw new Error("Отсутствуют данные файла (base64)");
    }

    // 1. Получаем целевую корневую папку Google Диска
    var rootFolder = DriveApp.getFolderById(rootFolderId);

    // 2. Ищем существующую папку художника или создаем новую
    var subFolders = rootFolder.getFoldersByName(artistName);
    var artistFolder;
    if (subFolders.hasNext()) {
      artistFolder = subFolders.next();
    } else {
      artistFolder = rootFolder.createFolder(artistName);
    }

    // 3. Декодируем base64 и сохраняем изображение
    var bytes = Utilities.base64Decode(base64Data);
    var blob = Utilities.newBlob(bytes, mimeType, fileName);
    var file = artistFolder.createFile(blob);

    var result = {
      success: true,
      fileId: file.getId(),
      fileName: file.getName(),
      folderName: artistName,
      fileUrl: file.getUrl()
    };

    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    status: "ok",
    service: "ARTEI Google Drive Web App is active"
  })).setMimeType(ContentService.MimeType.JSON);
}`

export const SocialAutomationsModal: React.FC<SocialAutomationsModalProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const [config, setConfig] = useState<SocialConfig>(DEFAULT_SOCIAL_CONFIG)
  const [isSaved, setIsSaved] = useState(false)
  const [showScriptInstructions, setShowScriptInstructions] = useState(false)
  const [scriptCopied, setScriptCopied] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setConfig(loadSocialConfig())
      setIsSaved(false)
      setShowScriptInstructions(false)
      setScriptCopied(false)
    }
  }, [isOpen])

  const handleCopyScript = async () => {
    try {
      await navigator.clipboard.writeText(GOOGLE_APPS_SCRIPT_CODE)
      setScriptCopied(true)
      setTimeout(() => setScriptCopied(false), 2500)
    } catch {}
  }

  const handleDisconnectTelegram = () => {
    const updated: SocialConfig = {
      ...config,
      telegram: {
        enabled: false,
        botToken: '',
        channelId: '',
        separateDetailsPost: true,
      },
    }
    setConfig(updated)
    saveSocialConfig(updated)
    if (onSave) onSave(updated)
  }

  const handleDisconnectWebhook = () => {
    const updated: SocialConfig = {
      ...config,
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
    }
    setConfig(updated)
    saveSocialConfig(updated)
    if (onSave) onSave(updated)
  }

  const handleDisconnectDrive = () => {
    const updated: SocialConfig = {
      ...config,
      googleDrive: {
        enabled: false,
        folderId: '',
        scriptUrl: '',
        customWebhookUrl: '',
      },
    }
    setConfig(updated)
    saveSocialConfig(updated)
    if (onSave) onSave(updated)
  }

  const handleDisconnectAll = () => {
    const cleared: SocialConfig = {
      ...DEFAULT_SOCIAL_CONFIG,
      websiteUrl: config.websiteUrl,
    }
    setConfig(cleared)
    saveSocialConfig(cleared)
    if (onSave) onSave(cleared)
    setIsSaved(true)
    setTimeout(() => setIsSaved(false), 2000)
  }

  if (!isOpen) return null

  const handleSave = () => {
    saveSocialConfig(config)
    setIsSaved(true)
    if (onSave) onSave(config)
    setTimeout(() => {
      setIsSaved(false)
      onClose()
    }, 850)
  }

  const handleTogglePlatform = (key: keyof SocialConfig['platforms']) => {
    setConfig((prev) => ({
      ...prev,
      platforms: {
        ...prev.platforms,
        [key]: !prev.platforms[key],
      },
    }))
  }

  const isTelegramConnected = Boolean(
    config.telegram.enabled && config.telegram.botToken.trim() && config.telegram.channelId.trim()
  )
  const isWebhookConnected = Boolean(config.webhook.enabled && config.webhook.webhookUrl.trim())
  const isDriveActive = isGoogleDriveConnected(config)

  return (
    <div className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-[#faf8f8] border border-[#e3dbdc] p-5 sm:p-6 max-w-xl w-full shadow-2xl flex flex-col gap-3.5 text-[#0f0b0c] max-h-[92vh] overflow-y-auto no-scrollbar">
        {/* Header */}
        <div className="flex items-center justify-between pb-1">
          <div className="flex items-center gap-2">
            <Share2 className="w-4 h-4 text-[#0f0b0c]" />
            <h3 className="text-base font-normal text-[#0f0b0c] tracking-tight m-0">
              Подключения и автоматизация
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 border border-[#e3dbdc] hover:border-[#34292a] flex items-center justify-center text-[#565051] hover:text-[#0f0b0c] transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        <p className="text-xs text-[#565051] leading-relaxed m-0">
          Telegram и Google Диск работают напрямую из браузера (0 операций Make). Для остальных соцсетей используется сценарий Webhook.
        </p>

        {/* 1. Website Link */}
        <div className="p-3 bg-white border border-[#e3dbdc] flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <Globe className="w-3.5 h-3.5 text-[#565051]" />
            <label className="text-xs font-normal text-[#0f0b0c]">
              Ссылка на сайт галереи
            </label>
          </div>
          <input
            type="url"
            value={config.websiteUrl}
            onChange={(e) => setConfig({ ...config, websiteUrl: e.target.value })}
            placeholder="https://ourdynasty.art"
            className="px-2.5 py-1.5 text-xs border border-[#e3dbdc] focus:border-[#34292a] outline-none text-[#0f0b0c] bg-[#faf8f8] transition-colors"
          />
          <span className="text-[11px] text-[#565051]">
            Автоматически подстраивается под формат каждой соцсети (с https:// или без).
          </span>
        </div>

        {/* 2. Telegram (Direct Bot API — 0 Make operations) */}
        <div className="p-3 bg-white border border-[#e3dbdc] flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Send className="w-3.5 h-3.5 text-[#0f0b0c]" />
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-normal text-[#0f0b0c]">
                    Telegram (Напрямую — 0 ресурсов Make)
                  </span>
                  {isTelegramConnected && (
                    <span className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-1 py-0.2 rounded-xs font-normal">
                      Подключен
                    </span>
                  )}
                </div>
                <span className="text-[11px] text-[#565051]">
                  Прямая отправка в канал через официальный Telegram Bot API
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() =>
                setConfig({
                  ...config,
                  telegram: { ...config.telegram, enabled: !config.telegram.enabled },
                })
              }
              className={`w-10 h-5 border transition-colors flex items-center px-0.5 cursor-pointer ${
                config.telegram.enabled
                  ? 'bg-[#0f0b0c] border-[#0f0b0c]'
                  : 'bg-[#e3dbdc] border-[#e3dbdc]'
              }`}
            >
              <div
                className={`w-3.5 h-3.5 bg-white transition-transform ${
                  config.telegram.enabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {config.telegram.enabled && (
            <div className="flex flex-col gap-2 pt-1">
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[11px] text-[#565051]">
                    Bot Token (получается у @BotFather)
                  </span>
                  {(config.telegram.botToken || config.telegram.channelId) && (
                    <button
                      type="button"
                      onClick={handleDisconnectTelegram}
                      className="text-[11px] text-[#565051] hover:text-rose-600 transition-colors flex items-center gap-1 cursor-pointer"
                      title="Очистить и отключить Telegram"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Отключить</span>
                    </button>
                  )}
                </div>
                <input
                  type="password"
                  value={config.telegram.botToken}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      telegram: { ...config.telegram, botToken: e.target.value.trim() },
                    })
                  }
                  placeholder="123456789:ABCdefGHIjklMNOpqrsTUVwxyz..."
                  className="px-2 py-1 text-xs border border-[#e3dbdc] focus:border-[#34292a] outline-none text-[#0f0b0c] bg-[#faf8f8] font-mono"
                />
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-[11px] text-[#565051]">
                  ID канала или публичный @username
                </span>
                <input
                  type="text"
                  value={config.telegram.channelId}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      telegram: { ...config.telegram, channelId: e.target.value.trim() },
                    })
                  }
                  placeholder="@ourdynastyart или -1001234567890"
                  className="px-2 py-1 text-xs border border-[#e3dbdc] focus:border-[#34292a] outline-none text-[#0f0b0c] bg-[#faf8f8]"
                />
              </div>

              <label className="flex items-center gap-2 pt-1 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={config.telegram.separateDetailsPost}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      telegram: {
                        ...config.telegram,
                        separateDetailsPost: e.target.checked,
                      },
                    })
                  }
                  className="rounded border-[#e3dbdc] text-[#0f0b0c] focus:ring-0"
                />
                <span className="text-[11px] text-[#565051]">
                  Публиковать макро-детали предшествующим постом без текста
                </span>
              </label>
            </div>
          )}
        </div>

        {/* 3. Social Media Webhook Relay (Make / Zapier / n8n) */}
        <div className="p-3 bg-white border border-[#e3dbdc] flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Link2 className="w-3.5 h-3.5 text-[#0f0b0c]" />
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-normal text-[#0f0b0c]">
                    Соцсети (Через Webhook: Instagram, TikTok, Pinterest...)
                  </span>
                  {isWebhookConnected && (
                    <span className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-1 py-0.2 rounded-xs font-normal">
                      Подключен
                    </span>
                  )}
                </div>
                <span className="text-[11px] text-[#565051]">
                  Публикация через сценарий Make.com, Zapier или n8n
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() =>
                setConfig({
                  ...config,
                  webhook: { ...config.webhook, enabled: !config.webhook.enabled },
                })
              }
              className={`w-10 h-5 border transition-colors flex items-center px-0.5 cursor-pointer ${
                config.webhook.enabled
                  ? 'bg-[#0f0b0c] border-[#0f0b0c]'
                  : 'bg-[#e3dbdc] border-[#e3dbdc]'
              }`}
            >
              <div
                className={`w-3.5 h-3.5 bg-white transition-transform ${
                  config.webhook.enabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {config.webhook.enabled && (
            <div className="flex flex-col gap-2 pt-1">
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[11px] text-[#565051]">
                    Webhook URL (Make.com / Zapier / n8n)
                  </span>
                  {config.webhook.webhookUrl.trim() && (
                    <button
                      type="button"
                      onClick={handleDisconnectWebhook}
                      className="text-[11px] text-[#565051] hover:text-rose-600 transition-colors flex items-center gap-1 cursor-pointer"
                      title="Очистить Webhook и отключить все соцсети"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Отключить все</span>
                    </button>
                  )}
                </div>
                <input
                  type="url"
                  value={config.webhook.webhookUrl}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      webhook: { ...config.webhook, webhookUrl: e.target.value },
                    })
                  }
                  onBlur={() => {
                    if (config.webhook.webhookUrl.trim()) {
                      setConfig({
                        ...config,
                        webhook: {
                          ...config.webhook,
                          webhookUrl: normalizeWebsiteUrl(config.webhook.webhookUrl),
                        },
                      })
                    }
                  }}
                  placeholder="https://hook.eu1.make.com/..."
                  className="px-2 py-1 text-xs border border-[#e3dbdc] focus:border-[#34292a] outline-none text-[#0f0b0c] bg-[#faf8f8]"
                />
              </div>

              <div className="flex flex-col gap-1.5 pt-1">
                <span className="text-[11px] text-[#565051]">Включенные платформы:</span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                  {[
                    { id: 'instagram', label: 'Instagram' },
                    { id: 'tiktok', label: 'TikTok' },
                    { id: 'pinterest', label: 'Pinterest' },
                    { id: 'facebook', label: 'Facebook' },
                    { id: 'threads', label: 'Threads' },
                    { id: 'x', label: 'X (Twitter)' },
                    { id: 'youtube', label: 'YouTube' },
                  ].map((plat) => {
                    const active = (config.platforms as any)[plat.id]
                    return (
                      <button
                        key={plat.id}
                        type="button"
                        onClick={() => handleTogglePlatform(plat.id as any)}
                        className={`px-2 py-1 text-xs border transition-colors flex items-center justify-between cursor-pointer ${
                          active
                            ? 'bg-[#0f0b0c] text-white border-[#0f0b0c]'
                            : 'bg-[#faf8f8] text-[#565051] border-[#e3dbdc] hover:border-[#34292a]'
                        }`}
                      >
                        <span>{plat.label}</span>
                        {active && <Check className="w-2.5 h-2.5 ml-1" />}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 4. Google Drive (Direct Apps Script — 0 Make operations) */}
        <div className="p-3 bg-white border border-[#e3dbdc] flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <HardDrive className="w-3.5 h-3.5 text-[#0f0b0c]" />
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-normal text-[#0f0b0c]">
                    Google Диск (Напрямую — 0 ресурсов Make)
                  </span>
                  {isDriveActive && (
                    <span className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-1 py-0.2 rounded-xs font-normal">
                      Подключен
                    </span>
                  )}
                </div>
                <span className="text-[11px] text-[#565051]">
                  Прямое сохранение по папкам художников через Google Apps Script
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() =>
                setConfig({
                  ...config,
                  googleDrive: {
                    ...config.googleDrive,
                    enabled: !config.googleDrive.enabled,
                  },
                })
              }
              className={`w-10 h-5 border transition-colors flex items-center px-0.5 cursor-pointer ${
                config.googleDrive.enabled
                  ? 'bg-[#0f0b0c] border-[#0f0b0c]'
                  : 'bg-[#e3dbdc] border-[#e3dbdc]'
              }`}
            >
              <div
                className={`w-3.5 h-3.5 bg-white transition-transform ${
                  config.googleDrive.enabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {config.googleDrive.enabled && (
            <div className="flex flex-col gap-2.5 pt-1">
              {/* Apps Script Web App URL */}
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[11px] text-[#565051]">
                    URL веб-приложения Google Apps Script
                  </span>
                  {(config.googleDrive.scriptUrl || config.googleDrive.folderId) && (
                    <button
                      type="button"
                      onClick={handleDisconnectDrive}
                      className="text-[11px] text-[#565051] hover:text-rose-600 transition-colors flex items-center gap-1 cursor-pointer"
                      title="Очистить и отключить Google Диск"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Отключить</span>
                    </button>
                  )}
                </div>
                <input
                  type="url"
                  value={config.googleDrive.scriptUrl || ''}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      googleDrive: {
                        ...config.googleDrive,
                        scriptUrl: e.target.value.trim(),
                      },
                    })
                  }
                  placeholder="https://script.google.com/macros/s/.../exec"
                  className="px-2 py-1 text-xs border border-[#e3dbdc] focus:border-[#34292a] outline-none text-[#0f0b0c] bg-[#faf8f8]"
                />
              </div>

              {/* Folder ID or Link */}
              <div className="flex flex-col gap-1">
                <span className="text-[11px] text-[#565051]">
                  ID или ссылка на целевую папку на Google Диске
                </span>
                <input
                  type="text"
                  value={config.googleDrive.folderId}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      googleDrive: {
                        ...config.googleDrive,
                        folderId: e.target.value,
                      },
                    })
                  }
                  onBlur={() => {
                    const extracted = extractGoogleDriveFolderId(config.googleDrive.folderId)
                    if (extracted !== config.googleDrive.folderId) {
                      setConfig({
                        ...config,
                        googleDrive: {
                          ...config.googleDrive,
                          folderId: extracted,
                        },
                      })
                    }
                  }}
                  placeholder="ID папки или ссылка: https://drive.google.com/drive/folders/..."
                  className="px-2 py-1 text-xs border border-[#e3dbdc] focus:border-[#34292a] outline-none text-[#0f0b0c] bg-[#faf8f8]"
                />
                <span className="text-[10px] text-[#565051]">
                  Внутри этой папки при сохранении работы автоматически создастся или найдет папку автора (например, «Иван Айвазовский»).
                </span>
              </div>

              {/* Accordion: Apps Script Guide & Code */}
              <div className="border border-[#e3dbdc] bg-[#faf8f8] overflow-hidden">
                <button
                  type="button"
                  onClick={() => setShowScriptInstructions(!showScriptInstructions)}
                  className="w-full px-2.5 py-1.5 flex items-center justify-between text-xs text-[#0f0b0c] hover:bg-white transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-1.5">
                    <FileCode className="w-3.5 h-3.5 text-[#565051]" />
                    <span>Инструкция и готовый скрипт Google Apps Script (1 мин)</span>
                  </div>
                  {showScriptInstructions ? (
                    <ChevronUp className="w-3.5 h-3.5 text-[#565051]" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5 text-[#565051]" />
                  )}
                </button>

                {showScriptInstructions && (
                  <div className="p-2.5 border-t border-[#e3dbdc] bg-white flex flex-col gap-2 text-[11px] text-[#565051] leading-relaxed">
                    <ol className="list-decimal pl-4 space-y-1 m-0">
                      <li>
                        Откройте{' '}
                        <a
                          href="https://script.google.com"
                          target="_blank"
                          rel="noreferrer"
                          className="text-[#0f0b0c] underline inline-flex items-center gap-0.5"
                        >
                          script.google.com <ExternalLink className="w-2.5 h-2.5" />
                        </a>{' '}
                        и нажмите «Новый проект».
                      </li>
                      <li>Вставьте код скрипта (кнопка копирования ниже).</li>
                      <li>
                        Нажмите <b>«Начать развертывание» → «Новое развертывание»</b>.
                      </li>
                      <li>
                        Выберите тип <b>«Веб-приложение»</b>:
                        <ul className="list-disc pl-4 mt-0.5 space-y-0.5">
                          <li>Выполнять от имени: <b>Я (ваш аккаунт)</b></li>
                          <li>У кого есть доступ: <b>Все</b> (Anyone)</li>
                        </ul>
                      </li>
                      <li>Скопируйте полученный URL веб-приложения и вставьте в поле выше.</li>
                    </ol>

                    <div className="flex items-center justify-between pt-1">
                      <button
                        type="button"
                        onClick={handleCopyScript}
                        className="px-2.5 py-1 bg-[#0f0b0c] hover:bg-[#34292a] text-white text-[11px] flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        {scriptCopied ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span>Код скопирован в буфер!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Скопировать код скрипта</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-2 border-t border-[#e3dbdc]">
          <button
            onClick={handleSave}
            className="flex-1 py-2 bg-[#0f0b0c] hover:bg-[#34292a] text-[#faf8f8] text-xs font-normal flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            {isSaved ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Настройки сохранены!</span>
              </>
            ) : (
              <span>Сохранить настройки</span>
            )}
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 border border-[#e3dbdc] hover:border-[#34292a] text-[#565051] hover:text-[#0f0b0c] text-xs font-normal transition-colors cursor-pointer"
          >
            Закрыть
          </button>
        </div>

        {/* Disconnect All Accounts option */}
        {isAnySocialConnected(config) && (
          <div className="flex justify-center pt-0.5">
            <button
              type="button"
              onClick={handleDisconnectAll}
              className="text-[11px] text-[#565051] hover:text-rose-600 transition-colors flex items-center gap-1.5 cursor-pointer py-1"
              title="Отвязать все подключенные каналы и соцсети"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Отключить все аккаунты</span>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

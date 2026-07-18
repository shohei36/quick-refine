import { app } from 'electron'
import { join } from 'path'
import { AppSettings, DEFAULT_SETTINGS } from '../../shared/types'
import { readJsonObject, writeJsonFile } from './jsonStore'

const settingsPath = (): string => join(app.getPath('userData'), 'settings.json')

let cache: AppSettings | null = null

export function getSettings(): AppSettings {
  if (!cache) {
    const stored = readJsonObject(settingsPath(), DEFAULT_SETTINGS)
    // modelsはネストしたオブジェクトなので、浅いマージだと保存後に追加されたプロバイダー
    // (例: gemini)のデフォルト値が失われてしまう。ここで明示的に深くマージする。
    cache = { ...stored, models: { ...DEFAULT_SETTINGS.models, ...stored.models } }
  }
  return cache
}

export function updateSettings(partial: Partial<AppSettings>): AppSettings {
  const current = getSettings()
  const next: AppSettings = {
    ...current,
    ...partial,
    models: { ...current.models, ...partial.models }
  }
  cache = next
  writeJsonFile(settingsPath(), next)
  return next
}

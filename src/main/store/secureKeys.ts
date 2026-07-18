import { app, safeStorage } from 'electron'
import { join } from 'path'
import { AIProviderId, ApiKeyStatus } from '../../shared/types'
import { readJsonObject, writeJsonFile } from './jsonStore'

type EncryptedKeys = Partial<Record<AIProviderId, string>>

const keysPath = (): string => join(app.getPath('userData'), 'secure-keys.json')

function loadEncrypted(): EncryptedKeys {
  return readJsonObject<EncryptedKeys>(keysPath(), {})
}

export function setApiKey(provider: AIProviderId, apiKey: string): void {
  if (!safeStorage.isEncryptionAvailable()) {
    throw new Error('OSの資格情報ストアが利用できないため、APIキーを安全に保存できません')
  }
  const encrypted = loadEncrypted()
  encrypted[provider] = safeStorage.encryptString(apiKey).toString('base64')
  writeJsonFile(keysPath(), encrypted)
}

export function getApiKey(provider: AIProviderId): string | null {
  const value = loadEncrypted()[provider]
  if (!value) return null
  try {
    return safeStorage.decryptString(Buffer.from(value, 'base64'))
  } catch (error) {
    console.error(`Failed to decrypt API key for ${provider}:`, error)
    return null
  }
}

export function removeApiKey(provider: AIProviderId): void {
  const encrypted = loadEncrypted()
  delete encrypted[provider]
  writeJsonFile(keysPath(), encrypted)
}

export function getApiKeyStatus(): ApiKeyStatus {
  const encrypted = loadEncrypted()
  return {
    anthropic: Boolean(encrypted.anthropic),
    openai: Boolean(encrypted.openai),
    gemini: Boolean(encrypted.gemini)
  }
}

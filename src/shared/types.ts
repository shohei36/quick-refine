export type AIProviderId = 'anthropic' | 'openai' | 'gemini'

export interface AppSettings {
  activeProvider: AIProviderId
  models: Record<AIProviderId, string>
  shortcut: string
  lastSkillId: string | null
}

export const DEFAULT_SHORTCUT = 'CommandOrControl+Shift+Space'

export const DEFAULT_MODELS: Record<AIProviderId, string> = {
  anthropic: 'claude-sonnet-4-5-20250929',
  openai: 'gpt-4.1',
  gemini: 'gemini-3.5-flash'
}

export const DEFAULT_SETTINGS: AppSettings = {
  activeProvider: 'anthropic',
  models: DEFAULT_MODELS,
  shortcut: DEFAULT_SHORTCUT,
  lastSkillId: null
}

export const PROVIDER_LABELS: Record<AIProviderId, string> = {
  anthropic: 'Claude (Anthropic)',
  openai: 'OpenAI',
  gemini: 'Gemini (Google)'
}

export const MODEL_OPTIONS: Record<AIProviderId, string[]> = {
  anthropic: [
    'claude-opus-4-1-20250805',
    'claude-sonnet-4-5-20250929',
    'claude-haiku-4-5-20251001'
  ],
  openai: ['gpt-4.1', 'gpt-4.1-mini', 'gpt-4.1-nano', 'gpt-4o', 'o3', 'o4-mini'],
  gemini: ['gemini-3.5-flash', 'gemini-3.1-flash-lite', 'gemini-2.5-pro', 'gemini-2.5-flash-lite']
}

/** 選択中の値がプリセットに含まれていなくても選べるよう、現在値を末尾に補って返す */
export function getModelOptions(provider: AIProviderId, currentValue: string): string[] {
  const presets = MODEL_OPTIONS[provider]
  return presets.includes(currentValue) ? presets : [...presets, currentValue]
}

export interface Skill {
  id: string
  name: string
  description: string
  systemPromptTemplate: string
  isPreset: boolean
  createdAt: number
  updatedAt: number
}

export type SkillInput = Pick<Skill, 'name' | 'description' | 'systemPromptTemplate'>

export type ChatRole = 'user' | 'assistant'

export interface ChatMessage {
  role: ChatRole
  content: string
}

export interface GenerateRequest {
  skillId: string
  input: string
  history: ChatMessage[]
}

export interface GenerateResult {
  message: ChatMessage
  history: ChatMessage[]
}

export interface ApiKeyStatus {
  anthropic: boolean
  openai: boolean
  gemini: boolean
}

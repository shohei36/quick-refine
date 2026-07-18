import {
  AIProviderId,
  ChatMessage,
  GenerateRequest,
  GenerateResult,
  PROVIDER_LABELS
} from '../../shared/types'
import { getApiKey } from '../store/secureKeys'
import { getSettings } from '../store/settingsStore'
import { listSkills } from '../store/skillsStore'
import { anthropicProvider } from './anthropicProvider'
import { geminiProvider } from './geminiProvider'
import { openaiProvider } from './openaiProvider'
import { AIProvider } from './types'

const providers: Record<AIProviderId, AIProvider> = {
  anthropic: anthropicProvider,
  openai: openaiProvider,
  gemini: geminiProvider
}

export async function generateText(request: GenerateRequest): Promise<GenerateResult> {
  const settings = getSettings()
  const provider = providers[settings.activeProvider]

  const apiKey = getApiKey(settings.activeProvider)
  if (!apiKey) {
    throw new Error(
      `${PROVIDER_LABELS[settings.activeProvider]}のAPIキーが設定されていません。設定画面から登録してください。`
    )
  }

  const skill = listSkills().find((candidate) => candidate.id === request.skillId)
  if (!skill) {
    throw new Error('指定されたスキルが見つかりません')
  }

  const userMessage: ChatMessage = { role: 'user', content: request.input }
  const messages: ChatMessage[] = [...request.history, userMessage]
  const model = settings.models[settings.activeProvider]

  const replyText = await provider.generate({
    systemPrompt: skill.systemPromptTemplate,
    messages,
    model,
    apiKey
  })

  const assistantMessage: ChatMessage = { role: 'assistant', content: replyText }

  return { message: assistantMessage, history: [...messages, assistantMessage] }
}

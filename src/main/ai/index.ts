import {
  AIProviderId,
  ChatMessage,
  GenerateRequest,
  GenerateResult,
  PROVIDER_LABELS,
  SkillDraft,
  SkillDraftRefineRequest,
  SkillDraftRefineResult,
  SkillDraftRequest
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

interface ResolvedProvider {
  provider: AIProvider
  apiKey: string
  model: string
}

function resolveActiveProvider(): ResolvedProvider {
  const settings = getSettings()
  const provider = providers[settings.activeProvider]

  const apiKey = getApiKey(settings.activeProvider)
  if (!apiKey) {
    throw new Error(
      `${PROVIDER_LABELS[settings.activeProvider]}のAPIキーが設定されていません。設定画面から登録してください。`
    )
  }

  return { provider, apiKey, model: settings.models[settings.activeProvider] }
}

export async function generateText(request: GenerateRequest): Promise<GenerateResult> {
  const { provider, apiKey, model } = resolveActiveProvider()

  const skill = listSkills().find((candidate) => candidate.id === request.skillId)
  if (!skill) {
    throw new Error('指定されたスキルが見つかりません')
  }

  const userMessage: ChatMessage = { role: 'user', content: request.input }
  const messages: ChatMessage[] = [...request.history, userMessage]

  const replyText = await provider.generate({
    systemPrompt: skill.systemPromptTemplate,
    messages,
    model,
    apiKey
  })

  const assistantMessage: ChatMessage = { role: 'assistant', content: replyText }

  return { message: assistantMessage, history: [...messages, assistantMessage] }
}

const SKILL_DRAFT_SYSTEM_PROMPT = `あなたはプロンプトエンジニアリングの専門家です。
ユーザーが説明する用途や目的をもとに、別の生成AIに渡して使う「スキル」を設計してください。
スキルは (1) 短い名前 (2) 用途の説明 (3) 実際に使うシステムプロンプト本文 の3つで構成されます。

出力は前置きや説明文を一切含めず、次のJSON形式のみで返してください。
{"name": "20文字以内の短いスキル名", "description": "1文でのスキルの説明", "systemPromptTemplate": "実際に使用するシステムプロンプト本文"}`

export function parseSkillDraft(raw: string): SkillDraft {
  const jsonText = raw
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/```\s*$/, '')
    .trim()

  let parsed: unknown
  try {
    parsed = JSON.parse(jsonText)
  } catch {
    throw new Error('AIの応答を解析できませんでした。もう一度お試しください。')
  }

  if (
    typeof parsed !== 'object' ||
    parsed === null ||
    typeof (parsed as Record<string, unknown>).name !== 'string' ||
    typeof (parsed as Record<string, unknown>).description !== 'string' ||
    typeof (parsed as Record<string, unknown>).systemPromptTemplate !== 'string'
  ) {
    throw new Error('AIの応答を解析できませんでした。もう一度お試しください。')
  }

  const draft = parsed as SkillDraft
  return {
    name: draft.name.trim(),
    description: draft.description.trim(),
    systemPromptTemplate: draft.systemPromptTemplate.trim()
  }
}

export async function generateSkillDraft(request: SkillDraftRequest): Promise<SkillDraft> {
  const { provider, apiKey, model } = resolveActiveProvider()

  const replyText = await provider.generate({
    systemPrompt: SKILL_DRAFT_SYSTEM_PROMPT,
    messages: [{ role: 'user', content: request.prompt }],
    model,
    apiKey
  })

  return parseSkillDraft(replyText)
}

const SKILL_REFINE_SYSTEM_PROMPT = `あなたはプロンプトエンジニアリングの専門家です。
すでに下書きされている、別の生成AIに渡して使う「スキル」(名前・説明・システムプロンプト)について、
ユーザーからの追加の指示にもとづいて改善してください。指示に関係ない部分はできるだけ変更せず維持してください。

出力は前置きや説明文を一切含めず、次のJSON形式のみで返してください。
{"reply": "何を変更したかをユーザーに伝える1〜2文の返信", "name": "20文字以内の短いスキル名", "description": "1文でのスキルの説明", "systemPromptTemplate": "実際に使用するシステムプロンプト本文"}`

export function parseSkillRefineResult(raw: string): SkillDraftRefineResult {
  const jsonText = raw
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/```\s*$/, '')
    .trim()

  let parsed: unknown
  try {
    parsed = JSON.parse(jsonText)
  } catch {
    throw new Error('AIの応答を解析できませんでした。もう一度お試しください。')
  }

  if (
    typeof parsed !== 'object' ||
    parsed === null ||
    typeof (parsed as Record<string, unknown>).reply !== 'string' ||
    typeof (parsed as Record<string, unknown>).name !== 'string' ||
    typeof (parsed as Record<string, unknown>).description !== 'string' ||
    typeof (parsed as Record<string, unknown>).systemPromptTemplate !== 'string'
  ) {
    throw new Error('AIの応答を解析できませんでした。もう一度お試しください。')
  }

  const result = parsed as SkillDraft & { reply: string }
  return {
    reply: result.reply.trim(),
    draft: {
      name: result.name.trim(),
      description: result.description.trim(),
      systemPromptTemplate: result.systemPromptTemplate.trim()
    }
  }
}

export async function refineSkillDraft(
  request: SkillDraftRefineRequest
): Promise<SkillDraftRefineResult> {
  const { provider, apiKey, model } = resolveActiveProvider()

  const contextMessage: ChatMessage = {
    role: 'user',
    content: `現在のスキル定義:\n${JSON.stringify(request.currentDraft)}\n\n追加の指示:\n${request.instruction}`
  }

  const replyText = await provider.generate({
    systemPrompt: SKILL_REFINE_SYSTEM_PROMPT,
    messages: [...request.history, contextMessage],
    model,
    apiKey
  })

  return parseSkillRefineResult(replyText)
}

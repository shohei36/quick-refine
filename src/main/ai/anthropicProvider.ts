import Anthropic from '@anthropic-ai/sdk'
import { AIProvider, GenerateOptions } from './types'

const MAX_TOKENS = 2048

export const anthropicProvider: AIProvider = {
  async generate({ systemPrompt, messages, model, apiKey }: GenerateOptions): Promise<string> {
    const client = new Anthropic({ apiKey })

    const response = await client.messages.create({
      model,
      max_tokens: MAX_TOKENS,
      system: systemPrompt,
      messages: messages.map((message) => ({ role: message.role, content: message.content }))
    })

    const textBlock = response.content.find((block) => block.type === 'text')
    if (!textBlock || textBlock.type !== 'text') {
      throw new Error('AIから有効なテキスト応答を取得できませんでした')
    }
    return textBlock.text
  }
}

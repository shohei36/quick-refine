import OpenAI from 'openai'
import { AIProvider, GenerateOptions } from './types'

export const openaiProvider: AIProvider = {
  async generate({ systemPrompt, messages, model, apiKey }: GenerateOptions): Promise<string> {
    const client = new OpenAI({ apiKey })

    const response = await client.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages.map((message) => ({ role: message.role, content: message.content }))
      ]
    })

    const content = response.choices[0]?.message?.content
    if (!content) {
      throw new Error('AIから有効なテキスト応答を取得できませんでした')
    }
    return content
  }
}

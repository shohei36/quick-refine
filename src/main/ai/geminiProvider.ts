import { GoogleGenAI } from '@google/genai'
import { AIProvider, GenerateOptions } from './types'

export const geminiProvider: AIProvider = {
  async generate({ systemPrompt, messages, model, apiKey }: GenerateOptions): Promise<string> {
    const client = new GoogleGenAI({ apiKey })

    const response = await client.models.generateContent({
      model,
      contents: messages.map((message) => ({
        role: message.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: message.content }]
      })),
      config: { systemInstruction: systemPrompt }
    })

    const text = response.text
    if (!text) {
      throw new Error('AIから有効なテキスト応答を取得できませんでした')
    }
    return text
  }
}

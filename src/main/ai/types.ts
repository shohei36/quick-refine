import { ChatMessage } from '../../shared/types'

export interface GenerateOptions {
  systemPrompt: string
  messages: ChatMessage[]
  model: string
  apiKey: string
}

export interface AIProvider {
  generate(options: GenerateOptions): Promise<string>
}

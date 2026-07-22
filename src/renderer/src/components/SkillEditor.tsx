import { useState } from 'react'
import type { ChatMessage, Skill, SkillInput } from '../../../shared/types'
import ChatPanel from './ChatPanel'

interface SkillEditorProps {
  initialValue?: Skill
  onSubmit: (input: SkillInput) => Promise<void>
  onCancel: () => void
}

function SkillEditor({ initialValue, onSubmit, onCancel }: SkillEditorProps): React.JSX.Element {
  const [name, setName] = useState(initialValue?.name ?? '')
  const [description, setDescription] = useState(initialValue?.description ?? '')
  const [systemPromptTemplate, setSystemPromptTemplate] = useState(
    initialValue?.systemPromptTemplate ?? ''
  )
  const [isSaving, setIsSaving] = useState(false)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [chatInput, setChatInput] = useState('')
  const [hasDraft, setHasDraft] = useState(Boolean(initialValue))
  const [isChatting, setIsChatting] = useState(false)
  const [aiError, setAiError] = useState<string | null>(null)

  async function handleSendChat(): Promise<void> {
    const instruction = chatInput.trim()
    if (!instruction || isChatting) return
    setIsChatting(true)
    setAiError(null)
    const userMessage: ChatMessage = { role: 'user', content: instruction }
    try {
      if (!hasDraft) {
        const draft = await window.api.ai.generateSkillDraft({ prompt: instruction })
        setName(draft.name)
        setDescription(draft.description)
        setSystemPromptTemplate(draft.systemPromptTemplate)
        const assistantMessage: ChatMessage = {
          role: 'assistant',
          content: '下書きを作成しました。内容を確認し、続けて修正の指示も出せます。'
        }
        setChatMessages((prev) => [...prev, userMessage, assistantMessage])
        setHasDraft(true)
      } else {
        const result = await window.api.ai.refineSkillDraft({
          currentDraft: { name, description, systemPromptTemplate },
          history: chatMessages,
          instruction
        })
        setName(result.draft.name)
        setDescription(result.draft.description)
        setSystemPromptTemplate(result.draft.systemPromptTemplate)
        const assistantMessage: ChatMessage = { role: 'assistant', content: result.reply }
        setChatMessages((prev) => [...prev, userMessage, assistantMessage])
      }
      setChatInput('')
    } catch (err) {
      setAiError(err instanceof Error ? err.message : String(err))
    } finally {
      setIsChatting(false)
    }
  }

  async function handleSubmit(event: React.FormEvent): Promise<void> {
    event.preventDefault()
    if (!name.trim() || !systemPromptTemplate.trim()) return
    setIsSaving(true)
    try {
      await onSubmit({ name: name.trim(), description: description.trim(), systemPromptTemplate })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <form className="skill-editor" onSubmit={handleSubmit}>
      <div className="skill-editor__ai-draft">
        <label>{hasDraft ? 'AIと対話して修正' : 'AIに下書きを作ってもらう'}</label>
        <ChatPanel
          messages={chatMessages}
          value={chatInput}
          onChange={setChatInput}
          onSend={handleSendChat}
          disabled={isChatting}
        />
        {aiError && <p className="error-text">{aiError}</p>}
      </div>
      <div className="field-row field-row--column">
        <label>スキル名</label>
        <input
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
          required
        />
      </div>
      <div className="field-row field-row--column">
        <label>説明</label>
        <input
          type="text"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
        />
      </div>
      <div className="field-row field-row--column">
        <label>指示内容(システムプロンプト)</label>
        <textarea
          rows={8}
          value={systemPromptTemplate}
          onChange={(event) => setSystemPromptTemplate(event.target.value)}
          placeholder="例: あなたは...のアシスタントです。ユーザーが入力した内容をもとに..."
          required
        />
      </div>
      <div className="skill-editor__actions">
        <button type="submit" className="btn btn--primary" disabled={isSaving}>
          保存
        </button>
        <button type="button" className="btn" onClick={onCancel}>
          キャンセル
        </button>
      </div>
    </form>
  )
}

export default SkillEditor

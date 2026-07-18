import { useState } from 'react'
import type { Skill, SkillInput } from '../../../shared/types'

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

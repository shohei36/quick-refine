import { useState } from 'react'
import type { Skill, SkillInput } from '../../../shared/types'
import SkillEditor from '../components/SkillEditor'

interface SkillManagerViewProps {
  skills: Skill[]
  onBack: () => void
  onSkillsChanged: () => Promise<void>
}

function SkillManagerView({
  skills,
  onBack,
  onSkillsChanged
}: SkillManagerViewProps): React.JSX.Element {
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null)
  const [isCreating, setIsCreating] = useState(false)

  async function handleCreate(input: SkillInput): Promise<void> {
    await window.api.skills.create(input)
    setIsCreating(false)
    await onSkillsChanged()
  }

  async function handleUpdate(id: string, input: SkillInput): Promise<void> {
    await window.api.skills.update(id, input)
    setEditingSkill(null)
    await onSkillsChanged()
  }

  async function handleDelete(id: string): Promise<void> {
    await window.api.skills.delete(id)
    await onSkillsChanged()
  }

  if (isCreating) {
    return (
      <div className="view">
        <header className="view-header">
          <button
            type="button"
            className="icon-btn"
            onClick={() => setIsCreating(false)}
            aria-label="戻る"
          >
            ←
          </button>
          <h1>新規スキル</h1>
          <span />
        </header>
        <SkillEditor onSubmit={handleCreate} onCancel={() => setIsCreating(false)} />
      </div>
    )
  }

  if (editingSkill) {
    return (
      <div className="view">
        <header className="view-header">
          <button
            type="button"
            className="icon-btn"
            onClick={() => setEditingSkill(null)}
            aria-label="戻る"
          >
            ←
          </button>
          <h1>スキルを編集</h1>
          <span />
        </header>
        <SkillEditor
          initialValue={editingSkill}
          onSubmit={(input) => handleUpdate(editingSkill.id, input)}
          onCancel={() => setEditingSkill(null)}
        />
      </div>
    )
  }

  return (
    <div className="view">
      <header className="view-header">
        <button type="button" className="icon-btn" onClick={onBack} aria-label="戻る">
          ←
        </button>
        <h1>スキル管理</h1>
        <span />
      </header>

      <ul className="skill-list">
        {skills.map((skill) => (
          <li key={skill.id} className="skill-list__item">
            <div>
              <p className="skill-list__name">
                {skill.name}
                {skill.isPreset && <span className="badge">プリセット</span>}
              </p>
              <p className="skill-list__description">{skill.description}</p>
            </div>
            {!skill.isPreset && (
              <div className="skill-list__actions">
                <button type="button" className="btn" onClick={() => setEditingSkill(skill)}>
                  編集
                </button>
                <button
                  type="button"
                  className="btn btn--danger"
                  onClick={() => handleDelete(skill.id)}
                >
                  削除
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>

      <button
        type="button"
        className="btn btn--primary btn--block"
        onClick={() => setIsCreating(true)}
      >
        + 新規スキルを作成
      </button>
    </div>
  )
}

export default SkillManagerView

import { useState } from 'react'
import type { AIProviderId, AppSettings, ChatMessage, Skill } from '../../../shared/types'
import { PROVIDER_LABELS, getModelOptions } from '../../../shared/types'
import ChatPanel from '../components/ChatPanel'

interface PopupViewProps {
  settings: AppSettings
  skills: Skill[]
  onOpenSettings: () => void
  onOpenSkills: () => void
  onSettingsChanged: () => Promise<void>
}

const PROVIDERS: AIProviderId[] = ['anthropic', 'openai', 'gemini']

function PopupView({
  settings,
  skills,
  onOpenSettings,
  onOpenSkills,
  onSettingsChanged
}: PopupViewProps): React.JSX.Element {
  const [skillId, setSkillId] = useState(settings.lastSkillId ?? skills[0]?.id ?? '')
  const [input, setInput] = useState('')
  const [history, setHistory] = useState<ChatMessage[]>([])
  const [draft, setDraft] = useState<string | null>(null)
  const [showChat, setShowChat] = useState(false)
  const [chatInput, setChatInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [showQuickSettings, setShowQuickSettings] = useState(false)

  const currentSkillName = skills.find((skill) => skill.id === skillId)?.name ?? 'スキル未選択'
  const currentModel = settings.models[settings.activeProvider]

  async function handleGenerate(): Promise<void> {
    if (!skillId || !input.trim() || isLoading) return
    setIsLoading(true)
    setError(null)
    try {
      const result = await window.api.ai.generate({ skillId, input, history: [] })
      setHistory(result.history)
      setDraft(result.message.content)
      setShowChat(false)
      if (skillId !== settings.lastSkillId) {
        await window.api.settings.update({ lastSkillId: skillId })
        await onSettingsChanged()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setIsLoading(false)
    }
  }

  async function handleSendChat(): Promise<void> {
    if (!chatInput.trim() || isLoading) return
    setIsLoading(true)
    setError(null)
    try {
      const result = await window.api.ai.generate({ skillId, input: chatInput, history })
      setHistory(result.history)
      setDraft(result.message.content)
      setChatInput('')
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setIsLoading(false)
    }
  }

  async function handleCopy(): Promise<void> {
    if (!draft) return
    await navigator.clipboard.writeText(draft)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  function handleReset(): void {
    setInput('')
    setHistory([])
    setDraft(null)
    setShowChat(false)
    setChatInput('')
    setError(null)
  }

  function handleHide(): void {
    window.api.window.hide()
  }

  async function handleProviderChange(provider: AIProviderId): Promise<void> {
    await window.api.settings.update({ activeProvider: provider })
    await onSettingsChanged()
  }

  async function handleModelChange(model: string): Promise<void> {
    const nextModels = { ...settings.models, [settings.activeProvider]: model }
    await window.api.settings.update({ models: nextModels })
    await onSettingsChanged()
  }

  return (
    <div className="view popup-view">
      <header className="view-header drag-region">
        <h1>Quick Refine</h1>
        <div className="view-header__actions no-drag">
          <button
            type="button"
            className="icon-btn"
            onClick={onOpenSkills}
            aria-label="スキル管理"
            title="スキル管理"
          >
            🗂
          </button>
          <button
            type="button"
            className="icon-btn"
            onClick={onOpenSettings}
            aria-label="設定"
            title="設定"
          >
            ⚙
          </button>
          <button
            type="button"
            className="icon-btn"
            onClick={handleHide}
            aria-label="閉じる"
            title="閉じる"
          >
            ×
          </button>
        </div>
      </header>

      <div className="popup-body">
        <div className="quick-settings">
          <button
            type="button"
            className="quick-settings__toggle"
            onClick={() => setShowQuickSettings((prev) => !prev)}
          >
            <span className="quick-settings__summary">
              AI: {PROVIDER_LABELS[settings.activeProvider]} / モデル: {currentModel} / スキル:{' '}
              {currentSkillName}
            </span>
            <span className="quick-settings__caret">{showQuickSettings ? '▲' : '▼'}</span>
          </button>

          {showQuickSettings && (
            <div className="quick-settings__body">
              <div className="field-row field-row--column">
                <label>使用するAI</label>
                <select
                  value={settings.activeProvider}
                  onChange={(event) => handleProviderChange(event.target.value as AIProviderId)}
                >
                  {PROVIDERS.map((provider) => (
                    <option key={provider} value={provider}>
                      {PROVIDER_LABELS[provider]}
                    </option>
                  ))}
                </select>
              </div>

              <div className="field-row field-row--column">
                <label>モデル</label>
                <select
                  value={currentModel}
                  onChange={(event) => handleModelChange(event.target.value)}
                >
                  {getModelOptions(settings.activeProvider, currentModel).map((model) => (
                    <option key={model} value={model}>
                      {model}
                    </option>
                  ))}
                </select>
              </div>

              <div className="field-row field-row--column">
                <label>スキル</label>
                <select value={skillId} onChange={(event) => setSkillId(event.target.value)}>
                  {skills.map((skill) => (
                    <option key={skill.id} value={skill.id}>
                      {skill.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        {!draft && (
          <>
            <textarea
              className="main-input"
              rows={6}
              placeholder="文章のもとになる内容を入力してください"
              value={input}
              onChange={(event) => setInput(event.target.value)}
            />
            <button
              type="button"
              className="btn btn--primary btn--block"
              onClick={handleGenerate}
              disabled={isLoading || !input.trim()}
            >
              {isLoading ? '生成中...' : '生成'}
            </button>
          </>
        )}

        {draft && (
          <div className={`result-area${showChat ? ' result-area--chat-open' : ''}`}>
            <div className="result-area__header">
              <span>生成結果</span>
              <div className="result-area__actions">
                <button
                  type="button"
                  className="icon-btn"
                  onClick={handleCopy}
                  aria-label="コピー"
                  title="コピー"
                >
                  {copied ? '✓' : '📋'}
                </button>
                <button type="button" className="btn" onClick={handleReset}>
                  新規作成
                </button>
              </div>
            </div>
            <p className="result-area__text">{draft}</p>

            <button
              type="button"
              className="btn btn--block"
              onClick={() => setShowChat((prev) => !prev)}
            >
              {showChat ? '対話を閉じる' : '対話して修正'}
            </button>

            {showChat && (
              <ChatPanel
                messages={history}
                value={chatInput}
                onChange={setChatInput}
                onSend={handleSendChat}
                disabled={isLoading}
              />
            )}
          </div>
        )}

        {error && <p className="error-text">{error}</p>}
      </div>
    </div>
  )
}

export default PopupView

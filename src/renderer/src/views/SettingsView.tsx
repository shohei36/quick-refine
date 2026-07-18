import { useEffect, useState } from 'react'
import type { AIProviderId, ApiKeyStatus, AppSettings } from '../../../shared/types'
import { PROVIDER_LABELS } from '../../../shared/types'
import ShortcutRecorder from '../components/ShortcutRecorder'

interface SettingsViewProps {
  settings: AppSettings
  onBack: () => void
  onSettingsChanged: () => Promise<void>
}

const PROVIDERS: AIProviderId[] = ['anthropic', 'openai', 'gemini']

function SettingsView({
  settings,
  onBack,
  onSettingsChanged
}: SettingsViewProps): React.JSX.Element {
  const [apiKeyStatus, setApiKeyStatus] = useState<ApiKeyStatus>({
    anthropic: false,
    openai: false,
    gemini: false
  })
  const [apiKeyInputs, setApiKeyInputs] = useState<Record<AIProviderId, string>>({
    anthropic: '',
    openai: '',
    gemini: ''
  })
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    window.api.apiKeys.status().then(setApiKeyStatus)
  }, [])

  async function handleSaveApiKey(provider: AIProviderId): Promise<void> {
    const value = apiKeyInputs[provider].trim()
    if (!value) return
    const status = await window.api.apiKeys.set(provider, value)
    setApiKeyStatus(status)
    setApiKeyInputs((prev) => ({ ...prev, [provider]: '' }))
    setMessage(`${PROVIDER_LABELS[provider]}のAPIキーを保存しました`)
  }

  async function handleRemoveApiKey(provider: AIProviderId): Promise<void> {
    const status = await window.api.apiKeys.remove(provider)
    setApiKeyStatus(status)
    setMessage(`${PROVIDER_LABELS[provider]}のAPIキーを削除しました`)
  }

  async function handleShortcutSave(accelerator: string): Promise<boolean> {
    const success = await window.api.shortcut.update(accelerator)
    if (success) await onSettingsChanged()
    return success
  }

  return (
    <div className="view settings-view">
      <header className="view-header">
        <button type="button" className="icon-btn" onClick={onBack} aria-label="戻る">
          ←
        </button>
        <h1>設定</h1>
        <span />
      </header>

      <p className="field-hint">
        使用するAI・モデルはメイン画面で選択すると自動的に記憶されます。ここではAPIキーの登録のみを行います。
      </p>

      {PROVIDERS.map((provider) => {
        const isActive = settings.activeProvider === provider
        return (
          <section
            className={`settings-section${isActive ? ' settings-section--active' : ''}`}
            key={provider}
          >
            <h2>
              {PROVIDER_LABELS[provider]}
              {isActive && <span className="badge badge--active">使用中</span>}
              {apiKeyStatus[provider] && <span className="badge badge--ok">登録済み</span>}
            </h2>
            <div className="field-row">
              <input
                type="password"
                placeholder={
                  apiKeyStatus[provider] ? '設定済み(変更する場合のみ入力)' : 'APIキーを入力'
                }
                value={apiKeyInputs[provider]}
                onChange={(event) =>
                  setApiKeyInputs((prev) => ({ ...prev, [provider]: event.target.value }))
                }
              />
              <button type="button" className="btn" onClick={() => handleSaveApiKey(provider)}>
                保存
              </button>
              {apiKeyStatus[provider] && (
                <button
                  type="button"
                  className="btn btn--danger"
                  onClick={() => handleRemoveApiKey(provider)}
                >
                  削除
                </button>
              )}
            </div>
          </section>
        )
      })}

      <section className="settings-section">
        <h2>表示 / 非表示ショートカット</h2>
        <p className="field-hint">ポップアップの表示にも、閉じる操作にも同じキーを使います</p>
        <ShortcutRecorder value={settings.shortcut} onSave={handleShortcutSave} />
      </section>

      {message && <p className="status-text">{message}</p>}
    </div>
  )
}

export default SettingsView

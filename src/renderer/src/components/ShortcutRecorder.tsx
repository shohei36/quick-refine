import { useState } from 'react'

interface ShortcutRecorderProps {
  value: string
  onSave: (accelerator: string) => Promise<boolean>
}

function formatAccelerator(event: React.KeyboardEvent): string | null {
  const parts: string[] = []
  if (event.ctrlKey || event.metaKey) parts.push('CommandOrControl')
  if (event.altKey) parts.push('Alt')
  if (event.shiftKey) parts.push('Shift')

  const key = event.key
  if (['Control', 'Meta', 'Alt', 'Shift'].includes(key)) return null

  const keyName = key === ' ' ? 'Space' : key.length === 1 ? key.toUpperCase() : key
  parts.push(keyName)
  return parts.join('+')
}

function ShortcutRecorder({ value, onSave }: ShortcutRecorderProps): React.JSX.Element {
  const [recording, setRecording] = useState(false)
  const [pending, setPending] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>): void {
    event.preventDefault()
    const accelerator = formatAccelerator(event)
    if (accelerator) {
      setPending(accelerator)
    }
  }

  async function handleConfirm(): Promise<void> {
    if (!pending) return
    const success = await onSave(pending)
    if (success) {
      setRecording(false)
      setPending(null)
      setErrorMessage(null)
    } else {
      setErrorMessage(
        'このショートカットは登録できませんでした(他のアプリと競合している可能性があります)'
      )
    }
  }

  function handleCancel(): void {
    setRecording(false)
    setPending(null)
    setErrorMessage(null)
  }

  if (!recording) {
    return (
      <div className="shortcut-recorder">
        <span className="shortcut-recorder__value">{value}</span>
        <button type="button" className="btn" onClick={() => setRecording(true)}>
          変更
        </button>
      </div>
    )
  }

  return (
    <div className="shortcut-recorder-wrap">
      <div className="shortcut-recorder">
        <div
          className="shortcut-recorder__capture"
          tabIndex={0}
          onKeyDown={handleKeyDown}
          ref={(node) => node?.focus()}
        >
          {pending ?? 'キーを押してください...'}
        </div>
        <button
          type="button"
          className="btn btn--primary"
          onClick={handleConfirm}
          disabled={!pending}
        >
          保存
        </button>
        <button type="button" className="btn" onClick={handleCancel}>
          キャンセル
        </button>
      </div>
      {errorMessage && <p className="error-text">{errorMessage}</p>}
    </div>
  )
}

export default ShortcutRecorder

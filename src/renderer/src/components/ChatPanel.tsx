import type { ChatMessage } from '../../../shared/types'

interface ChatPanelProps {
  messages: ChatMessage[]
  value: string
  onChange: (value: string) => void
  onSend: () => void
  disabled: boolean
}

function ChatPanel({
  messages,
  value,
  onChange,
  onSend,
  disabled
}: ChatPanelProps): React.JSX.Element {
  function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>): void {
    if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
      event.preventDefault()
      onSend()
    }
  }

  return (
    <div className="chat-panel">
      <div className="chat-messages">
        {messages.map((message, index) => (
          <div key={index} className={`chat-message chat-message--${message.role}`}>
            <span className="chat-message__role">{message.role === 'user' ? 'あなた' : 'AI'}</span>
            <p>{message.content}</p>
          </div>
        ))}
      </div>
      <div className="chat-input-row">
        <textarea
          className="chat-input"
          placeholder="修正指示を入力 (例: もっとカジュアルに)"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          rows={2}
        />
        <button
          type="button"
          className="btn btn--primary"
          onClick={onSend}
          disabled={disabled || !value.trim()}
        >
          送信
        </button>
      </div>
    </div>
  )
}

export default ChatPanel

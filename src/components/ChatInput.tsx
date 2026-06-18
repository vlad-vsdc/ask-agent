import { FormEvent, KeyboardEvent, useState } from 'react'
import { SendHorizonal } from 'lucide-react'

interface ChatInputProps {
  onSend: (value: string) => void
  disabled?: boolean
}

export const ChatInput = ({ onSend, disabled }: ChatInputProps) => {
  const [value, setValue] = useState('')

  const submit = (event?: FormEvent) => {
    event?.preventDefault()
    const trimmed = value.trim()

    if (!trimmed || disabled) {
      return
    }

    onSend(trimmed)
    setValue('')
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      submit()
    }
  }

  return (
    <form onSubmit={submit} className="border-t border-border bg-base/90 p-4 backdrop-blur">
      <div className="flex items-end gap-3 rounded-lg border border-border bg-panel p-2 focus-within:border-accent/70">
        <textarea
          value={value}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          rows={1}
          placeholder="Ask about weather, a calculation, or a fact..."
          className="max-h-40 min-h-11 flex-1 resize-none bg-transparent px-3 py-3 text-sm leading-6 text-slate-100 outline-none placeholder:text-slate-500"
        />
        <button
          type="submit"
          disabled={disabled || !value.trim()}
          className="grid h-11 w-11 shrink-0 place-items-center rounded-md bg-accent text-white transition hover:bg-accentSoft disabled:cursor-not-allowed disabled:opacity-45"
          aria-label="Send"
          title="Send"
        >
          <SendHorizonal className="h-5 w-5" />
        </button>
      </div>
    </form>
  )
}

import { useEffect, useRef } from 'react'
import type { ChatMessage } from '../types/index'
import { ChatInput } from './ChatInput'
import { MessageBubble } from './MessageBubble'

interface ChatWindowProps {
  messages: ChatMessage[]
  onSend: (value: string) => void
  isRunning: boolean
}

const suggestions = [
  'What is the weather in Berlin?',
  'What is 247 multiplied by 38?',
  'Tell me about Model Context Protocol',
]

export const ChatWindow = ({ messages, onSend, isRunning }: ChatWindowProps) => {
  const bottomRef = useRef<HTMLDivElement | null>(null)
  const hasUserMessages = messages.some((message) => message.role === 'user')

  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    bottomRef.current?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'end' })
  }, [messages])

  return (
    <section className="flex min-h-[calc(100vh-2rem)] flex-col overflow-hidden rounded-lg border border-border bg-base/75 shadow-glow backdrop-blur">
      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        <div className="mx-auto flex max-w-3xl flex-col gap-5">
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}

          {!hasUserMessages ? (
            <div className="grid gap-2 rounded-lg border border-dashed border-border bg-panel/70 p-4">
              <p className="text-sm text-slate-400">Try one of these examples:</p>
              <div className="flex flex-wrap gap-2">
                {suggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => onSend(suggestion)}
                    disabled={isRunning}
                    className="rounded-md border border-border bg-elevated px-3 py-2 text-sm text-slate-200 transition hover:border-accent/60 disabled:opacity-50"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          ) : null}
          <div ref={bottomRef} />
        </div>
      </div>

      <ChatInput onSend={onSend} disabled={isRunning} />
    </section>
  )
}

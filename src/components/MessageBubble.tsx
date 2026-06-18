import { Bot, UserRound } from 'lucide-react'
import type { ChatMessage } from '../types/index'
import { ToolCallCard } from './ToolCallCard'

interface MessageBubbleProps {
  message: ChatMessage
}

export const MessageBubble = ({ message }: MessageBubbleProps) => {
  const isUser = message.role === 'user'

  return (
    <article className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser ? (
        <span className="mt-1 grid h-8 w-8 shrink-0 place-items-center rounded-md bg-elevated text-accentSoft">
          <Bot className="h-4 w-4" />
        </span>
      ) : null}

      <div className={`max-w-[min(42rem,100%)] space-y-3 ${isUser ? 'items-end' : ''}`}>
        {message.toolCalls?.map((call) => <ToolCallCard key={call.id} call={call} />)}

        {message.content ? (
          <div
            className={`rounded-lg px-4 py-3 text-sm leading-7 ${
              isUser
                ? 'bg-accent text-white'
                : 'border border-border bg-panel text-slate-100 shadow-[0_12px_30px_rgb(0_0_0/0.18)]'
            }`}
          >
            {message.content}
            {message.isStreaming ? (
              <span className="ml-1 inline-block h-2 w-2 animate-softPulse rounded-full bg-accentSoft" />
            ) : null}
          </div>
        ) : message.isStreaming ? (
          <div className="rounded-lg border border-border bg-panel px-4 py-3 text-sm text-slate-400">
            Preparing an answer...
          </div>
        ) : null}
      </div>

      {isUser ? (
        <span className="mt-1 grid h-8 w-8 shrink-0 place-items-center rounded-md bg-accent text-white">
          <UserRound className="h-4 w-4" />
        </span>
      ) : null}
    </article>
  )
}

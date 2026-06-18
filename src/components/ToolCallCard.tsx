import { useState } from 'react'
import { Calculator, CheckCircle2, ChevronDown, CloudSun, Loader2, XCircle } from 'lucide-react'
import { toolLabels } from '../services/tools/index'
import type { ToolCall, ToolName } from '../types/index'

interface ToolCallCardProps {
  call: ToolCall
}

const ToolIcon = ({ name }: { name: ToolName }) => {
  if (name === 'get_weather') {
    return <CloudSun className="h-4 w-4" />
  }

  if (name === 'calculate') {
    return <Calculator className="h-4 w-4" />
  }

  return <span className="text-sm font-bold">W</span>
}

const argLabels: Record<string, string> = {
  city: 'city',
  expression: 'expression',
  query: 'query',
}

const formatArgs = (args: Record<string, string>) =>
  Object.entries(args)
    .map(([key, value]) => `${argLabels[key] ?? key}: ${value}`)
    .join(', ')

export const ToolCallCard = ({ call }: ToolCallCardProps) => {
  const [isOpen, setIsOpen] = useState(call.status !== 'calling')

  const statusNode =
    call.status === 'calling' ? (
      <Loader2 className="h-4 w-4 animate-spin text-accentSoft" />
    ) : call.status === 'success' ? (
      <CheckCircle2 className="h-4 w-4 text-success" />
    ) : (
      <XCircle className="h-4 w-4 text-danger" />
    )

  return (
    <section className="animate-fadeUp rounded-lg border border-accent/40 bg-accent/10 p-3 shadow-glow">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-accent text-white">
            <ToolIcon name={call.name} />
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-100">{toolLabels[call.name]}</p>
            <p className="truncate text-xs text-slate-400">{formatArgs(call.args)}</p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {call.durationMs ? (
            <span className="text-xs text-slate-400">{call.durationMs} ms</span>
          ) : null}
          {statusNode}
        </div>
      </div>

      <button
        type="button"
        className="mt-3 flex w-full items-center justify-between rounded-md border border-white/10 bg-black/20 px-3 py-2 text-left text-xs text-slate-300 transition hover:border-accent/50"
        onClick={() => setIsOpen((current) => !current)}
      >
        <span>{call.status === 'calling' ? 'Tool is running' : 'Tool result'}</span>
        <ChevronDown className={`h-4 w-4 transition ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen ? (
        <div className="mt-2 rounded-md bg-black/30 p-3 text-sm leading-6 text-slate-200">
          {call.result ?? 'Waiting for the tool result...'}
        </div>
      ) : null}
    </section>
  )
}

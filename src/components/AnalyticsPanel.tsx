import { useEffect, useState } from 'react'
import { Activity, BadgeCheck, ChevronDown, Clock3 } from 'lucide-react'
import { toolLabels } from '../services/tools/index'
import type { ToolAnalyticsEntry, ToolCall, ToolName } from '../types/index'

interface AnalyticsPanelProps {
  entries: ToolAnalyticsEntry[]
  totalCalls: number
  mostUsedTool: ToolName | null
  recentHistory: ToolCall[]
}

const statusIcon = (status: ToolCall['status']) => {
  if (status === 'success') {
    return '✓'
  }

  if (status === 'error') {
    return '×'
  }

  return '…'
}

export const AnalyticsPanel = ({
  entries,
  totalCalls,
  mostUsedTool,
  recentHistory,
}: AnalyticsPanelProps) => {
  const [historyOpen, setHistoryOpen] = useState(false)
  const [flash, setFlash] = useState(false)

  useEffect(() => {
    if (totalCalls === 0) {
      return
    }

    setFlash(true)
    const timeout = window.setTimeout(() => setFlash(false), 720)
    return () => window.clearTimeout(timeout)
  }, [totalCalls])

  const maxCalls = Math.max(1, ...entries.map((entry) => entry.callCount))

  return (
    <section
      className={`rounded-lg border border-border bg-panel p-4 ${flash ? 'animate-updateFlash' : ''}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Analytics</p>
          <h2 className="mt-2 text-3xl font-semibold text-white">{totalCalls}</h2>
          <p className="text-sm text-slate-400">Total calls</p>
        </div>
        <span className="grid h-10 w-10 place-items-center rounded-md bg-accent/15 text-accentSoft">
          <Activity className="h-5 w-5" />
        </span>
      </div>

      {totalCalls === 0 ? (
        <p className="mt-5 rounded-md border border-dashed border-border p-3 text-sm leading-6 text-slate-400">
          No data yet. Ask a question so the agent can start using tools.
        </p>
      ) : (
        <>
          <div className="mt-5 space-y-3">
            {entries.map((entry) => {
              const width =
                entry.callCount === 0 ? '0%' : `${Math.max(5, (entry.callCount / maxCalls) * 100)}%`

              return (
                <div key={entry.toolName}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="text-slate-200">{toolLabels[entry.toolName]}</span>
                    <span className="text-slate-400">{entry.callCount}</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/5">
                    <div className="h-2 rounded-full bg-accent" style={{ width }} />
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    Success: {entry.successCount} · Errors: {entry.errorCount} · Average:{' '}
                    {entry.avgDurationMs} ms
                  </p>
                </div>
              )
            })}
          </div>

          {mostUsedTool ? (
            <div className="mt-5 flex items-center gap-2 rounded-md border border-accent/30 bg-accent/10 px-3 py-2 text-sm text-slate-200">
              <BadgeCheck className="h-4 w-4 text-accentSoft" />
              Most used tool: {toolLabels[mostUsedTool]}
            </div>
          ) : null}

          <button
            type="button"
            onClick={() => setHistoryOpen((current) => !current)}
            className="mt-4 flex w-full items-center justify-between rounded-md border border-border px-3 py-2 text-sm text-slate-300 transition hover:border-accent/50"
          >
            <span className="flex items-center gap-2">
              <Clock3 className="h-4 w-4" />
              Call history
            </span>
            <ChevronDown className={`h-4 w-4 transition ${historyOpen ? 'rotate-180' : ''}`} />
          </button>

          {historyOpen ? (
            <div className="mt-3 space-y-2">
              {recentHistory.map((call) => (
                <div
                  key={call.id}
                  className="flex items-center justify-between gap-3 rounded-md bg-black/20 px-3 py-2 text-xs"
                >
                  <span className="min-w-0 truncate text-slate-300">
                    {statusIcon(call.status)} {toolLabels[call.name]}
                  </span>
                  <span className="shrink-0 text-slate-500">
                    {new Date(call.timestamp).toLocaleTimeString('ru-RU', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}{' '}
                    · {call.durationMs ?? 0} ms
                  </span>
                </div>
              ))}
            </div>
          ) : null}
        </>
      )}
    </section>
  )
}

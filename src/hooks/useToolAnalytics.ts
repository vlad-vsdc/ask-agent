import { useMemo, useState } from 'react'
import type { ToolAnalyticsEntry, ToolCall, ToolName } from '../types/index'

const allTools: ToolName[] = ['get_weather', 'calculate', 'search_wikipedia']

export const useToolAnalytics = () => {
  const [history, setHistory] = useState<ToolCall[]>([])

  const recordCall = (call: ToolCall): void => {
    setHistory((current) => [call, ...current])
  }

  const entries = useMemo<ToolAnalyticsEntry[]>(() => {
    return allTools.map((toolName) => {
      const calls = history.filter((call) => call.name === toolName)
      const totalDuration = calls.reduce((sum, call) => sum + (call.durationMs ?? 0), 0)

      return {
        toolName,
        callCount: calls.length,
        successCount: calls.filter((call) => call.status === 'success').length,
        errorCount: calls.filter((call) => call.status === 'error').length,
        avgDurationMs: calls.length ? Math.round(totalDuration / calls.length) : 0,
        lastUsedAt: calls[0]?.timestamp,
      }
    })
  }, [history])

  const totalCalls = history.length
  const mostUsedTool =
    entries.reduce<ToolAnalyticsEntry | null>((leader, entry) => {
      if (entry.callCount === 0) {
        return leader
      }

      if (!leader || entry.callCount > leader.callCount) {
        return entry
      }

      return leader
    }, null)?.toolName ?? null

  return {
    recordCall,
    entries,
    totalCalls,
    mostUsedTool,
    recentHistory: history.slice(0, 10),
  }
}

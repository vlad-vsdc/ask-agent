import { Calculator, CloudSun, Search } from 'lucide-react'
import { toolDescriptions, toolLabels } from '../services/tools/index'
import type { ToolName } from '../types/index'
import { AnalyticsPanel } from './AnalyticsPanel'
import type { ToolAnalyticsEntry, ToolCall } from '../types/index'

interface ToolStatusGridProps {
  usedToolNames: Set<ToolName>
  entries: ToolAnalyticsEntry[]
  totalCalls: number
  mostUsedTool: ToolName | null
  recentHistory: ToolCall[]
}

const tools: Array<{ name: ToolName; icon: JSX.Element }> = [
  { name: 'get_weather', icon: <CloudSun className="h-5 w-5" /> },
  { name: 'calculate', icon: <Calculator className="h-5 w-5" /> },
  { name: 'search_wikipedia', icon: <Search className="h-5 w-5" /> },
]

export const ToolStatusGrid = ({
  usedToolNames,
  entries,
  totalCalls,
  mostUsedTool,
  recentHistory,
}: ToolStatusGridProps) => {
  return (
    <aside className="grid content-start gap-3 lg:sticky lg:top-4">
      <AnalyticsPanel
        entries={entries}
        totalCalls={totalCalls}
        mostUsedTool={mostUsedTool}
        recentHistory={recentHistory}
      />

      <div className="grid grid-cols-2 gap-3">
        {tools.map((tool, index) => {
          const used = usedToolNames.has(tool.name)

          return (
            <section
              key={tool.name}
              className={`rounded-lg border p-4 ${
                index === 2 ? 'col-span-2' : ''
              } ${
                used
                  ? 'border-accent/50 bg-accent/10 text-white'
                  : 'border-border bg-panel text-slate-200'
              }`}
            >
              <div className="mb-4 flex items-center justify-between">
                <span className="grid h-9 w-9 place-items-center rounded-md bg-elevated text-accentSoft">
                  {tool.icon}
                </span>
                <span
                  className={`h-2 w-2 rounded-full ${used ? 'bg-success' : 'bg-slate-600'}`}
                  title={used ? 'Used' : 'Ready'}
                />
              </div>
              <h3 className="text-sm font-semibold">{toolLabels[tool.name]}</h3>
              <p className="mt-1 text-xs leading-5 text-slate-400">{toolDescriptions[tool.name]}</p>
            </section>
          )
        })}
      </div>
    </aside>
  )
}

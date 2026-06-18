import { useState } from 'react'
import { KeyRound, Settings, X } from 'lucide-react'
import { ChatWindow } from './components/ChatWindow'
import { ToolStatusGrid } from './components/ToolStatusGrid'
import { useAgentChat } from './hooks/useAgentChat'
import { useToolAnalytics } from './hooks/useToolAnalytics'

const initialApiKey = import.meta.env.VITE_GEMINI_API_KEY ?? ''

function App() {
  const [apiKey, setApiKey] = useState(initialApiKey)
  const [draftApiKey, setDraftApiKey] = useState(initialApiKey)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [demoMode, setDemoMode] = useState(true)

  const analytics = useToolAnalytics()
  const chat = useAgentChat({
    apiKey,
    demoMode,
    recordCall: analytics.recordCall,
  })

  const saveSettings = () => {
    setApiKey(draftApiKey.trim())
    setSettingsOpen(false)
  }

  return (
    <main className="min-h-screen bg-base px-3 py-4 text-slate-100 sm:px-4">
      <div className="mx-auto grid max-w-7xl gap-4 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="space-y-4">
          <header className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-panel/80 px-4 py-3 backdrop-blur">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-accentSoft">Ask Agent</p>
              <h1 className="text-lg font-semibold text-white">
                AI assistant with real tool use
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <label className="flex cursor-pointer items-center gap-2 rounded-md border border-border px-3 py-2 text-sm text-slate-300">
                <input
                  type="checkbox"
                  checked={demoMode}
                  onChange={(event) => setDemoMode(event.target.checked)}
                  className="h-4 w-4 accent-accent"
                />
                Demo mode
              </label>
              <button
                type="button"
                onClick={() => setSettingsOpen(true)}
                className="grid h-10 w-10 place-items-center rounded-md border border-border bg-elevated text-slate-200 transition hover:border-accent/60"
                aria-label="Settings"
                title="Settings"
              >
                <Settings className="h-5 w-5" />
              </button>
            </div>
          </header>

          {chat.error ? (
            <div className="rounded-lg border border-danger/35 bg-danger/10 px-4 py-3 text-sm text-red-100">
              {chat.error}
            </div>
          ) : !chat.hasApiKey && !demoMode ? (
            <div className="rounded-lg border border-warning/35 bg-warning/10 px-4 py-3 text-sm text-amber-100">
              Add your Gemini API key in settings to get started
            </div>
          ) : null}

          <ChatWindow messages={chat.messages} onSend={chat.sendMessage} isRunning={chat.isRunning} />
        </div>

        <ToolStatusGrid
          usedToolNames={chat.usedToolNames}
          entries={analytics.entries}
          totalCalls={analytics.totalCalls}
          mostUsedTool={analytics.mostUsedTool}
          recentHistory={analytics.recentHistory}
        />
      </div>

      {settingsOpen ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4 backdrop-blur-sm">
          <section className="w-full max-w-md rounded-lg border border-border bg-panel p-5 shadow-glow">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-accentSoft">Settings</p>
                <h2 className="mt-1 text-lg font-semibold text-white">Gemini API key</h2>
              </div>
              <button
                type="button"
                onClick={() => setSettingsOpen(false)}
                className="grid h-9 w-9 place-items-center rounded-md border border-border text-slate-300 transition hover:border-accent/60"
                aria-label="Close"
                title="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <label className="grid gap-2 text-sm text-slate-300">
              The key is stored only in this tab's memory
              <div className="flex items-center gap-2 rounded-md border border-border bg-base px-3 py-2 focus-within:border-accent/70">
                <KeyRound className="h-4 w-4 text-slate-500" />
                <input
                  type="password"
                  value={draftApiKey}
                  onChange={(event) => setDraftApiKey(event.target.value)}
                  placeholder="Enter your Gemini API key"
                  className="min-w-0 flex-1 bg-transparent py-2 text-sm text-slate-100 outline-none placeholder:text-slate-500"
                />
              </div>
            </label>

            <a
              href="https://aistudio.google.com/apikey"
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-block text-sm text-accentSoft hover:text-white"
            >
              Get a key in Google AI Studio
            </a>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setSettingsOpen(false)}
                className="rounded-md border border-border px-4 py-2 text-sm text-slate-300 transition hover:border-accent/60"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveSettings}
                className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-white transition hover:bg-accentSoft"
              >
                Save
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </main>
  )
}

export default App

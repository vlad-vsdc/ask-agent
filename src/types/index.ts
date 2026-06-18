export type MessageRole = 'user' | 'assistant'

export type ToolName = 'get_weather' | 'calculate' | 'search_wikipedia'

export type ToolStatus = 'idle' | 'calling' | 'success' | 'error'

export interface ToolCall {
  id: string
  name: ToolName
  args: Record<string, string>
  result?: string
  status: ToolStatus
  timestamp: string
  durationMs?: number
}

export interface ChatMessage {
  id: string
  role: MessageRole
  content: string
  toolCalls?: ToolCall[]
  isStreaming?: boolean
}

export interface ToolAnalyticsEntry {
  toolName: ToolName
  callCount: number
  successCount: number
  errorCount: number
  avgDurationMs: number
  lastUsedAt?: string
}

export interface GeminiChatTurn {
  role: 'user' | 'model' | 'function'
  parts: Array<
    | { text: string }
    | { functionCall: { name: ToolName; args: Record<string, unknown> } }
    | { functionResponse: { name: ToolName; response: { result: string } } }
  >
}

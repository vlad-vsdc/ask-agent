import { useCallback, useMemo, useState } from 'react'
import { callGemini } from '../services/gemini.service'
import { createToolCall, executeToolCall } from '../services/tools/index'
import type { ChatMessage, GeminiChatTurn, ToolCall, ToolName } from '../types/index'

interface UseAgentChatOptions {
  apiKey: string
  demoMode: boolean
  recordCall: (call: ToolCall) => void
}

const initialAssistantMessage: ChatMessage = {
  id: crypto.randomUUID(),
  role: 'assistant',
  content:
    'Hi! I am Ask Agent. Ask me about weather, calculations, or factual topics, and I will show every tool call directly in the chat.',
}

const demoScripts: Record<
  ToolName,
  {
    match: RegExp
    args: Record<string, string>
    result: string
    answer: string
    durationMs: number
  }
> = {
  get_weather: {
    match: /weather|berlin|temperature/i,
    args: { city: 'Berlin' },
    result: 'Current weather in Berlin, Germany: 21 °C, partly cloudy, wind 11 km/h.',
    answer:
      'Berlin is around 21 °C right now with partly cloudy skies and a moderate 11 km/h wind. It sounds like a calm window for a walk.',
    durationMs: 420,
  },
  calculate: {
    match: /247|multiply|multiplied|calculate|how much|what is/i,
    args: { expression: '247 * 38' },
    result: 'Calculation result: 9386',
    answer: '247 multiplied by 38 is 9386.',
    durationMs: 34,
  },
  search_wikipedia: {
    match: /model context protocol|mcp|wikipedia|tell me|explain/i,
    args: { query: 'Model Context Protocol' },
    result:
      'Model Context Protocol: an open protocol that helps AI applications connect to external data sources and tools through a shared interface.',
    answer:
      'Model Context Protocol is a way to connect AI assistants to tools and data through a common interface. The idea is that a model should not work in isolation; it should safely access the context around the task.',
    durationMs: 610,
  },
}

const toGeminiHistory = (messages: ChatMessage[]): GeminiChatTurn[] =>
  messages
    .filter((message) => message.content.trim().length > 0)
    .map((message) => ({
      role: message.role === 'user' ? 'user' : 'model',
      parts: [{ text: message.content }],
    }))

const sleep = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms))

const pickDemoScript = (input: string) =>
  Object.entries(demoScripts).find(([, script]) => script.match.test(input)) ??
  (['search_wikipedia', demoScripts.search_wikipedia] as const)

export const useAgentChat = ({ apiKey, demoMode, recordCall }: UseAgentChatOptions) => {
  const [messages, setMessages] = useState<ChatMessage[]>([initialAssistantMessage])
  const [isRunning, setIsRunning] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const hasApiKey = apiKey.trim().length > 0

  const appendMessage = useCallback((message: ChatMessage) => {
    setMessages((current) => [...current, message])
  }, [])

  const updateAssistantMessage = useCallback((id: string, patch: Partial<ChatMessage>) => {
    setMessages((current) =>
      current.map((message) => (message.id === id ? { ...message, ...patch } : message)),
    )
  }, [])

  const runDemoConversation = useCallback(
    async (input: string) => {
      const [toolName, script] = pickDemoScript(input)
      const assistantId = crypto.randomUUID()
      const toolCall = createToolCall(toolName as ToolName, script.args)

      appendMessage({
        id: assistantId,
        role: 'assistant',
        content: '',
        toolCalls: [toolCall],
        isStreaming: true,
      })

      await sleep(650)

      const completedCall: ToolCall = {
        ...toolCall,
        status: 'success',
        result: script.result,
        durationMs: script.durationMs,
      }

      updateAssistantMessage(assistantId, {
        toolCalls: [completedCall],
      })
      recordCall(completedCall)

      await sleep(250)

      for (let index = 1; index <= script.answer.length; index += 4) {
        updateAssistantMessage(assistantId, {
          content: script.answer.slice(0, index),
          isStreaming: true,
        })
        await sleep(18)
      }

      updateAssistantMessage(assistantId, { content: script.answer, isStreaming: false })
    },
    [appendMessage, recordCall, updateAssistantMessage],
  )

  const runRealConversation = useCallback(
    async (history: ChatMessage[]) => {
      let geminiHistory = toGeminiHistory(history)
      let guard = 0

      while (guard < 5) {
        guard += 1
        const geminiResponse = await callGemini(apiKey.trim(), geminiHistory)

        if (geminiResponse.functionCalls.length === 0) {
          appendMessage({
            id: crypto.randomUUID(),
            role: 'assistant',
            content:
              geminiResponse.text.trim() ||
              'I received an empty response from Gemini. Try rephrasing the question.',
          })
          return
        }

        const assistantId = crypto.randomUUID()
        const initialToolCalls = geminiResponse.functionCalls.map(({ name, args }) =>
          createToolCall(name, args),
        )

        appendMessage({
          id: assistantId,
          role: 'assistant',
          content: '',
          toolCalls: initialToolCalls,
          isStreaming: true,
        })

        geminiHistory = [
          ...geminiHistory,
          {
            role: 'model',
            parts: geminiResponse.functionCalls.map(({ name, args }) => ({
              functionCall: { name, args },
            })),
          },
        ]

        const completedCalls: ToolCall[] = []

        for (const call of initialToolCalls) {
          const startedAt = performance.now()
          let result = ''
          let status: ToolCall['status'] = 'success'

          try {
            result = await executeToolCall(call.name, call.args)
          } catch (caughtError) {
            status = 'error'
            result =
              caughtError instanceof Error
                ? caughtError.message
                : 'The tool failed. I will continue the conversation with this result.'
          }

          const completedCall: ToolCall = {
            ...call,
            status,
            result,
            durationMs: Math.max(1, Math.round(performance.now() - startedAt)),
          }

          completedCalls.push(completedCall)
          recordCall(completedCall)
          updateAssistantMessage(assistantId, {
            toolCalls: completedCalls.concat(initialToolCalls.slice(completedCalls.length)),
          })
        }

        geminiHistory = [
          ...geminiHistory,
          ...completedCalls.map<GeminiChatTurn>((call) => ({
            role: 'function',
            parts: [
              {
                functionResponse: {
                  name: call.name,
                  response: { result: call.result ?? '' },
                },
              },
            ],
          })),
        ]

        updateAssistantMessage(assistantId, {
          toolCalls: completedCalls,
        })
      }

      appendMessage({
        id: crypto.randomUUID(),
        role: 'assistant',
        content: 'Я остановил цепочку инструментов, чтобы не зациклиться. Попробуйте задать вопрос точнее.',
        content: 'I stopped the tool chain to avoid a loop. Try asking a more specific question.',
      })
    },
    [apiKey, appendMessage, recordCall, updateAssistantMessage],
  )

  const sendMessage = useCallback(
    async (input: string) => {
      const trimmed = input.trim()

      if (!trimmed || isRunning) {
        return
      }

      setError(null)
      setIsRunning(true)

      const userMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'user',
        content: trimmed,
      }

      const nextHistory = [...messages, userMessage]
      appendMessage(userMessage)

      try {
        if (!hasApiKey) {
          if (!demoMode) {
            setError('Add your Gemini API key in settings to get started')
            return
          }

          await runDemoConversation(trimmed)
          return
        }

        await runRealConversation(nextHistory)
      } catch (caughtError) {
        const details = caughtError instanceof Error ? caughtError.message : ''
        const lowerDetails = details.toLowerCase()
        const isKeyError =
          lowerDetails.includes('api key') ||
          lowerDetails.includes('apikey') ||
          lowerDetails.includes('permission') ||
          lowerDetails.includes('unauthorized') ||
          lowerDetails.includes('forbidden')
        const isQuotaError =
          lowerDetails.includes('quota') ||
          lowerDetails.includes('rate limit') ||
          lowerDetails.includes('rate-limit') ||
          lowerDetails.includes('resource_exhausted')

        if (isQuotaError && demoMode) {
          setError('Gemini quota is exhausted. Demo mode is showing the same tool-use experience.')
          await runDemoConversation(trimmed)
          return
        }

        const message = isKeyError
          ? 'Gemini rejected the API key. Check it in settings.'
          : isQuotaError
            ? 'Gemini quota is exhausted for this key. Turn on demo mode to view the full tool-use experience.'
          : `Could not get a response from Gemini. ${details || 'Check the key, limits, or connection.'}`
        setError(message)
        appendMessage({
          id: crypto.randomUUID(),
          role: 'assistant',
          content: message,
        })
      } finally {
        setIsRunning(false)
      }
    },
    [
      appendMessage,
      demoMode,
      hasApiKey,
      isRunning,
      messages,
      runDemoConversation,
      runRealConversation,
    ],
  )

  const usedToolNames = useMemo(() => {
    const names = new Set<ToolName>()
    messages.forEach((message) =>
      message.toolCalls?.forEach((call) => {
        if (call.status === 'success') {
          names.add(call.name)
        }
      }),
    )
    return names
  }, [messages])

  return {
    messages,
    sendMessage,
    isRunning,
    error,
    usedToolNames,
    hasApiKey,
  }
}

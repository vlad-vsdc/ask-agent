import type { GeminiChatTurn, ToolName } from '../types/index'

interface GeminiFunctionDeclaration {
  name: ToolName
  description: string
  parameters: {
    type: 'object'
    properties: Record<string, { type: 'string'; description: string }>
    required: string[]
  }
}

interface GeminiGenerateResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string
        functionCall?: {
          name: ToolName
          args?: Record<string, unknown>
        }
      }>
    }
  }>
  error?: {
    message?: string
    status?: string
  }
}

export const geminiFunctionDeclarations: GeminiFunctionDeclaration[] = [
  {
    name: 'get_weather',
    description: 'Get current weather for a city',
    parameters: {
      type: 'object',
      properties: {
        city: {
          type: 'string',
          description: 'City name',
        },
      },
      required: ['city'],
    },
  },
  {
    name: 'calculate',
    description: 'Evaluate a math expression',
    parameters: {
      type: 'object',
      properties: {
        expression: {
          type: 'string',
          description: 'Math expression to evaluate',
        },
      },
      required: ['expression'],
    },
  },
  {
    name: 'search_wikipedia',
    description: 'Search Wikipedia for a topic and return a summary',
    parameters: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Topic to search',
        },
      },
      required: ['query'],
    },
  },
]

const systemInstruction = `You are Ask Agent, a friendly AI assistant with real tools.
Always answer the user in conversational English.
If the question requires current weather, exact calculation, or factual lookup, use the appropriate tool.
After receiving a tool result, explain the answer naturally and briefly. Do not invent data if a tool returned an error.`

export interface GeminiFunctionCallResult {
  text: string
  functionCalls: Array<{ name: ToolName; args: Record<string, string> }>
}

const normalizeArgs = (args: Record<string, unknown>): Record<string, string> =>
  Object.fromEntries(Object.entries(args).map(([key, value]) => [key, String(value ?? '')]))

export const callGemini = async (
  apiKey: string,
  history: GeminiChatTurn[],
): Promise<GeminiFunctionCallResult> => {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${encodeURIComponent(
      apiKey,
    )}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: systemInstruction }],
        },
        contents: history,
        tools: [
          {
            functionDeclarations: geminiFunctionDeclarations,
          },
        ],
      }),
    },
  )

  const data = (await response.json().catch(() => ({}))) as GeminiGenerateResponse

  if (!response.ok) {
    const details = data.error?.message ?? `${response.status} ${response.statusText}`
    throw new Error(`Gemini API error: ${details}`)
  }

  const parts = data.candidates?.[0]?.content?.parts ?? []
  const functionCalls = parts
    .filter((part) => part.functionCall)
    .map((part) => ({
      name: part.functionCall!.name,
      args: normalizeArgs(part.functionCall!.args ?? {}),
    }))

  return {
    text: parts
      .map((part) => part.text)
      .filter(Boolean)
      .join('\n')
      .trim(),
    functionCalls,
  }
}

# Ask Agent — AI Assistant with Real Tool Use

Ask Agent is a production-quality React + TypeScript + Vite single-page app that demonstrates an AI assistant with real tool use, transparent function-call execution, and live session analytics.

The product UI, assistant messages, tool explanations, and error states are written in English for international recruiters and reviewers.

## Live Demo

Live demo: `https://your-vercel-demo-url.example`

## What It Demonstrates

- Gemini native function calling with three real tools.
- Transparent tool execution cards rendered before the final assistant answer.
- Session analytics that track tool counts, success/error totals, average latency, and recent history.
- No backend, no API routes, no storage persistence.
- Demo mode that shows the full UX without requiring a Gemini API key.

## Tech Stack

| Area | Technology |
| --- | --- |
| App shell | React 18, TypeScript, Vite |
| Styling | Tailwind CSS v3 |
| AI | Gemini API with native function declarations |
| Weather | Open-Meteo Geocoding API and Forecast API |
| Knowledge lookup | Russian Wikipedia REST API |
| Calculator | mathjs, client-side only |
| Icons | lucide-react |
| Quality | ESLint, Prettier |

## Architecture

```text
src/
├── components/
│   ├── ChatWindow.tsx
│   ├── MessageBubble.tsx
│   ├── ToolCallCard.tsx
│   ├── ToolStatusGrid.tsx
│   ├── AnalyticsPanel.tsx
│   └── ChatInput.tsx
├── hooks/
│   ├── useAgentChat.ts
│   └── useToolAnalytics.ts
├── services/
│   ├── gemini.service.ts
│   └── tools/
│       ├── weather.tool.ts
│       ├── calculator.tool.ts
│       ├── wikipedia.tool.ts
│       └── index.ts
├── types/
│   └── index.ts
└── App.tsx
```

## Agent Loop

1. The user sends an English natural-language message.
2. `useAgentChat` sends the conversation to Gemini with function declarations.
3. If Gemini returns a function call, the app immediately renders a `ToolCallCard`.
4. The matching client-side tool runs.
5. The tool result, status, and duration are attached to the card.
6. `useToolAnalytics` records the completed call.
7. The tool result is sent back to Gemini as a function response.
8. Gemini returns the final English conversational answer.

The loop supports multiple tool calls before a final response and has a guard to avoid infinite tool loops.

## Analytics Module

`useToolAnalytics` is deliberately decoupled from chat state. It stores an in-memory session log of completed `ToolCall` records and derives:

- total calls this session
- per-tool call counts
- success and error counts
- rolling average duration
- most-used tool
- last 10 calls, newest first

This makes observability a first-class product surface rather than a debug afterthought.

## API Key Handling

The app can read a reference value from `VITE_GEMINI_API_KEY`, but the production UI stores the key only in React state. It never writes to `localStorage` or `sessionStorage`.

Create a local `.env` file if desired:

```bash
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

Gemini keys can be created at [Google AI Studio](https://aistudio.google.com/apikey).

## Demo Mode

When no Gemini key is set, demo mode runs scripted examples for:

- weather
- calculator
- Wikipedia lookup

These examples still render transparency cards, simulated answer streaming, and analytics updates.

## Running Locally

```bash
npm install
npm run dev
```

Build for production:

```bash
npm run build
```

Lint:

```bash
npm run lint
```

## Deployment

This is a static Vite SPA and can be deployed to Vercel, Netlify, GitHub Pages, or any static hosting provider. No server runtime is required.

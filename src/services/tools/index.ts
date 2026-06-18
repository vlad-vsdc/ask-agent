import type { ToolCall, ToolName } from '../../types/index'
import { calculateExpression } from './calculator.tool'
import { getWeather } from './weather.tool'
import { searchWikipedia } from './wikipedia.tool'

export const toolLabels: Record<ToolName, string> = {
  get_weather: 'Weather',
  calculate: 'Calculator',
  search_wikipedia: 'Wikipedia',
}

export const toolDescriptions: Record<ToolName, string> = {
  get_weather: 'Current city weather via Open-Meteo.',
  calculate: 'Precise expression evaluation with mathjs.',
  search_wikipedia: 'Short factual summaries from Wikipedia.',
}

export const executeToolCall = async (name: ToolName, args: Record<string, string>) => {
  if (name === 'calculate') {
    return calculateExpression(args.expression ?? '')
  }

  if (name === 'get_weather') {
    return getWeather(args.city ?? '')
  }

  return searchWikipedia(args.query ?? '')
}

export const createToolCall = (name: ToolName, args: Record<string, string>): ToolCall => ({
  id: crypto.randomUUID(),
  name,
  args,
  status: 'calling',
  timestamp: new Date().toISOString(),
})

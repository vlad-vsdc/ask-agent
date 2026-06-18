import { evaluate } from 'mathjs'

export const calculateExpression = async (expression: string): Promise<string> => {
  try {
    const value = evaluate(expression)
    return `Calculation result: ${String(value)}`
  } catch {
    return 'Could not evaluate the expression. Check the syntax and try again.'
  }
}

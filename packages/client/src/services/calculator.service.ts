import type { CalculatorMode } from '../types/calculator.types'

interface CalculateResponse {
  result: string
  steps?: string[]
}

interface CalculateError {
  error: string
  message?: string
}

/**
 * Evaluates a mathematical expression using the backend API
 * @param expression The expression to evaluate (e.g., '2+3*4')
 * @param mode Calculator mode ('basic' or 'scientific')
 * @returns The calculated result as a string
 * @throws Error if expression is invalid or evaluation fails
 */
export async function evaluateExpression(
  expression: string,
  mode: CalculatorMode
): Promise<string> {
  try {
    const response = await fetch('/api/calculate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ expression, mode }),
    })

    if (!response.ok) {
      const errorData: CalculateError = await response.json()
      throw new Error(errorData.message || errorData.error || 'Calculation failed')
    }

    const data: CalculateResponse = await response.json()
    return data.result
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }
    throw new Error('Failed to evaluate expression')
  }
}

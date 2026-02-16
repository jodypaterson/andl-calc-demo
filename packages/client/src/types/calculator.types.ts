/**
 * Calculator type definitions
 */

export type CalculatorMode = 'basic' | 'scientific'

export interface HistoryEntry {
  expression: string
  result: string
  timestamp: number
}

export interface CalculatorState {
  // State fields
  expression: string
  result: string
  mode: CalculatorMode
  memory: number
  history: HistoryEntry[]
  isLoading: boolean
  error: string | null

  // Actions
  appendToExpression: (char: string) => void
  evaluate: () => Promise<void>
  clear: () => void
  clearEntry: () => void
  memoryClear: () => void
  memoryRecall: () => void
  memoryAdd: () => void
  memorySubtract: () => void
  memoryStore: () => void
  setMode: (mode: CalculatorMode) => void
  addToHistory: (entry: HistoryEntry) => void
  clearHistory: () => void
  recallFromHistory: (index: number) => void
}

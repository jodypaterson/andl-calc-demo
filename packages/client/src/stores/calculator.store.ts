import { create } from 'zustand'
import type { CalculatorState, HistoryEntry, CalculatorMode } from '../types/calculator.types'
import { evaluateExpression } from '../services/calculator.service'

const HISTORY_KEY = 'calculator-history'
const MAX_HISTORY = 50

// Load initial history from localStorage
const loadHistory = (): HistoryEntry[] => {
  try {
    const stored = localStorage.getItem(HISTORY_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

// Save history to localStorage
const saveHistory = (history: HistoryEntry[]) => {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history))
  } catch (error) {
    console.error('Failed to save calculator history:', error)
  }
}

export const useCalculatorStore = create<CalculatorState>((set, get) => ({
  // Initial state
  expression: '',
  result: '0',
  mode: 'basic',
  memory: 0,
  history: loadHistory(),
  isLoading: false,
  error: null,

  // Actions
  appendToExpression: (char: string) => {
    set((state) => ({
      expression: state.expression + char,
      error: null,
    }))
  },

  evaluate: async () => {
    const { expression, mode } = get()
    
    if (!expression) {
      return
    }

    set({ isLoading: true, error: null })

    try {
      const result = await evaluateExpression(expression, mode)
      
      // Add to history
      const entry: HistoryEntry = {
        expression,
        result,
        timestamp: Date.now(),
      }

      set((state) => {
        const newHistory = [entry, ...state.history].slice(0, MAX_HISTORY)
        saveHistory(newHistory)
        return {
          result,
          history: newHistory,
          isLoading: false,
        }
      })
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Invalid expression',
        isLoading: false,
      })
    }
  },

  clear: () => {
    set({
      expression: '',
      result: '0',
      error: null,
    })
  },

  clearEntry: () => {
    set((state) => ({
      expression: state.expression.slice(0, -1),
      error: null,
    }))
  },

  memoryClear: () => {
    set({ memory: 0 })
  },

  memoryRecall: () => {
    set((state) => ({
      expression: state.expression + state.memory.toString(),
      error: null,
    }))
  },

  memoryAdd: () => {
    set((state) => ({
      memory: state.memory + parseFloat(state.result),
    }))
  },

  memorySubtract: () => {
    set((state) => ({
      memory: state.memory - parseFloat(state.result),
    }))
  },

  memoryStore: () => {
    set((state) => ({
      memory: parseFloat(state.result),
    }))
  },

  setMode: (mode: CalculatorMode) => {
    set({ mode })
  },

  addToHistory: (entry: HistoryEntry) => {
    set((state) => {
      const newHistory = [entry, ...state.history].slice(0, MAX_HISTORY)
      saveHistory(newHistory)
      return { history: newHistory }
    })
  },

  clearHistory: () => {
    set({ history: [] })
    saveHistory([])
  },

  recallFromHistory: (index: number) => {
    set((state) => {
      const entry = state.history[index]
      if (entry) {
        return {
          expression: entry.expression,
          result: entry.result,
          error: null,
        }
      }
      return {}
    })
  },
}))

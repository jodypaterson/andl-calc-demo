import { useCalculatorStore } from '../stores/calculator.store'
import type { CalculatorMode } from '../types/calculator.types'

/**
 * Calculator hook - provides calculator state and operations
 * Wraps the Zustand store and adds button press routing logic
 */
export function useCalculator() {
  const store = useCalculatorStore()

  /**
   * Handles all calculator button presses
   * Routes to appropriate actions based on button type
   */
  const handleButtonPress = (button: string) => {
    // Clear all
    if (button === 'C') {
      store.clear()
      return
    }

    // Clear entry (backspace)
    if (button === 'CE') {
      store.clearEntry()
      return
    }

    // Evaluate expression
    if (button === '=') {
      store.evaluate()
      return
    }

    // Memory operations
    if (button === 'MC') {
      store.memoryClear()
      return
    }
    if (button === 'MR') {
      store.memoryRecall()
      return
    }
    if (button === 'M+') {
      store.memoryAdd()
      return
    }
    if (button === 'M-') {
      store.memorySubtract()
      return
    }
    if (button === 'MS') {
      store.memoryStore()
      return
    }

    // Toggle sign (+/-)
    if (button === '±') {
      const currentValue = store.expression || store.result
      if (currentValue && currentValue !== '0') {
        const newValue = currentValue.startsWith('-')
          ? currentValue.slice(1)
          : '-' + currentValue
        if (store.expression) {
          store.clear()
          store.appendToExpression(newValue)
        }
      }
      return
    }

    // Scientific functions (wrap expression)
    const scientificFunctions = ['sin', 'cos', 'tan', 'sqrt', 'log', 'ln']
    if (scientificFunctions.includes(button)) {
      store.appendToExpression(`${button}(`)
      return
    }

    // Decimal point - only add if current number doesn't have one
    if (button === '.') {
      const lastNumber = store.expression.split(/[+\-*/]/).pop() || ''
      if (!lastNumber.includes('.')) {
        store.appendToExpression(button)
      }
      return
    }

    // Digits (0-9) and operators (+, -, *, /, (, ))
    if (/^[0-9+\-*/()]$/.test(button)) {
      store.appendToExpression(button)
      return
    }
  }

  return {
    // State
    expression: store.expression,
    result: store.result,
    mode: store.mode,
    memory: store.memory,
    history: store.history,
    isLoading: store.isLoading,
    error: store.error,

    // Core actions
    handleButtonPress,
    setMode: store.setMode,
    clearHistory: store.clearHistory,
    recallFromHistory: store.recallFromHistory,
  }
}

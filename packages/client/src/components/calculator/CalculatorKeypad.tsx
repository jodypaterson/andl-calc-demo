import React, { useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../ui/Button';

export interface CalculatorKeypadProps {
  mode: 'basic' | 'scientific';
  onButtonPress: (value: string) => void;
}

interface ButtonConfig {
  value: string;
  label: string;
  type: 'digit' | 'operator' | 'action' | 'scientific';
  ariaLabel: string;
}

// Basic calculator buttons (4x5 grid)
const basicButtons: ButtonConfig[] = [
  // Row 1
  { value: 'C', label: 'C', type: 'action', ariaLabel: 'Clear all' },
  { value: 'CE', label: 'CE', type: 'action', ariaLabel: 'Clear entry' },
  { value: '%', label: '%', type: 'operator', ariaLabel: 'Percentage' },
  { value: '/', label: '÷', type: 'operator', ariaLabel: 'Divide' },
  // Row 2
  { value: '7', label: '7', type: 'digit', ariaLabel: 'Seven' },
  { value: '8', label: '8', type: 'digit', ariaLabel: 'Eight' },
  { value: '9', label: '9', type: 'digit', ariaLabel: 'Nine' },
  { value: '*', label: '×', type: 'operator', ariaLabel: 'Multiply' },
  // Row 3
  { value: '4', label: '4', type: 'digit', ariaLabel: 'Four' },
  { value: '5', label: '5', type: 'digit', ariaLabel: 'Five' },
  { value: '6', label: '6', type: 'digit', ariaLabel: 'Six' },
  { value: '-', label: '−', type: 'operator', ariaLabel: 'Subtract' },
  // Row 4
  { value: '1', label: '1', type: 'digit', ariaLabel: 'One' },
  { value: '2', label: '2', type: 'digit', ariaLabel: 'Two' },
  { value: '3', label: '3', type: 'digit', ariaLabel: 'Three' },
  { value: '+', label: '+', type: 'operator', ariaLabel: 'Add' },
  // Row 5
  { value: '0', label: '0', type: 'digit', ariaLabel: 'Zero' },
  { value: '.', label: '.', type: 'action', ariaLabel: 'Decimal point' },
  { value: '+/-', label: '±', type: 'action', ariaLabel: 'Toggle sign' },
  { value: '=', label: '=', type: 'action', ariaLabel: 'Equals' },
];

// Scientific calculator buttons (additional row)
const scientificButtons: ButtonConfig[] = [
  { value: 'sin', label: 'sin', type: 'scientific', ariaLabel: 'Sine' },
  { value: 'cos', label: 'cos', type: 'scientific', ariaLabel: 'Cosine' },
  { value: 'tan', label: 'tan', type: 'scientific', ariaLabel: 'Tangent' },
  { value: 'sqrt', label: '√', type: 'scientific', ariaLabel: 'Square root' },
];

export function CalculatorKeypad({ mode, onButtonPress }: CalculatorKeypadProps) {
  // Keyboard event handler
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    const key = event.key;
    
    // Prevent default for calculator keys
    if (['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '+', '-', '*', '/', '.', 'Enter', 'Escape', 'Backspace'].includes(key)) {
      event.preventDefault();
    }
    
    // Map keyboard keys to button values
    if (key >= '0' && key <= '9') {
      onButtonPress(key);
    } else if (['+', '-', '*', '/'].includes(key)) {
      onButtonPress(key);
    } else if (key === 'Enter' || key === '=') {
      onButtonPress('=');
    } else if (key === 'Escape' || key === 'c' || key === 'C') {
      onButtonPress('C');
    } else if (key === 'Backspace') {
      onButtonPress('CE');
    } else if (key === '.') {
      onButtonPress('.');
    }
  }, [onButtonPress]);
  
  // Set up keyboard event listener
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);
  
  // Get all buttons based on mode
  const allButtons = mode === 'scientific' ? [...scientificButtons, ...basicButtons] : basicButtons;
  
  return (
    <div className="calculator-keypad">
      <div
        className="grid gap-2"
        style={{
          gridTemplateColumns: 'repeat(4, 1fr)',
        }}
      >
        {allButtons.map((button) => (
          <motion.div
            key={button.value}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              onClick={() => onButtonPress(button.value)}
              aria-label={button.ariaLabel}
              className="w-full h-14 text-lg font-semibold"
              variant={button.type === 'operator' ? 'secondary' : button.type === 'action' ? 'primary' : 'ghost'}
            >
              {button.label}
            </Button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

import { forwardRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { X } from 'lucide-react';

export interface CalculatorDisplayProps {
  /** Current mathematical expression */
  expression: string;
  /** Calculated result */
  result: string;
  /** Calculator mode */
  mode: 'basic' | 'scientific';
  /** Callback when expression changes */
  onExpressionChange: (expression: string) => void;
  /** Callback when mode changes */
  onModeChange: (mode: 'basic' | 'scientific') => void;
  /** Callback when clear button is clicked */
  onClear: () => void;
  /** Optional class name for styling */
  className?: string;
}

export const CalculatorDisplay = forwardRef<HTMLDivElement, CalculatorDisplayProps>(
  (
    {
      expression,
      result,
      mode,
      onExpressionChange,
      onModeChange,
      onClear,
      className,
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          'glass p-6 rounded-2xl space-y-4 backdrop-blur-xl',
          className
        )}
      >
        {/* Mode Toggle */}
        <div className="flex items-center justify-center gap-2">
          <Button
            variant={mode === 'basic' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => onModeChange('basic')}
            className="flex-1"
          >
            Basic
          </Button>
          <Button
            variant={mode === 'scientific' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => onModeChange('scientific')}
            className="flex-1"
          >
            Scientific
          </Button>
        </div>

        {/* Expression Input */}
        <div className="relative">
          <Input
            value={expression}
            onChange={(e) => onExpressionChange(e.target.value)}
            placeholder="Enter expression..."
            autoFocus
            className="font-mono text-2xl pr-12"
            aria-label="Mathematical expression"
          />
          {expression && (
            <button
              onClick={onClear}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-accent transition-colors"
              aria-label="Clear expression"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          )}
        </div>

        {/* Result Display with Animation */}
        <AnimatePresence mode="wait">
          <motion.div
            key={result}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.15, ease: 'easeInOut' }}
            className="glass p-4 rounded-xl bg-accent/50"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground font-medium">Result</span>
              <motion.span
                key={`value-${result}`}
                initial={{ scale: 1 }}
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 0.3 }}
                className="font-mono text-3xl font-bold text-foreground"
                aria-live="polite"
                aria-atomic="true"
              >
                {result || '0'}
              </motion.span>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    );
  }
);

CalculatorDisplay.displayName = 'CalculatorDisplay';

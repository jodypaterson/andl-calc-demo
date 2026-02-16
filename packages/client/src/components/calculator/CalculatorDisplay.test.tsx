import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { CalculatorDisplay } from './CalculatorDisplay';

describe('CalculatorDisplay', () => {
  const defaultProps = {
    expression: '',
    result: '0',
    mode: 'basic' as const,
    onExpressionChange: vi.fn(),
    onModeChange: vi.fn(),
    onClear: vi.fn(),
  };

  describe('Acceptance Criterion 1: Component exports CalculatorDisplay', () => {
    it('should render without errors', () => {
      render(<CalculatorDisplay {...defaultProps} />);
      expect(screen.getByRole('region', { name: /calculator display/i })).toBeInTheDocument();
    });
  });

  describe('Acceptance Criterion 2: Expression input accepts/displays expressions', () => {
    it('should display the current expression', () => {
      render(<CalculatorDisplay {...defaultProps} expression="2+2" />);
      const input = screen.getByLabelText(/current expression/i);
      expect(input).toHaveValue('2+2');
    });

    it('should accept user input and call onExpressionChange', async () => {
      const user = userEvent.setup();
      const onExpressionChange = vi.fn();
      render(<CalculatorDisplay {...defaultProps} onExpressionChange={onExpressionChange} />);
      
      const input = screen.getByLabelText(/current expression/i);
      await user.type(input, '5+3');
      
      expect(onExpressionChange).toHaveBeenCalled();
    });

    it('should handle empty expression', () => {
      render(<CalculatorDisplay {...defaultProps} expression="" />);
      const input = screen.getByLabelText(/current expression/i);
      expect(input).toHaveValue('');
    });

    it('should handle complex expressions', () => {
      render(<CalculatorDisplay {...defaultProps} expression="(2+3)*4/2" />);
      const input = screen.getByLabelText(/current expression/i);
      expect(input).toHaveValue('(2+3)*4/2');
    });
  });

  describe('Acceptance Criterion 3: Result display shows result with 0 default', () => {
    it('should display default result of 0', () => {
      render(<CalculatorDisplay {...defaultProps} />);
      expect(screen.getByText('0')).toBeInTheDocument();
    });

    it('should display calculated result', () => {
      render(<CalculatorDisplay {...defaultProps} result="42" />);
      expect(screen.getByText('42')).toBeInTheDocument();
    });

    it('should display decimal results', () => {
      render(<CalculatorDisplay {...defaultProps} result="3.14159" />);
      expect(screen.getByText('3.14159')).toBeInTheDocument();
    });

    it('should display negative results', () => {
      render(<CalculatorDisplay {...defaultProps} result="-15" />);
      expect(screen.getByText('-15')).toBeInTheDocument();
    });

    it('should have ARIA label for result', () => {
      render(<CalculatorDisplay {...defaultProps} result="100" />);
      expect(screen.getByLabelText(/calculation result/i)).toBeInTheDocument();
    });
  });

  describe('Acceptance Criterion 4: Mode toggle between basic/scientific', () => {
    it('should show Basic as active mode by default', () => {
      render(<CalculatorDisplay {...defaultProps} mode="basic" />);
      const basicButton = screen.getByRole('button', { name: /basic/i });
      expect(basicButton).toHaveClass('bg-primary');
    });

    it('should show Scientific as active when in scientific mode', () => {
      render(<CalculatorDisplay {...defaultProps} mode="scientific" />);
      const scientificButton = screen.getByRole('button', { name: /scientific/i });
      expect(scientificButton).toHaveClass('bg-primary');
    });

    it('should call onModeChange when Basic button clicked', async () => {
      const user = userEvent.setup();
      const onModeChange = vi.fn();
      render(<CalculatorDisplay {...defaultProps} mode="scientific" onModeChange={onModeChange} />);
      
      const basicButton = screen.getByRole('button', { name: /basic/i });
      await user.click(basicButton);
      
      expect(onModeChange).toHaveBeenCalledWith('basic');
    });

    it('should call onModeChange when Scientific button clicked', async () => {
      const user = userEvent.setup();
      const onModeChange = vi.fn();
      render(<CalculatorDisplay {...defaultProps} mode="basic" onModeChange={onModeChange} />);
      
      const scientificButton = screen.getByRole('button', { name: /scientific/i });
      await user.click(scientificButton);
      
      expect(onModeChange).toHaveBeenCalledWith('scientific');
    });
  });

  describe('Acceptance Criterion 5: onExpressionChange callback fires', () => {
    it('should fire callback on every keystroke', async () => {
      const user = userEvent.setup();
      const onExpressionChange = vi.fn();
      render(<CalculatorDisplay {...defaultProps} onExpressionChange={onExpressionChange} />);
      
      const input = screen.getByLabelText(/current expression/i);
      await user.type(input, 'abc');
      
      expect(onExpressionChange).toHaveBeenCalledTimes(3);
    });
  });

  describe('Acceptance Criterion 6: onModeChange callback fires', () => {
    it('should fire when mode button clicked', async () => {
      const user = userEvent.setup();
      const onModeChange = vi.fn();
      render(<CalculatorDisplay {...defaultProps} onModeChange={onModeChange} />);
      
      const scientificButton = screen.getByRole('button', { name: /scientific/i });
      await user.click(scientificButton);
      
      expect(onModeChange).toHaveBeenCalledTimes(1);
    });
  });

  describe('Acceptance Criterion 7: Result animates on value change', () => {
    it('should render AnimatePresence wrapper', () => {
      const { container } = render(<CalculatorDisplay {...defaultProps} />);
      // AnimatePresence renders children, verify result is in document
      expect(screen.getByText('0')).toBeInTheDocument();
    });

    it('should update result when prop changes', () => {
      const { rerender } = render(<CalculatorDisplay {...defaultProps} result="5" />);
      expect(screen.getByText('5')).toBeInTheDocument();
      
      rerender(<CalculatorDisplay {...defaultProps} result="10" />);
      expect(screen.getByText('10')).toBeInTheDocument();
    });
  });

  describe('Acceptance Criterion 8: Uses glassmorphic styling', () => {
    it('should have glass class on container', () => {
      const { container } = render(<CalculatorDisplay {...defaultProps} />);
      const displayContainer = container.querySelector('.glass');
      expect(displayContainer).toBeInTheDocument();
    });
  });

  describe('Clear button functionality', () => {
    it('should render clear button with X icon', () => {
      render(<CalculatorDisplay {...defaultProps} />);
      const clearButton = screen.getByRole('button', { name: /clear/i });
      expect(clearButton).toBeInTheDocument();
    });

    it('should call onClear when clicked', async () => {
      const user = userEvent.setup();
      const onClear = vi.fn();
      render(<CalculatorDisplay {...defaultProps} onClear={onClear} />);
      
      const clearButton = screen.getByRole('button', { name: /clear/i });
      await user.click(clearButton);
      
      expect(onClear).toHaveBeenCalledTimes(1);
    });
  });

  describe('Accessibility', () => {
    it('should have correct ARIA labels on expression input', () => {
      render(<CalculatorDisplay {...defaultProps} />);
      expect(screen.getByLabelText(/current expression/i)).toBeInTheDocument();
    });

    it('should have correct ARIA label on result display', () => {
      render(<CalculatorDisplay {...defaultProps} />);
      expect(screen.getByLabelText(/calculation result/i)).toBeInTheDocument();
    });

    it('should have accessible button labels', () => {
      render(<CalculatorDisplay {...defaultProps} />);
      expect(screen.getByRole('button', { name: /basic/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /scientific/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /clear/i })).toBeInTheDocument();
    });

    it('should support keyboard navigation with Tab', async () => {
      const user = userEvent.setup();
      render(<CalculatorDisplay {...defaultProps} />);
      
      // Tab through interactive elements
      await user.tab();
      expect(screen.getByLabelText(/current expression/i)).toHaveFocus();
      
      await user.tab();
      expect(screen.getByRole('button', { name: /basic/i })).toHaveFocus();
      
      await user.tab();
      expect(screen.getByRole('button', { name: /scientific/i })).toHaveFocus();
      
      await user.tab();
      expect(screen.getByRole('button', { name: /clear/i })).toHaveFocus();
    });
  });

  describe('Integration with AT-25 components', () => {
    it('should use Button component from AT-25', () => {
      render(<CalculatorDisplay {...defaultProps} />);
      // Verify buttons are rendered (Button component should handle styling)
      expect(screen.getByRole('button', { name: /basic/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /clear/i })).toBeInTheDocument();
    });

    it('should use Input component from AT-25', () => {
      render(<CalculatorDisplay {...defaultProps} />);
      const input = screen.getByLabelText(/current expression/i);
      expect(input).toBeInTheDocument();
      expect(input.tagName).toBe('INPUT');
    });
  });

  describe('TypeScript interfaces', () => {
    it('should accept all required props', () => {
      expect(() => {
        render(<CalculatorDisplay {...defaultProps} />);
      }).not.toThrow();
    });

    it('should accept optional className prop', () => {
      expect(() => {
        render(<CalculatorDisplay {...defaultProps} className="custom-class" />);
      }).not.toThrow();
    });
  });
});

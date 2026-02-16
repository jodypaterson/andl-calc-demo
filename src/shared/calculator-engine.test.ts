import { describe, it, expect } from 'vitest';
import { CalculatorEngine } from './calculator-engine';

const calculator = new CalculatorEngine();

describe('Calculator Engine - Scientific Functions', () => {
  describe('Inverse Trigonometric Functions', () => {
    it('asin should compute correctly in RAD mode', () => {
      expect(calculator.evaluate('asin(0.5)', 'RAD')).toBeCloseTo(0.5236, 3);
      expect(calculator.evaluate('asin(0)', 'RAD')).toBeCloseTo(0, 5);
      expect(calculator.evaluate('asin(1)', 'RAD')).toBeCloseTo(Math.PI / 2, 5);
    });

    it('asin should compute correctly in DEG mode', () => {
      expect(calculator.evaluate('asin(0.5)', 'DEG')).toBeCloseTo(30, 1);
      expect(calculator.evaluate('asin(0)', 'DEG')).toBeCloseTo(0, 5);
      expect(calculator.evaluate('asin(1)', 'DEG')).toBeCloseTo(90, 1);
    });

    it('asin should throw MathError for domain violation', () => {
      expect(() => calculator.evaluate('asin(2)')).toThrow('asin domain error');
      expect(() => calculator.evaluate('asin(-2)')).toThrow('asin domain error');
      expect(() => calculator.evaluate('asin(1.1)')).toThrow('asin domain error');
    });

    it('acos should compute correctly in RAD mode', () => {
      expect(calculator.evaluate('acos(0.5)', 'RAD')).toBeCloseTo(1.0472, 3);
      expect(calculator.evaluate('acos(1)', 'RAD')).toBeCloseTo(0, 5);
      expect(calculator.evaluate('acos(0)', 'RAD')).toBeCloseTo(Math.PI / 2, 5);
    });

    it('acos should compute correctly in DEG mode', () => {
      expect(calculator.evaluate('acos(0.5)', 'DEG')).toBeCloseTo(60, 1);
      expect(calculator.evaluate('acos(1)', 'DEG')).toBeCloseTo(0, 5);
      expect(calculator.evaluate('acos(0)', 'DEG')).toBeCloseTo(90, 1);
    });

    it('acos should throw MathError for domain violation', () => {
      expect(() => calculator.evaluate('acos(2)')).toThrow('acos domain error');
      expect(() => calculator.evaluate('acos(-2)')).toThrow('acos domain error');
    });

    it('atan should compute correctly in RAD mode', () => {
      expect(calculator.evaluate('atan(1)', 'RAD')).toBeCloseTo(Math.PI / 4, 5);
      expect(calculator.evaluate('atan(0)', 'RAD')).toBeCloseTo(0, 5);
    });

    it('atan should compute correctly in DEG mode', () => {
      expect(calculator.evaluate('atan(1)', 'DEG')).toBeCloseTo(45, 1);
      expect(calculator.evaluate('atan(0)', 'DEG')).toBeCloseTo(0, 5);
    });
  });

  describe('Hyperbolic Functions', () => {
    it('sinh(0) should equal 0', () => {
      expect(calculator.evaluate('sinh(0)')).toBe(0);
    });

    it('sinh should compute correctly', () => {
      expect(calculator.evaluate('sinh(1)')).toBeCloseTo(1.1752, 4);
      expect(calculator.evaluate('sinh(-1)')).toBeCloseTo(-1.1752, 4);
    });

    it('cosh(0) should equal 1', () => {
      expect(calculator.evaluate('cosh(0)')).toBe(1);
    });

    it('cosh should compute correctly', () => {
      expect(calculator.evaluate('cosh(1)')).toBeCloseTo(1.5431, 4);
    });

    it('tanh(0) should equal 0', () => {
      expect(calculator.evaluate('tanh(0)')).toBe(0);
    });

    it('tanh should compute correctly', () => {
      expect(calculator.evaluate('tanh(1)')).toBeCloseTo(0.7616, 4);
      expect(calculator.evaluate('tanh(-1)')).toBeCloseTo(-0.7616, 4);
    });
  });

  describe('Power and Root Functions', () => {
    it('exp(1) should approximate E', () => {
      expect(calculator.evaluate('exp(1)')).toBeCloseTo(Math.E, 5);
    });

    it('exp should compute correctly', () => {
      expect(calculator.evaluate('exp(0)')).toBeCloseTo(1, 5);
      expect(calculator.evaluate('exp(2)')).toBeCloseTo(7.389, 3);
    });

    it('abs(-5) should equal 5', () => {
      expect(calculator.evaluate('abs(-5)')).toBe(5);
    });

    it('abs should compute correctly', () => {
      expect(calculator.evaluate('abs(5)')).toBe(5);
      expect(calculator.evaluate('abs(0)')).toBe(0);
      expect(calculator.evaluate('abs(-3.14)')).toBeCloseTo(3.14, 2);
    });

    it('cbrt(27) should equal 3', () => {
      expect(calculator.evaluate('cbrt(27)')).toBe(3);
    });

    it('cbrt should compute correctly', () => {
      expect(calculator.evaluate('cbrt(8)')).toBeCloseTo(2, 5);
      expect(calculator.evaluate('cbrt(-8)')).toBeCloseTo(-2, 5);
      expect(calculator.evaluate('cbrt(0)')).toBe(0);
    });
  });

  describe('Factorial Function', () => {
    it('fact(0) should equal 1', () => {
      expect(calculator.evaluate('fact(0)')).toBe(1);
    });

    it('fact(5) should equal 120', () => {
      expect(calculator.evaluate('fact(5)')).toBe(120);
    });

    it('fact should compute correctly', () => {
      expect(calculator.evaluate('fact(1)')).toBe(1);
      expect(calculator.evaluate('fact(3)')).toBe(6);
      expect(calculator.evaluate('fact(4)')).toBe(24);
      expect(calculator.evaluate('fact(10)')).toBe(3628800);
    });

    it('fact(170) should succeed', () => {
      expect(() => calculator.evaluate('fact(170)')).not.toThrow();
      expect(calculator.evaluate('fact(170)')).toBeGreaterThan(0);
    });

    it('fact(171) should throw overflow error', () => {
      expect(() => calculator.evaluate('fact(171)')).toThrow('fact overflow');
      expect(() => calculator.evaluate('fact(171)')).toThrow('exceeds Number.MAX_VALUE');
    });

    it('fact(-1) should throw domain error', () => {
      expect(() => calculator.evaluate('fact(-1)')).toThrow('fact domain error');
      expect(() => calculator.evaluate('fact(-1)')).toThrow('negative input');
    });

    it('fact(5.5) should throw non-integer error', () => {
      expect(() => calculator.evaluate('fact(5.5)')).toThrow('fact requires integer input');
      expect(() => calculator.evaluate('fact(3.14)')).toThrow('fact requires integer input');
    });
  });

  describe('Rounding Functions', () => {
    it('floor(3.7) should equal 3', () => {
      expect(calculator.evaluate('floor(3.7)')).toBe(3);
    });

    it('floor should compute correctly', () => {
      expect(calculator.evaluate('floor(5.9)')).toBe(5);
      expect(calculator.evaluate('floor(5.1)')).toBe(5);
      expect(calculator.evaluate('floor(-2.3)')).toBe(-3);
    });

    it('ceil(3.2) should equal 4', () => {
      expect(calculator.evaluate('ceil(3.2)')).toBe(4);
    });

    it('ceil should compute correctly', () => {
      expect(calculator.evaluate('ceil(5.1)')).toBe(6);
      expect(calculator.evaluate('ceil(5.9)')).toBe(6);
      expect(calculator.evaluate('ceil(-2.7)')).toBe(-2);
    });

    it('round(3.5) should equal 4', () => {
      expect(calculator.evaluate('round(3.5)')).toBe(4);
    });

    it('round should compute correctly', () => {
      expect(calculator.evaluate('round(3.4)')).toBe(3);
      expect(calculator.evaluate('round(3.6)')).toBe(4);
      expect(calculator.evaluate('round(2.5)')).toBe(3);
      expect(calculator.evaluate('round(-2.5)')).toBe(-2);
    });
  });

  describe('Mathematical Constants', () => {
    it('PI should approximate 3.14159', () => {
      expect(calculator.evaluate('PI')).toBeCloseTo(Math.PI, 5);
      expect(calculator.evaluate('PI')).toBeCloseTo(3.14159, 5);
    });

    it('E should approximate 2.71828', () => {
      expect(calculator.evaluate('E')).toBeCloseTo(Math.E, 5);
      expect(calculator.evaluate('E')).toBeCloseTo(2.71828, 5);
    });

    it('constants should work in expressions', () => {
      expect(calculator.evaluate('PI * 2')).toBeCloseTo(Math.PI * 2, 5);
      expect(calculator.evaluate('E + 1')).toBeCloseTo(Math.E + 1, 5);
      expect(calculator.evaluate('PI / 2')).toBeCloseTo(Math.PI / 2, 5);
    });
  });

  describe('Expression Integration', () => {
    it('sin(asin(0.5)) should return 0.5', () => {
      expect(calculator.evaluate('sin(asin(0.5))', 'RAD')).toBeCloseTo(0.5, 5);
    });

    it('function composition should work', () => {
      expect(calculator.evaluate('cos(acos(0.5))', 'RAD')).toBeCloseTo(0.5, 5);
      expect(calculator.evaluate('tan(atan(1))', 'RAD')).toBeCloseTo(1, 5);
    });

    it('constants in complex expressions', () => {
      expect(calculator.evaluate('sin(PI / 2)', 'RAD')).toBeCloseTo(1, 5);
      expect(calculator.evaluate('exp(1) - E')).toBeCloseTo(0, 10);
    });

    it('mixed functions should work', () => {
      expect(calculator.evaluate('abs(sin(-PI / 2))', 'RAD')).toBeCloseTo(1, 5);
      expect(calculator.evaluate('floor(PI)')).toBe(3);
      expect(calculator.evaluate('ceil(E)')).toBe(3);
    });
  });
});

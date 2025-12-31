/**
 * Unit tests for the demo utility module.
 * 
 * These tests provide baseline coverage that the CI/CD pipeline
 * will measure and enforce.
 */

import { describe, it, expect } from 'vitest';
import { add, multiply, divide, factorial, isPrime } from '../src/index.js';

describe('add', () => {
  it('adds two positive numbers', () => {
    expect(add(2, 3)).toBe(5);
  });

  it('adds negative numbers', () => {
    expect(add(-1, -1)).toBe(-2);
  });

  it('adds zero', () => {
    expect(add(5, 0)).toBe(5);
  });
});

describe('multiply', () => {
  it('multiplies two positive numbers', () => {
    expect(multiply(3, 4)).toBe(12);
  });

  it('multiplies by zero', () => {
    expect(multiply(5, 0)).toBe(0);
  });

  it('multiplies negative numbers', () => {
    expect(multiply(-2, -3)).toBe(6);
  });
});

describe('divide', () => {
  it('divides two numbers', () => {
    expect(divide(10, 2)).toBe(5);
  });

  it('throws on division by zero', () => {
    expect(() => divide(5, 0)).toThrow('Cannot divide by zero');
  });

  it('handles decimal results', () => {
    expect(divide(5, 2)).toBe(2.5);
  });
});

describe('factorial', () => {
  it('calculates factorial of 0', () => {
    expect(factorial(0)).toBe(1);
  });

  it('calculates factorial of 1', () => {
    expect(factorial(1)).toBe(1);
  });

  it('calculates factorial of 5', () => {
    expect(factorial(5)).toBe(120);
  });

  it('throws for negative numbers', () => {
    expect(() => factorial(-1)).toThrow('Factorial not defined for negative numbers');
  });
});

describe('isPrime', () => {
  it('returns false for 0 and 1', () => {
    expect(isPrime(0)).toBe(false);
    expect(isPrime(1)).toBe(false);
  });

  it('returns true for 2 and 3', () => {
    expect(isPrime(2)).toBe(true);
    expect(isPrime(3)).toBe(true);
  });

  it('returns false for 4', () => {
    expect(isPrime(4)).toBe(false);
  });

  it('returns true for larger primes', () => {
    expect(isPrime(17)).toBe(true);
    expect(isPrime(97)).toBe(true);
  });

  it('returns false for composite numbers', () => {
    expect(isPrime(15)).toBe(false);
    expect(isPrime(100)).toBe(false);
  });
});

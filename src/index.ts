/**
 * ANDL Demo - CI/CD Pipeline
 * 
 * A simple utility module for demonstration purposes.
 * This file exists to give ANDL something to build CI/CD around.
 */

/**
 * Adds two numbers together.
 * @param a - First number
 * @param b - Second number
 * @returns The sum of a and b
 */
export function add(a: number, b: number): number {
  return a + b;
}

/**
 * Multiplies two numbers together.
 * @param a - First number
 * @param b - Second number
 * @returns The product of a and b
 */
export function multiply(a: number, b: number): number {
  return a * b;
}

/**
 * Divides two numbers.
 * @param a - Dividend
 * @param b - Divisor
 * @returns The quotient of a divided by b
 * @throws Error if b is zero
 */
export function divide(a: number, b: number): number {
  if (b === 0) {
    throw new Error('Cannot divide by zero');
  }
  return a / b;
}

/**
 * Calculates the factorial of a number.
 * @param n - Non-negative integer
 * @returns The factorial of n
 * @throws Error if n is negative
 */
export function factorial(n: number): number {
  if (n < 0) {
    throw new Error('Factorial not defined for negative numbers');
  }
  if (n === 0 || n === 1) {
    return 1;
  }
  return n * factorial(n - 1);
}

/**
 * Checks if a number is prime.
 * @param n - Number to check
 * @returns True if n is prime, false otherwise
 */
export function isPrime(n: number): boolean {
  if (n <= 1) return false;
  if (n <= 3) return true;
  if (n % 2 === 0 || n % 3 === 0) return false;
  
  let i = 5;
  while (i * i <= n) {
    if (n % i === 0 || n % (i + 2) === 0) {
      return false;
    }
    i += 6;
  }
  return true;
}

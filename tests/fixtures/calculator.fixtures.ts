export const validExpressions = [
  { input: '2 + 2', expected: 4 },
  { input: '10 - 5', expected: 5 },
  { input: '3 * 4', expected: 12 },
  { input: '15 / 3', expected: 5 },
  { input: '2 + 3 * 4', expected: 14 } // Order of operations
];

export const invalidExpressions = [
  { input: '', error: 'Empty expression' },
  { input: '2 +', error: 'Incomplete expression' },
  { input: '/ 5', error: 'Invalid start' },
  { input: '2 ++ 3', error: 'Invalid operator sequence' }
];

export const edgeCaseExpressions = [
  { input: '0 / 0', expected: NaN },
  { input: '1 / 0', expected: Infinity },
  { input: '-5 + 10', expected: 5 },
  { input: '0.1 + 0.2', expected: 0.30000000000000004 } // Floating point precision
];

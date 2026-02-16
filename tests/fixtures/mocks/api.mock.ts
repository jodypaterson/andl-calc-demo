export function mockAuthResponse(success = true) {
  return {
    status: success ? 200 : 401,
    data: success
      ? { token: 'mock-token-123', userId: 'user-1' }
      : { error: 'Unauthorized' }
  };
}

export function mockCalculatorResponse(result: number) {
  return {
    status: 200,
    data: { result, expression: 'mock-expression' }
  };
}

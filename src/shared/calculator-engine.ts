/**
 * Calculator Engine with Tokenizer, Parser, and Evaluator
 * Implements EBNF grammar for mathematical expressions
 * 
 * Grammar:
 * expression  = term (('+' | '-') term)*
 * term        = factor (('*' | '/') factor)*
 * factor      = base ('^' factor)?           // Right-associative
 * base        = NUMBER | '(' expression ')' | function
 * function    = FUNC_NAME '(' expression ')'
 */

// ===== TOKEN TYPES =====

export enum TokenType {
  NUMBER = 'NUMBER',
  OPERATOR = 'OPERATOR',
  LPAREN = 'LPAREN',
  RPAREN = 'RPAREN',
  FUNCTION = 'FUNCTION',
  CONSTANT = 'CONSTANT',
  EOF = 'EOF'
}

export interface Token {
  type: TokenType;
  value: string;
  position: number;
}

// ===== AST NODE TYPES =====

export type ASTNode = NumberNode | BinaryOpNode | FunctionNode;

export interface NumberNode {
  type: 'number';
  value: number;
}

export interface BinaryOpNode {
  type: 'binaryOp';
  operator: string;
  left: ASTNode;
  right: ASTNode;
}

export interface FunctionNode {
  type: 'function';
  name: string;
  argument: ASTNode;
}

// ===== TOKENIZER =====

export class InvalidCharacterError extends Error {
  constructor(char: string, position: number) {
    super(`Invalid character '${char}' at position ${position}`);
    this.name = 'InvalidCharacterError';
  }
}

export function tokenize(expression: string): Token[] {
  const tokens: Token[] = [];
  let position = 0;

  while (position < expression.length) {
    const char = expression[position];

    // Skip whitespace
    if (/\s/.test(char)) {
      position++;
      continue;
    }

    // Numbers (integers and floats)
    if (/[0-9]/.test(char)) {
      let numStr = '';
      const startPos = position;
      while (position < expression.length && /[0-9.]/.test(expression[position])) {
        numStr += expression[position];
        position++;
      }
      tokens.push({ type: TokenType.NUMBER, value: numStr, position: startPos });
      continue;
    }

    // Operators
    if (['+', '-', '*', '/', '^'].includes(char)) {
      tokens.push({ type: TokenType.OPERATOR, value: char, position });
      position++;
      continue;
    }

    // Parentheses
    if (char === '(') {
      tokens.push({ type: TokenType.LPAREN, value: char, position });
      position++;
      continue;
    }

    if (char === ')') {
      tokens.push({ type: TokenType.RPAREN, value: char, position });
      position++;
      continue;
    }

    // Mathematical constants (PI, E)
    if (/[A-Z]/.test(char)) {
      let constantName = '';
      const startPos = position;
      while (position < expression.length && /[A-Z]/.test(expression[position])) {
        constantName += expression[position];
        position++;
      }
      if (['PI', 'E'].includes(constantName)) {
        tokens.push({ type: TokenType.CONSTANT, value: constantName, position: startPos });
        continue;
      }
      throw new InvalidCharacterError(constantName, startPos);
    }

    // Function names
    if (/[a-z]/.test(char)) {
      let funcName = '';
      const startPos = position;
      while (position < expression.length && /[a-z]/.test(expression[position])) {
        funcName += expression[position];
        position++;
      }
      if (['sin', 'cos', 'tan', 'sqrt', 'log', 'ln', 'asin', 'acos', 'atan', 'sinh', 'cosh', 'tanh', 'exp', 'abs', 'cbrt', 'fact', 'floor', 'ceil', 'round'].includes(funcName)) {
        tokens.push({ type: TokenType.FUNCTION, value: funcName, position: startPos });
        continue;
      }
      throw new InvalidCharacterError(funcName, startPos);
    }

    // Invalid character
    throw new InvalidCharacterError(char, position);
  }

  tokens.push({ type: TokenType.EOF, value: '', position });
  return tokens;
}

// ===== PARSER =====

export class SyntaxError extends Error {
  constructor(message: string, position?: number) {
    super(position !== undefined ? `${message} at position ${position}` : message);
    this.name = 'SyntaxError';
  }
}

class Parser {
  private tokens: Token[];
  private current = 0;

  constructor(tokens: Token[]) {
    this.tokens = tokens;
  }

  parse(): ASTNode {
    const result = this.parseExpression();
    if (this.currentToken().type !== TokenType.EOF) {
      throw new SyntaxError('Unexpected token after expression', this.currentToken().position);
    }
    return result;
  }

  private currentToken(): Token {
    return this.tokens[this.current];
  }

  private advance(): Token {
    const token = this.currentToken();
    if (token.type !== TokenType.EOF) {
      this.current++;
    }
    return token;
  }

  // expression = term (('+' | '-') term)*
  private parseExpression(): ASTNode {
    let left = this.parseTerm();

    while (this.currentToken().type === TokenType.OPERATOR && 
           (this.currentToken().value === '+' || this.currentToken().value === '-')) {
      const operator = this.advance().value;
      const right = this.parseTerm();
      left = { type: 'binaryOp', operator, left, right };
    }

    return left;
  }

  // term = factor (('*' | '/') factor)*
  private parseTerm(): ASTNode {
    let left = this.parseFactor();

    while (this.currentToken().type === TokenType.OPERATOR && 
           (this.currentToken().value === '*' || this.currentToken().value === '/')) {
      const operator = this.advance().value;
      const right = this.parseFactor();
      left = { type: 'binaryOp', operator, left, right };
    }

    return left;
  }

  // factor = base ('^' factor)?  // Right-associative via recursion
  private parseFactor(): ASTNode {
    const left = this.parseBase();

    if (this.currentToken().type === TokenType.OPERATOR && 
        this.currentToken().value === '^') {
      this.advance();
      const right = this.parseFactor(); // Right-associative: recurse for right side
      return { type: 'binaryOp', operator: '^', left, right };
    }

    return left;
  }

  // base = NUMBER | '(' expression ')' | function
  private parseBase(): ASTNode {
    const token = this.currentToken();

    // NUMBER
    if (token.type === TokenType.NUMBER) {
      this.advance();
      return { type: 'number', value: parseFloat(token.value) };
    }

    // CONSTANT (PI, E)
    if (token.type === TokenType.CONSTANT) {
      this.advance();
      if (token.value === 'PI') {
        return { type: 'number', value: Math.PI };
      }
      if (token.value === 'E') {
        return { type: 'number', value: Math.E };
      }
      throw new MathError(`Unknown constant: ${token.value}`);
    }

    // Unary minus
    if (token.type === TokenType.OPERATOR && token.value === '-') {
      this.advance();
      const operand = this.parseBase();
      return { type: 'binaryOp', operator: '-', left: { type: 'number', value: 0 }, right: operand };
    }

    // '(' expression ')'
    if (token.type === TokenType.LPAREN) {
      this.advance();
      const expr = this.parseExpression();
      if (this.currentToken().type !== TokenType.RPAREN) {
        throw new SyntaxError('Expected closing parenthesis', this.currentToken().position);
      }
      this.advance();
      return expr;
    }

    // function
    if (token.type === TokenType.FUNCTION) {
      return this.parseFunction();
    }

    throw new SyntaxError(`Unexpected token: ${token.value}`, token.position);
  }

  // function = FUNC_NAME '(' expression ')'
  private parseFunction(): ASTNode {
    const funcToken = this.advance();
    const funcName = funcToken.value;

    if (this.currentToken().type !== TokenType.LPAREN) {
      throw new SyntaxError(`Expected '(' after function name`, this.currentToken().position);
    }
    this.advance();

    const argument = this.parseExpression();

    if (this.currentToken().type !== TokenType.RPAREN) {
      throw new SyntaxError(`Expected ')' after function argument`, this.currentToken().position);
    }
    this.advance();

    return { type: 'function', name: funcName, argument };
  }
}

export function parse(tokens: Token[]): ASTNode {
  const parser = new Parser(tokens);
  return parser.parse();
}

// ===== EVALUATOR =====

export class MathError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'MathError';
  }
}

export type AngleMode = 'DEG' | 'RAD';

function evaluateNode(node: ASTNode, mode: AngleMode = 'RAD'): number {
  switch (node.type) {
    case 'number':
      return node.value;

    case 'binaryOp': {
      const left = evaluateNode(node.left, mode);
      const right = evaluateNode(node.right, mode);

      switch (node.operator) {
        case '+':
          return left + right;
        case '-':
          return left - right;
        case '*':
          return left * right;
        case '/':
          if (right === 0) {
            throw new MathError('Division by zero');
          }
          return left / right;
        case '^':
          return Math.pow(left, right);
        default:
          throw new MathError(`Unknown operator: ${node.operator}`);
      }
    }

    case 'function': {
      const arg = evaluateNode(node.argument, mode);
      const funcName = node.name;

      // Convert degrees to radians for trig functions if in DEG mode
      const radians = mode === 'DEG' ? (arg * Math.PI) / 180 : arg;

      switch (funcName) {
        case 'sin':
          return Math.sin(radians);
        case 'cos':
          return Math.cos(radians);
        case 'tan':
          return Math.tan(radians);
        case 'sqrt':
          if (arg < 0) {
            throw new MathError('Cannot take square root of negative number');
          }
          return Math.sqrt(arg);
        case 'log':
          if (arg <= 0) {
            throw new MathError('Logarithm argument must be positive');
          }
          return Math.log10(arg);
        case 'ln':
          if (arg <= 0) {
            throw new MathError('Natural logarithm argument must be positive');
          }
          return Math.log(arg);
        
        // Inverse trigonometric functions (return angles)
        case 'asin':
          if (arg < -1 || arg > 1) {
            throw new MathError(`asin domain error: ${arg} not in [-1, 1]`);
          }
          // Convert output to degrees if in DEG mode
          return mode === 'DEG' ? (Math.asin(arg) * 180 / Math.PI) : Math.asin(arg);
        case 'acos':
          if (arg < -1 || arg > 1) {
            throw new MathError(`acos domain error: ${arg} not in [-1, 1]`);
          }
          return mode === 'DEG' ? (Math.acos(arg) * 180 / Math.PI) : Math.acos(arg);
        case 'atan':
          return mode === 'DEG' ? (Math.atan(arg) * 180 / Math.PI) : Math.atan(arg);
        
        // Hyperbolic functions
        case 'sinh':
          return Math.sinh(arg);
        case 'cosh':
          return Math.cosh(arg);
        case 'tanh':
          return Math.tanh(arg);
        
        // Power and root functions
        case 'exp':
          return Math.exp(arg);
        case 'abs':
          return Math.abs(arg);
        case 'cbrt':
          return Math.cbrt(arg);
        
        // Factorial function
        case 'fact':
          if (!Number.isInteger(arg)) {
            throw new MathError(`fact requires integer input, got ${arg}`);
          }
          if (arg < 0) {
            throw new MathError(`fact domain error: negative input ${arg}`);
          }
          if (arg > 170) {
            throw new MathError(`fact overflow: ${arg}! exceeds Number.MAX_VALUE`);
          }
          let factorial = 1;
          for (let i = 2; i <= arg; i++) {
            factorial *= i;
          }
          return factorial;
        
        // Rounding functions
        case 'floor':
          return Math.floor(arg);
        case 'ceil':
          return Math.ceil(arg);
        case 'round':
          return Math.round(arg);
        
        default:
          throw new MathError(`Unknown function: ${funcName}`);
      }
    }
  }
}

// ===== CALCULATOR ENGINE =====

export class CalculatorEngine {
  /**
   * Evaluate a mathematical expression
   * @param expression The expression string to evaluate
   * @param mode Angle mode for trig functions: 'DEG' or 'RAD' (default: 'RAD')
   * @returns The numeric result
   */
  evaluate(expression: string, mode: AngleMode = 'RAD'): number {
    const tokens = this.tokenize(expression);
    const ast = this.parse(tokens);
    return evaluateNode(ast, mode);
  }

  /**
   * Tokenize an expression into tokens
   * @param expression The expression string
   * @returns Array of tokens
   */
  tokenize(expression: string): Token[] {
    return tokenize(expression);
  }

  /**
   * Parse tokens into an AST
   * @param tokens Array of tokens
   * @returns Root AST node
   */
  parse(tokens: Token[]): ASTNode {
    return parse(tokens);
  }
}

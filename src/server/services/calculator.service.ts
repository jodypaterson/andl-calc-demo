import { CalculatorEngine } from '../../shared/calculator-engine.js';
import { prisma } from '../lib/prisma.js';
import { CalcMode } from '@prisma/client';

export interface EvaluationResult {
  result: number;
  expression: string;
  mode: CalcMode;
  timestamp: Date;
}

export class CalculatorService {
  private engine: CalculatorEngine;

  constructor() {
    this.engine = new CalculatorEngine('DEG');
  }

  async evaluate(
    expression: string,
    mode: CalcMode = CalcMode.DEG,
    userId?: string
  ): Promise<EvaluationResult> {
    // Set engine mode
    this.engine.setMode(mode);

    // Evaluate (may throw MathError or SyntaxError)
    const result = this.engine.evaluate(expression);

    // Save to history if userId provided
    if (userId) {
      await prisma.calculationHistory.create({
        data: {
          userId,
          expression,
          result: result.toString(),
          mode,
        },
      });
    }

    return {
      result,
      expression,
      mode,
      timestamp: new Date(),
    };
  }

  async getHistory(userId: string, limit = 50) {
    return prisma.calculationHistory.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async clearHistory(userId: string): Promise<void> {
    await prisma.calculationHistory.deleteMany({
      where: { userId },
    });
  }
}

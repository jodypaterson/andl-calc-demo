import { Router, Request, Response, NextFunction } from 'express';
import { CalculatorService } from '../services/calculator.service.js';
import { authenticate } from '../middleware/authenticate.js';
import { optionalAuth } from '../middleware/optionalAuth.js';
import { validate } from '../middleware/validate.js';
import {
  evaluateSchema,
  historyQuerySchema,
} from '../schemas/calculator.schema.js';
import { MathError, SyntaxError } from '../../shared/calculator-engine.js';

const router = Router();
const calculatorService = new CalculatorService();

/**
 * @route POST /api/calculator/evaluate
 * @desc Evaluate mathematical expression
 * @access Public (saves history if authenticated)
 */
router.post(
  '/evaluate',
  optionalAuth, // Works with or without auth
  validate(evaluateSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { expression, mode } = req.body;
      const userId = req.user?.id; // Undefined if not authenticated

      const result = await calculatorService.evaluate(
        expression,
        mode,
        userId
      );

      res.json({
        result: result.result,
        expression: result.expression,
        mode: result.mode,
      });
    } catch (error) {
      if (error instanceof MathError || error instanceof SyntaxError) {
        res.status(400).json({ error: error.message });
        return;
      }
      next(error);
    }
  }
);

/**
 * @route GET /api/calculator/history
 * @desc Get calculation history
 * @access Private
 */
router.get(
  '/history',
  authenticate, // Requires auth
  validate(historyQuerySchema, 'query'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const limit = Number(req.query.limit) || 50;

      const history = await calculatorService.getHistory(userId, limit);

      res.json({ history });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route DELETE /api/calculator/history
 * @desc Clear calculation history
 * @access Private
 */
router.delete(
  '/history',
  authenticate, // Requires auth
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;

      await calculatorService.clearHistory(userId);

      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  }
);

export default router;

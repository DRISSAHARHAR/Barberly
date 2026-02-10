import { NextFunction, Request, Response } from 'express';
import { AnyZodObject } from 'zod';

export function validateBody(schema: AnyZodObject) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      res.status(422).json({
        message: 'Validation failed',
        issues: result.error.issues
      });
      return;
    }

    req.body = result.data;
    next();
  };
}

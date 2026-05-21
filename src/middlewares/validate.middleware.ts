import { Request, Response, NextFunction } from 'express';

export const validate = (schema: any) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // TODO: Implement validation middleware using Zod or similar
    // Validate request body/query/params against schema
    next();
  };
};


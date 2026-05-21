import { Router } from 'express';
import { nudgesController } from '@controllers/nudges.controller';
import { fetchUser, rateLimitMiddleware, verifyAccessToken } from '@middlewares';

export const nudgesRoutes = Router();

nudgesRoutes.use(rateLimitMiddleware, verifyAccessToken, fetchUser);

// GET /nudges
nudgesRoutes.get('/', nudgesController.list);

// PATCH /nudges/:id/read
nudgesRoutes.patch('/:id/read', nudgesController.markRead);

import { NextFunction } from 'express';
import { ExtendedRequest, ExtendedResponse } from '@types';
import { ForbiddenError, UnauthorizedError } from '@errors';
import { verifyFirebaseToken } from '@firebase/firebaseAuth';
import { TokenManager } from '@adapters';
import { User } from '@models';

const tokenManager = new TokenManager();

const getBearerToken = (authorization?: string): string => {
  if (!authorization || !authorization.startsWith('Bearer ')) {
    throw new UnauthorizedError('Authorization header missing or invalid');
  }

  return authorization.substring(7).trim();
};

export const verifyFirebaseIdToken = async (
  req: ExtendedRequest,
  res: ExtendedResponse,
  next: NextFunction
): Promise<void> => {
  try {
    const token = getBearerToken(req.headers.authorization);
    const firebaseUser = await verifyFirebaseToken(token);
    req.firebaseUser = firebaseUser;
    next();
  } catch (error) {
    res.sendError(error instanceof Error ? error : new UnauthorizedError('Invalid Firebase token'));
  }
};

export const verifyFirebaseOrAccessToken = async (
  req: ExtendedRequest,
  res: ExtendedResponse,
  next: NextFunction
): Promise<void> => {
  const authorization = req.headers.authorization;
  if (!authorization || !authorization.startsWith('Bearer ')) {
    return res.sendError(new UnauthorizedError('Authorization header missing or invalid'));
  }
  const token = authorization.substring(7).trim();

  // Try Firebase first (email/Google flows)
  try {
    const firebaseUser = await verifyFirebaseToken(token);
    req.firebaseUser = firebaseUser;
    return next();
  } catch {
    // Not a Firebase token — fall through
  }

  // Try backend access token (OTP flow)
  try {
    const payload = tokenManager.verifyAccessToken(token);
    req.userId = payload.userId;
    req.user = {
      ...(req.user || { email: '' }),
      id: payload.userId,
      firebaseUserId: payload.firebaseUid,
    };
    return next();
  } catch {
    return res.sendError(new UnauthorizedError('Invalid token'));
  }
};

export const verifyAccessToken = (
  req: ExtendedRequest,
  res: ExtendedResponse,
  next: NextFunction
): void => {
  try {
    const token = getBearerToken(req.headers.authorization);
    const payload = tokenManager.verifyAccessToken(token);

    req.userId = payload.userId;
    req.user = {
      ...(req.user || { email: '' }),
      id: payload.userId,
      firebaseUserId: payload.firebaseUid,
    };

    next();
  } catch (error) {
    res.sendError(error instanceof Error ? error : new UnauthorizedError('Invalid access token'));
  }
};

export const fetchUser = async (
  req: ExtendedRequest,
  res: ExtendedResponse,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.userId) {
      throw new UnauthorizedError('User identity missing');
    }

    const user = await User.findByPk(req.userId);
    if (!user || !user.dataValues.isActive) {
      throw new ForbiddenError('User is inactive or missing');
    }

    req.user = {
      id: user.dataValues.id,
      email: user.dataValues.email || '',
      firstName: user.dataValues.firstName || undefined,
      lastName: user.dataValues.lastName || undefined,
      isActive: user.dataValues.isActive,
      isOnboarded: user.dataValues.isOnboarded,
      provider: user.dataValues.provider,
      firebaseUserId: user.dataValues.firebaseUserId,
    };

    next();
  } catch (error) {
    res.sendError(error instanceof Error ? error : new UnauthorizedError('Unauthorized'));
  }
};

export const authenticate = verifyAccessToken;

export const authorize = (...roles: string[]) => {
  return (req: ExtendedRequest, res: ExtendedResponse, next: NextFunction) => {
    void roles;
    next();
  };
};


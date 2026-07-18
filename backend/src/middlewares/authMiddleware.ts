import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import logger from '../config/logger';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: string;
  };
}

export const authenticateJWT = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ message: 'Authorization token required or malformed' });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_session_jwt_key_123!') as {
      id: string;
      role: string;
    };
    req.user = {
      id: decoded.id,
      role: decoded.role,
    };
    next();
  } catch (error) {
    logger.warn('JWT verification failed:', error);
    res.status(403).json({ message: 'Token is invalid or expired' });
  }
};

export const requireAdmin = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user || req.user.role !== 'admin') {
    res.status(403).json({ message: 'Forbidden: Admin access required' });
    return;
  }
  next();
};

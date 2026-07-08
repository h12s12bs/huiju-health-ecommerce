import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'lerou_jwt_secret_key_2026_highly_secure';

export interface AuthenticatedRequest extends Request {
  adminUser?: string;
}

export function authenticateAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing token' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { username: string };
    req.adminUser = decoded.username;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Forbidden: Invalid token' });
  }
}

export interface CustomerAuthenticatedRequest extends Request {
  customer?: {
    customerId: string;
    name: string;
    email: string;
  };
}

export function authenticateCustomer(req: CustomerAuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing token' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { customerId: string; name: string; email: string; role: string };
    if (decoded.role !== 'customer') {
      return res.status(403).json({ error: 'Forbidden: Invalid role' });
    }
    req.customer = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Forbidden: Invalid token' });
  }
}

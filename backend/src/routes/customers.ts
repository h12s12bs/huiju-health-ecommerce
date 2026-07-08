import { Router, Response } from 'express';
import { getDatabase } from '../db.js';
import { authenticateAdmin, AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

// Get all customers (Admin only)
router.get('/', authenticateAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const db = await getDatabase();
    const rows = await db.all('SELECT * FROM customers ORDER BY signupDate DESC');
    return res.json(rows);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to fetch customers' });
  }
});

export default router;

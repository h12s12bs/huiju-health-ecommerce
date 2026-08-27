import { Router, Response } from 'express';
import { getDatabase } from '../db.js';
import { authenticateAdmin, AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

// Get all products
router.get('/', async (req, res) => {
  try {
    const db = await getDatabase();
    const rows = await db.all('SELECT * FROM products');
    
    const formatted = rows.map(row => ({
      ...row,
      badges: row.badges ? row.badges.split(',').map((s: string) => s.trim()) : [],
      isNew: !!row.isNew,
      comfortRating: row.comfortRating ?? undefined,
      originalPrice: row.originalPrice ?? undefined
    }));

    return res.json(formatted);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Add a product
router.post('/', authenticateAdmin, async (req: AuthenticatedRequest, res: Response) => {
  const {
    id, title, category, price, originalPrice, image, rating, reviews,
    description, origin, weight, storage, comfortRating, cookingTip, badges, isNew, brand, cost
  } = req.body;

  if (!title || !category || price === undefined || !image) {
    return res.status(400).json({ error: 'Title, category, price, and image are required' });
  }

  const generatedId = id || `${category}-${Date.now()}`;
  const badgesStr = Array.isArray(badges) ? badges.join(', ') : (badges || '');
  const isNewInt = isNew ? 1 : 0;

  try {
    const db = await getDatabase();
    await db.run(
      `INSERT INTO products (
        id, title, category, price, originalPrice, image, rating, reviews,
        description, origin, weight, storage, comfortRating, cookingTip, badges, isNew, brand, cost
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        generatedId, title, category, Number(price), originalPrice ? Number(originalPrice) : null,
        image, rating ? Number(rating) : 5.0, reviews ? Number(reviews) : 0,
        description || '', origin || '', weight || '', storage || '',
        comfortRating ? Number(comfortRating) : null, cookingTip || '',
        badgesStr, isNewInt, brand || '', cost ? Number(cost) : 0
      ]
    );

    const newProd = await db.get('SELECT * FROM products WHERE id = ?', [generatedId]);
    return res.status(201).json({
      ...newProd,
      badges: newProd.badges ? newProd.badges.split(',').map((s: string) => s.trim()) : [],
      isNew: !!newProd.isNew,
      comfortRating: newProd.comfortRating ?? undefined,
      originalPrice: newProd.originalPrice ?? undefined
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to create product' });
  }
});

// Update a product
router.put('/:id', authenticateAdmin, async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const {
    title, category, price, originalPrice, image, rating, reviews,
    description, origin, weight, storage, comfortRating, cookingTip, badges, isNew, brand, cost
  } = req.body;

  if (!title || !category || price === undefined || !image) {
    return res.status(400).json({ error: 'Title, category, price, and image are required' });
  }

  const badgesStr = Array.isArray(badges) ? badges.join(', ') : (badges || '');
  const isNewInt = isNew ? 1 : 0;

  try {
    const db = await getDatabase();
    const existing = await db.get('SELECT id FROM products WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ error: 'Product not found' });
    }

    await db.run(
      `UPDATE products SET 
        title = ?, category = ?, price = ?, originalPrice = ?, image = ?, rating = ?, reviews = ?,
        description = ?, origin = ?, weight = ?, storage = ?, comfortRating = ?, cookingTip = ?,
        badges = ?, isNew = ?, brand = ?, cost = ?
       WHERE id = ?`,
      [
        title, category, Number(price), originalPrice ? Number(originalPrice) : null,
        image, rating ? Number(rating) : 5.0, reviews ? Number(reviews) : 0,
        description || '', origin || '', weight || '', storage || '',
        comfortRating ? Number(comfortRating) : null, cookingTip || '',
        badgesStr, isNewInt, brand || '', cost ? Number(cost) : 0, id
      ]
    );

    const updated = await db.get('SELECT * FROM products WHERE id = ?', [id]);
    return res.json({
      ...updated,
      badges: updated.badges ? updated.badges.split(',').map((s: string) => s.trim()) : [],
      isNew: !!updated.isNew,
      comfortRating: updated.comfortRating ?? undefined,
      originalPrice: updated.originalPrice ?? undefined
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to update product' });
  }
});

// Delete a product
router.delete('/:id', authenticateAdmin, async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;

  try {
    const db = await getDatabase();
    const existing = await db.get('SELECT id FROM products WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ error: 'Product not found' });
    }

    await db.run('DELETE FROM products WHERE id = ?', [id]);
    return res.json({ success: true, message: `Product ${id} deleted` });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to delete product' });
  }
});

export default router;

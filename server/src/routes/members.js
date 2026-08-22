import express from 'express';
import { db } from '../db/database.js';

const router = express.Router();

// GET all members
router.get('/', async (req, res) => {
  try {
    const activeOnly = req.query.active === 'true';
    const members = await db.getMembers(activeOnly);
    res.json({ success: true, data: members });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET single member
router.get('/:id', async (req, res) => {
  try {
    const member = await db.getMemberById(req.params.id);
    if (!member) {
      return res.status(404).json({ success: false, error: 'Member not found' });
    }
    res.json({ success: true, data: member });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST create member
router.post('/', async (req, res) => {
  try {
    const { name, email, password, role, department, avatarColor, active } = req.body;
    if (!name || name.trim() === '') {
      return res.status(400).json({ success: false, error: 'Name is required' });
    }
    const newMember = await db.addMember({ name: name.trim(), email, password, role, department, avatarColor, active });
    res.status(201).json({ success: true, data: newMember });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT update member
router.put('/:id', async (req, res) => {
  try {
    const updated = await db.updateMember(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Member not found' });
    }
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE member
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await db.deleteMember(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Member not found' });
    }
    res.json({ success: true, message: 'Member deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;

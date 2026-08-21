import express from 'express';
import { db } from '../db/database.js';

const router = express.Router();

// GET all members
router.get('/', (req, res) => {
  try {
    const activeOnly = req.query.active === 'true';
    const members = db.getMembers(activeOnly);
    res.json({ success: true, data: members });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET single member
router.get('/:id', (req, res) => {
  try {
    const member = db.getMemberById(req.params.id);
    if (!member) {
      return res.status(404).json({ success: false, error: 'Member not found' });
    }
    res.json({ success: true, data: member });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST create member
router.post('/', (req, res) => {
  try {
    const { name, email, role, department, avatarColor, active } = req.body;
    if (!name || name.trim() === '') {
      return res.status(400).json({ success: false, error: 'Name is required' });
    }
    const newMember = db.addMember({ name: name.trim(), email, role, department, avatarColor, active });
    res.status(201).json({ success: true, data: newMember });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT update member
router.put('/:id', (req, res) => {
  try {
    const updated = db.updateMember(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Member not found' });
    }
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE member
router.delete('/:id', (req, res) => {
  try {
    const deleted = db.deleteMember(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Member not found' });
    }
    res.json({ success: true, message: 'Member deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;

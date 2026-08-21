import express from 'express';
import { db } from '../db/database.js';

const router = express.Router();

// Employee Login
router.post('/login', (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required' });
    }

    const member = db.validateMember(email, password);
    if (!member) {
      return res.status(401).json({ success: false, error: 'Invalid email or password' });
    }

    res.json({
      success: true,
      message: 'Login successful',
      user: member
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Employee Registration / Sign Up
router.post('/register', (req, res) => {
  try {
    const { name, email, password, role, department, avatarColor } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Name, email, and password are required to register.'
      });
    }

    const newMember = db.addMember({
      name,
      email,
      password,
      role: role || 'Team Member',
      department: department || 'Engineering',
      avatarColor: avatarColor || '#0284c7'
    });

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      user: {
        ...newMember,
        isAdmin: false
      }
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Admin Login
router.post('/admin-login', (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required' });
    }

    const admin = db.validateAdmin(email, password);
    if (!admin) {
      return res.status(401).json({ success: false, error: 'Invalid Admin credentials' });
    }

    res.json({
      success: true,
      message: 'Admin access granted',
      user: admin
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Reset Data (Remove all users and logs, fresh start)
router.post('/reset', (req, res) => {
  try {
    db.resetData();
    res.json({ success: true, message: 'All users and logs have been reset to clean state.' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;

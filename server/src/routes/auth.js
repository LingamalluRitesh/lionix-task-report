import express from 'express';
import { db } from '../db/database.js';

const router = express.Router();

// Unified Login Endpoint (Handles both Admin & Employee accounts)
router.post('/login', (req, res) => {
  try {
    const { email, identifier, password } = req.body;
    const loginIdentifier = (email || identifier || '').trim();

    if (!loginIdentifier || !password) {
      return res.status(400).json({
        success: false,
        error: 'Please enter your username/email and password'
      });
    }

    const user = db.validateLogin(loginIdentifier, password);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials. Please verify username/email and password.'
      });
    }

    res.json({
      success: true,
      user
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Employee Registration Endpoint
router.post('/register', (req, res) => {
  try {
    const { name, email, password, role, department } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Name, email, and password are required'
      });
    }

    const newMember = db.addMember({
      name,
      email,
      password,
      role: role || 'Software Engineer',
      department: department || 'IT'
    });

    res.status(201).json({
      success: true,
      user: {
        ...newMember,
        isAdmin: false
      }
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Reset data endpoint
router.post('/reset', (req, res) => {
  try {
    db.resetData();
    res.json({ success: true, message: 'All dummy users, projects, and logs cleared successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;

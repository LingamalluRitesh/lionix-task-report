import express from 'express';
import { db } from '../db/database.js';

const router = express.Router();

// Unified Login Endpoint (Handles both Admin & Employee accounts)
router.post('/login', async (req, res) => {
  try {
    const { email, identifier, password } = req.body;
    const loginIdentifier = (email || identifier || '').trim();

    if (!loginIdentifier || !password) {
      return res.status(400).json({
        success: false,
        error: 'Please enter your username/email and password'
      });
    }

    const user = await db.validateLogin(loginIdentifier, password);
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
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, department } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Name, email, and password are required'
      });
    }

    const newMember = await db.addMember({
      name,
      email,
      password,
      role: role || 'Python Developer',
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

// Change Password Endpoint for ANY logged-in person (Admin, Lead, Coordinator, Employee)
router.post('/change-password', async (req, res) => {
  try {
    const { memberId, currentPassword, newPassword } = req.body;

    if (!memberId || !newPassword) {
      return res.status(400).json({
        success: false,
        error: 'User ID and new password are required'
      });
    }

    if (newPassword.trim().length < 4) {
      return res.status(400).json({
        success: false,
        error: 'New password must be at least 4 characters long'
      });
    }

    const result = await db.changePassword(memberId, currentPassword, newPassword.trim());
    res.json({
      success: true,
      message: 'Password updated successfully and saved into the database!',
      ...result
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to update password'
    });
  }
});

// Reset data endpoint
router.post('/reset', async (req, res) => {
  try {
    db.resetData();
    res.json({ success: true, message: 'Data reset successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;

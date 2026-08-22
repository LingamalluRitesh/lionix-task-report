import express from 'express';
import { db } from '../db/database.js';

const router = express.Router();

// GET all projects
router.get('/', async (req, res) => {
  try {
    const activeOnly = req.query.active === 'true';
    const projects = await db.getProjects(activeOnly);
    res.json({ success: true, data: projects });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET single project
router.get('/:id', async (req, res) => {
  try {
    const project = await db.getProjectById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, error: 'Project not found' });
    }
    res.json({ success: true, data: project });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST create project
router.post('/', async (req, res) => {
  try {
    const { name, code, description, color, status } = req.body;
    if (!name || name.trim() === '') {
      return res.status(400).json({ success: false, error: 'Project name is required' });
    }
    const newProject = await db.addProject({ name: name.trim(), code, description, color, status });
    res.status(201).json({ success: true, data: newProject });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT update project
router.put('/:id', async (req, res) => {
  try {
    const updated = await db.updateProject(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Project not found' });
    }
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE project
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await db.deleteProject(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Project not found' });
    }
    res.json({ success: true, message: 'Project deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;

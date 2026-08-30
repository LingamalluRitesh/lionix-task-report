import express from 'express';
import { db } from '../db/database.js';

const router = express.Router();

// GET all team assignments (map of leadId -> memberIds)
router.get('/assignments', async (req, res) => {
  try {
    const assignments = await db.getTeamAssignments();
    res.json({ success: true, data: assignments });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET teammates assigned to a specific lead
router.get('/:id/assignments', async (req, res) => {
  try {
    const assignedIds = await db.getTeamAssignments(req.params.id);
    res.json({ success: true, data: assignedIds });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST assign teammates to a specific lead
router.post('/:id/assignments', async (req, res) => {
  try {
    const { memberIds } = req.body;
    const updated = await db.assignTeammates(req.params.id, memberIds);
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

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

// POST assign project to a member
router.post('/:id/assign-project', async (req, res) => {
  try {
    const { projectId, projectName } = req.body;
    let finalProjectName = projectName;
    if (projectId && !finalProjectName) {
      const proj = await db.getProjectById(projectId);
      if (proj) finalProjectName = proj.name;
    }
    const updated = await db.updateMember(req.params.id, {
      assignedProjectId: projectId || null,
      assignedProjectName: finalProjectName || null
    });
    res.json({ success: true, data: updated, message: `Assigned to ${finalProjectName || 'project'}` });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST set member shift for a date
router.post('/:id/shift', async (req, res) => {
  try {
    const { date, shift } = req.body;
    const result = await db.setMemberShift(req.params.id, date, shift);
    res.json({ success: true, data: result, message: `Shift updated to ${shift}` });
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

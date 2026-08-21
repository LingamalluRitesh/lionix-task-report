import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import authRouter from './routes/auth.js';
import membersRouter from './routes/members.js';
import projectsRouter from './routes/projects.js';
import reportsRouter from './routes/reports.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/members', membersRouter);
app.use('/api/projects', projectsRouter);
app.use('/api/reports', reportsRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Serve frontend static build
const clientDist = path.join(__dirname, '../../client/dist');
app.use(express.static(clientDist));

// Handle all SPA routes including /admin
app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  res.sendFile(path.join(clientDist, 'index.html'), (err) => {
    if (err) {
      res.status(200).send('TaskPulse API server running on port ' + PORT);
    }
  });
});

app.listen(PORT, () => {
  console.log(`🚀 TaskPulse Server running on http://localhost:${PORT}`);
});

import express from 'express';
import cors from 'cors';
import { getDb } from './db.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// ─── Health ──────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── Load All Data (single fetch for the frontend) ──────
app.get('/api/data', (_req, res) => {
  const db = getDb();
  const projects = db.prepare('SELECT * FROM projects ORDER BY sort_order').all();
  const ideas    = db.prepare('SELECT * FROM ideas ORDER BY created_at DESC').all();
  const universal = db.prepare('SELECT * FROM universal ORDER BY created_at DESC').all();
  const tasks    = db.prepare('SELECT * FROM tasks ORDER BY created_at DESC').all();

  // Nest ideas inside their projects
  const projectsWithIdeas = projects.map(p => ({
    ...p,
    ideas: ideas
      .filter(i => i.project_id === p.id)
      .map(i => ({ id: i.id, text: i.text, pinned: !!i.pinned }))
  }));

  // Map universal rows to frontend shape
  const universalMapped = universal.map(u => ({
    id: u.id,
    text: u.text,
    details: u.details,
    datetime: u.datetime,
    projectId: u.project_id,
  }));

  // Map task rows
  const tasksMapped = tasks.map(t => ({
    id: t.id,
    text: t.text,
    done: !!t.done,
  }));

  res.json({ projects: projectsWithIdeas, universal: universalMapped, tasks: tasksMapped });
});

// ─── Projects ────────────────────────────────────────────
app.post('/api/projects', (req, res) => {
  const db = getDb();
  const { id, name, color } = req.body;
  const maxSort = db.prepare('SELECT COALESCE(MAX(sort_order), -1) + 1 as next FROM projects').get().next;
  db.prepare('INSERT INTO projects (id, name, color, sort_order) VALUES (?, ?, ?, ?)').run(id, name, color, maxSort);
  res.json({ id, name, color });
});

app.delete('/api/projects/:id', (req, res) => {
  const db = getDb();
  db.prepare('DELETE FROM projects WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

// ─── Ideas (within a project) ────────────────────────────
app.post('/api/projects/:projectId/ideas', (req, res) => {
  const db = getDb();
  const { id, text, pinned } = req.body;
  db.prepare('INSERT INTO ideas (id, project_id, text, pinned) VALUES (?, ?, ?, ?)').run(id, req.params.projectId, text, pinned ? 1 : 0);
  res.json({ id, text, pinned: !!pinned });
});

app.delete('/api/ideas/:id', (req, res) => {
  const db = getDb();
  db.prepare('DELETE FROM ideas WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

// ─── Universal Cards ─────────────────────────────────────
app.post('/api/universal', (req, res) => {
  const db = getDb();
  const { id, text, details, datetime, projectId } = req.body;
  db.prepare('INSERT INTO universal (id, text, details, datetime, project_id) VALUES (?, ?, ?, ?, ?)').run(id, text, details || '', datetime || '', projectId || '');
  res.json({ id, text, details, datetime, projectId });
});

app.patch('/api/universal/:id', (req, res) => {
  const db = getDb();
  const { details, datetime, projectId } = req.body;
  const fields = [];
  const values = [];
  if (details !== undefined) { fields.push('details = ?'); values.push(details); }
  if (datetime !== undefined) { fields.push('datetime = ?'); values.push(datetime); }
  if (projectId !== undefined) { fields.push('project_id = ?'); values.push(projectId); }
  if (fields.length === 0) return res.json({ ok: true });
  values.push(req.params.id);
  db.prepare(`UPDATE universal SET ${fields.join(', ')} WHERE id = ?`).run(...values);
  res.json({ ok: true });
});

app.delete('/api/universal/:id', (req, res) => {
  const db = getDb();
  db.prepare('DELETE FROM universal WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

// ─── Tasks ───────────────────────────────────────────────
app.post('/api/tasks', (req, res) => {
  const db = getDb();
  const { id, text } = req.body;
  db.prepare('INSERT INTO tasks (id, text, done) VALUES (?, ?, 0)').run(id, text);
  res.json({ id, text, done: false });
});

app.patch('/api/tasks/:id', (req, res) => {
  const db = getDb();
  const { done } = req.body;
  db.prepare('UPDATE tasks SET done = ? WHERE id = ?').run(done ? 1 : 0, req.params.id);
  res.json({ ok: true });
});

app.delete('/api/tasks/:id', (req, res) => {
  const db = getDb();
  db.prepare('DELETE FROM tasks WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

// ─── Start ───────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n  🧠 IdeaOS API running → http://localhost:${PORT}/api/health\n`);
});

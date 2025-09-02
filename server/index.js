import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import webpush from 'web-push';
import dotenv from 'dotenv';
import { getDb } from './db.js';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const VAPID_PATH = path.join(__dirname, '.vapid.json');

let vapidKeys;
if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  vapidKeys = {
    publicKey: process.env.VAPID_PUBLIC_KEY,
    privateKey: process.env.VAPID_PRIVATE_KEY
  };
} else if (fs.existsSync(VAPID_PATH)) {
  vapidKeys = JSON.parse(fs.readFileSync(VAPID_PATH, 'utf-8'));
} else {
  vapidKeys = webpush.generateVAPIDKeys();
  fs.writeFileSync(VAPID_PATH, JSON.stringify(vapidKeys, null, 2));
}

webpush.setVapidDetails(
  'mailto:admin@ideaos.local',
  vapidKeys.publicKey,
  vapidKeys.privateKey
);

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
  const reminders = db.prepare('SELECT * FROM reminders ORDER BY created_at DESC').all();

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
    remindFired: !!u.remind_fired,
    createdAt: u.created_at,
  }));

  // Map task rows
  const tasksMapped = tasks.map(t => ({
    id: t.id,
    text: t.text,
    done: !!t.done,
  }));

  // Map reminder rows
  const remindersMapped = reminders.map(r => ({
    id: r.id,
    title: r.title,
    datetime: r.datetime,
    projectId: r.project_id,
    done: !!r.done,
    remindFired: !!r.remind_fired,
  }));

  res.json({
    projects: projectsWithIdeas,
    universal: universalMapped,
    tasks: tasksMapped,
    reminders: remindersMapped,
    vapidPublicKey: vapidKeys.publicKey,
  });
});

// ─── Projects ────────────────────────────────────────────
app.post('/api/projects', (req, res) => {
  const db = getDb();
  const { id, name, color } = req.body;
  const maxSort = db.prepare('SELECT COALESCE(MAX(sort_order), -1) + 1 as next FROM projects').get().next;
  db.prepare('INSERT INTO projects (id, name, color, sort_order) VALUES (?, ?, ?, ?)').run(id, name, color, maxSort);
  res.json({ id, name, color, ideas: [] });
});

app.delete('/api/projects/:id', (req, res) => {
  const db = getDb();
  db.prepare('DELETE FROM projects WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

app.patch('/api/projects/:id', (req, res) => {
  const db = getDb();
  const { name } = req.body;
  db.prepare('UPDATE projects SET name = ? WHERE id = ?').run(name, req.params.id);
  res.json({ ok: true });
});

// ─── Ideas (within a project) ────────────────────────────
app.post('/api/projects/:projectId/ideas', (req, res) => {
  const db = getDb();
  const { id, text, pinned } = req.body;
  db.prepare('INSERT INTO ideas (id, project_id, text, pinned) VALUES (?, ?, ?, ?)').run(id, req.params.projectId, text, pinned ? 1 : 0);
  res.json({ id, text, pinned: !!pinned });
});

app.patch('/api/ideas/:id', (req, res) => {
  const db = getDb();
  const { pinned } = req.body;
  db.prepare('UPDATE ideas SET pinned = ? WHERE id = ?').run(pinned ? 1 : 0, req.params.id);
  res.json({ ok: true });
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
  db.prepare('INSERT INTO universal (id, text, details, datetime, project_id, remind_fired) VALUES (?, ?, ?, ?, ?, 0)').run(id, text, details || '', datetime || '', projectId || '');
  res.json({ id, text, details, datetime, projectId, remindFired: false });
});

app.patch('/api/universal/:id', (req, res) => {
  const db = getDb();
  const { text, details, datetime, projectId, remindFired } = req.body;
  const fields = [];
  const values = [];
  if (text !== undefined) { fields.push('text = ?'); values.push(text); }
  if (details !== undefined) { fields.push('details = ?'); values.push(details); }
  if (datetime !== undefined) { fields.push('datetime = ?'); values.push(datetime); }
  if (projectId !== undefined) { fields.push('project_id = ?'); values.push(projectId); }
  if (remindFired !== undefined) { fields.push('remind_fired = ?'); values.push(remindFired ? 1 : 0); }
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

// ─── Reminders ───────────────────────────────────────────
app.post('/api/reminders', (req, res) => {
  const db = getDb();
  const { id, title, datetime, projectId } = req.body;
  db.prepare('INSERT INTO reminders (id, title, datetime, project_id, done, remind_fired) VALUES (?, ?, ?, ?, 0, 0)').run(id, title, datetime || '', projectId || '');
  res.json({ id, title, datetime, projectId, done: false, remindFired: false });
});

app.patch('/api/reminders/:id', (req, res) => {
  const db = getDb();
  const { done, remindFired } = req.body;
  const fields = [];
  const values = [];
  if (done !== undefined) { fields.push('done = ?'); values.push(done ? 1 : 0); }
  if (remindFired !== undefined) { fields.push('remind_fired = ?'); values.push(remindFired ? 1 : 0); }
  if (fields.length === 0) return res.json({ ok: true });
  values.push(req.params.id);
  db.prepare(`UPDATE reminders SET ${fields.join(', ')} WHERE id = ?`).run(...values);
  res.json({ ok: true });
});

app.delete('/api/reminders/:id', (req, res) => {
  const db = getDb();
  db.prepare('DELETE FROM reminders WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

// ─── Web-Push Subscriptions ──────────────────────────────
app.post('/api/subscribe', (req, res) => {
  const db = getDb();
  const subscription = req.body;
  const id = subscription.keys?.auth || 'sub_' + Date.now();
  db.prepare('INSERT OR REPLACE INTO subscriptions (id, subscription) VALUES (?, ?)').run(id, JSON.stringify(subscription));
  res.json({ ok: true });
});

// ─── Background Web-Push Notification Worker ─────────────
setInterval(() => {
  try {
    const db = getDb();
    const now = new Date();
    const subsRows = db.prepare('SELECT * FROM subscriptions').all();
    if (subsRows.length === 0) return;

    const subscriptions = subsRows.map(row => ({ id: row.id, sub: JSON.parse(row.subscription) }));

    const sendPush = (title, body) => {
      const payload = JSON.stringify({ title, body });
      subscriptions.forEach(({ id, sub }) => {
        webpush.sendNotification(sub, payload).catch(err => {
          if (err.statusCode === 410 || err.statusCode === 404) {
            db.prepare('DELETE FROM subscriptions WHERE id = ?').run(id);
          }
        });
      });
    };

    // Check Reminders
    const dueReminders = db.prepare('SELECT * FROM reminders WHERE done = 0 AND remind_fired = 0 AND datetime != ""').all();
    dueReminders.forEach(r => {
      if (new Date(r.datetime) <= now) {
        sendPush('⏰ Reminder: ' + r.title, 'IdeaOS Scheduled Reminder');
        db.prepare('UPDATE reminders SET remind_fired = 1 WHERE id = ?').run(r.id);
      }
    });

    // Check Universal Board Cards
    const dueUniversal = db.prepare('SELECT * FROM universal WHERE remind_fired = 0 AND datetime != ""').all();
    dueUniversal.forEach(u => {
      if (new Date(u.datetime) <= now) {
        sendPush('⏰ Idea Alert: ' + u.text, 'IdeaOS Time-Sensitive Card');
        db.prepare('UPDATE universal SET remind_fired = 1 WHERE id = ?').run(u.id);
      }
    });

  } catch (err) {
    console.error('Push worker error:', err);
  }
}, 30000);

// ─── Serve Frontend Static Files in Production ───────────
const DIST_PATH = path.join(__dirname, '../dist');
if (fs.existsSync(DIST_PATH)) {
  app.use(express.static(DIST_PATH));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(DIST_PATH, 'index.html'));
  });
}

// ─── Start ───────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n  🧠 IdeaOS API running → http://localhost:${PORT}/api/health\n`);
});

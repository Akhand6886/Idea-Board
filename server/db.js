import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, 'ideaos.db');

let db;

export function getDb() {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    initSchema();
    seedIfEmpty();
  }
  return db;
}

function initSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS projects (
      id    TEXT PRIMARY KEY,
      name  TEXT NOT NULL,
      color TEXT NOT NULL DEFAULT '#f59e0b',
      sort_order INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS ideas (
      id         TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      text       TEXT NOT NULL,
      pinned     INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS universal (
      id         TEXT PRIMARY KEY,
      text       TEXT NOT NULL,
      details    TEXT NOT NULL DEFAULT '',
      datetime   TEXT NOT NULL DEFAULT '',
      project_id TEXT NOT NULL DEFAULT '',
      remind_fired INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS tasks (
      id         TEXT PRIMARY KEY,
      text       TEXT NOT NULL,
      done       INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS reminders (
      id         TEXT PRIMARY KEY,
      title      TEXT NOT NULL,
      datetime   TEXT NOT NULL,
      project_id TEXT NOT NULL DEFAULT '',
      done       INTEGER NOT NULL DEFAULT 0,
      remind_fired INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS subscriptions (
      id            TEXT PRIMARY KEY,
      subscription  TEXT NOT NULL,
      created_at    TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);
}

function seedIfEmpty() {
  const count = db.prepare('SELECT COUNT(*) as c FROM projects').get().c;
  if (count === 0) {
    const insertProject = db.prepare('INSERT INTO projects (id, name, color, sort_order) VALUES (?, ?, ?, ?)');
    insertProject.run('p1', 'Personal', '#f59e0b', 0);
    insertProject.run('p2', 'Work', '#3b82f6', 1);

    const insertUniversal = db.prepare('INSERT INTO universal (id, text, details, datetime, project_id, remind_fired) VALUES (?, ?, ?, ?, ?, ?)');
    insertUniversal.run('u1', 'Research VAPID keys for push notifs', '# Steps\n1. Generate keys\n2. Save to .env', '', 'p2', 0);

    const insertReminder = db.prepare('INSERT INTO reminders (id, title, datetime, project_id, done, remind_fired) VALUES (?, ?, ?, ?, ?, ?)');
    insertReminder.run('r1', 'Review project proposal doc', new Date(Date.now() + 86400000).toISOString().slice(0, 16), 'p2', 0, 0);
    insertReminder.run('r2', 'Call dentist to reschedule', new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 16), '', 0, 0);
  }
}

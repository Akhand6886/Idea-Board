import React, { useState, useEffect } from "react";
import { Sidebar } from "./components/Sidebar";
import { UniversalBoard } from "./components/UniversalBoard";
import { ProjectBoard } from "./components/ProjectBoard";
import { DailyTasks } from "./components/DailyTasks";
import { Reminders } from "./components/Reminders";

const SEED = {
  projects: [
    { id: 'p1', name: 'Personal', color: '#f59e0b', ideas: [
      { id: 'i1', text: 'Build a habit tracker with streak counters and heatmap visualization', pinned: false },
      { id: 'i2', text: 'Learn Rust — start with "The Book", then write a small CLI tool', pinned: true },
      { id: 'i3', text: 'Automate home backups to external SSD via cron + rsync', pinned: false },
      { id: 'i4', text: 'Read "Designing Data-Intensive Applications" cover to cover', pinned: false },
    ]},
    { id: 'p2', name: 'Work', color: '#3b82f6', ideas: [
      { id: 'i5', text: 'Migrate auth service to Kubernetes — draft migration plan first', pinned: false },
      { id: 'i6', text: 'Document all REST endpoints with OpenAPI 3.1 spec', pinned: true },
      { id: 'i7', text: 'Set up Grafana + Prometheus monitoring dashboard for staging', pinned: false },
    ]},
    { id: 'p3', name: 'Side Projects', color: '#8b5cf6', ideas: [
      { id: 'i8', text: 'SaaS idea: AI-powered PR reviewer that leaves contextual comments', pinned: true },
      { id: 'i9', text: 'Open-source CLI tool for managing .env files across projects', pinned: false },
    ]},
  ],
  reminders: [
    { id: 'r1', title: 'Review project proposal doc', datetime: new Date(Date.now() + 86400000).toISOString().slice(0, 16), projectId: 'p2', done: false },
    { id: 'r2', title: 'Call dentist to reschedule', datetime: new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 16), projectId: '', done: false },
    { id: 'r3', title: 'Push weekly deploy to production', datetime: new Date(Date.now() - 3600000).toISOString().slice(0, 16), projectId: 'p2', done: false },
  ],
  tasks: [
    { id: 't1', text: 'Morning standup notes', done: false },
    { id: 't2', text: 'Review open PRs on GitHub', done: true },
    { id: 't3', text: 'Write unit tests for auth module', done: false },
    { id: 't4', text: 'Update README with new API changes', done: false },
    { id: 't5', text: 'Reply to Slack messages', done: true },
  ],
  board: [
    { id: 'b1', text: 'WebSockets', datetime: '', projectId: 'p2', createdAt: new Date(Date.now() - 5 * 3600000).toISOString(), remindFired: false },
    { id: 'b2', text: 'Read about CRDT data structures', datetime: new Date(Date.now() + 2 * 86400000).toISOString().slice(0, 16), projectId: '', createdAt: new Date(Date.now() - 2 * 3600000).toISOString(), remindFired: false },
    { id: 'b3', text: 'edge caching', datetime: '', projectId: 'p2', createdAt: new Date(Date.now() - 86400000).toISOString(), remindFired: false },
    { id: 'b4', text: 'Talk to Priya about the API rate limit issue before Friday', datetime: new Date(Date.now() + 86400000).toISOString().slice(0, 16), projectId: 'p2', createdAt: new Date(Date.now() - 3600000).toISOString(), remindFired: false },
    { id: 'b5', text: 'Remix framework', datetime: '', projectId: '', createdAt: new Date(Date.now() - 7200000).toISOString(), remindFired: false },
    { id: 'b6', text: 'Side project: personal finance tracker in Next.js', datetime: '', projectId: 'p3', createdAt: new Date(Date.now() - 10 * 3600000).toISOString(), remindFired: false },
    { id: 'b7', text: 'vector embeddings', datetime: '', projectId: '', createdAt: new Date().toISOString(), remindFired: false },
  ],
};

export default function IdeaOS() {
  const [projects, setProjects] = useState(() => {
    const saved = localStorage.getItem('ideaos_projects');
    return saved ? JSON.parse(saved) : SEED.projects;
  });
  const [reminders, setReminders] = useState(() => {
    const saved = localStorage.getItem('ideaos_reminders');
    return saved ? JSON.parse(saved) : SEED.reminders;
  });
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem('ideaos_tasks');
    return saved ? JSON.parse(saved) : SEED.tasks;
  });
  const [boardCards, setBoardCards] = useState(() => {
    const saved = localStorage.getItem('ideaos_board');
    return saved ? JSON.parse(saved) : SEED.board;
  });

  const [view, setView] = useState('capture');
  const [activeProj, setActiveProj] = useState('p1');

  // New project form
  const [showProjForm, setShowProjForm] = useState(false);
  const [newProjName, setNewProjName] = useState('');
  const [newProjColor, setNewProjColor] = useState('#10b981');

  // Persist to localStorage
  useEffect(() => { localStorage.setItem('ideaos_projects', JSON.stringify(projects)); }, [projects]);
  useEffect(() => { localStorage.setItem('ideaos_reminders', JSON.stringify(reminders)); }, [reminders]);
  useEffect(() => { localStorage.setItem('ideaos_tasks', JSON.stringify(tasks)); }, [tasks]);
  useEffect(() => { localStorage.setItem('ideaos_board', JSON.stringify(boardCards)); }, [boardCards]);

  // Notification permission
  useEffect(() => {
    if ('Notification' in window) Notification.requestPermission();
  }, []);

  // Reminder notification check
  useEffect(() => {
    const iv = setInterval(() => {
      const now = new Date();
      const fire = (title) => {
        if ('Notification' in window && Notification.permission === 'granted')
          new Notification('⏰ ' + title, { body: 'IdeaOS' });
      };
      setReminders(prev => prev.map(r => {
        if (!r.done && r.datetime && new Date(r.datetime) <= now) { fire(r.title); return { ...r, done: true }; }
        return r;
      }));
      setBoardCards(prev => prev.map(c => {
        if (!c.remindFired && c.datetime && new Date(c.datetime) <= now) { fire(c.text); return { ...c, remindFired: true }; }
        return c;
      }));
    }, 30000);
    return () => clearInterval(iv);
  }, []);

  // ── Board actions ──
  const onBoardCapture = (card) => setBoardCards(p => [card, ...p]);
  const onBoardUpdate = (id, patch) => setBoardCards(p => p.map(c => c.id === id ? { ...c, ...patch } : c));
  const onBoardDelete = (id) => setBoardCards(p => p.filter(c => c.id !== id));
  const onSendToProject = (card) => {
    if (!card.projectId) return;
    setProjects(p => p.map(pr => pr.id === card.projectId
      ? { ...pr, ideas: [{ id: 'i' + Date.now(), text: card.text, pinned: false }, ...pr.ideas] }
      : pr));
    onBoardDelete(card.id);
  };

  // ── Project actions ──
  const onAddIdea = (projId, idea) => {
    setProjects(p => p.map(pr => pr.id === projId ? { ...pr, ideas: [idea, ...pr.ideas] } : pr));
  };
  const onDeleteIdea = (projId, ideaId) => {
    setProjects(p => p.map(pr => pr.id === projId ? { ...pr, ideas: pr.ideas.filter(i => i.id !== ideaId) } : pr));
  };
  const onAddProject = () => {
    if (!newProjName.trim()) return;
    const id = 'p' + Date.now();
    setProjects(p => [...p, { id, name: newProjName.trim(), color: newProjColor, ideas: [] }]);
    setActiveProj(id); setView('board');
    setNewProjName(''); setShowProjForm(false);
  };

  // ── Task actions ──
  const onAddTask = (task) => setTasks(p => [...p, task]);
  const onToggleTask = (id) => setTasks(p => p.map(t => t.id === id ? { ...t, done: !t.done } : t));
  const onDeleteTask = (id) => setTasks(p => p.filter(t => t.id !== id));

  // ── Reminder actions ──
  const onAddReminder = (rem) => setReminders(p => [...p, rem]);
  const onMarkReminderDone = (id) => setReminders(p => p.map(r => r.id === id ? { ...r, done: true } : r));
  const onDeleteReminder = (id) => setReminders(p => p.filter(r => r.id !== id));

  const proj = projects.find(p => p.id === activeProj);
  const boardOverdue = boardCards.filter(c => c.datetime && !c.remindFired && new Date(c.datetime) < new Date()).length;

  return (
    <div style={{
      display: 'flex', height: '100vh', width: '100vw',
      fontFamily: "'SF Pro Text', -apple-system, BlinkMacSystemFont, sans-serif",
      background: '#0c0c0e', color: '#e2e0da', overflow: 'hidden'
    }}>
      {/* Sidebar */}
      <Sidebar
        view={view} setView={setView}
        activeProj={activeProj} setActiveProj={setActiveProj}
        projects={projects} tasks={tasks} reminders={reminders}
        boardOverdue={boardOverdue}
        showProjForm={showProjForm} setShowProjForm={setShowProjForm}
        newProjName={newProjName} setNewProjName={setNewProjName}
        newProjColor={newProjColor} setNewProjColor={setNewProjColor}
        onAddProject={onAddProject}
      />

      {/* Main */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {view === 'capture' && (
          <UniversalBoard
            boardCards={boardCards} projects={projects}
            onCapture={onBoardCapture} onUpdateCard={onBoardUpdate}
            onDeleteCard={onBoardDelete} onSendToProject={onSendToProject}
          />
        )}

        {view === 'board' && (
          <ProjectBoard proj={proj} onAddIdea={onAddIdea} onDeleteIdea={onDeleteIdea} />
        )}

        {view === 'tasks' && (
          <DailyTasks tasks={tasks} onAddTask={onAddTask} onToggleTask={onToggleTask} onDeleteTask={onDeleteTask} />
        )}

        {view === 'reminders' && (
          <Reminders reminders={reminders} projects={projects}
            onAddReminder={onAddReminder} onMarkDone={onMarkReminderDone} onDeleteReminder={onDeleteReminder}
          />
        )}
      </div>
    </div>
  );
}

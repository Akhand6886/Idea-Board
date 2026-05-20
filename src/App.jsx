import React, { useState, useEffect, useCallback } from "react";
import { Sidebar } from "./components/Sidebar";
import { UniversalBoard } from "./components/UniversalBoard";
import { ProjectBoard } from "./components/ProjectBoard";
import { DailyTasks } from "./components/DailyTasks";
import { Reminders } from "./components/Reminders";
import { CommandPalette } from "./components/CommandPalette";
import { api } from "./api";

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

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

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
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('ideaos_theme') || 'dark';
  });

  const [view, setView] = useState('capture');
  const [activeProj, setActiveProj] = useState('p1');
  const [showPalette, setShowPalette] = useState(false);

  // New project form
  const [showProjForm, setShowProjForm] = useState(false);
  const [newProjName, setNewProjName] = useState('');
  const [newProjColor, setNewProjColor] = useState('#10b981');

  const [syncStatus, setSyncStatus] = useState('connecting'); // 'connecting' | 'synced' | 'offline'

  const runSync = useCallback((promise) => {
    return promise
      .then(res => {
        setSyncStatus('synced');
        return res;
      })
      .catch(err => {
        console.warn(err);
        setSyncStatus('offline');
        throw err;
      });
  }, []);

  // ── Load from Backend API on mount ──
  useEffect(() => {
    runSync(api.loadAll()).then(data => {
      if (data.projects) setProjects(data.projects);
      if (data.reminders) setReminders(data.reminders);
      if (data.tasks) setTasks(data.tasks);
      if (data.universal) setBoardCards(data.universal);

      // Register Service Worker & Web-Push Subscription
      if (data.vapidPublicKey && 'serviceWorker' in navigator && 'PushManager' in window) {
        navigator.serviceWorker.register('/sw.js').then(reg => {
          reg.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(data.vapidPublicKey)
          }).then(sub => {
            runSync(api.subscribe(sub)).catch(console.warn);
          }).catch(err => console.warn('Push subscription failed:', err));
        }).catch(err => console.warn('SW registration failed:', err));
      }
    }).catch(err => {
      console.warn('Backend API offline, using localStorage fallback:', err);
      setSyncStatus('offline');
    });
  }, [runSync]);

  // ── Persist to localStorage ──
  useEffect(() => { localStorage.setItem('ideaos_projects', JSON.stringify(projects)); }, [projects]);
  useEffect(() => { localStorage.setItem('ideaos_reminders', JSON.stringify(reminders)); }, [reminders]);
  useEffect(() => { localStorage.setItem('ideaos_tasks', JSON.stringify(tasks)); }, [tasks]);
  useEffect(() => { localStorage.setItem('ideaos_board', JSON.stringify(boardCards)); }, [boardCards]);
  useEffect(() => { 
    localStorage.setItem('ideaos_theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // ── Global keyboard shortcut: ⌘K ──
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowPalette(v => !v);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // ── Notification permission ──
  useEffect(() => {
    if ('Notification' in window) Notification.requestPermission();
  }, []);

  // ── Local Reminder notification check fallback ──
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

  // ── Theme ──
  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

  // ── Board actions ──
  const onBoardCapture = (card) => {
    setBoardCards(p => [card, ...p]);
    runSync(api.createUniversal(card)).catch(console.warn);
  };
  const onBoardUpdate = (id, patch) => {
    setBoardCards(p => p.map(c => c.id === id ? { ...c, ...patch } : c));
    runSync(api.updateUniversal(id, patch)).catch(console.warn);
  };
  const onBoardDelete = (id) => {
    setBoardCards(p => p.filter(c => c.id !== id));
    runSync(api.deleteUniversal(id)).catch(console.warn);
  };
  const onSendToProject = (card) => {
    if (!card.projectId) return;
    const ideaId = 'i' + Date.now();
    const newIdea = { id: ideaId, text: card.text, pinned: false };
    setProjects(p => p.map(pr => pr.id === card.projectId
      ? { ...pr, ideas: [newIdea, ...pr.ideas] }
      : pr));
    onBoardDelete(card.id);
    runSync(api.createIdea(card.projectId, newIdea)).catch(console.warn);
  };
  const onMoveCardToProject = (cardId, projectId) => {
    const card = boardCards.find(c => c.id === cardId);
    if (!card) return;
    const ideaId = 'i' + Date.now();
    const newIdea = { id: ideaId, text: card.text, pinned: false };
    setProjects(p => p.map(pr => pr.id === projectId
      ? { ...pr, ideas: [newIdea, ...pr.ideas] }
      : pr));
    onBoardDelete(cardId);
    runSync(api.createIdea(projectId, newIdea)).catch(console.warn);
  };

  // ── Project actions ──
  const onAddIdea = (projId, idea) => {
    setProjects(p => p.map(pr => pr.id === projId ? { ...pr, ideas: [idea, ...pr.ideas] } : pr));
    runSync(api.createIdea(projId, idea)).catch(console.warn);
  };
  const onDeleteIdea = (projId, ideaId) => {
    setProjects(p => p.map(pr => pr.id === projId ? { ...pr, ideas: pr.ideas.filter(i => i.id !== ideaId) } : pr));
    runSync(api.deleteIdea(ideaId)).catch(console.warn);
  };
  const onTogglePin = (projId, ideaId) => {
    let newPinned = false;
    setProjects(p => p.map(pr => pr.id === projId
      ? { ...pr, ideas: pr.ideas.map(i => { if (i.id === ideaId) { newPinned = !i.pinned; return { ...i, pinned: newPinned }; } return i; }) }
      : pr));
    setTimeout(() => runSync(api.updateIdea(ideaId, { pinned: newPinned })).catch(console.warn), 0);
  };
  const onUpdateIdea = (projId, ideaId, fields) => {
    setProjects(p => p.map(pr => pr.id === projId
      ? { ...pr, ideas: pr.ideas.map(i => i.id === ideaId ? { ...i, ...fields } : i) }
      : pr));
    runSync(api.updateIdea(ideaId, fields)).catch(console.warn);
  };
  const onAddProject = () => {
    if (!newProjName.trim()) return;
    const id = 'p' + Date.now();
    const newProj = { id, name: newProjName.trim(), color: newProjColor, ideas: [] };
    setProjects(p => [...p, newProj]);
    setActiveProj(id); setView('board');
    setNewProjName(''); setShowProjForm(false);
    runSync(api.createProject(newProj)).catch(console.warn);
  };
  const onDeleteProject = (id) => {
    setProjects(p => p.filter(pr => pr.id !== id));
    if (activeProj === id) {
      setActiveProj(projects[0]?.id || '');
      setView('capture');
    }
    runSync(api.deleteProject(id)).catch(console.warn);
  };
  const onRenameProject = (id, name) => {
    setProjects(p => p.map(pr => pr.id === id ? { ...pr, name } : pr));
    runSync(api.updateProject(id, { name })).catch(console.warn);
  };

  // ── Task actions ──
  const onAddTask = (task) => {
    setTasks(p => [...p, task]);
    runSync(api.createTask(task)).catch(console.warn);
  };
  const onUpdateTask = (id, fields) => {
    let completedAll = false;
    setTasks(p => {
      const updated = p.map(t => {
        if (t.id === id) {
          return { ...t, ...fields };
        }
        return t;
      });
      if (fields.done !== undefined) {
        const activeCount = updated.filter(t => !t.done).length;
        const targetTask = p.find(t => t.id === id);
        if (fields.done && activeCount === 0 && updated.length > 0 && targetTask && !targetTask.done) {
          completedAll = true;
        }
      }
      return updated;
    });
    if (completedAll) {
      import("./utils/confetti").then(({ triggerConfetti }) => triggerConfetti());
    }
    runSync(api.updateTask(id, fields)).catch(console.warn);
  };
  const onDeleteTask = (id) => {
    setTasks(p => p.filter(t => t.id !== id));
    runSync(api.deleteTask(id)).catch(console.warn);
  };
  const onReorderTasks = (fromIdx, toIdx) => {
    setTasks(prev => {
      const updated = [...prev];
      const [moved] = updated.splice(fromIdx, 1);
      updated.splice(toIdx, 0, moved);
      setTimeout(() => {
        runSync(api.reorderTasks(updated.map(t => t.id))).catch(console.warn);
      }, 0);
      return updated;
    });
  };

  // ── Reminder actions ──
  const onAddReminder = (rem) => {
    setReminders(p => [...p, rem]);
    runSync(api.createReminder(rem)).catch(console.warn);
  };
  const onUpdateReminder = (id, fields) => {
    setReminders(p => p.map(r => r.id === id ? { ...r, ...fields } : r));
    runSync(api.updateReminder(id, fields)).catch(console.warn);
  };
  const onDeleteReminder = (id) => {
    setReminders(p => p.filter(r => r.id !== id));
    runSync(api.deleteReminder(id)).catch(console.warn);
  };

  // ── Command palette navigation ──
  const onPaletteNavigate = useCallback((targetView, projId) => {
    setView(targetView);
    if (projId) setActiveProj(projId);
  }, []);

  const proj = projects.find(p => p.id === activeProj);
  const boardOverdue = boardCards.filter(c => c.datetime && !c.remindFired && new Date(c.datetime) < new Date()).length;

  return (
    <div style={{
      display: 'flex', height: '100vh', width: '100vw',
      fontFamily: "'SF Pro Text', -apple-system, BlinkMacSystemFont, sans-serif",
      background: 'var(--bg-app)', color: 'var(--text-main)', overflow: 'hidden'
    }}>
      {/* Command Palette */}
      <CommandPalette
        open={showPalette}
        onClose={() => setShowPalette(false)}
        projects={projects}
        boardCards={boardCards}
        tasks={tasks}
        reminders={reminders}
        onNavigate={onPaletteNavigate}
        onAddTask={onAddTask}
        onAddIdea={onAddIdea}
        onAddReminder={onAddReminder}
        activeProjId={activeProj}
      />

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
        onDeleteProject={onDeleteProject}
        onRenameProject={onRenameProject}
        theme={theme} toggleTheme={toggleTheme}
        onOpenPalette={() => setShowPalette(true)}
        syncStatus={syncStatus}
        onMoveCardToProject={onMoveCardToProject}
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
          <ProjectBoard 
            proj={proj} 
            onAddIdea={onAddIdea} 
            onDeleteIdea={onDeleteIdea} 
            onTogglePin={onTogglePin}
            onUpdateIdea={onUpdateIdea}
          />
        )}

        {view === 'tasks' && (
          <DailyTasks 
            tasks={tasks} 
            onAddTask={onAddTask} 
            onUpdateTask={onUpdateTask} 
            onDeleteTask={onDeleteTask} 
            onReorderTasks={onReorderTasks} 
          />
        )}

        {view === 'reminders' && (
          <Reminders 
            reminders={reminders} 
            projects={projects}
            onAddReminder={onAddReminder} 
            onUpdateReminder={onUpdateReminder} 
            onDeleteReminder={onDeleteReminder}
          />
        )}
      </div>
    </div>
  );
}

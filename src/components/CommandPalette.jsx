import React, { useState, useEffect, useRef, useMemo } from "react";
import { Search, LayoutGrid, Lightbulb, CheckSquare, Bell, Folder, X } from "lucide-react";

export function CommandPalette({
  open, onClose, projects, boardCards, tasks, reminders,
  onNavigate, onAddTask, onAddIdea, onAddReminder, activeProjId
}) {
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) {
      setQuery('');
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  // Build navigation & database searchable items
  const searchItems = useMemo(() => {
    const list = [
      { id: 'nav-capture', label: 'Universal Board', type: 'nav', icon: <LayoutGrid size={14} />, action: () => onNavigate('capture') },
      { id: 'nav-tasks', label: 'Daily Tasks', type: 'nav', icon: <CheckSquare size={14} />, action: () => onNavigate('tasks') },
      { id: 'nav-reminders', label: 'Reminders', type: 'nav', icon: <Bell size={14} />, action: () => onNavigate('reminders') },
    ];

    projects.forEach(p => {
      list.push({ id: 'proj-' + p.id, label: p.name, type: 'project', icon: <Folder size={14} />, color: p.color, action: () => onNavigate('board', p.id) });
      p.ideas.forEach(i => {
        list.push({ id: 'idea-' + i.id, label: i.text, type: 'idea', sublabel: p.name, color: p.color, action: () => onNavigate('board', p.id) });
      });
    });

    boardCards.forEach(c => {
      list.push({ id: 'card-' + c.id, label: c.text, type: 'card', sublabel: 'Universal Board', action: () => onNavigate('capture') });
    });

    tasks.forEach(t => {
      list.push({ id: 'task-' + t.id, label: t.text, type: 'task', sublabel: t.done ? 'Done' : 'Todo', action: () => onNavigate('tasks') });
    });

    reminders.filter(r => !r.done).forEach(r => {
      list.push({ id: 'rem-' + r.id, label: r.title, type: 'reminder', sublabel: new Date(r.datetime).toLocaleDateString(), action: () => onNavigate('reminders') });
    });

    return list;
  }, [projects, boardCards, tasks, reminders, onNavigate]);

  // Command items when query starts with '/'
  const filtered = useMemo(() => {
    if (query.startsWith('/')) {
      const q = query.toLowerCase();
      if (q.startsWith('/task')) {
        const text = query.substring(5).trim();
        return [{
          id: 'cmd-task',
          label: text ? `Add Task: "${text}"` : 'Type task description... (e.g. /task Buy groceries)',
          type: 'command',
          icon: <CheckSquare size={14} />,
          action: () => {
            if (!text) return;
            onAddTask({ id: 't' + Date.now(), text, done: false });
          }
        }];
      }
      if (q.startsWith('/idea')) {
        const text = query.substring(6).trim();
        const activeProj = projects.find(p => p.id === activeProjId) || projects[0];
        const projName = activeProj ? activeProj.name : 'current project';
        return [{
          id: 'cmd-idea',
          label: text ? `Add Idea to ${projName}: "${text}"` : `Type idea description for ${projName}... (e.g. /idea Learn Rust)`,
          type: 'command',
          icon: <Lightbulb size={14} />,
          action: () => {
            if (!text || !activeProj) return;
            onAddIdea(activeProj.id, { id: 'i' + Date.now(), text, pinned: false });
          }
        }];
      }
      if (q.startsWith('/rem')) {
        const text = query.substring(5).trim();
        return [{
          id: 'cmd-rem',
          label: text ? `Add Reminder (Tomorrow): "${text}"` : 'Type reminder title... (e.g. /rem Dentist appointment)',
          type: 'command',
          icon: <Bell size={14} />,
          action: () => {
            if (!text) return;
            const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 16);
            onAddReminder({ id: 'r' + Date.now(), title: text, datetime: tomorrow, projectId: '', done: false });
          }
        }];
      }

      // Default suggestions when typing '/'
      return [
        { id: 'suggest-task', label: 'Create a new task', type: 'suggest', icon: <CheckSquare size={14} />, action: () => setQuery('/task ') },
        { id: 'suggest-idea', label: 'Create a new project idea', type: 'suggest', icon: <Lightbulb size={14} />, action: () => setQuery('/idea ') },
        { id: 'suggest-rem', label: 'Create a new reminder', type: 'suggest', icon: <Bell size={14} />, action: () => setQuery('/rem ') },
      ];
    }

    return query.trim()
      ? searchItems.filter(i => i.label.toLowerCase().includes(query.toLowerCase()))
      : searchItems.slice(0, 8);
  }, [query, searchItems, projects, activeProjId, onAddTask, onAddIdea, onAddReminder]);

  const [selectedIdx, setSelectedIdx] = useState(0);

  useEffect(() => { setSelectedIdx(0); }, [query]);

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setSelectedIdx(i => Math.min(i + 1, filtered.length - 1)); }
    if (e.key === 'ArrowUp') { e.preventDefault(); setSelectedIdx(i => Math.max(i - 1, 0)); }
    if (e.key === 'Enter' && filtered[selectedIdx]) { filtered[selectedIdx].action(); onClose(); }
    if (e.key === 'Escape') onClose();
  };

  if (!open) return null;

  const typeLabels = {
    nav: 'Navigate',
    project: 'Project',
    idea: 'Idea',
    card: 'Card',
    task: 'Task',
    reminder: 'Reminder',
    command: 'Run Command',
    suggest: 'Command suggestion'
  };

  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: '20vh', zIndex: 1000
    }}>
      <div onClick={e => e.stopPropagation()} className="animate-in" style={{
        width: 520, background: 'var(--bg-sidebar)', border: '1px solid var(--border-main)',
        borderRadius: 12, overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.4)'
      }}>
        {/* Search input */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', borderBottom: '1px solid var(--border-subtle)' }}>
          <Search size={16} color="var(--text-dim)" />
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search, jump to, or type '/' for commands..."
            style={{ flex: 1, background: 'transparent', border: 'none', color: 'var(--text-main)', fontSize: 14, outline: 'none' }}
          />
          <kbd style={{ fontSize: 10, color: 'var(--text-muted)', background: 'var(--bg-input)', padding: '2px 6px', borderRadius: 4, border: '1px solid var(--border-main)' }}>esc</kbd>
        </div>

        {/* Results */}
        <div style={{ maxHeight: 320, overflow: 'auto', padding: '6px 0' }}>
          {filtered.length === 0 && (
            <div style={{ padding: '20px 16px', color: 'var(--text-muted)', fontSize: 13, textAlign: 'center' }}>
              No results for "{query}"
            </div>
          )}
          {filtered.map((item, idx) => (
            <button
              key={item.id}
              onClick={() => { item.action(); if (item.type !== 'suggest') onClose(); }}
              onMouseEnter={() => setSelectedIdx(idx)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '8px 16px',
                border: 'none', cursor: 'pointer', textAlign: 'left',
                background: idx === selectedIdx ? 'var(--accent-glow)' : 'transparent',
                color: 'var(--text-main)', fontSize: 13,
              }}
            >
              <span style={{ color: item.color || 'var(--text-dim)', display: 'flex', flexShrink: 0 }}>{item.icon || <Search size={14} />}</span>
              <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.label}</span>
              {item.sublabel && <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{item.sublabel}</span>}
              <span style={{ fontSize: 10, color: 'var(--text-muted)', background: 'var(--bg-input)', padding: '1px 6px', borderRadius: 3 }}>{typeLabels[item.type]}</span>
            </button>
          ))}
        </div>

        {/* Footer */}
        <div style={{ padding: '8px 16px', borderTop: '1px solid var(--border-subtle)', display: 'flex', gap: 12, justifyContent: 'center' }}>
          {[['↑↓', 'navigate'], ['↵', 'select'], ['esc', 'close']].map(([key, label]) => (
            <span key={label} style={{ fontSize: 10, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
              <kbd style={{ background: 'var(--bg-input)', padding: '1px 5px', borderRadius: 3, border: '1px solid var(--border-main)', fontSize: 10 }}>{key}</kbd> {label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

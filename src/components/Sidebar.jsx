import React, { useState } from "react";
import { LayoutGrid, Lightbulb, CheckSquare, Bell, Plus, Sun, Moon, Search, MoreHorizontal, Edit2, Trash2, X, Check } from "lucide-react";

const PALETTE = ['#f59e0b','#10b981','#3b82f6','#ec4899','#8b5cf6','#f97316','#06b6d4','#ef4444'];

export function Sidebar({ 
  view, setView, activeProj, setActiveProj, 
  projects, tasks, reminders, boardOverdue,
  showProjForm, setShowProjForm,
  newProjName, setNewProjName,
  newProjColor, setNewProjColor,
  onAddProject, onDeleteProject, onRenameProject,
  theme, toggleTheme, onOpenPalette,
  syncStatus, onMoveCardToProject
}) {
  const pending = reminders.filter(r => !r.done).length;
  const doneCount = tasks.filter(t => t.done).length;
  const [contextMenu, setContextMenu] = useState(null); // project id
  const [renaming, setRenaming] = useState(null); // { id, name }
  const [confirmDelete, setConfirmDelete] = useState(null); // project id
  const [dragOverProjId, setDragOverProjId] = useState(null);

  const handleRenameSubmit = () => {
    if (renaming && renaming.name.trim()) {
      onRenameProject(renaming.id, renaming.name.trim());
    }
    setRenaming(null);
    setContextMenu(null);
  };

  const handleDeleteConfirm = (id) => {
    onDeleteProject(id);
    setConfirmDelete(null);
    setContextMenu(null);
  };

  return (
    <div style={{ width: 210, background: 'var(--bg-sidebar)', borderRight: '1px solid var(--border-main)', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
      {/* Branding */}
      <div style={{ padding: '18px 14px 10px', borderBottom: '1px solid var(--border-main)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: '-0.4px', color: 'var(--accent)' }}>IdeaOS</div>
            <div 
              title={syncStatus === 'synced' ? 'Synced to database' : syncStatus === 'offline' ? 'Offline (local fallback)' : 'Syncing...'} 
              style={{
                width: 6, height: 6, borderRadius: '50%',
                background: syncStatus === 'synced' ? 'var(--success)' : syncStatus === 'offline' ? 'var(--danger)' : 'var(--accent)',
                boxShadow: syncStatus === 'connecting' ? '0 0 6px var(--accent)' : 'none',
                animation: syncStatus === 'connecting' ? 'pulse 1s infinite' : 'none',
              }} 
            />
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>Your dev workspace</div>
        </div>
        <div style={{ display: 'flex', gap: 2 }}>
          <button onClick={onOpenPalette} aria-label="Search (⌘K)" title="⌘K"
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-dim)', padding: 4, borderRadius: 4, display: 'flex', alignItems: 'center' }}>
            <Search size={14} />
          </button>
          <button onClick={toggleTheme} aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-dim)', padding: 4, borderRadius: 4, display: 'flex', alignItems: 'center' }}>
            {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
          </button>
        </div>
      </div>

      {/* Navigation */}
      <div style={{ padding: '8px 6px 4px' }}>
        {[
          ['capture', <LayoutGrid size={13} />, 'Universal Board', boardOverdue > 0 ? [boardOverdue + '!', '#f87171', '#1f0d0d'] : null],
          ['board', <Lightbulb size={13} />, 'Idea Board', null],
          ['tasks', <CheckSquare size={13} />, 'Daily Tasks', [doneCount + '/' + tasks.length, '#4ade80', '#0d1f0d']],
          ['reminders', <Bell size={13} />, 'Reminders', pending > 0 ? [pending, '#f87171', '#1f0d0d'] : null],
        ].map(([id, icon, label, badge]) => (
          <button key={id} onClick={() => setView(id)} style={{
            display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '7px 10px',
            borderRadius: 6, border: 'none', cursor: 'pointer',
            background: view === id ? 'var(--border-main)' : 'transparent',
            color: view === id ? 'var(--text-main)' : 'var(--text-dim)',
            fontSize: 12.5, fontWeight: view === id ? 500 : 400, marginBottom: 2, textAlign: 'left'
          }}>
            {icon}{label}
            {badge && <span style={{ marginLeft: 'auto', fontSize: 10, background: badge[2], color: badge[1], padding: '1px 6px', borderRadius: 10 }}>{badge[0]}</span>}
          </button>
        ))}
      </div>

      {/* Projects */}
      <div style={{ padding: '10px 6px 6px', flex: 1, overflow: 'auto' }}>
        <div style={{ fontSize: 10, color: 'var(--text-muted)', letterSpacing: 1, textTransform: 'uppercase', padding: '0 10px', marginBottom: 5 }}>Projects</div>
        {projects.map(p => (
          <div key={p.id} style={{ position: 'relative' }}>
            {renaming && renaming.id === p.id ? (
              /* Rename inline input */
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 6px' }}>
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: p.color, flexShrink: 0 }} />
                <input
                  autoFocus
                  value={renaming.name}
                  onChange={e => setRenaming(r => ({ ...r, name: e.target.value }))}
                  onKeyDown={e => { if (e.key === 'Enter') handleRenameSubmit(); if (e.key === 'Escape') setRenaming(null); }}
                  onBlur={handleRenameSubmit}
                  style={{ flex: 1, background: 'var(--bg-input)', border: '1px solid var(--accent)', borderRadius: 4, color: 'var(--text-main)', fontSize: 12, padding: '2px 6px', outline: 'none' }}
                />
              </div>
            ) : (
              <button 
                onClick={() => { setActiveProj(p.id); setView('board'); setContextMenu(null); }} 
                onDragOver={e => {
                  e.preventDefault();
                  setDragOverProjId(p.id);
                }}
                onDragLeave={() => {
                  setDragOverProjId(null);
                }}
                onDrop={e => {
                  e.preventDefault();
                  setDragOverProjId(null);
                  try {
                    const data = JSON.parse(e.dataTransfer.getData("application/json"));
                    if (data && data.cardId) {
                      onMoveCardToProject(data.cardId, p.id);
                    }
                  } catch (err) {
                    console.warn(err);
                  }
                }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '6px 10px',
                  borderRadius: 6, cursor: 'pointer',
                  background: dragOverProjId === p.id 
                    ? 'var(--accent-glow)' 
                    : (activeProj === p.id && view === 'board' ? 'var(--border-main)' : 'transparent'),
                  border: dragOverProjId === p.id ? '1px dashed var(--accent)' : 'none',
                  color: activeProj === p.id && view === 'board' ? 'var(--text-main)' : 'var(--text-dim)',
                  fontSize: 12.5, textAlign: 'left', marginBottom: 1,
                  boxSizing: 'border-box'
                }}
              >
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: p.color, flexShrink: 0 }} />
                <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</span>
                <span style={{ fontSize: 10.5, color: 'var(--text-muted)' }}>{p.ideas.length}</span>
                <span
                  onClick={(e) => { e.stopPropagation(); setContextMenu(contextMenu === p.id ? null : p.id); }}
                  style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', padding: '0 2px', opacity: contextMenu === p.id ? 1 : 0.4 }}
                >
                  <MoreHorizontal size={12} />
                </span>
              </button>
            )}

            {/* Context menu */}
            {contextMenu === p.id && !renaming && (
              <div className="animate-in" style={{
                position: 'absolute', right: 6, top: '100%', zIndex: 50,
                background: 'var(--bg-card)', border: '1px solid var(--border-main)',
                borderRadius: 8, padding: 4, boxShadow: 'var(--shadow-card)',
                minWidth: 120
              }}>
                {confirmDelete === p.id ? (
                  <div style={{ padding: '6px 8px', fontSize: 11 }}>
                    <div style={{ color: 'var(--danger)', fontWeight: 500, marginBottom: 6 }}>Delete "{p.name}" and {p.ideas.length} ideas?</div>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button onClick={() => handleDeleteConfirm(p.id)} style={{ flex: 1, background: '#f8717120', border: '1px solid #f8717140', color: '#f87171', borderRadius: 4, padding: '3px 8px', cursor: 'pointer', fontSize: 11, fontWeight: 500 }}>Delete</button>
                      <button onClick={() => setConfirmDelete(null)} style={{ flex: 1, background: 'var(--bg-input)', border: '1px solid var(--border-main)', color: 'var(--text-dim)', borderRadius: 4, padding: '3px 8px', cursor: 'pointer', fontSize: 11 }}>Cancel</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <button onClick={() => { setRenaming({ id: p.id, name: p.name }); }} style={{
                      display: 'flex', alignItems: 'center', gap: 6, width: '100%', padding: '5px 8px',
                      border: 'none', cursor: 'pointer', borderRadius: 4, background: 'transparent', color: 'var(--text-main)', fontSize: 11, textAlign: 'left'
                    }}>
                      <Edit2 size={11} /> Rename
                    </button>
                    <button onClick={() => setConfirmDelete(p.id)} style={{
                      display: 'flex', alignItems: 'center', gap: 6, width: '100%', padding: '5px 8px',
                      border: 'none', cursor: 'pointer', borderRadius: 4, background: 'transparent', color: '#f87171', fontSize: 11, textAlign: 'left'
                    }}>
                      <Trash2 size={11} /> Delete
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        ))}

        <button onClick={() => setShowProjForm(v => !v)} style={{
          display: 'flex', alignItems: 'center', gap: 7, width: '100%', padding: '6px 10px',
          borderRadius: 6, border: 'none', cursor: 'pointer', background: 'transparent',
          color: 'var(--text-muted)', fontSize: 12, textAlign: 'left', marginTop: 4
        }}>
          <Plus size={11} /> New project
        </button>

        {showProjForm && (
          <div className="animate-in" style={{ padding: '8px 10px', background: 'var(--bg-input-inner)', borderRadius: 7, margin: '4px 0 8px' }}>
            <input value={newProjName} onChange={e => setNewProjName(e.target.value)} placeholder="Project name"
              autoFocus
              onKeyDown={e => { if (e.key === 'Enter') onAddProject(); if (e.key === 'Escape') setShowProjForm(false); }}
              style={{ width: '100%', background: 'transparent', border: 'none', color: 'var(--text-main)', fontSize: 12, outline: 'none', marginBottom: 8 }} />
            <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 8 }}>
              {PALETTE.map(c => <div key={c} onClick={() => setNewProjColor(c)} style={{
                width: 14, height: 14, borderRadius: '50%', background: c, cursor: 'pointer',
                border: newProjColor === c ? '2px solid rgba(255,255,255,0.7)' : '2px solid transparent', boxSizing: 'border-box'
              }} />)}
            </div>
            <button onClick={onAddProject} style={{ fontSize: 11, background: 'var(--accent)', color: '#000', border: 'none', borderRadius: 4, padding: '3px 10px', cursor: 'pointer', fontWeight: 600 }}>Create</button>
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{ padding: '10px 14px', borderTop: '1px solid var(--border-main)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
          {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
        </span>
        <kbd style={{ fontSize: 9, color: 'var(--text-muted)', background: 'var(--bg-input)', padding: '1px 5px', borderRadius: 3, border: '1px solid var(--border-main)' }}>⌘K</kbd>
      </div>
    </div>
  );
}

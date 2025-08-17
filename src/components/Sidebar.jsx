import React from "react";
import { LayoutGrid, Lightbulb, CheckSquare, Bell, Plus } from "lucide-react";

const PALETTE = ['#f59e0b','#10b981','#3b82f6','#ec4899','#8b5cf6','#f97316','#06b6d4','#ef4444'];

export function Sidebar({ 
  view, setView, activeProj, setActiveProj, 
  projects, tasks, reminders, boardOverdue,
  showProjForm, setShowProjForm,
  newProjName, setNewProjName,
  newProjColor, setNewProjColor,
  onAddProject
}) {
  const pending = reminders.filter(r => !r.done).length;
  const doneCount = tasks.filter(t => t.done).length;

  return (
    <div style={{ width: 210, background: '#101012', borderRight: '1px solid #1c1c1f', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
      {/* Branding */}
      <div style={{ padding: '18px 14px 10px', borderBottom: '1px solid #1a1a1d' }}>
        <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: '-0.4px', color: '#f59e0b' }}>IdeaOS</div>
        <div style={{ fontSize: 11, color: '#333', marginTop: 2 }}>Your dev workspace</div>
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
            background: view === id ? '#1c1c1f' : 'transparent',
            color: view === id ? '#f0ede5' : '#5a5a5e',
            fontSize: 12.5, fontWeight: view === id ? 500 : 400, marginBottom: 2, textAlign: 'left'
          }}>
            {icon}{label}
            {badge && <span style={{ marginLeft: 'auto', fontSize: 10, background: badge[2], color: badge[1], padding: '1px 6px', borderRadius: 10 }}>{badge[0]}</span>}
          </button>
        ))}
      </div>

      {/* Projects */}
      <div style={{ padding: '10px 6px 6px', flex: 1, overflow: 'auto' }}>
        <div style={{ fontSize: 10, color: '#333', letterSpacing: 1, textTransform: 'uppercase', padding: '0 10px', marginBottom: 5 }}>Projects</div>
        {projects.map(p => (
          <button key={p.id} onClick={() => { setActiveProj(p.id); setView('board'); }} style={{
            display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '6px 10px',
            borderRadius: 6, border: 'none', cursor: 'pointer',
            background: activeProj === p.id && view === 'board' ? '#1c1c1f' : 'transparent',
            color: activeProj === p.id && view === 'board' ? '#e2e0da' : '#5a5a5e',
            fontSize: 12.5, textAlign: 'left', marginBottom: 1
          }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: p.color, flexShrink: 0 }} />
            <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</span>
            <span style={{ fontSize: 10.5, color: '#2e2e32' }}>{p.ideas.length}</span>
          </button>
        ))}

        <button onClick={() => setShowProjForm(v => !v)} style={{
          display: 'flex', alignItems: 'center', gap: 7, width: '100%', padding: '6px 10px',
          borderRadius: 6, border: 'none', cursor: 'pointer', background: 'transparent',
          color: '#333', fontSize: 12, textAlign: 'left', marginTop: 4
        }}>
          <Plus size={11} /> New project
        </button>

        {showProjForm && (
          <div style={{ padding: '8px 10px', background: '#181819', borderRadius: 7, margin: '4px 0 8px' }}>
            <input value={newProjName} onChange={e => setNewProjName(e.target.value)} placeholder="Project name"
              onKeyDown={e => e.key === 'Enter' && onAddProject()}
              style={{ width: '100%', background: 'transparent', border: 'none', color: '#e2e0da', fontSize: 12, outline: 'none', marginBottom: 8 }} />
            <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 8 }}>
              {PALETTE.map(c => <div key={c} onClick={() => setNewProjColor(c)} style={{
                width: 14, height: 14, borderRadius: '50%', background: c, cursor: 'pointer',
                border: newProjColor === c ? '2px solid rgba(255,255,255,0.7)' : '2px solid transparent', boxSizing: 'border-box'
              }} />)}
            </div>
            <button onClick={onAddProject} style={{ fontSize: 11, background: '#f59e0b', color: '#000', border: 'none', borderRadius: 4, padding: '3px 10px', cursor: 'pointer', fontWeight: 600 }}>Create</button>
          </div>
        )}
      </div>

      {/* Date Footer */}
      <div style={{ padding: '10px 14px', borderTop: '1px solid #1a1a1d', fontSize: 11, color: '#282828' }}>
        {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
      </div>
    </div>
  );
}

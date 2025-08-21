import React, { useState } from "react";
import { Plus, Clock, Check, Trash2 } from "lucide-react";

const inp = { background: 'var(--bg-input-inner)', border: '1px solid var(--border-main)', borderRadius: 7, padding: '7px 11px', color: 'var(--text-main)', fontSize: 13, outline: 'none' };

export function Reminders({ reminders, projects, onAddReminder, onMarkDone, onDeleteReminder }) {
  const [showForm, setShowForm] = useState(false);
  const [newRem, setNewRem] = useState({ title: '', datetime: '', projectId: '' });

  const handleAdd = () => {
    if (!newRem.title || !newRem.datetime) return;
    onAddReminder({ ...newRem, id: 'r' + Date.now(), done: false });
    setNewRem({ title: '', datetime: '', projectId: '' });
    setShowForm(false);
  };

  const pending = reminders.filter(r => !r.done).length;

  return (
    <>
      <div style={{ padding: '16px 22px 12px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 14.5, fontWeight: 600, color: 'var(--text-main)' }}>Reminders</h2>
          <div style={{ fontSize: 11.5, color: 'var(--text-dim)', marginTop: 3 }}>{pending} upcoming</div>
        </div>
        <div style={{ flex: 1 }} />
        <button onClick={() => setShowForm(v => !v)} style={{
          display: 'flex', alignItems: 'center', gap: 6, background: 'var(--accent)', color: '#fff',
          border: 'none', borderRadius: 7, padding: '6px 13px', cursor: 'pointer', fontSize: 13, fontWeight: 600
        }}>
          <Plus size={13} />New
        </button>
      </div>

      {showForm && (
        <div style={{ padding: '12px 22px', borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-sidebar)' }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <input value={newRem.title} onChange={e => setNewRem(p => ({ ...p, title: e.target.value }))}
              placeholder="Reminder title..." style={{ ...inp, flexGrow: 2, minWidth: 180 }} />
            <input type="datetime-local" value={newRem.datetime} onChange={e => setNewRem(p => ({ ...p, datetime: e.target.value }))}
              style={{ ...inp, minWidth: 155 }} />
            <select value={newRem.projectId} onChange={e => setNewRem(p => ({ ...p, projectId: e.target.value }))}
              style={{ ...inp, minWidth: 120, color: newRem.projectId ? 'var(--text-main)' : 'var(--text-muted)' }}>
              <option value="">No project</option>
              {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <button onClick={handleAdd} style={{ background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 7, padding: '0 14px', cursor: 'pointer', fontWeight: 600, fontSize: 13, flexShrink: 0 }}>Save</button>
          </div>
        </div>
      )}

      <div style={{ flex: 1, overflow: 'auto', padding: '16px 22px' }}>
        {reminders.filter(r => !r.done).sort((a, b) => new Date(a.datetime) - new Date(b.datetime)).map(r => {
          const dt = new Date(r.datetime);
          const over = dt < new Date();
          const rproj = projects.find(p => p.id === r.projectId);
          return (
            <div key={r.id} style={{
              display: 'flex', alignItems: 'center', gap: 14, padding: '11px 14px',
              background: 'var(--bg-card)', border: `1px solid ${over ? '#f8717122' : 'var(--border-main)'}`,
              borderRadius: 9, marginBottom: 9
            }}>
              <div style={{
                width: 38, height: 38, borderRadius: 7,
                background: over ? '#1f1010' : 'var(--bg-input)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0
              }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: over ? '#f87171' : 'var(--accent)', lineHeight: 1 }}>{dt.getDate()}</div>
                <div style={{ fontSize: 9, color: over ? '#f87171' : 'var(--text-muted)', textTransform: 'uppercase' }}>{dt.toLocaleString('en', { month: 'short' })}</div>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-main)' }}>{r.title}</div>
                <div style={{ fontSize: 11, color: over ? '#f87171' : 'var(--text-dim)', marginTop: 3, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Clock size={10} />{dt.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                  {over && <span style={{ color: '#f87171' }}>· Overdue</span>}
                  {rproj && <span style={{ color: rproj.color }}>● {rproj.name}</span>}
                </div>
              </div>
              <button onClick={() => onMarkDone(r.id)} style={{
                background: '#0d1a0d', border: '1px solid #1e2e1e', color: '#4ade80',
                borderRadius: 6, padding: '5px 11px', cursor: 'pointer', fontSize: 12
              }}>Done</button>
              <button onClick={() => onDeleteReminder(r.id)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 2 }}><Trash2 size={13} /></button>
            </div>
          );
        })}

        {reminders.filter(r => r.done).length > 0 && <>
          <div style={{ fontSize: 10, color: 'var(--text-muted)', letterSpacing: 1, textTransform: 'uppercase', margin: '18px 0 8px' }}>Completed</div>
          {reminders.filter(r => r.done).map(r => (
            <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0', opacity: 0.3, borderBottom: '1px solid var(--border-subtle)' }}>
              <Check size={13} color="#4ade80" />
              <span style={{ fontSize: 13, textDecoration: 'line-through', color: 'var(--text-dim)', flex: 1 }}>{r.title}</span>
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{new Date(r.datetime).toLocaleDateString()}</span>
            </div>
          ))}
        </>}
      </div>
    </>
  );
}

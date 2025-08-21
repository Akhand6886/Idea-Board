import React, { useState } from "react";
import { Star, X } from "lucide-react";

const inp = { background: 'var(--bg-input-inner)', border: '1px solid var(--border-main)', borderRadius: 7, padding: '7px 11px', color: 'var(--text-main)', fontSize: 13, outline: 'none' };

export function ProjectBoard({ proj, onAddIdea, onDeleteIdea }) {
  const [newIdea, setNewIdea] = useState('');

  const handleAdd = () => {
    if (!newIdea.trim()) return;
    onAddIdea(proj.id, { id: 'i' + Date.now(), text: newIdea.trim(), pinned: false });
    setNewIdea('');
  };

  if (!proj) return null;

  return (
    <>
      <div style={{ padding: '16px 22px 12px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 9, height: 9, borderRadius: '50%', background: proj.color }} />
        <h2 style={{ margin: 0, fontSize: 14.5, fontWeight: 600, color: 'var(--text-main)' }}>{proj.name}</h2>
        <span style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>{proj.ideas.length} ideas</span>
      </div>
      <div style={{ padding: '12px 22px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', gap: 8 }}>
        <input value={newIdea} onChange={e => setNewIdea(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAdd()}
          placeholder={`Capture an idea for ${proj.name}...`} style={{ ...inp, flex: 1 }} />
        <button onClick={handleAdd} style={{ background: proj.color, color: '#000', border: 'none', borderRadius: 7, padding: '0 14px', cursor: 'pointer', fontWeight: 600, fontSize: 13, flexShrink: 0 }}>Add</button>
      </div>
      <div style={{ flex: 1, overflow: 'auto', padding: 20 }}>
        {!proj.ideas.length && <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>No ideas yet.</div>}
        <div style={{ columns: 3, columnGap: 14 }}>
          {proj.ideas.map(idea => (
            <div key={idea.id} style={{
              display: 'block', marginBottom: 13, breakInside: 'avoid',
              background: 'var(--bg-card)', border: '1px solid var(--border-main)', borderLeft: `3px solid ${proj.color}55`,
              borderRadius: 9, padding: '11px 13px', position: 'relative'
            }}>
              {idea.pinned && <Star size={10} style={{ color: proj.color, marginBottom: 5 }} fill={proj.color} />}
              <p style={{ margin: 0, fontSize: 13, lineHeight: 1.65, color: 'var(--text-main)', paddingRight: 16 }}>{idea.text}</p>
              <button onClick={() => onDeleteIdea(proj.id, idea.id)} style={{
                position: 'absolute', top: 7, right: 7, background: 'transparent', border: 'none',
                color: 'var(--text-muted)', cursor: 'pointer', padding: 2, display: 'flex'
              }}><X size={11} /></button>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

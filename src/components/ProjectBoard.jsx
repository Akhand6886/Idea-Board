import React, { useState } from "react";
import { Star, X, Search, Lightbulb } from "lucide-react";
import { inp } from "../styles";

export function ProjectBoard({ proj, onAddIdea, onDeleteIdea, onTogglePin }) {
  const [newIdea, setNewIdea] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingText, setEditingText] = useState(null); // { id, text }
  const [hoveredCard, setHoveredCard] = useState(null);

  const handleAdd = () => {
    if (!newIdea.trim()) return;
    onAddIdea(proj.id, { id: 'i' + Date.now(), text: newIdea.trim(), pinned: false });
    setNewIdea('');
  };

  const handleTextEdit = (ideaId) => {
    if (editingText && editingText.text.trim()) {
      onUpdateIdeaText?.(proj.id, ideaId, editingText.text.trim());
    }
    setEditingText(null);
  };

  if (!proj) return null;

  const filteredIdeas = proj.ideas.filter(i =>
    !searchQuery || i.text.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pinned first, then unpinned
  const sortedIdeas = [
    ...filteredIdeas.filter(i => i.pinned),
    ...filteredIdeas.filter(i => !i.pinned),
  ];

  return (
    <>
      <div style={{ padding: '16px 22px 12px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 9, height: 9, borderRadius: '50%', background: proj.color }} />
        <h2 style={{ margin: 0, fontSize: 14.5, fontWeight: 600, color: 'var(--text-main)' }}>{proj.name}</h2>
        <span style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>{proj.ideas.length} ideas</span>
        <div style={{ flex: 1 }} />
        {/* Search */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--bg-input)', border: '1px solid var(--border-main)', borderRadius: 7, padding: '4px 10px', minWidth: 160 }}>
          <Search size={12} color="var(--text-muted)" />
          <input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search ideas..."
            style={{ background: 'transparent', border: 'none', color: 'var(--text-main)', fontSize: 12, outline: 'none', flex: 1 }}
          />
          {searchQuery && <button onClick={() => setSearchQuery('')} aria-label="Clear search" style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0, display: 'flex' }}><X size={10} /></button>}
        </div>
      </div>
      <div style={{ padding: '12px 22px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', gap: 8 }}>
        <input value={newIdea} onChange={e => setNewIdea(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAdd()}
          placeholder={`Capture an idea for ${proj.name}...`} style={{ ...inp, flex: 1 }} />
        <button onClick={handleAdd} style={{ background: proj.color, color: '#000', border: 'none', borderRadius: 7, padding: '0 14px', cursor: 'pointer', fontWeight: 600, fontSize: 13, flexShrink: 0 }}>Add</button>
      </div>
      <div style={{ flex: 1, overflow: 'auto', padding: 20 }}>
        {!sortedIdeas.length && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
            <Lightbulb size={36} style={{ opacity: 0.2 }} />
            <div style={{ fontSize: 14, fontWeight: 500, marginTop: 16, color: 'var(--text-dim)' }}>
              {searchQuery ? `No ideas matching "${searchQuery}"` : 'No ideas yet'}
            </div>
            <div style={{ fontSize: 12, marginTop: 4 }}>
              {searchQuery ? 'Try a different search' : `Start adding ideas for ${proj.name}`}
            </div>
          </div>
        )}
        <div style={{ columns: 3, columnGap: 14 }}>
          {sortedIdeas.map(idea => {
            const isHovered = hoveredCard === idea.id;
            return (
              <div key={idea.id}
                onMouseEnter={() => setHoveredCard(idea.id)}
                onMouseLeave={() => setHoveredCard(null)}
                style={{
                  display: 'block', marginBottom: 13, breakInside: 'avoid',
                  background: isHovered ? 'var(--bg-card-hover)' : 'var(--bg-card)',
                  border: '1px solid var(--border-main)', borderLeft: `3px solid ${proj.color}55`,
                  borderRadius: 9, padding: '11px 13px', position: 'relative',
                  boxShadow: isHovered ? 'var(--shadow-card)' : 'none',
                  transition: 'background 0.15s ease, box-shadow 0.15s ease',
                }}>
                {/* Pin toggle */}
                <button
                  onClick={() => onTogglePin(proj.id, idea.id)}
                  aria-label={idea.pinned ? 'Unpin idea' : 'Pin idea'}
                  style={{
                    background: 'transparent', border: 'none', cursor: 'pointer', padding: 2,
                    color: idea.pinned ? proj.color : 'var(--text-muted)',
                    opacity: idea.pinned ? 1 : (isHovered ? 0.5 : 0),
                    transition: 'opacity 0.15s',
                    display: 'flex', marginBottom: idea.pinned ? 4 : 0,
                  }}
                >
                  <Star size={10} fill={idea.pinned ? proj.color : 'none'} />
                </button>
                <p style={{ margin: 0, fontSize: 13, lineHeight: 1.65, color: 'var(--text-main)', paddingRight: 16 }}>{idea.text}</p>
                <button onClick={() => onDeleteIdea(proj.id, idea.id)} aria-label="Delete idea" style={{
                  position: 'absolute', top: 7, right: 7, background: 'transparent', border: 'none',
                  color: 'var(--text-muted)', cursor: 'pointer', padding: 2, display: 'flex',
                  opacity: isHovered ? 1 : 0.3, transition: 'opacity 0.15s',
                }}><X size={11} /></button>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}

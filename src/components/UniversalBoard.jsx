import React, { useState, useRef } from "react";
import { ChevronDown, ChevronUp, AlarmClock, Folder, X, Send, Search } from "lucide-react";
import { inp } from "../styles";

function timeAgo(iso) {
  const s = Math.floor((Date.now() - new Date(iso)) / 1000);
  if (s < 60) return 'just now';
  if (s < 3600) return Math.floor(s / 60) + 'm ago';
  if (s < 86400) return Math.floor(s / 3600) + 'h ago';
  return Math.floor(s / 86400) + 'd ago';
}

function fmtDt(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ' ' +
    d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

export function UniversalBoard({ boardCards, projects, onCapture, onUpdateCard, onDeleteCard, onSendToProject }) {
  const [capText, setCapText] = useState('');
  const [capTime, setCapTime] = useState('');
  const [capProj, setCapProj] = useState('');
  const [capExpand, setCapExpand] = useState(false);
  const [filterProj, setFilterProj] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [editCard, setEditCard] = useState(null);
  const [editingText, setEditingText] = useState(null); // { id, text }
  const [hoveredCard, setHoveredCard] = useState(null);
  const capInputRef = useRef(null);

  const handleCapture = () => {
    if (!capText.trim()) return;
    onCapture({
      id: 'b' + Date.now(),
      text: capText.trim(),
      datetime: capTime,
      projectId: capProj,
      createdAt: new Date().toISOString(),
      remindFired: false,
    });
    setCapText(''); setCapTime(''); setCapProj(''); setCapExpand(false);
    capInputRef.current?.focus();
  };

  const handleTextEdit = (cardId) => {
    if (editingText && editingText.text.trim()) {
      onUpdateCard(cardId, { text: editingText.text.trim() });
    }
    setEditingText(null);
  };

  const filteredCards = boardCards.filter(c => {
    if (filterProj === '__timed__') return !!c.datetime;
    if (filterProj) return c.projectId === filterProj;
    return true;
  }).filter(c => !searchQuery || c.text.toLowerCase().includes(searchQuery.toLowerCase()));

  const cardCount = filteredCards.length;
  const totalCount = boardCards.length;

  return (
    <>
      {/* Header */}
      <div style={{ padding: '16px 22px 12px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 14.5, fontWeight: 600, color: 'var(--text-main)' }}>Universal Board</h2>
          <div style={{ fontSize: 11.5, color: 'var(--text-dim)', marginTop: 3 }}>
            {totalCount} card{totalCount !== 1 ? 's' : ''} · Capture anything
          </div>
        </div>
        {/* Search */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--bg-input)', border: '1px solid var(--border-main)', borderRadius: 7, padding: '4px 10px', minWidth: 180 }}>
          <Search size={12} color="var(--text-muted)" />
          <input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search cards..."
            style={{ background: 'transparent', border: 'none', color: 'var(--text-main)', fontSize: 12, outline: 'none', flex: 1 }}
          />
          {searchQuery && <button onClick={() => setSearchQuery('')} aria-label="Clear search" style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0, display: 'flex' }}><X size={10} /></button>}
        </div>
      </div>

      {/* Quick-capture input */}
      <div style={{ padding: '14px 22px', borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-sidebar)' }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: capExpand ? 10 : 0 }}>
          <input
            ref={capInputRef}
            value={capText}
            onChange={e => setCapText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleCapture()}
            placeholder="Type a word, thought, or note…"
            style={{ ...inp, flex: 1, fontSize: 14, padding: '9px 13px', background: 'var(--bg-input)', border: '1px solid var(--border-main)' }}
          />
          <button onClick={() => setCapExpand(v => !v)} title="Add time / project" style={{
            background: 'var(--bg-input-inner)', border: '1px solid var(--border-main)', borderRadius: 7, padding: '0 10px',
            cursor: 'pointer', color: capExpand ? 'var(--accent)' : 'var(--text-dim)', display: 'flex', alignItems: 'center'
          }}>
            {capExpand ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
          <button onClick={handleCapture} style={{ background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 7, padding: '0 14px', cursor: 'pointer', fontWeight: 600, fontSize: 13, flexShrink: 0 }}>Capture</button>
        </div>

        {/* Expanded options */}
        {capExpand && (
          <div className="animate-in" style={{ display: 'flex', gap: 8, flexWrap: 'wrap', paddingTop: 2 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--bg-input)', border: '1px solid var(--border-main)', borderRadius: 7, padding: '5px 10px', flex: 1, minWidth: 190 }}>
              <AlarmClock size={13} color="var(--accent)" />
              <input type="datetime-local" value={capTime} onChange={e => setCapTime(e.target.value)}
                style={{ background: 'transparent', border: 'none', color: capTime ? 'var(--text-main)' : 'var(--text-muted)', fontSize: 12, outline: 'none', flex: 1 }} />
              {capTime && <button onClick={() => setCapTime('')} aria-label="Clear time" style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0, display: 'flex' }}><X size={11} /></button>}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--bg-input)', border: '1px solid var(--border-main)', borderRadius: 7, padding: '5px 10px', flex: 1, minWidth: 130 }}>
              <Folder size={13} color={capProj ? projects.find(p => p.id === capProj)?.color : 'var(--text-muted)'} />
              <select value={capProj} onChange={e => setCapProj(e.target.value)}
                style={{ background: 'transparent', border: 'none', color: capProj ? 'var(--text-main)' : 'var(--text-muted)', fontSize: 12, outline: 'none', flex: 1, cursor: 'pointer' }}>
                <option value="">No project</option>
                {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Filter chips */}
      <div style={{ padding: '10px 22px 0', display: 'flex', gap: 6, flexWrap: 'wrap', borderBottom: '1px solid var(--border-subtle)', paddingBottom: 10 }}>
        {[{ id: '', name: 'All' }, ...projects].map(p => (
          <button key={p.id} onClick={() => setFilterProj(p.id)} style={{
            fontSize: 11, padding: '3px 10px', borderRadius: 20, border: 'none', cursor: 'pointer',
            background: filterProj === p.id ? (p.color || 'var(--accent)') + '22' : 'var(--bg-input-inner)',
            color: filterProj === p.id ? (p.color || 'var(--accent)') : 'var(--text-dim)',
            fontWeight: filterProj === p.id ? 500 : 400, display: 'flex', alignItems: 'center', gap: 5
          }}>
            {p.color && <span style={{ width: 6, height: 6, borderRadius: '50%', background: p.color, display: 'inline-block' }} />}
            {p.name}
          </button>
        ))}
        <button onClick={() => setFilterProj('__timed__')} style={{
          fontSize: 11, padding: '3px 10px', borderRadius: 20, border: 'none', cursor: 'pointer',
          background: filterProj === '__timed__' ? 'var(--accent)22' : 'var(--bg-input-inner)',
          color: filterProj === '__timed__' ? 'var(--accent)' : 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: 5
        }}>
          <AlarmClock size={10} /> With reminder
        </button>
      </div>

      {/* Board cards */}
      <div style={{ flex: 1, overflow: 'auto', padding: '18px 20px' }}>
        {filteredCards.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
            <LayoutGridEmpty />
            <div style={{ fontSize: 14, fontWeight: 500, marginTop: 16, color: 'var(--text-dim)' }}>
              {searchQuery ? `No cards matching "${searchQuery}"` : 'No cards yet'}
            </div>
            <div style={{ fontSize: 12, marginTop: 4 }}>
              {searchQuery ? 'Try a different search term' : 'Type a thought above and hit Capture'}
            </div>
          </div>
        ) : (
          <div style={{ columns: 3, columnGap: 14 }}>
            {filteredCards.map(card => {
              const isEditing = editCard === card.id;
              const isEditingText = editingText && editingText.id === card.id;
              const cardProj = projects.find(p => p.id === card.projectId);
              const hasTime = !!card.datetime;
              const overdue = hasTime && new Date(card.datetime) < new Date() && !card.remindFired;
              const isHovered = hoveredCard === card.id;

              return (
                <div key={card.id}
                  draggable
                  onDragStart={e => {
                    e.dataTransfer.setData("application/json", JSON.stringify({ cardId: card.id }));
                    e.dataTransfer.effectAllowed = "move";
                  }}
                  onMouseEnter={() => setHoveredCard(card.id)}
                  onMouseLeave={() => setHoveredCard(null)}
                  style={{
                    display: 'block', marginBottom: 13, breakInside: 'avoid',
                    background: isHovered ? 'var(--bg-card-hover)' : 'var(--bg-card)',
                    borderRadius: 10,
                    border: `1px solid ${overdue ? '#f8717130' : 'var(--border-main)'}`,
                    borderTop: `2px solid ${cardProj ? cardProj.color + '88' : overdue ? '#f87171' : 'var(--border-main)'}`,
                    padding: '11px 13px', position: 'relative',
                    boxShadow: isHovered ? 'var(--shadow-card)' : 'none',
                    transition: 'background 0.15s ease, box-shadow 0.15s ease',
                    cursor: 'grab',
                  }}>
                  {/* Main text — double-click to edit */}
                  {isEditingText ? (
                    <textarea
                      autoFocus
                      value={editingText.text}
                      onChange={e => setEditingText(t => ({ ...t, text: e.target.value }))}
                      onBlur={() => handleTextEdit(card.id)}
                      onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleTextEdit(card.id); } if (e.key === 'Escape') setEditingText(null); }}
                      style={{ width: '100%', background: 'var(--bg-input)', border: '1px solid var(--accent)', borderRadius: 6, color: 'var(--text-main)', fontSize: 13, lineHeight: 1.65, padding: '6px 8px', outline: 'none', resize: 'vertical', minHeight: 40, fontFamily: 'inherit' }}
                    />
                  ) : (
                    <p onDoubleClick={() => setEditingText({ id: card.id, text: card.text })}
                      style={{ margin: 0, fontSize: 13, lineHeight: 1.65, color: 'var(--text-main)', paddingRight: 18, wordBreak: 'break-word', cursor: 'text' }}
                      title="Double-click to edit"
                    >{card.text}</p>
                  )}

                  {/* Tags row */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 8, alignItems: 'center' }}>
                    {hasTime && (
                      <span style={{
                        display: 'flex', alignItems: 'center', gap: 4, fontSize: 10.5,
                        color: overdue ? '#f87171' : 'var(--text-dim)',
                        background: overdue ? '#f8717115' : 'var(--bg-sidebar)',
                        padding: '2px 7px', borderRadius: 4
                      }}>
                        <AlarmClock size={9} />{fmtDt(card.datetime)}{overdue && ' · overdue'}
                      </span>
                    )}
                    {cardProj && (
                      <span style={{
                        display: 'flex', alignItems: 'center', gap: 4, fontSize: 10.5,
                        color: cardProj.color, background: cardProj.color + '15',
                        padding: '2px 7px', borderRadius: 4
                      }}>
                        <span style={{ width: 5, height: 5, borderRadius: '50%', background: cardProj.color, display: 'inline-block' }} />{cardProj.name}
                      </span>
                    )}
                    <span style={{ fontSize: 10, color: 'var(--text-muted)', marginLeft: 'auto' }}>{timeAgo(card.createdAt)}</span>
                  </div>

                  {/* Inline edit panel */}
                  {isEditing && (
                    <div className="animate-in" style={{ marginTop: 10, borderTop: '1px solid var(--border-subtle)', paddingTop: 9, display: 'flex', flexDirection: 'column', gap: 7 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--bg-sidebar)', border: '1px solid var(--border-main)', borderRadius: 6, padding: '4px 8px' }}>
                        <AlarmClock size={11} color="var(--accent)" />
                        <input type="datetime-local" value={card.datetime} onChange={e => onUpdateCard(card.id, { datetime: e.target.value, remindFired: false })}
                          style={{ background: 'transparent', border: 'none', color: card.datetime ? 'var(--text-main)' : 'var(--text-muted)', fontSize: 11, outline: 'none', flex: 1 }} />
                        {card.datetime && <button onClick={() => onUpdateCard(card.id, { datetime: '' })} aria-label="Clear reminder" style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0 }}><X size={10} /></button>}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--bg-sidebar)', border: '1px solid var(--border-main)', borderRadius: 6, padding: '4px 8px' }}>
                        <Folder size={11} color={cardProj ? cardProj.color : 'var(--text-muted)'} />
                        <select value={card.projectId} onChange={e => onUpdateCard(card.id, { projectId: e.target.value })}
                          style={{ background: 'transparent', border: 'none', color: card.projectId ? 'var(--text-main)' : 'var(--text-muted)', fontSize: 11, outline: 'none', flex: 1, cursor: 'pointer' }}>
                          <option value="">No project</option>
                          {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                      </div>
                      {card.projectId && (
                        <button onClick={() => { onSendToProject(card); setEditCard(null); }} style={{
                          display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#4ade80',
                          background: '#0d1a0d', border: '1px solid #1e2e1e', borderRadius: 6, padding: '4px 9px', cursor: 'pointer'
                        }}>
                          <Send size={10} />Move to {projects.find(p => p.id === card.projectId)?.name}
                        </button>
                      )}
                    </div>
                  )}

                  {/* Action buttons */}
                  <div style={{ position: 'absolute', top: 7, right: 7, display: 'flex', gap: 3, opacity: isHovered || isEditing ? 1 : 0.3, transition: 'opacity 0.15s' }}>
                    <button onClick={() => setEditCard(isEditing ? null : card.id)} aria-label="Edit card" style={{
                      background: isEditing ? 'var(--border-main)' : 'transparent', border: 'none',
                      color: isEditing ? 'var(--accent)' : 'var(--text-muted)', cursor: 'pointer', padding: 3, borderRadius: 4, display: 'flex', alignItems: 'center'
                    }}>
                      {isEditing ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
                    </button>
                    <button onClick={() => onDeleteCard(card.id)} aria-label="Delete card" style={{
                      background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 3, borderRadius: 4, display: 'flex', alignItems: 'center'
                    }}>
                      <X size={11} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}

/* ── Empty state illustration ── */
function LayoutGridEmpty() {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" style={{ opacity: 0.3 }}>
      <rect x="4" y="4" width="18" height="18" rx="4" stroke="var(--text-dim)" strokeWidth="2" strokeDasharray="4 3" />
      <rect x="26" y="4" width="18" height="18" rx="4" stroke="var(--text-dim)" strokeWidth="2" strokeDasharray="4 3" />
      <rect x="4" y="26" width="18" height="18" rx="4" stroke="var(--text-dim)" strokeWidth="2" strokeDasharray="4 3" />
      <rect x="26" y="26" width="18" height="18" rx="4" stroke="var(--text-dim)" strokeWidth="2" strokeDasharray="4 3" />
    </svg>
  );
}

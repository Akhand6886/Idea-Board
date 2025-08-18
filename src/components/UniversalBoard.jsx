import React, { useState, useRef } from "react";
import { ChevronDown, ChevronUp, AlarmClock, Folder, X, Send } from "lucide-react";

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

const inp = { background: '#181819', border: '1px solid #252528', borderRadius: 7, padding: '7px 11px', color: '#e2e0da', fontSize: 13, outline: 'none' };

export function UniversalBoard({ boardCards, projects, onCapture, onUpdateCard, onDeleteCard, onSendToProject }) {
  const [capText, setCapText] = useState('');
  const [capTime, setCapTime] = useState('');
  const [capProj, setCapProj] = useState('');
  const [capExpand, setCapExpand] = useState(false);
  const [filterProj, setFilterProj] = useState('');
  const [editCard, setEditCard] = useState(null);
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

  const filteredCards = boardCards.filter(c => {
    if (filterProj === '__timed__') return !!c.datetime;
    if (filterProj) return c.projectId === filterProj;
    return true;
  });

  return (
    <>
      {/* Header */}
      <div style={{ padding: '16px 22px 12px', borderBottom: '1px solid #181819' }}>
        <h2 style={{ margin: 0, fontSize: 14.5, fontWeight: 600 }}>Universal Board</h2>
        <div style={{ fontSize: 11.5, color: '#444', marginTop: 3 }}>Capture anything — attach a time, a project, or both</div>
      </div>

      {/* Quick-capture input */}
      <div style={{ padding: '14px 22px', borderBottom: '1px solid #181819', background: '#0e0e10' }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: capExpand ? 10 : 0 }}>
          <input
            ref={capInputRef}
            value={capText}
            onChange={e => setCapText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleCapture()}
            placeholder="Type a word, thought, or note…"
            style={{ ...inp, flex: 1, fontSize: 14, padding: '9px 13px', background: '#161618', border: '1px solid #2a2a2e' }}
          />
          <button onClick={() => setCapExpand(v => !v)} title="Add time / project" style={{
            background: '#1c1c20', border: '1px solid #2a2a2e', borderRadius: 7, padding: '0 10px',
            cursor: 'pointer', color: capExpand ? '#f59e0b' : '#555', display: 'flex', alignItems: 'center'
          }}>
            {capExpand ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
          <button onClick={handleCapture} style={{ background: '#f59e0b', color: '#000', border: 'none', borderRadius: 7, padding: '0 14px', cursor: 'pointer', fontWeight: 600, fontSize: 13, flexShrink: 0 }}>Capture</button>
        </div>

        {/* Expanded options */}
        {capExpand && (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', paddingTop: 2 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#161618', border: '1px solid #2a2a2e', borderRadius: 7, padding: '5px 10px', flex: 1, minWidth: 190 }}>
              <AlarmClock size={13} color="#f59e0b" />
              <input type="datetime-local" value={capTime} onChange={e => setCapTime(e.target.value)}
                style={{ background: 'transparent', border: 'none', color: capTime ? '#e2e0da' : '#555', fontSize: 12, outline: 'none', flex: 1 }} />
              {capTime && <button onClick={() => setCapTime('')} style={{ background: 'transparent', border: 'none', color: '#444', cursor: 'pointer', padding: 0, display: 'flex' }}><X size={11} /></button>}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#161618', border: '1px solid #2a2a2e', borderRadius: 7, padding: '5px 10px', flex: 1, minWidth: 130 }}>
              <Folder size={13} color={capProj ? projects.find(p => p.id === capProj)?.color : '#555'} />
              <select value={capProj} onChange={e => setCapProj(e.target.value)}
                style={{ background: 'transparent', border: 'none', color: capProj ? '#e2e0da' : '#555', fontSize: 12, outline: 'none', flex: 1, cursor: 'pointer' }}>
                <option value="">No project</option>
                {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Filter chips */}
      <div style={{ padding: '10px 22px 0', display: 'flex', gap: 6, flexWrap: 'wrap', borderBottom: '1px solid #181819', paddingBottom: 10 }}>
        {[{ id: '', name: 'All' }, ...projects].map(p => (
          <button key={p.id} onClick={() => setFilterProj(p.id)} style={{
            fontSize: 11, padding: '3px 10px', borderRadius: 20, border: 'none', cursor: 'pointer',
            background: filterProj === p.id ? (p.color || '#f59e0b') + '22' : '#181819',
            color: filterProj === p.id ? (p.color || '#f59e0b') : '#555',
            fontWeight: filterProj === p.id ? 500 : 400, display: 'flex', alignItems: 'center', gap: 5
          }}>
            {p.color && <span style={{ width: 6, height: 6, borderRadius: '50%', background: p.color, display: 'inline-block' }} />}
            {p.name}
          </button>
        ))}
        <button onClick={() => setFilterProj('__timed__')} style={{
          fontSize: 11, padding: '3px 10px', borderRadius: 20, border: 'none', cursor: 'pointer',
          background: filterProj === '__timed__' ? '#f59e0b22' : '#181819',
          color: filterProj === '__timed__' ? '#f59e0b' : '#555', display: 'flex', alignItems: 'center', gap: 5
        }}>
          <AlarmClock size={10} /> With reminder
        </button>
      </div>

      {/* Board cards */}
      <div style={{ flex: 1, overflow: 'auto', padding: '18px 20px' }}>
        {filteredCards.length === 0 ? (
          <div style={{ color: '#2e2e32', fontSize: 13, paddingTop: 16 }}>No cards yet — capture something above.</div>
        ) : (
          <div style={{ columns: 3, columnGap: 14 }}>
            {filteredCards.map(card => {
              const isEditing = editCard === card.id;
              const cardProj = projects.find(p => p.id === card.projectId);
              const hasTime = !!card.datetime;
              const overdue = hasTime && new Date(card.datetime) < new Date() && !card.remindFired;

              return (
                <div key={card.id} style={{
                  display: 'block', marginBottom: 13, breakInside: 'avoid',
                  background: '#131315', borderRadius: 10,
                  border: `1px solid ${overdue ? '#f8717130' : '#1e1e21'}`,
                  borderTop: `2px solid ${cardProj ? cardProj.color + '88' : overdue ? '#f87171' : '#2a2a2e'}`,
                  padding: '11px 13px', position: 'relative'
                }}>
                  {/* Main text */}
                  <p style={{ margin: 0, fontSize: 13, lineHeight: 1.65, color: '#c8c5bf', paddingRight: 18, wordBreak: 'break-word' }}>{card.text}</p>

                  {/* Tags row */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 8, alignItems: 'center' }}>
                    {hasTime && (
                      <span style={{
                        display: 'flex', alignItems: 'center', gap: 4, fontSize: 10.5,
                        color: overdue ? '#f87171' : '#5a6a7e',
                        background: overdue ? '#f8717115' : '#151e25',
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
                    <span style={{ fontSize: 10, color: '#282830', marginLeft: 'auto' }}>{timeAgo(card.createdAt)}</span>
                  </div>

                  {/* Inline edit panel */}
                  {isEditing && (
                    <div style={{ marginTop: 10, borderTop: '1px solid #1e1e24', paddingTop: 9, display: 'flex', flexDirection: 'column', gap: 7 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#0e0e10', border: '1px solid #222', borderRadius: 6, padding: '4px 8px' }}>
                        <AlarmClock size={11} color="#f59e0b" />
                        <input type="datetime-local" value={card.datetime} onChange={e => onUpdateCard(card.id, { datetime: e.target.value, remindFired: false })}
                          style={{ background: 'transparent', border: 'none', color: card.datetime ? '#e2e0da' : '#555', fontSize: 11, outline: 'none', flex: 1 }} />
                        {card.datetime && <button onClick={() => onUpdateCard(card.id, { datetime: '' })} style={{ background: 'transparent', border: 'none', color: '#444', cursor: 'pointer', padding: 0 }}><X size={10} /></button>}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#0e0e10', border: '1px solid #222', borderRadius: 6, padding: '4px 8px' }}>
                        <Folder size={11} color={cardProj ? cardProj.color : '#555'} />
                        <select value={card.projectId} onChange={e => onUpdateCard(card.id, { projectId: e.target.value })}
                          style={{ background: 'transparent', border: 'none', color: card.projectId ? '#e2e0da' : '#555', fontSize: 11, outline: 'none', flex: 1, cursor: 'pointer' }}>
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
                  <div style={{ position: 'absolute', top: 7, right: 7, display: 'flex', gap: 3 }}>
                    <button onClick={() => setEditCard(isEditing ? null : card.id)} style={{
                      background: isEditing ? '#1c1c22' : 'transparent', border: 'none',
                      color: isEditing ? '#f59e0b' : '#2e2e38', cursor: 'pointer', padding: 3, borderRadius: 4, display: 'flex', alignItems: 'center'
                    }}>
                      {isEditing ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
                    </button>
                    <button onClick={() => onDeleteCard(card.id)} style={{
                      background: 'transparent', border: 'none', color: '#2e2e38', cursor: 'pointer', padding: 3, borderRadius: 4, display: 'flex', alignItems: 'center'
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

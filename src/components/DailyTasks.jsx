import React, { useState, useRef } from "react";
import { Check, Trash2, GripVertical, Search, X, CheckSquare } from "lucide-react";
import { inp } from "../styles";

export function DailyTasks({ tasks, onAddTask, onToggleTask, onDeleteTask, onReorderTasks }) {
  const [newTask, setNewTask] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const dragItem = useRef(null);
  const dragOverItem = useRef(null);

  const handleAdd = () => {
    if (!newTask.trim()) return;
    onAddTask({ id: 't' + Date.now(), text: newTask.trim(), done: false });
    setNewTask('');
  };

  const doneCount = tasks.filter(t => t.done).length;
  const totalCount = tasks.length;
  const progress = totalCount > 0 ? (doneCount / totalCount) * 100 : 0;

  const activeTasks = tasks.filter(t => !t.done).filter(t => !searchQuery || t.text.toLowerCase().includes(searchQuery.toLowerCase()));
  const doneTasks = tasks.filter(t => t.done).filter(t => !searchQuery || t.text.toLowerCase().includes(searchQuery.toLowerCase()));

  const handleDragStart = (idx) => { dragItem.current = idx; };
  const handleDragEnter = (idx) => { dragOverItem.current = idx; };
  const handleDragEnd = () => {
    if (dragItem.current !== null && dragOverItem.current !== null && dragItem.current !== dragOverItem.current) {
      onReorderTasks(dragItem.current, dragOverItem.current);
    }
    dragItem.current = null;
    dragOverItem.current = null;
  };

  return (
    <>
      <div style={{ padding: '16px 22px 12px', borderBottom: '1px solid var(--border-subtle)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 14.5, fontWeight: 600, color: 'var(--text-main)' }}>Daily Tasks</h2>
            <div style={{ fontSize: 11.5, color: 'var(--text-dim)', marginTop: 3 }}>
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} · {doneCount}/{totalCount} complete
            </div>
          </div>
          {/* Search */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--bg-input)', border: '1px solid var(--border-main)', borderRadius: 7, padding: '4px 10px', minWidth: 160 }}>
            <Search size={12} color="var(--text-muted)" />
            <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search tasks..."
              style={{ background: 'transparent', border: 'none', color: 'var(--text-main)', fontSize: 12, outline: 'none', flex: 1 }} />
            {searchQuery && <button onClick={() => setSearchQuery('')} aria-label="Clear search" style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0, display: 'flex' }}><X size={10} /></button>}
          </div>
        </div>
        {/* Progress bar */}
        <div style={{ marginTop: 10, height: 3, background: 'var(--bg-input-inner)', borderRadius: 3, overflow: 'hidden' }}>
          <div style={{
            height: '100%', width: `${progress}%`, borderRadius: 3,
            background: progress === 100 ? 'var(--success)' : 'var(--accent)',
            transition: 'width 0.3s ease, background 0.3s ease'
          }} />
        </div>
      </div>

      <div style={{ padding: '12px 22px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', gap: 8 }}>
        <input value={newTask} onChange={e => setNewTask(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAdd()}
          placeholder="Add a task..." style={{ ...inp, flex: 1 }} />
        <button onClick={handleAdd} style={{ background: '#4ade80', color: '#000', border: 'none', borderRadius: 7, padding: '0 14px', cursor: 'pointer', fontWeight: 600, fontSize: 13, flexShrink: 0 }}>Add</button>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '8px 22px' }}>
        {activeTasks.length === 0 && doneTasks.length === 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
            <CheckSquare size={36} style={{ opacity: 0.2 }} />
            <div style={{ fontSize: 14, fontWeight: 500, marginTop: 16, color: 'var(--text-dim)' }}>
              {searchQuery ? `No tasks matching "${searchQuery}"` : (totalCount > 0 ? 'All tasks done! 🎉' : 'No tasks yet')}
            </div>
            <div style={{ fontSize: 12, marginTop: 4 }}>
              {!searchQuery && totalCount === 0 && 'Add your first task above'}
            </div>
          </div>
        )}

        {activeTasks.map((t, idx) => (
          <div key={t.id}
            draggable
            onDragStart={() => handleDragStart(tasks.indexOf(t))}
            onDragEnter={() => handleDragEnter(tasks.indexOf(t))}
            onDragEnd={handleDragEnd}
            onDragOver={e => e.preventDefault()}
            style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0',
              borderBottom: '1px solid var(--border-subtle)', cursor: 'grab'
            }}>
            <GripVertical size={12} color="var(--text-muted)" style={{ opacity: 0.4, cursor: 'grab', flexShrink: 0 }} />
            <button onClick={() => onToggleTask(t.id)} aria-label="Complete task" style={{
              width: 17, height: 17, borderRadius: 4, border: '1.5px solid var(--border-main)',
              background: 'transparent', cursor: 'pointer', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center'
            }} />
            <span style={{ fontSize: 13, color: 'var(--text-main)', flex: 1 }}>{t.text}</span>
            <button onClick={() => onDeleteTask(t.id)} aria-label="Delete task" style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 2, opacity: 0.5 }}><Trash2 size={13} /></button>
          </div>
        ))}

        {doneTasks.length > 0 && <>
          <div style={{ fontSize: 10, color: 'var(--text-muted)', letterSpacing: 1, textTransform: 'uppercase', padding: '18px 0 8px' }}>Completed</div>
          {doneTasks.map(t => (
            <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', opacity: 0.38, borderBottom: '1px solid var(--border-subtle)' }}>
              <button onClick={() => onToggleTask(t.id)} aria-label="Uncheck task" style={{
                width: 17, height: 17, borderRadius: 4, border: '1.5px solid #4ade80',
                background: '#4ade8018', cursor: 'pointer', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}><Check size={9} color="#4ade80" /></button>
              <span style={{ fontSize: 13, color: 'var(--text-dim)', textDecoration: 'line-through', flex: 1 }}>{t.text}</span>
              <button onClick={() => onDeleteTask(t.id)} aria-label="Delete task" style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 2, opacity: 0.3 }}><Trash2 size={12} /></button>
            </div>
          ))}
        </>}
      </div>
    </>
  );
}

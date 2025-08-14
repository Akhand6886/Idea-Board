import React, { useState } from "react";
import { Check, Trash2 } from "lucide-react";

const inp = { background: '#181819', border: '1px solid #252528', borderRadius: 7, padding: '7px 11px', color: '#e2e0da', fontSize: 13, outline: 'none' };

export function DailyTasks({ tasks, onAddTask, onToggleTask, onDeleteTask }) {
  const [newTask, setNewTask] = useState('');

  const handleAdd = () => {
    if (!newTask.trim()) return;
    onAddTask({ id: 't' + Date.now(), text: newTask.trim(), done: false });
    setNewTask('');
  };

  const doneCount = tasks.filter(t => t.done).length;

  return (
    <>
      <div style={{ padding: '16px 22px 12px', borderBottom: '1px solid #181819' }}>
        <h2 style={{ margin: 0, fontSize: 14.5, fontWeight: 600 }}>Daily Tasks</h2>
        <div style={{ fontSize: 11.5, color: '#444', marginTop: 3 }}>
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} · {doneCount}/{tasks.length} complete
        </div>
      </div>
      <div style={{ padding: '12px 22px', borderBottom: '1px solid #181819', display: 'flex', gap: 8 }}>
        <input value={newTask} onChange={e => setNewTask(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAdd()}
          placeholder="Add a task..." style={{ ...inp, flex: 1 }} />
        <button onClick={handleAdd} style={{ background: '#4ade80', color: '#000', border: 'none', borderRadius: 7, padding: '0 14px', cursor: 'pointer', fontWeight: 600, fontSize: 13, flexShrink: 0 }}>Add</button>
      </div>
      <div style={{ flex: 1, overflow: 'auto', padding: '8px 22px' }}>
        {tasks.filter(t => !t.done).map(t => (
          <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid #181819' }}>
            <button onClick={() => onToggleTask(t.id)} style={{
              width: 17, height: 17, borderRadius: 4, border: '1.5px solid #2c2c30',
              background: 'transparent', cursor: 'pointer', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center'
            }} />
            <span style={{ fontSize: 13, color: '#ccc', flex: 1 }}>{t.text}</span>
            <button onClick={() => onDeleteTask(t.id)} style={{ background: 'transparent', border: 'none', color: '#282832', cursor: 'pointer', padding: 2 }}><Trash2 size={13} /></button>
          </div>
        ))}
        {tasks.filter(t => t.done).length > 0 && <>
          <div style={{ fontSize: 10, color: '#2e2e38', letterSpacing: 1, textTransform: 'uppercase', padding: '18px 0 8px' }}>Completed</div>
          {tasks.filter(t => t.done).map(t => (
            <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', opacity: 0.38, borderBottom: '1px solid #181819' }}>
              <button onClick={() => onToggleTask(t.id)} style={{
                width: 17, height: 17, borderRadius: 4, border: '1.5px solid #4ade80',
                background: '#4ade8018', cursor: 'pointer', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}><Check size={9} color="#4ade80" /></button>
              <span style={{ fontSize: 13, color: '#666', textDecoration: 'line-through', flex: 1 }}>{t.text}</span>
            </div>
          ))}
        </>}
      </div>
    </>
  );
}

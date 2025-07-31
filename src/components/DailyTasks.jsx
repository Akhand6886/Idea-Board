import React, { useState } from "react";
import { Check, Trash2, Plus } from "lucide-react";

export function DailyTasks({ tasks, setTasks }) {
  const [newTask, setNewTask] = useState('');

  const handleAddTask = () => {
    if (!newTask.trim()) return;
    setTasks(prev => [{ id: 't' + Date.now(), text: newTask.trim(), done: false }, ...prev]);
    setNewTask('');
  };

  const toggleTask = (id) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t));
  };

  const deleteTask = (id) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const pendingTasks = tasks.filter(t => !t.done);
  const completedTasks = tasks.filter(t => t.done);

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', width: '100%' }}>
      <header style={{ marginBottom: 40 }}>
        <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 8, letterSpacing: '-1px' }}>Daily Tasks</h1>
        <p style={{ color: '#666', fontSize: 15 }}>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
      </header>

      {/* Add Task Input */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 40 }}>
        <input 
          style={{ flex: 1, background: '#111', border: '1px solid #222', borderRadius: 12, padding: '16px', color: '#fff', fontSize: 16, outline: 'none' }}
          placeholder="Add a new task..."
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
        />
        <button 
          onClick={handleAddTask}
          style={{ background: '#4ade80', color: '#000', border: 'none', borderRadius: 12, padding: '0 24px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}
        >
          <Plus size={18} /> Add
        </button>
      </div>

      {/* Task List */}
      <div>
        {pendingTasks.map(task => (
          <div key={task.id} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 0', borderBottom: '1px solid #141414' }}>
            <button 
              onClick={() => toggleTask(task.id)}
              style={{ width: 24, height: 24, borderRadius: 6, border: '2px solid #333', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <Check size={14} color="transparent" />
            </button>
            <span style={{ fontSize: 16, color: '#eee', flex: 1 }}>{task.text}</span>
            <button onClick={() => deleteTask(task.id)} style={{ background: 'none', border: 'none', color: '#333', cursor: 'pointer' }}><Trash2 size={16} /></button>
          </div>
        ))}

        {completedTasks.length > 0 && (
          <div style={{ marginTop: 40 }}>
            <div style={{ fontSize: 12, color: '#444', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 16, fontWeight: 700 }}>Completed</div>
            {completedTasks.map(task => (
              <div key={task.id} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '12px 0', borderBottom: '1px solid #141414', opacity: 0.5 }}>
                <button 
                  onClick={() => toggleTask(task.id)}
                  style={{ width: 24, height: 24, borderRadius: 6, border: 'none', background: '#4ade80', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <Check size={14} color="#000" />
                </button>
                <span style={{ fontSize: 16, color: '#666', textDecoration: 'line-through', flex: 1 }}>{task.text}</span>
                <button onClick={() => deleteTask(task.id)} style={{ background: 'none', border: 'none', color: '#333', cursor: 'pointer' }}><Trash2 size={16} /></button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

import React from "react";
import { Inbox, CheckSquare, Zap, Hash, Command } from "lucide-react";

export function Sidebar({ view, setView, activeProjId, setActiveProjId, projects }) {
  return (
    <aside style={{ width: 240, borderRight: '1px solid #141414', display: 'flex', flexDirection: 'column', background: '#050505', zIndex: 10 }}>
      <div style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: 'linear-gradient(45deg, #f59e0b, #ec4899)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Zap size={16} color="#000" />
          </div>
          <span style={{ fontWeight: 800, fontSize: 18, letterSpacing: '-0.5px' }}>IdeaOS</span>
        </div>
      </div>

      <nav style={{ flex: 1, padding: '0 12px' }}>
        <NavItem icon={<Inbox size={15}/>} label="Universal" active={view === 'universal'} onClick={() => setView('universal')} />
        <NavItem icon={<CheckSquare size={15}/>} label="Tasks" active={view === 'tasks'} onClick={() => setView('tasks')} />
        <div style={{ height: 20 }} />
        <div style={{ fontSize: 9, color: '#333', padding: '10px 12px', textTransform: 'uppercase', letterSpacing: 1.5 }}>Projects</div>
        {projects.map(p => (
          <NavItem 
            key={p.id} 
            icon={<div style={{ width: 6, height: 6, borderRadius: '50%', background: p.color }} />} 
            label={p.name} 
            active={view === 'board' && activeProjId === p.id} 
            onClick={() => { setView('board'); setActiveProjId(p.id); }} 
          />
        ))}
      </nav>

      <div style={{ padding: '16px 24px', fontSize: 11, color: '#222', borderTop: '1px solid #111', display: 'flex', alignItems: 'center', gap: 8 }}>
        <Command size={12} /> <span style={{letterSpacing: 0.5}}>CMD + K TO SEARCH</span>
      </div>
    </aside>
  );
}

function NavItem({ icon, label, active, onClick }) {
  return (
    <button 
      onClick={onClick}
      style={{ 
        width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '8px 12px', 
        borderRadius: 8, border: 'none', background: active ? '#1a1a1a' : 'transparent',
        color: active ? '#fff' : '#666', cursor: 'pointer', transition: '0.2s', marginBottom: 2,
        textAlign: 'left', fontSize: 13, fontWeight: active ? 600 : 400
      }}
    >
      {icon}
      <span style={{ flex: 1 }}>{label}</span>
    </button>
  );
}

import React from "react";
import { Star, X } from "lucide-react";

const glass = {
  background: 'rgba(255, 255, 255, 0.03)',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(255, 255, 255, 0.08)',
};

export function ProjectBoard({ activeProj, onDeleteIdea }) {
  if (!activeProj) return null;

  return (
    <div style={{ padding: '0 20px', maxWidth: 1000, margin: '0 auto', width: '100%' }}>
      <header style={{ marginBottom: 40, display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 16, height: 16, borderRadius: '50%', background: activeProj.color }} />
        <h1 style={{ fontSize: 32, fontWeight: 800, margin: 0, letterSpacing: '-1px' }}>{activeProj.name}</h1>
      </header>
      
      {activeProj.ideas.length === 0 ? (
        <div style={{ color: '#666', fontSize: 15 }}>No ideas yet in this project. Use the Universal Inbox to capture and move ideas here.</div>
      ) : (
        <div style={{ columnCount: 3, columnGap: 20 }}>
          {activeProj.ideas.map(idea => (
            <div key={idea.id} style={{ ...glass, borderRadius: 16, padding: '20px', marginBottom: 20, borderTop: `4px solid ${activeProj.color}`, breakInside: 'avoid' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                {idea.pinned && <Star size={14} fill={activeProj.color} color={activeProj.color} />}
                <div style={{ flex: 1 }} />
                <button 
                  onClick={() => onDeleteIdea(activeProj.id, idea.id)}
                  style={{ background: 'none', border: 'none', color: '#444', cursor: 'pointer' }}
                >
                  <X size={16} />
                </button>
              </div>
              <p style={{ margin: 0, color: '#ccc', lineHeight: 1.6, fontSize: 15 }}>{idea.text}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

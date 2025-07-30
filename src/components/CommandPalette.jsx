import React from "react";
import { Search, ChevronRight } from "lucide-react";

export function CommandPalette({ 
  showCommandPalette, 
  setShowCommandPalette, 
  cmdSearch, 
  setCmdSearch, 
  cmdResults, 
  setSelectedItem, 
  setView, 
  setActiveProjId 
}) {
  if (!showCommandPalette) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
      <div style={{ width: 600, background: '#0a0a0a', border: '1px solid #222', borderRadius: 16, overflow: 'hidden', boxShadow: '0 30px 60px rgba(0,0,0,0.5)' }}>
        <div style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: 15, borderBottom: '1px solid #141414' }}>
          <Search size={20} color="#666" />
          <input 
            autoFocus
            style={{ flex: 1, background: 'transparent', border: 'none', color: '#fff', fontSize: 18, outline: 'none' }}
            placeholder="Search ideas, projects, or commands..."
            value={cmdSearch}
            onChange={(e) => setCmdSearch(e.target.value)}
          />
          <div style={{ fontSize: 10, color: '#333', background: '#111', padding: '4px 8px', borderRadius: 4 }}>ESC</div>
        </div>
        <div style={{ padding: '8px' }}>
          {cmdResults.length > 0 ? cmdResults.map((res, i) => (
            <div key={i} 
              onClick={() => {
                if (res.type === 'card') setSelectedItem(res.item);
                if (res.type === 'view') { setView(res.view); setActiveProjId(res.id); }
                setShowCommandPalette(false);
                setCmdSearch('');
              }}
              style={{ padding: '12px 16px', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', transition: '0.2s', ':hover': { background: '#111' } }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#111'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              {res.icon}
              <span style={{ flex: 1, fontSize: 14 }}>{res.type === 'card' ? res.item.text : res.label}</span>
              <ChevronRight size={14} color="#222" />
            </div>
          )) : (
            <div style={{ padding: '40px', textAlign: 'center', color: '#333', fontSize: 13 }}>
              No results found for "{cmdSearch}"
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

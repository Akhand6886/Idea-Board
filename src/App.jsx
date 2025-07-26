import React, { useState, useEffect, useMemo, useRef } from "react";
import { 
  Plus, Bell, CheckSquare, Lightbulb, Trash2, X, 
  Check, Clock, Star, Search, Settings, ChevronRight, 
  Hash, Inbox, Zap, ChevronDown, MoveRight, Maximize2, 
  Terminal, FileText, Command, Filter
} from "lucide-react";

// --- Configuration ---
const PALETTE = [
  { name: 'Amber', color: '#f59e0b' },
  { name: 'Emerald', color: '#10b981' },
  { name: 'Blue', color: '#3b82f6' },
  { name: 'Pink', color: '#ec4899' },
  { name: 'Violet', color: '#8b5cf6' },
  { name: 'Cyan', color: '#06b6d4' },
];

const INITIAL_DATA = {
  projects: [
    { id: 'p1', name: 'Personal', color: '#f59e0b', ideas: [] },
    { id: 'p2', name: 'Work', color: '#3b82f6', ideas: [] },
  ],
  universal: [
    { id: 'u1', text: 'Research VAPID keys for push notifs', details: '# Steps\n1. Generate keys\n2. Save to .env', datetime: '', projectId: 'p2' },
  ],
  tasks: [],
};

export default function IdeaOS() {
  const [data, setData] = useState(() => {
    const saved = localStorage.getItem('ideaos_v3_data');
    return saved ? JSON.parse(saved) : INITIAL_DATA;
  });

  const [view, setView] = useState('universal');
  const [activeProjId, setActiveProjId] = useState('p1');
  const [inputVal, setInputVal] = useState('');
  const [expandedInput, setExpandedInput] = useState(false);
  const [quickDate, setQuickDate] = useState('');
  const [quickProj, setQuickProj] = useState('');
  
  // Phase 3 States
  const [selectedItem, setSelectedItem] = useState(null); // The item currently open in side-panel
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [cmdSearch, setCmdSearch] = useState('');
  const cmdRef = useRef(null);

  useEffect(() => {
    localStorage.setItem('ideaos_v3_data', JSON.stringify(data));
  }, [data]);

  // Command Palette Shortcut
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowCommandPalette(true);
      }
      if (e.key === 'Escape') setShowCommandPalette(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // --- Handlers ---
  const handleCapture = () => {
    if (!inputVal.trim()) return;
    const newItem = { id: 'u' + Date.now(), text: inputVal.trim(), details: '', datetime: quickDate, projectId: quickProj };
    setData(prev => ({ ...prev, universal: [newItem, ...prev.universal] }));
    setInputVal('');
    setQuickDate('');
    setQuickProj('');
    setExpandedInput(false);
  };

  const updateItemDetails = (id, details) => {
    setData(prev => ({
      ...prev,
      universal: prev.universal.map(u => u.id === id ? { ...u, details } : u)
    }));
  };

  // --- Command Palette Logic ---
  const cmdResults = useMemo(() => {
    if (!cmdSearch) return [];
    const lower = cmdSearch.toLowerCase();
    const results = [];
    
    // Search Universal
    data.universal.forEach(u => {
      if (u.text.toLowerCase().includes(lower)) results.push({ type: 'card', item: u, icon: <Inbox size={14}/> });
    });
    
    // Search Projects
    data.projects.forEach(p => {
      if (p.name.toLowerCase().includes(lower)) results.push({ type: 'view', view: 'board', id: p.id, label: `Go to ${p.name}`, icon: <Hash size={14}/> });
    });

    return results.slice(0, 5);
  }, [cmdSearch, data]);

  // --- Styles ---
  const glass = {
    background: 'rgba(255, 255, 255, 0.03)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
  };

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', background: '#000', color: '#fff', fontFamily: 'Inter, sans-serif', overflow: 'hidden' }}>
      
      {/* --- Sidebar --- */}
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
          {data.projects.map(p => (
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

      {/* --- Main Content --- */}
      <main style={{ flex: 1, position: 'relative', display: 'flex', background: '#000' }}>
        <div style={{ flex: 1, overflowY: 'auto', padding: '60px 40px' }}>
          
          {view === 'universal' && (
            <div style={{ maxWidth: 800, margin: '0 auto' }}>
              <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 40, letterSpacing: '-1px' }}>Universal Inbox</h1>
              
              {/* Capture Box */}
              <div style={{ ...glass, borderRadius: 16, padding: '12px', marginBottom: 40 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '4px 8px' }}>
                  <Terminal size={18} color="#444" />
                  <input 
                    style={{ flex: 1, background: 'transparent', border: 'none', color: '#fff', fontSize: 17, outline: 'none' }}
                    placeholder="Quick capture..."
                    value={inputVal}
                    onChange={(e) => setInputVal(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleCapture()}
                  />
                  <button onClick={() => setExpandedInput(!expandedInput)} style={{ background: 'none', border: 'none', color: '#444', cursor: 'pointer' }}>
                    <ChevronDown size={18} />
                  </button>
                </div>
                {expandedInput && (
                   <div style={{ display: 'flex', gap: 12, padding: '12px 8px 4px', borderTop: '1px solid rgba(255,255,255,0.05)', marginTop: 8 }}>
                    <input type="datetime-local" value={quickDate} onChange={e => setQuickDate(e.target.value)} style={{ flex: 1, background: '#111', border: 'none', color: '#fff', padding: '8px', borderRadius: 8, fontSize: 12 }} />
                    <select value={quickProj} onChange={e => setQuickProj(e.target.value)} style={{ flex: 1, background: '#111', border: 'none', color: '#fff', borderRadius: 8, padding: '8px', fontSize: 12 }}>
                      <option value="">No project</option>
                      {data.projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                   </div>
                )}
              </div>

              {/* Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 20 }}>
                {data.universal.map(item => (
                  <div key={item.id} 
                    onClick={() => setSelectedItem(item)}
                    style={{ ...glass, borderRadius: 16, padding: '20px', cursor: 'pointer', transition: '0.2s', position: 'relative' }}>
                    <p style={{ margin: 0, fontSize: 15, fontWeight: 500, color: '#eee', marginBottom: 12 }}>{item.text}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {item.details && <FileText size={12} color="#4ade80" />}
                      {item.datetime && <Clock size={12} color="#666" />}
                      <div style={{flex:1}}/>
                      <Maximize2 size={12} color="#222" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* --- Phase 3: Detail Side-Panel --- */}
        {selectedItem && (
          <div style={{ width: 450, background: '#050505', borderLeft: '1px solid #1a1a1a', display: 'flex', flexDirection: 'column', animation: 'slideIn 0.3s ease' }}>
            <div style={{ padding: '24px', borderBottom: '1px solid #141414', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 12, fontWeight: 800, color: '#444', textTransform: 'uppercase' }}>Workspace</span>
              <button onClick={() => setSelectedItem(null)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}><X size={18}/></button>
            </div>
            <div style={{ flex: 1, padding: '32px', overflowY: 'auto' }}>
              <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 24 }}>{selectedItem.text}</h2>
              <div style={{ fontSize: 11, color: '#444', marginBottom: 8, letterSpacing: 1 }}>NOTES (MARKDOWN)</div>
              <textarea 
                value={selectedItem.details}
                onChange={(e) => {
                  const val = e.target.value;
                  setSelectedItem(prev => ({ ...prev, details: val }));
                  updateItemDetails(selectedItem.id, val);
                }}
                style={{ 
                  width: '100%', height: 'calc(100% - 100px)', background: 'transparent', border: 'none', 
                  color: '#ccc', fontSize: 14, lineHeight: 1.6, outline: 'none', resize: 'none',
                  fontFamily: 'SFMono-Regular, Consolas, "Liberation Mono", Menlo, monospace'
                }}
                placeholder="Start typing your deep notes here..."
              />
            </div>
          </div>
        )}
      </main>

      {/* --- Phase 3: Command Palette --- */}
      {showCommandPalette && (
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
      )}

      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </div>
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

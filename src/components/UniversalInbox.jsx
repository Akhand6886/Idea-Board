import React, { useState } from "react";
import { Terminal, ChevronDown, FileText, Clock, Maximize2 } from "lucide-react";

const glass = {
  background: 'rgba(255, 255, 255, 0.03)',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(255, 255, 255, 0.08)',
};

export function UniversalInbox({ universalData, projectsData, onCapture, onSelectItem }) {
  const [inputVal, setInputVal] = useState('');
  const [expandedInput, setExpandedInput] = useState(false);
  const [quickDate, setQuickDate] = useState('');
  const [quickProj, setQuickProj] = useState('');

  const handleCaptureClick = () => {
    if (!inputVal.trim()) return;
    onCapture({
      text: inputVal.trim(),
      details: '',
      datetime: quickDate,
      projectId: quickProj
    });
    setInputVal('');
    setQuickDate('');
    setQuickProj('');
    setExpandedInput(false);
  };

  return (
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
            onKeyDown={(e) => e.key === 'Enter' && handleCaptureClick()}
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
              {projectsData.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            </div>
        )}
      </div>

      {/* Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 20 }}>
        {universalData.map(item => (
          <div key={item.id} 
            onClick={() => onSelectItem(item)}
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
  );
}

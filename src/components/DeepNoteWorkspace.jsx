import React from "react";
import { X } from "lucide-react";

export function DeepNoteWorkspace({ selectedItem, setSelectedItem, updateItemDetails }) {
  if (!selectedItem) return null;

  return (
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
  );
}

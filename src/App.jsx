import React, { useState, useEffect, useMemo, useRef } from "react";
import { 
  Plus, Bell, CheckSquare, Lightbulb, Trash2, X, 
  Check, Clock, Star, Search, Settings, ChevronRight, 
  Hash, Zap, MoveRight, Inbox,
  Command, Filter
} from "lucide-react";
import { Sidebar } from "./components/Sidebar";
import { UniversalInbox } from "./components/UniversalInbox";
import { DeepNoteWorkspace } from "./components/DeepNoteWorkspace";
import { CommandPalette } from "./components/CommandPalette";
import { ProjectBoard } from "./components/ProjectBoard";
import { DailyTasks } from "./components/DailyTasks";
import { api } from "./api";

// --- Configuration ---
const PALETTE = [
  { name: 'Amber', color: '#f59e0b' },
  { name: 'Emerald', color: '#10b981' },
  { name: 'Blue', color: '#3b82f6' },
  { name: 'Pink', color: '#ec4899' },
  { name: 'Violet', color: '#8b5cf6' },
  { name: 'Cyan', color: '#06b6d4' },
];

const EMPTY_DATA = { projects: [], universal: [], tasks: [] };

export default function IdeaOS() {
  const [data, setData] = useState(EMPTY_DATA);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('universal');
  const [activeProjId, setActiveProjId] = useState('p1');
  
  // Phase 3 States
  const [selectedItem, setSelectedItem] = useState(null);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [cmdSearch, setCmdSearch] = useState('');
  const cmdRef = useRef(null);

  // --- Load all data from backend on mount ---
  useEffect(() => {
    api.loadAll()
      .then(d => {
        setData(d);
        if (d.projects.length > 0) setActiveProjId(d.projects[0].id);
      })
      .catch(err => {
        console.warn('Backend unavailable, falling back to localStorage:', err.message);
        const saved = localStorage.getItem('ideaos_v3_data');
        if (saved) setData(JSON.parse(saved));
      })
      .finally(() => setLoading(false));
  }, []);

  // --- Fallback: still save to localStorage ---
  useEffect(() => {
    if (!loading) {
      localStorage.setItem('ideaos_v3_data', JSON.stringify(data));
    }
  }, [data, loading]);

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

  // --- Handlers (optimistic updates + API calls) ---
  const handleCapture = (newItem) => {
    newItem.id = 'u' + Date.now();
    setData(prev => ({ ...prev, universal: [newItem, ...prev.universal] }));
    api.createUniversal(newItem).catch(console.error);
  };

  const updateItemDetails = (id, details) => {
    setData(prev => ({
      ...prev,
      universal: prev.universal.map(u => u.id === id ? { ...u, details } : u)
    }));
    api.updateUniversal(id, { details }).catch(console.error);
  };

  const handleDeleteIdea = (projectId, ideaId) => {
    setData(prev => ({
      ...prev,
      projects: prev.projects.map(p => 
        p.id === projectId 
          ? { ...p, ideas: p.ideas.filter(i => i.id !== ideaId) } 
          : p
      )
    }));
    api.deleteIdea(ideaId).catch(console.error);
  };

  const setTasks = (tasksUpdater) => {
    setData(prev => {
      const newTasks = typeof tasksUpdater === 'function' ? tasksUpdater(prev.tasks) : tasksUpdater;
      return { ...prev, tasks: newTasks };
    });
  };

  // --- Command Palette Logic ---
  const cmdResults = useMemo(() => {
    if (!cmdSearch) return [];
    const lower = cmdSearch.toLowerCase();
    const results = [];
    
    data.universal.forEach(u => {
      if (u.text.toLowerCase().includes(lower)) results.push({ type: 'card', item: u, icon: <Inbox size={14}/> });
    });
    
    data.projects.forEach(p => {
      if (p.name.toLowerCase().includes(lower)) results.push({ type: 'view', view: 'board', id: p.id, label: `Go to ${p.name}`, icon: <Hash size={14}/> });
    });

    return results.slice(0, 5);
  }, [cmdSearch, data]);

  if (loading) {
    return (
      <div style={{ display: 'flex', height: '100vh', width: '100vw', background: '#000', color: '#fff', fontFamily: 'Inter, sans-serif', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>🧠</div>
          <div style={{ color: '#444', fontSize: 14 }}>Loading workspace...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', background: '#000', color: '#fff', fontFamily: 'Inter, sans-serif', overflow: 'hidden' }}>
      
      {/* --- Sidebar --- */}
      <Sidebar 
        view={view} 
        setView={setView} 
        activeProjId={activeProjId} 
        setActiveProjId={setActiveProjId} 
        projects={data.projects} 
      />

      {/* --- Main Content --- */}
      <main style={{ flex: 1, position: 'relative', display: 'flex', background: '#000' }}>
        <div style={{ flex: 1, overflowY: 'auto', padding: '60px 40px' }}>
          
          {view === 'universal' && (
            <UniversalInbox 
              universalData={data.universal} 
              projectsData={data.projects} 
              onCapture={handleCapture} 
              onSelectItem={setSelectedItem} 
            />
          )}

          {view === 'board' && (
            <ProjectBoard 
              activeProj={data.projects.find(p => p.id === activeProjId)}
              onDeleteIdea={handleDeleteIdea}
            />
          )}

          {view === 'tasks' && (
            <DailyTasks 
              tasks={data.tasks}
              setTasks={setTasks}
            />
          )}
        </div>

        {/* --- Detail Side-Panel --- */}
        <DeepNoteWorkspace 
          selectedItem={selectedItem} 
          setSelectedItem={setSelectedItem} 
          updateItemDetails={updateItemDetails} 
        />
      </main>

      {/* --- Command Palette --- */}
      <CommandPalette 
        showCommandPalette={showCommandPalette}
        setShowCommandPalette={setShowCommandPalette}
        cmdSearch={cmdSearch}
        setCmdSearch={setCmdSearch}
        cmdResults={cmdResults}
        setSelectedItem={setSelectedItem}
        setView={setView}
        setActiveProjId={setActiveProjId}
      />

      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}

import React, { useState, useEffect, useMemo, useRef } from "react";
import { 
  Plus, Bell, CheckSquare, Lightbulb, Trash2, X, 
  Check, Clock, Star, Search, Settings, ChevronRight, 
  Hash, Zap, MoveRight, 
  Command, Filter
} from "lucide-react";
import { Sidebar } from "./components/Sidebar";
import { UniversalInbox } from "./components/UniversalInbox";
import { DeepNoteWorkspace } from "./components/DeepNoteWorkspace";
import { CommandPalette } from "./components/CommandPalette";
import { ProjectBoard } from "./components/ProjectBoard";
import { DailyTasks } from "./components/DailyTasks";

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
  const handleCapture = (newItem) => {
    newItem.id = 'u' + Date.now();
    setData(prev => ({ ...prev, universal: [newItem, ...prev.universal] }));
  };

  const updateItemDetails = (id, details) => {
    setData(prev => ({
      ...prev,
      universal: prev.universal.map(u => u.id === id ? { ...u, details } : u)
    }));
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
  };

  const setTasks = (tasksUpdater) => {
    setData(prev => ({
      ...prev,
      tasks: typeof tasksUpdater === 'function' ? tasksUpdater(prev.tasks) : tasksUpdater
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

        {/* --- Phase 3: Detail Side-Panel --- */}
        <DeepNoteWorkspace 
          selectedItem={selectedItem} 
          setSelectedItem={setSelectedItem} 
          updateItemDetails={updateItemDetails} 
        />
      </main>

      {/* --- Phase 3: Command Palette --- */}
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



const API_BASE = 'http://localhost:3001/api';

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) throw new Error(`API ${res.status}: ${path}`);
  return res.json();
}

export const api = {
  // Load everything in one shot
  loadAll: () => request('/data'),

  // Projects
  createProject: (project) => request('/projects', { method: 'POST', body: JSON.stringify(project) }),
  updateProject: (id, fields) => request(`/projects/${id}`, { method: 'PATCH', body: JSON.stringify(fields) }),
  deleteProject: (id) => request(`/projects/${id}`, { method: 'DELETE' }),

  // Ideas
  createIdea: (projectId, idea) => request(`/projects/${projectId}/ideas`, { method: 'POST', body: JSON.stringify(idea) }),
  updateIdea: (id, fields) => request(`/ideas/${id}`, { method: 'PATCH', body: JSON.stringify(fields) }),
  deleteIdea: (id) => request(`/ideas/${id}`, { method: 'DELETE' }),

  // Universal
  createUniversal: (card) => request('/universal', { method: 'POST', body: JSON.stringify(card) }),
  updateUniversal: (id, fields) => request(`/universal/${id}`, { method: 'PATCH', body: JSON.stringify(fields) }),
  deleteUniversal: (id) => request(`/universal/${id}`, { method: 'DELETE' }),

  // Tasks
  createTask: (task) => request('/tasks', { method: 'POST', body: JSON.stringify(task) }),
  toggleTask: (id, done) => request(`/tasks/${id}`, { method: 'PATCH', body: JSON.stringify({ done }) }),
  deleteTask: (id) => request(`/tasks/${id}`, { method: 'DELETE' }),

  // Reminders
  createReminder: (rem) => request('/reminders', { method: 'POST', body: JSON.stringify(rem) }),
  updateReminder: (id, fields) => request(`/reminders/${id}`, { method: 'PATCH', body: JSON.stringify(fields) }),
  deleteReminder: (id) => request(`/reminders/${id}`, { method: 'DELETE' }),

  // Web-Push Subscribe
  subscribe: (sub) => request('/subscribe', { method: 'POST', body: JSON.stringify(sub) }),
};

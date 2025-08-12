# 🌌 IdeaOS

**IdeaOS** is a premium, high-performance personal workspace designed for developers. It bridges the gap between chaotic thought capture and structured project management. 

Built with a "Zero-Friction" philosophy, IdeaOS allows you to dump ideas instantly and refine them into full-scale project specs when you're ready.

---

## ✨ Features

### 📥 Universal Inbox
The entry point for everything. Capture thoughts, URLs, or code snippets with zero friction.
- **Quick Refencing**: Attach a project or a reminder time during capture.
- **Inbox Zero Workflow**: Move refined cards from the Universal Board directly into dedicated Project Boards.

### ⌨️ Command Palette (`Cmd + K`)
The power-user interface. Navigate the entire app and search your ideas instantly without leaving the keyboard.

### 📝 Deep-Note Workspace
Each idea is more than just a line of text. Expand any card into a full-screen markdown side-panel for drafting specs, architectural diagrams, or task lists.

### 🗓 Daily Tasks & Reminders
Integrated task management with visual completion tracking and browser-level notifications (coming soon).

### 🕶 OLED Aesthetic
A minimalist, high-contrast design system optimized for dark mode and focused work sessions.

---

## 🛠 Tech Stack

- **Frontend**: React 18 + Vite
- **Backend**: Node.js + Express
- **Database**: SQLite via `better-sqlite3`
- **Icons**: Lucide React
- **Design**: Vanilla CSS (Custom OLED System)
- **Architecture**: Optimistic UI updates with graceful localStorage fallback

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js (v18.0+)
- npm

### 2. Installation
```bash
# Navigate to the project
cd "Idea Board"

# Install dependencies
npm install
```

### 3. Running Locally
```bash
# Frontend only (uses localStorage fallback)
npm run dev

# Backend API server
npm run server

# Both simultaneously (recommended)
npm run dev:full
```

### 4. API Endpoints
The backend runs on `http://localhost:3001` with these endpoints:
- `GET  /api/data` — Load all data in one request
- `POST /api/projects` — Create a project
- `POST /api/universal` — Capture a universal card
- `PATCH /api/universal/:id` — Update card details
- `POST /api/tasks` — Create a task
- `PATCH /api/tasks/:id` — Toggle task completion

---

## 🗺 Roadmap

- [x] Phase 1: Foundation & Project Setup
- [x] Phase 2: Universal Inbox & Project Migration
- [x] Phase 3: Command Palette & Deep Workspace
- [x] Phase 4: Component Modularization & UI Polish
- [x] **Phase 5: Backend Integration (Node.js + SQLite)**
- [ ] **Phase (Left for later development after ful UI and Backend work): Raspberry Pi Deployment & Push Notifications**

---

*Designed for the minimalists, the hackers, and the builders.*

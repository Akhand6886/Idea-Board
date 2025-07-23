# IdeaOS: Implementation Plan

IdeaOS is a premium, high-performance personal workspace designed for developers. It combines quick capture (Universal Board), structured ideation (Project Boards), and task management into a single, OLED-aesthetic interface.

## User Review Required

> [!IMPORTANT]
> The initial version uses `localStorage` for persistence. In Phase 3, we will transition to a Node.js + SQLite backend for Raspberry Pi deployment. Please confirm if you want to start with the Backend setup immediately or polish the Frontend first.

## Phase 1: Project Foundation [CURRENT]
- [ ] Initialize Vite + React project.
- [ ] Setup folder structure (`/components`, `/hooks`, `/styles`).
- [ ] Define Global Design System (OLED black, typography, accent colors).

## Phase 2: Feature Modularization
- [ ] **Navigation & Sidebar**: Implement the core navigation logic and project list.
- [ ] **Universal Inbox**: Build the high-velocity capture board with quick-refencing.
- [ ] **Project Boards**: Implement the "Move to Project" workflow and structured idea boards.
- [ ] **Daily Tasks**: Create the task management view with completion tracking.
- [ ] **Deep-Note Workspace**: Develop the slide-out markdown editor for detailed notes.
- [ ] **Command Palette**: Implement `Cmd+K` global search and navigation.

## Phase 3: Backend & Deployment
- [ ] **Express Server**: Scaffold the Node.js backend.
- [ ] **SQLite Integration**: Setup schemas for projects, ideas, and tasks.
- [ ] **Web-Push Notifications**: Implement the service worker and notification trigger logic.
- [ ] **Pi Deployment**: Create deployment scripts and Nginx configuration templates.

## Verification Plan
### Manual Verification
- Test `Cmd+K` navigation from every view.
- Verify "Move to Project" correctly transfers data between states.
- Check `localStorage` persistence across page refreshes.

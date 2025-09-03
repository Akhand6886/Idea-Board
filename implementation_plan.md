# IdeaOS: Implementation Plan

IdeaOS is a premium, high-performance personal workspace designed for developers. It combines quick capture (Universal Board), structured ideation (Project Boards), and task management into a single, OLED-aesthetic interface.

## User Review Required

> [!IMPORTANT]
> The initial version used `localStorage` for persistence. In Phase 3, we transitioned to a Node.js + SQLite backend with VAPID Web-Push notifications for Raspberry Pi deployment. Please confirm if you would like to proceed with the AI agentic roadmap (Ollama/Llama 3) or advanced developer integrations (idea-cli/GitHub sync) next.

## Phase 1: Project Foundation [COMPLETED]
- [x] Initialize Vite + React project.
- [x] Setup folder structure (`/components`, `/hooks`, `/styles`).
- [x] Define Global Design System (OLED black, typography, accent colors).

## Phase 2: Feature Modularization [COMPLETED]
- [x] **Navigation & Sidebar**: Implement the core navigation logic and project list.
- [x] **Universal Inbox**: Build the high-velocity capture board with quick-refencing.
- [x] **Project Boards**: Implement the "Move to Project" workflow and structured idea boards.
- [x] **Daily Tasks**: Create the task management view with completion tracking.
- [x] **Deep-Note Workspace**: Develop the slide-out markdown editor for detailed notes.
- [x] **Command Palette**: Implement `Cmd+K` global search and navigation.

## Phase 3: Backend & Deployment [COMPLETED]
- [x] **Express Server**: Scaffold the Node.js backend with static file serving for production.
- [x] **SQLite Integration**: Setup schemas for projects, ideas, tasks, reminders, and push subscriptions.
- [x] **Web-Push Notifications**: Implement the service worker (`sw.js`), VAPID key generation, subscription storage, and background worker loop.
- [x] **Pi Deployment**: Create multi-stage `Dockerfile`, `docker-compose.yml`, Nginx configuration templates, and `deploy.sh`.

## Verification Plan
### Manual Verification
- Test `Cmd+K` navigation from every view.
- Verify "Move to Project" correctly transfers data between states.
- Check `localStorage` persistence across page refreshes.
- Verify Web-Push notification subscription and background worker execution.

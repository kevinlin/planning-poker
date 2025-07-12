# Poker Estimation Web App – Developer Specification

## 📌 Purpose
A lightweight, real-time web app for story estimation using poker-style voting. Each session is tied to a single JIRA story and is shareable via a unique short code. It is primarily designed for Zühlke teams but open to anyone with the link.

---

## 1. 🧭 Functional Requirements

### 1.1. Session Creation
- A session is created by entering a **JIRA Key** and **Title**.
- The app auto-generates a **unique short code** (e.g., `AB12`) for the session.
- A **sharable URL** is generated (e.g., `/session/AB12`).
- Sessions are tied to a single story only.
- Creator has no special rights, except the ability to remove participants.

### 1.2. Joining a Session
- Users enter a **name** to join.
- Names are session-specific and must be **unique**.
- If a name is taken, user must choose another.
- Rejoining with the same name is allowed if that name is not active.

### 1.3. Estimation Flow
- Estimation scale is **Fibonacci**: `[1, 2, 3, 5, 8, 13, 21]`.
- Displayed as **poker cards**.
- Each participant may submit **only one vote per round**.
- Once all votes are submitted:
  - **Cards are automatically revealed**.
  - **Names and votes** are shown.
  - **Min and Max votes** are highlighted.
  - A **10-second countdown** is shown during voting (non-blocking).
- Rules after reveal:
  - **1 estimate**: final.
  - **2 estimates**: majority wins.
  - **3+ estimates**: min and max discuss, then revote (anyone can trigger).
  - **Manual override**: any participant may finalize a vote immediately.

### 1.4. Participant Management
- Participants list is **always visible**.
- Show vote count: e.g., “3 of 5 submitted”.
- Participants marked **inactive** after **30s** of no activity (tab closed or idle).
- Inactive users shown grayed out.
- Creator can **remove** participants.
- **Auto-reconnect** if network blips or tab reloads.
- Anyone can join any time during a round and see current state.

### 1.5. Session Lifecycle
- **Persistent**: sessions survive server restarts and are stored in local files.
- **Automatic cleanup**: expired sessions are cleaned up every 5 minutes.
- Ends if:
  - All participants leave.
  - A vote is finalized.
  - Session is idle for 15 minutes.
- Users can’t reopen closed stories.

### 1.6. Home Page
- Lists all active sessions (open stories) and closed ones.
- Sections:
  - **To be estimated**
  - **Already estimated**
- Real-time updates as sessions are created or closed.
- Short codes are shown and copyable.
- No deletion or editing of history.

---

## 2. 🎨 UI Design

### 2.1. Style
- Use **Zühlke branding**:
```css
:root > * {
  --md-primary-fg-color: #985b9c;
}
.md-header {
  background-image: linear-gradient(45deg, #aa41af 5%, #3c69c8 60%, #00a5e6 100%);
}
.md-footer {
  background-color: #666;
}
```

### 2.2. Components
- Poker cards (clickable, animate on flip/reveal)
- Participant list
- Vote count tracker
- Final estimate highlighted with color
- Inactive user styling (grayed out)
- 10s visible timer on top of round

---

## 3. 🏗️ Technical Architecture

### 3.1. Frontend
- **React** with Vite or Next.js
- State Management: Zustand or Redux Toolkit
- Real-time: **Socket.IO or WebSocket API**
- CSS: Tailwind (preferred), using provided Zühlke palette

### 3.2. Deployment
- **Single server** deployable on Vercel, Railway, or Azure App Service
- WebSocket enabled
- SSL via platform
- **File system access**: requires persistent file storage for session data

---

## 4. 🔐 Data Handling

- **File-based persistence**: Session and user data are stored in local JSON files to survive server restarts.
- **Automatic cleanup**: Sessions are automatically cleaned up after 15 minutes of inactivity.
- **No personal data collection**: Only session-related data (names, votes, timestamps) is stored.
- **Local storage**: Data is stored in `/data/sessions.json` file on the server.
- **Backup-friendly**: Simple JSON format allows easy backup and migration.
- Session data auto-clears after:
  - 15 minutes of inactivity
  - Everyone leaves

---

## 5. ⚠️ Error Handling Strategy

| Case                                      | Handling                                                           |
|------------------------------------------|--------------------------------------------------------------------|
| Name already taken                       | Show “Name already in use” message                                 |
| Short code not found                     | Show “Session not found” and link back to home                     |
| Voting after submission                  | Disable input and show “You’ve already voted”                      |
| Inactive participant still counted       | Indicate inactive, allow manual removal                           |
| Reconnect with same name                 | Allow if name not currently active                                 |
| WebSocket disconnect                     | Retry for 10s, fallback to refresh prompt                          |
| Manual finalization collision            | First click wins, second click is ignored                          |
| Invalid JIRA key or title                | Allow, editable anytime during session                             |

---

## 6. 📝 Future Enhancements (Out of Scope for v1)
- Figma plugin for inline estimation
- Dark mode
- Multiple story queue per session
- Session export (CSV/JSON)
- Admin dashboard for metrics
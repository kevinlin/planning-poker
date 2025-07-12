# System Patterns: Planning Poker - Zühlke Story Estimation Tool

## System Architecture
The application follows a **full-stack Next.js architecture** with clear separation between frontend, API, and storage layers:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   API Routes    │    │   Storage       │
│   (React)       │◄──►│   (Next.js)     │◄──►│   (File-based)  │
│                 │    │                 │    │                 │
│ • Session Pages │    │ • Session CRUD  │    │ • JSON Files    │
│ • Poker Cards   │    │ • Voting Logic  │    │ • Auto Cleanup  │
│ • Participant   │    │ • Participant   │    │ • Persistence   │
│   Management    │    │   Management    │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Key Technical Decisions
- **Framework**: Next.js 15 with App Router for full-stack capabilities and easy deployment
- **Storage**: File-based JSON storage for simplicity and persistence across server restarts
- **Real-time**: Polling every 2 seconds instead of WebSockets for simplicity and reliability
- **State Management**: Local React state with useEffect polling, no complex state library needed
- **Styling**: Tailwind CSS with custom Zühlke color variables for consistent branding
- **Type Safety**: Full TypeScript implementation with comprehensive interfaces

## Design Patterns in Use

### 1. **Singleton Storage Manager**
```typescript
// lib/storage.ts - Single instance manages all file operations
export const persistentStorage = new PersistentStorage();
```

### 2. **Static Service Layer**
```typescript
// lib/sessions.ts - Static methods for session operations
export class SessionManager {
  static createSession(jiraKey: string, title: string): Session
  static getSession(code: string): Session | null
  static submitVote(code: string, participantId: string, value: number): Session | null
}
```

### 3. **Component Composition**
```typescript
// Reusable poker card components
<PokerCard value={5} isSelected={true} onClick={handleVote} />
<PokerCardBack participantName="John" />
```

### 4. **Error Boundary Pattern**
```typescript
// Comprehensive error handling in API routes
try {
  const session = SessionManager.submitVote(code, participantId, value);
  return NextResponse.json(session);
} catch (error) {
  if (error.message === 'Participant not found') {
    return NextResponse.json({ error: 'Participant not found' }, { status: 403 });
  }
  return NextResponse.json({ error: 'Failed to submit vote' }, { status: 500 });
}
```

## Component Relationships

### Core Components
- **SessionPage**: Main session interface, manages voting flow
- **PokerCard**: Individual voting cards with click handlers
- **ParticipantList**: Displays active/inactive participants
- **UI Components**: Reusable Button, Card, Input, Badge components

### Data Flow
1. **Session Creation**: HomePage → API → SessionManager → PersistentStorage
2. **Joining**: SessionPage → API → SessionManager → Update participants
3. **Voting**: PokerCard → API → SessionManager → Update votes
4. **Real-time Updates**: useEffect polling → API → SessionManager → UI refresh

## Critical Implementation Paths

### 1. **Session Lifecycle Management**
```typescript
// Automatic cleanup every 5 minutes
setInterval(() => {
  this.cleanupExpiredSessions();
}, 5 * 60 * 1000);
```

### 2. **Vote Consensus Logic**
```typescript
// Automatic reveal when all active participants vote
const activeParticipants = session.participants.filter(p => isParticipantActive(p.lastActivity));
const allVoted = activeParticipants.every(p => votedParticipants.includes(p.id));
if (allVoted && session.votes.length > 0) {
  session.status = 'revealed';
}
```

### 3. **Participant Activity Tracking**
```typescript
// 30-second activity timeout
export function isParticipantActive(lastActivity: Date): boolean {
  const now = new Date();
  const diff = now.getTime() - lastActivity.getTime();
  return diff <= 30 * 1000; // 30 seconds
}
```

### 4. **Data Persistence with Auto-save**
```typescript
// Debounced file writes to prevent excessive I/O
private saveData(): void {
  if (this.saveTimeout) clearTimeout(this.saveTimeout);
  this.saveTimeout = setTimeout(() => {
    fs.writeFileSync(SESSIONS_FILE, JSON.stringify(dataToSave, null, 2));
  }, 1000);
}
```

## Security Considerations
- **No Authentication**: Sessions are protected by unique codes only
- **Input Validation**: All API endpoints validate required fields and data types
- **Rate Limiting**: Implicit through polling intervals, prevents spam
- **Data Sanitization**: User names and inputs are trimmed and validated
- **Session Isolation**: Each session is completely isolated from others 
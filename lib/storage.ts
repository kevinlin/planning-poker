import fs from 'fs';
import path from 'path';
import { Session } from './types';

// Support both local development and production environments
const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), 'data');
const SESSIONS_FILE = path.join(DATA_DIR, 'sessions.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

export interface StorageData {
  sessions: Record<string, Session>;
  lastCleanup: string;
}

class PersistentStorage {
  private data: StorageData;
  private saveTimeout: NodeJS.Timeout | null = null;

  constructor() {
    this.data = this.loadData();
    this.scheduleCleanup();
  }

  private loadData(): StorageData {
    try {
      if (fs.existsSync(SESSIONS_FILE)) {
        const fileContent = fs.readFileSync(SESSIONS_FILE, 'utf-8');
        const parsed = JSON.parse(fileContent);
        
        // Convert date strings back to Date objects
        Object.values(parsed.sessions || {}).forEach((session: any) => {
          session.createdAt = new Date(session.createdAt);
          session.lastActivity = new Date(session.lastActivity);
          session.participants.forEach((participant: any) => {
            participant.joinedAt = new Date(participant.joinedAt);
            participant.lastActivity = new Date(participant.lastActivity);
          });
          session.votes.forEach((vote: any) => {
            vote.submittedAt = new Date(vote.submittedAt);
          });
        });

        return {
          sessions: parsed.sessions || {},
          lastCleanup: parsed.lastCleanup || new Date().toISOString()
        };
      }
    } catch (error) {
      console.error('Error loading sessions from file:', error);
    }

    return {
      sessions: {},
      lastCleanup: new Date().toISOString()
    };
  }

  private saveData(): void {
    // Debounce saves to avoid excessive file writes
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }

    this.saveTimeout = setTimeout(() => {
      try {
        const dataToSave = {
          sessions: this.data.sessions,
          lastCleanup: this.data.lastCleanup
        };
        
        fs.writeFileSync(SESSIONS_FILE, JSON.stringify(dataToSave, null, 2));
        console.log(`Saved ${Object.keys(this.data.sessions).length} sessions to persistent storage`);
      } catch (error) {
        console.error('Error saving sessions to file:', error);
      }
    }, 1000); // Save after 1 second of inactivity
  }

  private scheduleCleanup(): void {
    // Clean up expired sessions every 5 minutes
    setInterval(() => {
      this.cleanupExpiredSessions();
    }, 5 * 60 * 1000);

    // Initial cleanup
    setTimeout(() => {
      this.cleanupExpiredSessions();
    }, 10000); // Wait 10 seconds after startup
  }

  private cleanupExpiredSessions(): void {
    const now = new Date();
    const expiredSessions: string[] = [];

    Object.entries(this.data.sessions).forEach(([code, session]) => {
      const timeSinceLastActivity = now.getTime() - session.lastActivity.getTime();
      const isExpired = timeSinceLastActivity > 15 * 60 * 1000; // 15 minutes

      if (isExpired) {
        expiredSessions.push(code);
      }
    });

    if (expiredSessions.length > 0) {
      expiredSessions.forEach(code => {
        delete this.data.sessions[code];
      });
      
      this.data.lastCleanup = now.toISOString();
      this.saveData();
      console.log(`Cleaned up ${expiredSessions.length} expired sessions`);
    }
  }

  // Public methods for session management
  getAllSessions(): Session[] {
    return Object.values(this.data.sessions);
  }

  getSession(code: string): Session | undefined {
    return this.data.sessions[code];
  }

  saveSession(session: Session): void {
    this.data.sessions[session.code] = session;
    this.saveData();
  }

  deleteSession(code: string): boolean {
    if (this.data.sessions[code]) {
      delete this.data.sessions[code];
      this.saveData();
      return true;
    }
    return false;
  }

  sessionExists(code: string): boolean {
    return !!this.data.sessions[code];
  }

  getSessionCount(): number {
    return Object.keys(this.data.sessions).length;
  }

  // Force cleanup for testing
  forceCleanup(): void {
    this.cleanupExpiredSessions();
  }
}

// Export singleton instance
export const persistentStorage = new PersistentStorage(); 
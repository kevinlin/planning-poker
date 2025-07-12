import { Session, Participant, Vote } from './types';

const STORAGE_KEY = 'poker-estimation-sessions';

export class ClientStorage {
  private static instance: ClientStorage;
  private sessions: Map<string, Session> = new Map();

  private constructor() {
    this.loadFromLocalStorage();
  }

  static getInstance(): ClientStorage {
    if (!ClientStorage.instance) {
      ClientStorage.instance = new ClientStorage();
    }
    return ClientStorage.instance;
  }

  private loadFromLocalStorage(): void {
    if (typeof window === 'undefined') return;
    
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        Object.entries(data).forEach(([code, session]: [string, any]) => {
          // Convert date strings back to Date objects
          session.createdAt = new Date(session.createdAt);
          session.lastActivity = new Date(session.lastActivity);
          session.participants.forEach((participant: any) => {
            participant.joinedAt = new Date(participant.joinedAt);
            participant.lastActivity = new Date(participant.lastActivity);
          });
          session.votes.forEach((vote: any) => {
            vote.submittedAt = new Date(vote.submittedAt);
          });
          this.sessions.set(code, session);
        });
      }
    } catch (error) {
      console.error('Error loading sessions from localStorage:', error);
    }
  }

  private saveToLocalStorage(): void {
    if (typeof window === 'undefined') return;
    
    try {
      const data: Record<string, Session> = {};
      this.sessions.forEach((session, code) => {
        data[code] = session;
      });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving sessions to localStorage:', error);
    }
  }

  getAllSessions(): Session[] {
    return Array.from(this.sessions.values());
  }

  getSession(code: string): Session | undefined {
    return this.sessions.get(code);
  }

  saveSession(session: Session): void {
    this.sessions.set(session.code, session);
    this.saveToLocalStorage();
  }

  deleteSession(code: string): boolean {
    const deleted = this.sessions.delete(code);
    if (deleted) {
      this.saveToLocalStorage();
    }
    return deleted;
  }

  sessionExists(code: string): boolean {
    return this.sessions.has(code);
  }

  getSessionCount(): number {
    return this.sessions.size;
  }
}

export const clientStorage = ClientStorage.getInstance(); 
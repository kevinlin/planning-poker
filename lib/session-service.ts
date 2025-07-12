import { Session, SessionSummary } from './types';
import { ClientSessionManager } from './client-session-manager';
import { IS_STATIC_EXPORT } from './config';

export class SessionService {
  static async getAllSessions(): Promise<SessionSummary[]> {
    if (IS_STATIC_EXPORT || typeof window !== 'undefined') {
      // Client-side logic for static export or browser
      const sessions = ClientSessionManager.getAllSessions();
      return sessions.map(session => ({
        id: session.id,
        code: session.code,
        jiraKey: session.jiraKey,
        title: session.title,
        status: session.status,
        participantCount: session.participants.length,
        finalEstimate: session.finalEstimate,
        createdAt: session.createdAt,
      }));
    } else {
      // Server-side logic for dynamic mode
      const response = await fetch('/api/sessions');
      if (response.ok) {
        return await response.json();
      }
      throw new Error('Failed to fetch sessions');
    }
  }

  static async createSession(jiraKey: string, title: string): Promise<Session> {
    if (IS_STATIC_EXPORT || typeof window !== 'undefined') {
      // Client-side logic for static export or browser
      return ClientSessionManager.createSession(jiraKey, title);
    } else {
      // Server-side logic for dynamic mode
      const response = await fetch('/api/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ jiraKey, title }),
      });
      
      if (response.ok) {
        return await response.json();
      }
      throw new Error('Failed to create session');
    }
  }

  static async getSession(code: string): Promise<Session | null> {
    if (IS_STATIC_EXPORT || typeof window !== 'undefined') {
      // Client-side logic for static export or browser
      const session = ClientSessionManager.getSession(code);
      return session || null;
    } else {
      // Server-side logic for dynamic mode
      const response = await fetch(`/api/sessions/${code}`);
      if (response.ok) {
        return await response.json();
      }
      return null;
    }
  }

  static async joinSession(code: string, name: string): Promise<{ success: boolean; session?: Session; error?: string }> {
    if (IS_STATIC_EXPORT || typeof window !== 'undefined') {
      // Client-side logic for static export or browser
      return ClientSessionManager.joinSession(code, name);
    } else {
      // Server-side logic for dynamic mode
      const response = await fetch(`/api/sessions/${code}/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name }),
      });
      
      if (response.ok) {
        const session = await response.json();
        return { success: true, session };
      } else {
        const errorData = await response.json();
        return { success: false, error: errorData.error };
      }
    }
  }

  static async submitVote(code: string, participantName: string, estimate: number): Promise<{ success: boolean; session?: Session; error?: string }> {
    if (IS_STATIC_EXPORT || typeof window !== 'undefined') {
      // Client-side logic for static export or browser
      return ClientSessionManager.submitVote(code, participantName, estimate);
    } else {
      // Server-side logic for dynamic mode
      const response = await fetch(`/api/sessions/${code}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ participantName, estimate }),
      });
      
      if (response.ok) {
        const session = await response.json();
        return { success: true, session };
      } else {
        const errorData = await response.json();
        return { success: false, error: errorData.error };
      }
    }
  }

  static async revealVotes(code: string): Promise<{ success: boolean; session?: Session; error?: string }> {
    if (IS_STATIC_EXPORT || typeof window !== 'undefined') {
      // Client-side logic for static export or browser
      return ClientSessionManager.revealVotes(code);
    } else {
      // Server-side logic for dynamic mode
      const response = await fetch(`/api/sessions/${code}/actions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'reveal' }),
      });
      
      if (response.ok) {
        const session = await response.json();
        return { success: true, session };
      } else {
        const errorData = await response.json();
        return { success: false, error: errorData.error };
      }
    }
  }

  static async finalizeSession(code: string, estimate: number): Promise<{ success: boolean; session?: Session; error?: string }> {
    if (IS_STATIC_EXPORT || typeof window !== 'undefined') {
      // Client-side logic for static export or browser
      return ClientSessionManager.finalizeSession(code, estimate);
    } else {
      // Server-side logic for dynamic mode
      const response = await fetch(`/api/sessions/${code}/actions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'finalize', estimate }),
      });
      
      if (response.ok) {
        const session = await response.json();
        return { success: true, session };
      } else {
        const errorData = await response.json();
        return { success: false, error: errorData.error };
      }
    }
  }

  static async resetSession(code: string): Promise<{ success: boolean; session?: Session; error?: string }> {
    if (IS_STATIC_EXPORT || typeof window !== 'undefined') {
      // Client-side logic for static export or browser
      return ClientSessionManager.resetSession(code);
    } else {
      // Server-side logic for dynamic mode
      const response = await fetch(`/api/sessions/${code}/actions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'reset' }),
      });
      
      if (response.ok) {
        const session = await response.json();
        return { success: true, session };
      } else {
        const errorData = await response.json();
        return { success: false, error: errorData.error };
      }
    }
  }
} 
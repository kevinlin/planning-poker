import { Session, Participant, Vote } from './types';
import { generateSessionCode, generateId, isSessionExpired } from './utils';
import { clientStorage } from './client-storage';

export class ClientSessionManager {
  static createSession(jiraKey: string, title: string): Session {
    const code = this.generateUniqueCode();
    const session: Session = {
      id: generateId(),
      code,
      jiraKey,
      title,
      participants: [],
      votes: [],
      status: 'active',
      createdAt: new Date(),
      lastActivity: new Date(),
      finalEstimate: undefined,
    };

    clientStorage.saveSession(session);
    return session;
  }

  static getAllSessions(): Session[] {
    const sessions = clientStorage.getAllSessions();
    // Filter out expired sessions
    return sessions.filter(session => !isSessionExpired(session.lastActivity));
  }

  static getSession(code: string): Session | undefined {
    const session = clientStorage.getSession(code);
    if (session && isSessionExpired(session.lastActivity)) {
      clientStorage.deleteSession(code);
      return undefined;
    }
    return session;
  }

  static joinSession(code: string, name: string): { success: boolean; session?: Session; error?: string } {
    const session = this.getSession(code);
    if (!session) {
      return { success: false, error: 'Session not found' };
    }

    // Check if participant already exists
    const existingParticipant = session.participants.find(p => p.name === name);
    if (existingParticipant) {
      existingParticipant.lastActivity = new Date();
    } else {
      const participant: Participant = {
        id: generateId(),
        name,
        isActive: true,
        joinedAt: new Date(),
        lastActivity: new Date(),
      };
      session.participants.push(participant);
    }

    session.lastActivity = new Date();
    clientStorage.saveSession(session);
    return { success: true, session };
  }

  static submitVote(code: string, participantName: string, estimate: number): { success: boolean; session?: Session; error?: string } {
    const session = this.getSession(code);
    if (!session) {
      return { success: false, error: 'Session not found' };
    }

    if (session.status !== 'active') {
      return { success: false, error: 'Session is not active' };
    }

    const participant = session.participants.find(p => p.name === participantName);
    if (!participant) {
      return { success: false, error: 'Participant not found' };
    }

    // Remove existing vote from this participant
    session.votes = session.votes.filter(v => v.participantId !== participant.id);

    // Add new vote
    const vote: Vote = {
      participantId: participant.id,
      value: estimate,
      submittedAt: new Date(),
    };
    session.votes.push(vote);

    // Update activity
    participant.lastActivity = new Date();
    session.lastActivity = new Date();

    // Auto-reveal if all participants have voted
    const activeParticipants = session.participants.filter(p => 
      new Date().getTime() - p.lastActivity.getTime() < 60 * 1000 // 60 seconds
    );
    
    if (session.votes.length === activeParticipants.length && activeParticipants.length > 0) {
      session.status = 'revealed';
    }

    clientStorage.saveSession(session);
    return { success: true, session };
  }

  static revealVotes(code: string): { success: boolean; session?: Session; error?: string } {
    const session = this.getSession(code);
    if (!session) {
      return { success: false, error: 'Session not found' };
    }

    session.status = 'revealed';
    session.lastActivity = new Date();
    clientStorage.saveSession(session);
    return { success: true, session };
  }

  static finalizeSession(code: string, estimate: number): { success: boolean; session?: Session; error?: string } {
    const session = this.getSession(code);
    if (!session) {
      return { success: false, error: 'Session not found' };
    }

    session.status = 'finalized';
    session.finalEstimate = estimate;
    session.lastActivity = new Date();
    clientStorage.saveSession(session);
    return { success: true, session };
  }

  static resetSession(code: string): { success: boolean; session?: Session; error?: string } {
    const session = this.getSession(code);
    if (!session) {
      return { success: false, error: 'Session not found' };
    }

    session.votes = [];
    session.status = 'active';
    session.finalEstimate = undefined;
    session.lastActivity = new Date();
    clientStorage.saveSession(session);
    return { success: true, session };
  }

  private static generateUniqueCode(): string {
    let code: string;
    do {
      code = generateSessionCode();
    } while (clientStorage.sessionExists(code));
    return code;
  }
} 
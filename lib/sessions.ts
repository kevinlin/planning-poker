import { Session, Participant, Vote, SessionSummary, FIBONACCI_SCALE } from './types';
import { generateSessionCode, generateId, isParticipantActive, isSessionExpired } from './utils';
import { persistentStorage } from './storage';

console.log('Session storage initialized with persistent storage');

export class SessionManager {
  static createSession(jiraKey: string, title: string): Session {
    const id = generateId();
    let code = generateSessionCode();
    
    // Ensure unique code
    while (persistentStorage.sessionExists(code)) {
      code = generateSessionCode();
    }
    
    const session: Session = {
      id,
      code,
      jiraKey,
      title,
      participants: [],
      votes: [],
      status: 'active',
      createdAt: new Date(),
      lastActivity: new Date(),
    };
    
    persistentStorage.saveSession(session);
    
    console.log(`Created session ${code} (${id}). Total sessions: ${persistentStorage.getSessionCount()}`);
    
    return session;
  }

  static getSession(code: string): Session | null {
    console.log(`Looking for session ${code}. Total sessions: ${persistentStorage.getSessionCount()}`);
    
    const session = persistentStorage.getSession(code);
    if (!session) {
      console.log(`Session code ${code} not found`);
      return null;
    }
    
    // Check if session is expired
    if (isSessionExpired(session.lastActivity)) {
      console.log(`Session ${code} expired, deleting`);
      this.deleteSession(code);
      return null;
    }
    
    console.log(`Found session ${code}`);
    return session;
  }

  static getAllSessions(): SessionSummary[] {
    console.log(`Getting all sessions. Total: ${persistentStorage.getSessionCount()}`);
    
    const activeSessions: SessionSummary[] = [];
    const allSessions = persistentStorage.getAllSessions();
    
    for (const session of allSessions) {
      if (isSessionExpired(session.lastActivity)) {
        console.log(`Session ${session.code} expired, deleting`);
        this.deleteSession(session.code);
        continue;
      }
      
      activeSessions.push({
        id: session.id,
        code: session.code,
        jiraKey: session.jiraKey,
        title: session.title,
        status: session.status,
        participantCount: session.participants.filter((p: Participant) => isParticipantActive(p.lastActivity)).length,
        finalEstimate: session.finalEstimate,
        createdAt: session.createdAt,
      });
    }
    
    console.log(`Returning ${activeSessions.length} active sessions`);
    return activeSessions.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  static joinSession(code: string, name: string): { participant: Participant; session: Session } | null {
    const session = this.getSession(code);
    if (!session) return null;
    
    // Check if name is already taken by an active participant
    const existingParticipant = session.participants.find(p => 
      p.name.toLowerCase() === name.toLowerCase() && isParticipantActive(p.lastActivity)
    );
    
    if (existingParticipant) {
      throw new Error('Name already taken');
    }
    
    // Check if participant is rejoining
    const rejoinParticipant = session.participants.find(p => 
      p.name.toLowerCase() === name.toLowerCase()
    );
    
    if (rejoinParticipant) {
      rejoinParticipant.isActive = true;
      rejoinParticipant.lastActivity = new Date();
      this.updateSessionActivity(session);
      return { participant: rejoinParticipant, session };
    }
    
    // Create new participant
    const participant: Participant = {
      id: generateId(),
      name,
      isActive: true,
      joinedAt: new Date(),
      lastActivity: new Date(),
    };
    
    session.participants.push(participant);
    this.updateSessionActivity(session);
    
    return { participant, session };
  }

  static submitVote(code: string, participantId: string, value: number): Session | null {
    const session = this.getSession(code);
    if (!session) return null;
    
    const participant = session.participants.find(p => p.id === participantId);
    if (!participant || !isParticipantActive(participant.lastActivity)) {
      throw new Error('Participant not found or inactive');
    }
    
    if (!FIBONACCI_SCALE.includes(value as any)) {
      throw new Error('Invalid vote value');
    }
    
    // Remove existing vote from this participant
    session.votes = session.votes.filter(v => v.participantId !== participantId);
    
    // Add new vote
    session.votes.push({
      participantId,
      value,
      submittedAt: new Date(),
    });
    
    session.status = 'voting';
    participant.lastActivity = new Date();
    this.updateSessionActivity(session);
    
    // Check if all active participants have voted
    const activeParticipants = session.participants.filter(p => isParticipantActive(p.lastActivity));
    const votedParticipants = session.votes.map(v => v.participantId);
    const allVoted = activeParticipants.every(p => votedParticipants.includes(p.id));
    
    if (allVoted && session.votes.length > 0) {
      session.status = 'revealed';
    }
    
    return session;
  }

  static revealVotes(code: string): Session | null {
    const session = this.getSession(code);
    if (!session) return null;
    
    session.status = 'revealed';
    this.updateSessionActivity(session);
    
    return session;
  }

  static finalizeEstimate(code: string, estimate: number): Session | null {
    const session = this.getSession(code);
    if (!session) return null;
    
    if (!FIBONACCI_SCALE.includes(estimate as any)) {
      throw new Error('Invalid estimate value');
    }
    
    session.finalEstimate = estimate;
    session.status = 'finalized';
    this.updateSessionActivity(session);
    
    return session;
  }

  static resetVoting(code: string): Session | null {
    const session = this.getSession(code);
    if (!session) return null;
    
    session.votes = [];
    session.status = 'active';
    this.updateSessionActivity(session);
    
    return session;
  }

  static updateParticipantActivity(code: string, participantId: string): Session | null {
    const session = this.getSession(code);
    if (!session) return null;
    
    const participant = session.participants.find(p => p.id === participantId);
    if (!participant) return null;
    
    participant.lastActivity = new Date();
    participant.isActive = true;
    this.updateSessionActivity(session);
    
    return session;
  }

  static removeParticipant(code: string, participantId: string): Session | null {
    const session = this.getSession(code);
    if (!session) return null;
    
    session.participants = session.participants.filter(p => p.id !== participantId);
    session.votes = session.votes.filter(v => v.participantId !== participantId);
    
    this.updateSessionActivity(session);
    
    // If no participants left, delete session
    if (session.participants.length === 0) {
      this.deleteSession(code);
      return null;
    }
    
    return session;
  }

  static getVoteStats(session: Session): {
    votes: { participantName: string; value: number }[];
    minVote: number | null;
    maxVote: number | null;
    uniqueVotes: number[];
  } {
    const votes = session.votes.map(vote => {
      const participant = session.participants.find(p => p.id === vote.participantId);
      return {
        participantName: participant?.name || 'Unknown',
        value: vote.value,
      };
    });
    
    const values = votes.map(v => v.value);
    const uniqueVotes = [...new Set(values)].sort((a, b) => a - b);
    
    return {
      votes,
      minVote: values.length > 0 ? Math.min(...values) : null,
      maxVote: values.length > 0 ? Math.max(...values) : null,
      uniqueVotes,
    };
  }

  static shouldAutoFinalize(session: Session): number | null {
    const stats = this.getVoteStats(session);
    
    if (stats.uniqueVotes.length === 1) {
      // All votes are the same - auto-finalize
      return stats.uniqueVotes[0];
    }
    
    if (stats.uniqueVotes.length === 2) {
      // Two different votes - majority wins
      const voteCounts = stats.uniqueVotes.map(value => ({
        value,
        count: stats.votes.filter(v => v.value === value).length,
      }));
      
      voteCounts.sort((a, b) => b.count - a.count);
      
      if (voteCounts[0].count > voteCounts[1].count) {
        return voteCounts[0].value;
      }
    }
    
    return null;
  }

  private static updateSessionActivity(session: Session): void {
    session.lastActivity = new Date();
    persistentStorage.saveSession(session);
  }

  static deleteSession(code: string): void {
    persistentStorage.deleteSession(code);
    console.log(`Deleted session ${code}`);
  }
}

// Cleanup expired sessions periodically
setInterval(() => {
  console.log('Running session cleanup...');
  const allSessions = persistentStorage.getAllSessions();
  for (const session of allSessions) {
    if (isSessionExpired(session.lastActivity)) {
      SessionManager.removeParticipant(session.code, ''); // This will trigger cleanup
    }
  }
}, 60000); // Check every minute 
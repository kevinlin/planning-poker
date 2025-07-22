export interface Session {
  id: string;
  code: string; // short code like "AB12"
  jiraKey: string;
  title: string;
  participants: Participant[];
  votes: Vote[];
  status: 'active' | 'voting' | 'revealed' | 'finalized';
  createdAt: Date;
  lastActivity: Date;
  finalEstimate?: number;
  creatorId?: string;
}

export interface Participant {
  id: string;
  name: string;
  isActive: boolean;
  joinedAt: Date;
  lastActivity: Date;
}

export interface Vote {
  participantId: string;
  value: number;
  submittedAt: Date;
}

export interface SessionSummary {
  id: string;
  code: string;
  jiraKey: string;
  title: string;
  status: Session['status'];
  participantCount: number;
  finalEstimate?: number;
  createdAt: Date;
}

export const FIBONACCI_SCALE = [1, 2, 3, 5, 8, 13, 21] as const;
export type FibonacciValue = typeof FIBONACCI_SCALE[number];

export interface CreateSessionRequest {
  jiraKey: string;
  title: string;
}

export interface JoinSessionRequest {
  name: string;
}

export interface VoteRequest {
  participantId: string;
  value: FibonacciValue;
}

export interface SessionState {
  session: Session;
  currentParticipant?: Participant;
  hasVoted: boolean;
  canReveal: boolean;
}

// Google Analytics gtag types
declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}

export {}; 
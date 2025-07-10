/**
 * In-memory session store.
 * This is a simple implementation for demonstration purposes.
 * In a real-world application, you would use a database or a distributed cache like Redis.
 * The data is ephemeral and will be lost on server restart.
 */
import type { Session, Participant } from "./types"

const sessions = new Map<string, Session>()

function generateShortCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  let result = ""
  for (let i = 0; i < 4; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  // Ensure code is unique
  if (sessions.has(result)) {
    return generateShortCode()
  }
  return result
}

function generateId() {
  return Math.random().toString(36).substr(2, 9)
}

export async function createSession(data: { title: string; jiraKey: string }): Promise<Session> {
  const code = generateShortCode()
  const creatorId = generateId() // A dummy ID for the creator
  const session: Session = {
    code,
    title: data.title,
    jiraKey: data.jiraKey,
    participants: [],
    status: "active",
    createdAt: new Date(),
    creatorId: creatorId, // In this model, creator has no special rights other than being identifiable
    finalVote: null,
  }
  sessions.set(code, session)
  return session
}

export async function getSessions() {
  const allSessions = Array.from(sessions.values())
  const activeSessions = allSessions
    .filter((s) => s.status === "active")
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  const closedSessions = allSessions
    .filter((s) => s.status === "closed")
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  return { activeSessions, closedSessions }
}

export async function getSession(code: string): Promise<Session | undefined> {
  return sessions.get(code)
}

export async function findSessionByCode(code: string): Promise<Session | undefined> {
  return sessions.get(code)
}

export async function addParticipant(code: string, participant: Participant): Promise<void> {
  const session = sessions.get(code)
  if (session) {
    session.participants.push(participant)
  } else {
    throw new Error("Session not found")
  }
}

export async function getParticipant(code: string, participantId: string): Promise<Participant | null> {
  const session = sessions.get(code)
  return session?.participants.find((p) => p.id === participantId) || null
}

export async function updateParticipantVote(code: string, participantId: string, vote: number): Promise<void> {
  const session = sessions.get(code)
  if (session) {
    const participant = session.participants.find((p) => p.id === participantId)
    if (participant) {
      participant.vote = vote
      participant.lastActive = Date.now()
    } else {
      throw new Error("Participant not found")
    }
  } else {
    throw new Error("Session not found")
  }
}

export async function finalizeSessionVote(code: string, vote: number): Promise<void> {
  const session = sessions.get(code)
  if (session) {
    session.status = "closed"
    session.finalVote = vote
  } else {
    throw new Error("Session not found")
  }
}

export async function resetSessionVoting(code: string): Promise<void> {
  const session = sessions.get(code)
  if (session) {
    session.participants.forEach((p) => (p.vote = null))
  } else {
    throw new Error("Session not found")
  }
}

export async function removeParticipantFromSession(code: string, participantId: string): Promise<void> {
  const session = sessions.get(code)
  if (session) {
    session.participants = session.participants.filter((p) => p.id !== participantId)
  } else {
    throw new Error("Session not found")
  }
}

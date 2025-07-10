/**
 * File-persisted session store for development.
 * This implementation persists sessions to a local JSON file to prevent data loss on server restart.
 * In a real-world application, you would use a database or a distributed cache like Redis.
 */
import type { Session, Participant } from "./types"
import { writeFileSync, readFileSync, existsSync } from "fs"
import { join } from "path"

const SESSIONS_FILE = join(process.cwd(), '.sessions.json')

// Load sessions from file on startup
function loadSessions(): Map<string, Session> {
  try {
    if (existsSync(SESSIONS_FILE)) {
      const data = readFileSync(SESSIONS_FILE, 'utf-8')
      const sessionsArray = JSON.parse(data)
      const sessions = new Map<string, Session>()
      
      // Convert date strings back to Date objects and restore the Map
      sessionsArray.forEach(([code, session]: [string, any]) => {
        session.createdAt = new Date(session.createdAt)
        sessions.set(code, session)
      })
      
      return sessions
    }
  } catch (error) {
    console.warn('Failed to load sessions from file:', error)
  }
  return new Map<string, Session>()
}

// Save sessions to file
function saveSessions(sessions: Map<string, Session>): void {
  try {
    const sessionsArray = Array.from(sessions.entries())
    writeFileSync(SESSIONS_FILE, JSON.stringify(sessionsArray, null, 2))
  } catch (error) {
    console.warn('Failed to save sessions to file:', error)
  }
}

const sessions = loadSessions()

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
  saveSessions(sessions)
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
    saveSessions(sessions)
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
      saveSessions(sessions)
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
    saveSessions(sessions)
  } else {
    throw new Error("Session not found")
  }
}

export async function resetSessionVoting(code: string): Promise<void> {
  const session = sessions.get(code)
  if (session) {
    session.participants.forEach((p) => (p.vote = null))
    saveSessions(sessions)
  } else {
    throw new Error("Session not found")
  }
}

export async function removeParticipantFromSession(code: string, participantId: string): Promise<void> {
  const session = sessions.get(code)
  if (session) {
    session.participants = session.participants.filter((p) => p.id !== participantId)
    saveSessions(sessions)
  } else {
    throw new Error("Session not found")
  }
}

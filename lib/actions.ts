"use server"

import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"
import {
  addParticipant,
  createSession as createSessionInStore,
  finalizeSessionVote,
  findSessionByCode,
  removeParticipantFromSession,
  resetSessionVoting,
  updateParticipantVote,
} from "./sessions"
import type { Participant } from "./types"

function generateId() {
  return Math.random().toString(36).substr(2, 9)
}

export async function createSession(formData: FormData) {
  const title = formData.get("title") as string
  const jiraKey = formData.get("jiraKey") as string

  if (!title || !jiraKey) {
    return { success: false, error: "Title and JIRA Key are required." }
  }

  try {
    const session = await createSessionInStore({ title, jiraKey })
    return { success: true, code: session.code }
  } catch (error) {
    return { success: false, error: "Failed to create session. Please try again." }
  }
}

export async function joinSession(code: string, formData: FormData) {
  const name = formData.get("name") as string
  if (!name) {
    return { success: false, error: "Name is required." }
  }

  const session = await findSessionByCode(code)
  if (!session) {
    return { success: false, error: "Session not found." }
  }
  if (session.participants.some((p) => p.name === name)) {
    return { success: false, error: "This name is already taken in this session." }
  }

  const participant: Participant = {
    id: generateId(),
    name,
    vote: null,
    lastActive: Date.now(),
  }

  await addParticipant(code, participant)
  cookies().set(`participant-${code}`, participant.id, { httpOnly: true, path: `/` })

  revalidatePath(`/session/${code}`)
  revalidatePath("/")
  return { success: true, participant }
}

export async function submitVote(code: string, participantId: string, vote: number) {
  try {
    await updateParticipantVote(code, participantId, vote)
    revalidatePath(`/session/${code}`)
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function finalizeVote(code: string, vote: number) {
  try {
    await finalizeSessionVote(code, vote)
    revalidatePath(`/session/${code}`)
    revalidatePath("/")
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function resetVoting(code: string) {
  try {
    await resetSessionVoting(code)
    revalidatePath(`/session/${code}`)
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function removeParticipant(code: string, participantId: string) {
  try {
    await removeParticipantFromSession(code, participantId)
    revalidatePath(`/session/${code}`)
    revalidatePath("/")
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

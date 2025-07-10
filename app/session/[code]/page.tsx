import { getSession, getParticipant } from "@/lib/sessions"
import { SessionPage } from "@/components/session-page"
import { notFound } from "next/navigation"
import { cookies } from "next/headers"

export default async function Page({ params }: { params: { code: string } }) {
  const session = await getSession(params.code)
  if (!session) {
    notFound()
  }

  const participantId = cookies().get(`participant-${params.code}`)?.value
  const participant = participantId ? await getParticipant(params.code, participantId) : null

  return <SessionPage initialSession={session} initialParticipant={participant} />
}

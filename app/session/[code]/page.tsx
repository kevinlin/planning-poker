import { getSession, getParticipant } from "@/lib/sessions"
import { SessionPage } from "@/components/session-page"
import { notFound } from "next/navigation"
import { cookies } from "next/headers"

export default async function Page({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params
  const session = await getSession(code)
  if (!session) {
    notFound()
  }

  const participantId = (await cookies()).get(`participant-${code}`)?.value
  const participant = participantId ? await getParticipant(code, participantId) : null

  return <SessionPage initialSession={session} initialParticipant={participant} />
}

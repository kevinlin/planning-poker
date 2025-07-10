import { getSessions } from "@/lib/sessions"
import { HomePage } from "@/components/home-page"

export default async function Page() {
  const { activeSessions, closedSessions } = await getSessions()

  return <HomePage activeSessions={activeSessions} closedSessions={closedSessions} />
}

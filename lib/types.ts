export interface Participant {
  id: string
  name: string
  vote: number | null
  lastActive: number
}

export interface Session {
  code: string
  title: string
  jiraKey: string
  participants: Participant[]
  status: "active" | "closed"
  createdAt: Date
  creatorId: string
  finalVote: number | null
}

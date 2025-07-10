"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { createSession } from "@/lib/actions"
import type { Session } from "@/lib/types"
import { Clipboard, Users } from "lucide-react"

interface HomePageProps {
  activeSessions: Session[]
  closedSessions: Session[]
}

export function HomePage({ activeSessions, closedSessions }: HomePageProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isCreating, setIsCreating] = useState(false)

  const handleCreateSession = async (formData: FormData) => {
    setIsCreating(true)
    const result = await createSession(formData)
    if (result.success && result.code) {
      toast({ title: "Session Created!", description: `Your session code is ${result.code}.` })
      router.push(`/session/${result.code}`)
    } else {
      toast({ title: "Error", description: result.error, variant: "destructive" })
      setIsCreating(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({ title: "Copied!", description: "Session code copied to clipboard." })
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      <div className="md:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle>Create New Session</CardTitle>
            <CardDescription>Enter a JIRA key and title to start estimating.</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={handleCreateSession} className="space-y-4">
              <div>
                <Label htmlFor="jiraKey">JIRA Key</Label>
                <Input id="jiraKey" name="jiraKey" placeholder="PROJ-123" required />
              </div>
              <div>
                <Label htmlFor="title">Title</Label>
                <Input id="title" name="title" placeholder="Implement user authentication" required />
              </div>
              <Button type="submit" className="w-full" disabled={isCreating}>
                {isCreating ? "Creating..." : "Create Session"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
      <div className="md:col-span-2 space-y-8">
        <SessionList
          title="To Be Estimated"
          sessions={activeSessions}
          onCopy={copyToClipboard}
          onJoin={(code) => router.push(`/session/${code}`)}
        />
        <SessionList title="Already Estimated" sessions={closedSessions} onCopy={copyToClipboard} />
      </div>
    </div>
  )
}

function SessionList({
  title,
  sessions,
  onCopy,
  onJoin,
}: { title: string; sessions: Session[]; onCopy: (text: string) => void; onJoin?: (code: string) => void }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {sessions.length === 0 ? (
          <p className="text-muted-foreground">No sessions here.</p>
        ) : (
          <ul className="space-y-4">
            {sessions.map((session) => (
              <li key={session.code} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-semibold">{session.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {session.jiraKey} - Code: <span className="font-mono bg-gray-200 px-1 rounded">{session.code}</span>
                  </p>
                  {session.finalVote && (
                    <p className="text-sm font-bold text-primary">Final Estimate: {session.finalVote}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground flex items-center gap-1">
                    <Users className="w-4 h-4" /> {session.participants.length}
                  </span>
                  <Button variant="ghost" size="icon" onClick={() => onCopy(session.code)}>
                    <Clipboard className="h-4 w-4" />
                  </Button>
                  {onJoin && <Button onClick={() => onJoin(session.code)}>Join</Button>}
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}

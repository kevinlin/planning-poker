"use client"

import type React from "react"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import type { Session, Participant } from "@/lib/types"
import { joinSession, submitVote, finalizeVote, removeParticipant, resetVoting } from "@/lib/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import { User, CheckCircle, XCircle, Crown, Clipboard } from "lucide-react"

const ESTIMATION_VALUES = [1, 2, 3, 5, 8, 13, 21]

interface SessionPageProps {
  initialSession: Session
  initialParticipant: Participant | null
}

export function SessionPage({ initialSession, initialParticipant }: SessionPageProps) {
  const [session, setSession] = useState(initialSession)
  const [participant, setParticipant] = useState(initialParticipant)
  const [isJoining, setIsJoining] = useState(false)
  const [showJoinDialog, setShowJoinDialog] = useState(!initialParticipant)
  const router = useRouter()
  const { toast } = useToast()

  // Poll for updates to simulate real-time
  useEffect(() => {
    if (session.status === "closed") return
    const interval = setInterval(() => {
      router.refresh()
    }, 3000) // Refresh every 3 seconds
    return () => clearInterval(interval)
  }, [router, session.status])

  useEffect(() => {
    setSession(initialSession)
    if (initialParticipant) {
      setParticipant(initialParticipant)
    }
  }, [initialSession, initialParticipant])

  const handleJoin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsJoining(true)
    const formData = new FormData(e.currentTarget)
    const result = await joinSession(session.code, formData)

    if (result.success && result.participant) {
      setParticipant(result.participant)
      setShowJoinDialog(false)
      toast({ title: "Joined Session!", description: `Welcome, ${result.participant.name}!` })
      router.refresh()
    } else {
      toast({ title: "Error", description: result.error, variant: "destructive" })
    }
    setIsJoining(false)
  }

  const handleVote = async (value: number) => {
    if (!participant) return
    const result = await submitVote(session.code, participant.id, value)
    if (result.error) {
      toast({ title: "Error", description: result.error, variant: "destructive" })
    } else {
      toast({ title: "Vote Submitted!", description: `You voted ${value}.` })
      router.refresh()
    }
  }

  const handleFinalize = async (vote: number) => {
    const result = await finalizeVote(session.code, vote)
    if (result.error) {
      toast({ title: "Error", description: result.error, variant: "destructive" })
    } else {
      toast({ title: "Vote Finalized!", description: `The final estimate is ${vote}.` })
      router.refresh()
    }
  }

  const handleRevote = async () => {
    const result = await resetVoting(session.code)
    if (result.error) {
      toast({ title: "Error", description: result.error, variant: "destructive" })
    } else {
      toast({ title: "New Round!", description: "A new voting round has started." })
      router.refresh()
    }
  }

  const handleRemoveParticipant = async (participantId: string) => {
    if (participant?.id !== session.creatorId) {
      toast({
        title: "Permission Denied",
        description: "Only the session creator can remove participants.",
        variant: "destructive",
      })
      return
    }
    const result = await removeParticipant(session.code, participantId)
    if (result.error) {
      toast({ title: "Error", description: result.error, variant: "destructive" })
    } else {
      toast({ title: "Participant Removed" })
      router.refresh()
    }
  }

  const copyShareLink = () => {
    navigator.clipboard.writeText(window.location.href)
    toast({ title: "Link Copied!", description: "Share this link with your team." })
  }

  const votesSubmitted = useMemo(
    () => session.participants.filter((p) => p.vote !== null).length,
    [session.participants],
  )
  const allVotesIn = useMemo(
    () => votesSubmitted === session.participants.length && session.participants.length > 0,
    [votesSubmitted, session.participants.length],
  )
  const myVote = useMemo(
    () => session.participants.find((p) => p.id === participant?.id)?.vote ?? null,
    [session.participants, participant],
  )

  if (session.status === "closed") {
    return (
      <Card className="text-center">
        <CardHeader>
          <CardTitle>Session Closed</CardTitle>
          <CardDescription>
            {session.title} ({session.jiraKey})
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-4xl font-bold text-primary">{session.finalVote}</p>
          <p className="text-muted-foreground mt-2">The final estimate for this story has been set.</p>
          <Button onClick={() => router.push("/")} className="mt-6">
            Back to Home
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl">{session.title}</CardTitle>
                  <CardDescription>{session.jiraKey}</CardDescription>
                </div>
                <Button variant="ghost" onClick={copyShareLink}>
                  <Clipboard className="mr-2 h-4 w-4" /> Share Link
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {allVotesIn ? (
                <ResultsView session={session} onFinalize={handleFinalize} onRevote={handleRevote} />
              ) : (
                <VotingView myVote={myVote} onVote={handleVote} />
              )}
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-1">
          <ParticipantList
            participants={session.participants}
            creatorId={session.creatorId}
            currentParticipantId={participant?.id ?? null}
            onRemove={handleRemoveParticipant}
            votesSubmitted={votesSubmitted}
          />
        </div>
      </div>

      <Dialog open={showJoinDialog} onOpenChange={setShowJoinDialog}>
        <DialogContent onInteractOutside={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>Join Session</DialogTitle>
            <DialogDescription>
              Enter your name to participate in the estimation for "{session.title}".
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleJoin} className="space-y-4">
            <Input name="name" placeholder="Your Name" required />
            <Button type="submit" className="w-full" disabled={isJoining}>
              {isJoining ? "Joining..." : "Join"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}

function VotingView({ myVote, onVote }: { myVote: number | null; onVote: (value: number) => void }) {
  return (
    <div>
      <h3 className="text-center text-lg font-medium mb-6">Choose your estimate:</h3>
      <div className="flex flex-wrap justify-center gap-4">
        {ESTIMATION_VALUES.map((value) => (
          <Button
            key={value}
            variant={myVote === value ? "default" : "outline"}
            className="w-24 h-32 text-2xl font-bold"
            onClick={() => onVote(value)}
            disabled={myVote !== null}
          >
            {value}
          </Button>
        ))}
      </div>
      {myVote && <p className="text-center mt-6 text-muted-foreground">Your vote is cast. Waiting for others...</p>}
    </div>
  )
}

function ResultsView({
  session,
  onFinalize,
  onRevote,
}: { session: Session; onFinalize: (vote: number) => void; onRevote: () => void }) {
  const votes = session.participants.map((p) => p.vote).filter((v): v is number => v !== null)
  const voteCounts = votes.reduce(
    (acc, vote) => {
      acc[vote] = (acc[vote] || 0) + 1
      return acc
    },
    {} as Record<number, number>,
  )

  const sortedVotes = Object.entries(voteCounts).sort((a, b) => b[1] - a[1])
  const minVote = Math.min(...votes)
  const maxVote = Math.max(...votes)
  const majorityVote = sortedVotes.length > 0 && sortedVotes[0][1] > votes.length / 2 ? Number(sortedVotes[0][0]) : null

  return (
    <div className="text-center">
      <h3 className="text-lg font-medium mb-4">Votes are in!</h3>
      <div className="flex flex-wrap justify-center gap-4 mb-6">
        {session.participants.map((p) => (
          <div
            key={p.id}
            className={`p-4 rounded-lg border-2 ${p.vote === minVote ? "border-blue-500" : ""} ${p.vote === maxVote ? "border-red-500" : ""}`}
          >
            <p className="font-semibold">{p.name}</p>
            <p className="text-3xl font-bold">{p.vote}</p>
          </div>
        ))}
      </div>
      <div className="space-y-4">
        {votes.length > 2 && minVote !== maxVote && (
          <p className="text-muted-foreground">
            Min (<span className="text-blue-500 font-bold">{minVote}</span>) and Max (
            <span className="text-red-500 font-bold">{maxVote}</span>) should discuss.
          </p>
        )}
        {majorityVote && <p className="text-green-600 font-semibold">Majority vote is {majorityVote}.</p>}
        <div className="flex justify-center gap-4">
          <Button onClick={onRevote}>Revote</Button>
          <Button
            onClick={() => onFinalize(majorityVote || Math.round(votes.reduce((a, b) => a + b, 0) / votes.length))}
          >
            Finalize Vote
          </Button>
        </div>
      </div>
    </div>
  )
}

function ParticipantList({
  participants,
  creatorId,
  currentParticipantId,
  onRemove,
  votesSubmitted,
}: {
  participants: Participant[]
  creatorId: string
  currentParticipantId: string | null
  onRemove: (id: string) => void
  votesSubmitted: number
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Participants</span>
          <span className="text-sm font-normal bg-primary text-primary-foreground rounded-full px-2 py-0.5">
            {votesSubmitted}/{participants.length}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {participants.map((p) => (
            <li
              key={p.id}
              className={`flex items-center justify-between ${p.lastActive < Date.now() - 30000 ? "opacity-50" : ""}`}
            >
              <div className="flex items-center gap-2">
                {p.vote !== null ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <User className="h-5 w-5 text-muted-foreground" />
                )}
                <span className="font-medium">
                  {p.name} {p.id === currentParticipantId && "(You)"}
                </span>
                {p.id === creatorId && <Crown className="h-4 w-4 text-yellow-500" />}
              </div>
              {currentParticipantId === creatorId && p.id !== creatorId && (
                <Button variant="ghost" size="icon" onClick={() => onRemove(p.id)}>
                  <XCircle className="h-4 w-4 text-red-500" />
                </Button>
              )}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}

'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { PokerCard, PokerCardBack } from '@/components/poker-card';
import { ParticipantList } from '@/components/participant-list';
import { ClientOnly } from '@/components/client-only';
import { Session, Participant, FIBONACCI_SCALE, FibonacciValue } from '@/lib/types';
import { isParticipantActive } from '@/lib/utils';
import { ArrowLeft, Eye, RotateCcw, Check, Copy } from 'lucide-react';

interface SessionPageProps {
  params: Promise<{ code: string }>;
}

export default function SessionPage({ params }: SessionPageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [currentParticipant, setCurrentParticipant] = useState<Participant | null>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [selectedVote, setSelectedVote] = useState<FibonacciValue | null>(null);
  const [voting, setVoting] = useState(false);

  useEffect(() => {
    fetchSession();
    // Poll for updates every 2 seconds
    const interval = setInterval(fetchSession, 2000);
    return () => clearInterval(interval);
  }, [resolvedParams.code]);

  useEffect(() => {
    // Update participant activity every 10 seconds
    if (currentParticipant) {
      const interval = setInterval(() => {
        updateActivity();
      }, 10000);
      return () => clearInterval(interval);
    }
  }, [currentParticipant]);

  const fetchSession = async () => {
    try {
      const response = await fetch(`/api/sessions/${resolvedParams.code}`);
      if (response.ok) {
        const data = await response.json();
        setSession(data);
        
        // Check if current participant is still active
        if (currentParticipant) {
          const updatedParticipant = data.participants.find(
            (p: Participant) => p.id === currentParticipant.id
          );
          if (updatedParticipant) {
            setCurrentParticipant(updatedParticipant);
          }
        }
      } else if (response.status === 404) {
        setError('Session not found');
      }
    } catch (error) {
      console.error('Error fetching session:', error);
    } finally {
      setLoading(false);
    }
  };

  const joinSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Name is required');
      return;
    }

    setJoining(true);
    setError('');

    try {
      const response = await fetch(`/api/sessions/${resolvedParams.code}/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name.trim(),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setCurrentParticipant(data.participant);
        setSession(data.session);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to join session');
      }
    } catch (error) {
      console.error('Error joining session:', error);
      setError('Failed to join session');
    } finally {
      setJoining(false);
    }
  };

  const submitVote = async (value: FibonacciValue) => {
    if (!currentParticipant || voting) return;

    setVoting(true);
    setSelectedVote(value);

    try {
      const response = await fetch(`/api/sessions/${resolvedParams.code}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          participantId: currentParticipant.id,
          value,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setSession(data);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to submit vote');
        setSelectedVote(null);
      }
    } catch (error) {
      console.error('Error submitting vote:', error);
      setError('Failed to submit vote');
      setSelectedVote(null);
    } finally {
      setVoting(false);
    }
  };

  const performAction = async (action: string, data?: any) => {
    try {
      const response = await fetch(`/api/sessions/${resolvedParams.code}/actions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action,
          ...data,
        }),
      });

      if (response.ok) {
        const sessionData = await response.json();
        setSession(sessionData);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to perform action');
      }
    } catch (error) {
      console.error('Error performing action:', error);
      setError('Failed to perform action');
    }
  };

  const updateActivity = async () => {
    if (!currentParticipant) return;
    
    try {
      await fetch(`/api/sessions/${resolvedParams.code}/actions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'update_activity',
          participantId: currentParticipant.id,
        }),
      });
    } catch (error) {
      console.error('Error updating activity:', error);
    }
  };

  const copySessionCode = () => {
    if (typeof window !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(resolvedParams.code);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading session...</p>
        </div>
      </div>
    );
  }

  if (error && !session) {
    return (
      <div className="text-center py-16">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Session Not Found</h1>
        <p className="text-gray-600 mb-8">{error}</p>
        <Button onClick={() => router.push('/')} variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  if (!currentParticipant) {
    return (
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Join Session</CardTitle>
            <CardDescription>
              Enter your name to join the estimation session for <strong>{session.jiraKey}</strong>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <h3 className="font-semibold text-lg">{session.title}</h3>
              <div className="flex items-center space-x-2 mt-2">
                <span className="text-sm text-gray-600">Session Code:</span>
                <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">
                  {session.code}
                </code>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={copySessionCode}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <form onSubmit={joinSession} className="space-y-4">
              <div>
                <Label htmlFor="name">Your Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              {error && (
                <p className="text-red-600 text-sm">{error}</p>
              )}
              <div className="flex gap-2">
                <Button
                  type="submit"
                  disabled={joining}
                  className="flex-1"
                >
                  {joining ? 'Joining...' : 'Join Session'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/')}
                >
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Back
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  const activeParticipants = session.participants.filter(p => isParticipantActive(p.lastActivity));
  const currentUserVote = session.votes.find(v => v.participantId === currentParticipant.id);
  const hasVoted = !!currentUserVote;
  const allActiveVoted = activeParticipants.length > 0 && 
    activeParticipants.every(p => session.votes.some(v => v.participantId === p.id));

  // Calculate vote stats
  const voteStats = {
    votes: session.votes.map(vote => {
      const participant = session.participants.find(p => p.id === vote.participantId);
      return {
        participantName: participant?.name || 'Unknown',
        value: vote.value,
      };
    }),
    minVote: session.votes.length > 0 ? Math.min(...session.votes.map(v => v.value)) : null,
    maxVote: session.votes.length > 0 ? Math.max(...session.votes.map(v => v.value)) : null,
    uniqueVotes: [...new Set(session.votes.map(v => v.value))].sort((a, b) => a - b),
  };

  // Calculate auto-finalize estimate
  const autoFinalizeEstimate = (() => {
    if (voteStats.uniqueVotes.length === 1) {
      return voteStats.uniqueVotes[0];
    }
    if (voteStats.uniqueVotes.length === 2) {
      const voteCounts = voteStats.uniqueVotes.map(value => ({
        value,
        count: voteStats.votes.filter(v => v.value === value).length,
      }));
      voteCounts.sort((a, b) => b.count - a.count);
      if (voteCounts[0].count > voteCounts[1].count) {
        return voteCounts[0].value;
      }
    }
    return null;
  })();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={() => router.push('/')}
          className="flex items-center"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">Session Code:</span>
          <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">
            {session.code}
          </code>
          <Button
            variant="ghost"
            size="sm"
            onClick={copySessionCode}
          >
            <Copy className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Session Info */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl">{session.jiraKey}</CardTitle>
              <CardDescription className="text-lg mt-2">{session.title}</CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Badge
                variant={
                  session.status === 'finalized' ? 'success' :
                  session.status === 'revealed' ? 'warning' :
                  session.status === 'voting' ? 'info' : 'outline'
                }
              >
                {session.status}
              </Badge>
              {session.finalEstimate && (
                <Badge variant="success" className="text-lg px-3 py-1">
                  {session.finalEstimate} points
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ClientOnly fallback={<div className="text-sm text-gray-600">Loading...</div>}>
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                {session.votes.length} of {activeParticipants.length} votes submitted
              </div>
              {session.status === 'voting' && !allActiveVoted && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => performAction('reveal')}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  Reveal Votes
                </Button>
              )}
            </div>
          </ClientOnly>
        </CardContent>
      </Card>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-600">{error}</p>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Voting Area */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Cast Your Vote</CardTitle>
              <CardDescription>
                Select your estimate for this story
              </CardDescription>
            </CardHeader>
            <CardContent>
              {session.status === 'finalized' ? (
                <div className="text-center py-8">
                  <div className="text-6xl font-bold text-green-600 mb-4">
                    {session.finalEstimate}
                  </div>
                  <p className="text-lg text-gray-600">Final Estimate</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Voting Cards */}
                  <div className="flex flex-wrap gap-4 justify-center">
                    {FIBONACCI_SCALE.map((value) => (
                      <PokerCard
                        key={value}
                        value={value}
                        isSelected={selectedVote === value || currentUserVote?.value === value}
                        isClickable={session.status !== 'revealed' && session.status !== 'finalized'}
                        onClick={() => submitVote(value)}
                      />
                    ))}
                  </div>

                  {hasVoted && session.status !== 'revealed' && (
                    <div className="text-center text-sm text-gray-600">
                      You voted {currentUserVote?.value}. You can change your vote anytime.
                    </div>
                  )}

                  {/* Revealed Votes */}
                  {session.status === 'revealed' && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-center">Revealed Votes</h3>
                      
                      <div className="flex flex-wrap gap-4 justify-center">
                        {voteStats.votes.map((vote, index) => (
                          <PokerCard
                            key={index}
                            value={vote.value as FibonacciValue}
                            isRevealed={true}
                            isClickable={false}
                            participantName={vote.participantName}
                            className={
                              vote.value === voteStats.minVote ? 'ring-2 ring-blue-500' :
                              vote.value === voteStats.maxVote ? 'ring-2 ring-red-500' : ''
                            }
                          />
                        ))}
                      </div>

                      <div className="text-center text-sm text-gray-600">
                        Min: {voteStats.minVote} | Max: {voteStats.maxVote}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2 justify-center">
                        {autoFinalizeEstimate ? (
                          <Button
                            onClick={() => performAction('finalize', { estimate: autoFinalizeEstimate })}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <Check className="h-4 w-4 mr-1" />
                            Finalize ({autoFinalizeEstimate} points)
                          </Button>
                        ) : (
                          <>
                            {voteStats.uniqueVotes.map((value) => (
                              <Button
                                key={value}
                                variant="outline"
                                onClick={() => performAction('finalize', { estimate: value })}
                              >
                                Finalize {value}
                              </Button>
                            ))}
                          </>
                        )}
                        <Button
                          variant="outline"
                          onClick={() => performAction('reset')}
                        >
                          <RotateCcw className="h-4 w-4 mr-1" />
                          Revote
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Voting in Progress */}
                  {session.status === 'voting' && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-center">Voting in Progress</h3>
                      
                      <div className="flex flex-wrap gap-4 justify-center">
                        {session.votes.map((vote) => {
                          const participant = session.participants.find(p => p.id === vote.participantId);
                          return (
                            <PokerCardBack
                              key={vote.participantId}
                              participantName={participant?.name || 'Unknown'}
                            />
                          );
                        })}
                      </div>

                      {allActiveVoted && (
                        <div className="text-center">
                          <p className="text-sm text-gray-600 mb-2">All votes are in!</p>
                          <Button
                            onClick={() => performAction('reveal')}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Reveal Votes
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Participants */}
        <div>
          <Card>
            <CardContent className="pt-6">
              <ClientOnly fallback={<div className="text-center py-4">Loading participants...</div>}>
                <ParticipantList
                  participants={session.participants}
                  currentParticipantId={currentParticipant.id}
                  canRemove={true}
                  onRemoveParticipant={(participantId) => 
                    performAction('remove_participant', { participantId })
                  }
                />
              </ClientOnly>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 
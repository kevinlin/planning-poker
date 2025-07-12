'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ClientOnly } from '@/components/client-only';
import { SessionSummary } from '@/lib/types';
import { formatTimeAgo } from '@/lib/utils';
import { Plus, Copy, ExternalLink, Trash2 } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [jiraKey, setJiraKey] = useState('');
  const [title, setTitle] = useState('');
  const [error, setError] = useState('');
  const [deletingSession, setDeletingSession] = useState<string | null>(null);

  useEffect(() => {
    fetchSessions();
    // Poll for updates every 10 seconds
    const interval = setInterval(fetchSessions, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchSessions = async () => {
    try {
      const response = await fetch('/api/sessions');
      if (response.ok) {
        const data = await response.json();
        setSessions(data);
      }
    } catch (error) {
      console.error('Error fetching sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const createSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jiraKey.trim() || !title.trim()) {
      setError('Both JIRA key and title are required');
      return;
    }

    setCreating(true);
    setError('');

    try {
      const response = await fetch('/api/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jiraKey: jiraKey.trim(),
          title: title.trim(),
        }),
      });

      if (response.ok) {
        const session = await response.json();
        router.push(`/session/${session.code}`);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to create session');
      }
    } catch (error) {
      console.error('Error creating session:', error);
      setError('Failed to create session');
    } finally {
      setCreating(false);
    }
  };

  const copySessionCode = (code: string) => {
    if (typeof window !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(code);
      // You could add a toast notification here
    }
  };

  const deleteSession = async (code: string) => {
    setDeletingSession(code);
    
    try {
      const response = await fetch(`/api/sessions/${code}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Remove the session from the local state
        setSessions(sessions.filter(s => s.code !== code));
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to delete session');
      }
    } catch (error) {
      console.error('Error deleting session:', error);
      setError('Failed to delete session');
    } finally {
      setDeletingSession(null);
    }
  };

  const activeSessionsToEstimate = sessions.filter(s => s.status !== 'finalized');
  const estimatedSessions = sessions.filter(s => s.status === 'finalized');

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading sessions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-center">
        <Button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="bg-purple-600 hover:bg-purple-700"
          size="lg"
        >
          <Plus className="mr-2 h-5 w-5" />
          Create New Session
        </Button>
      </div>

      {showCreateForm && (
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Create New Session</CardTitle>
            <CardDescription>
              Enter the JIRA key and story title to create a new estimation session.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={createSession} className="space-y-4">
              <div>
                <Label htmlFor="jiraKey">JIRA Key</Label>
                <Input
                  id="jiraKey"
                  type="text"
                  placeholder="e.g., ABC-123"
                  value={jiraKey}
                  onChange={(e) => setJiraKey(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="title">Story Title</Label>
                <Input
                  id="title"
                  type="text"
                  placeholder="e.g., Implement user authentication"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>
              {error && (
                <p className="text-red-600 text-sm">{error}</p>
              )}
              <div className="flex gap-2">
                <Button
                  type="submit"
                  disabled={creating}
                  className="flex-1"
                >
                  {creating ? 'Creating...' : 'Create Session'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreateForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-8 md:grid-cols-2">
        {/* To be estimated */}
        <div>
          <h2 className="text-2xl font-semibold mb-4">To be estimated</h2>
          {activeSessionsToEstimate.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-gray-600">No active sessions</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Share the session code with your team to get started.
              </p>
              {activeSessionsToEstimate.map((session) => (
                <Card key={session.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{session.jiraKey}</CardTitle>
                        <CardDescription>{session.title}</CardDescription>
                      </div>
                      <Badge
                        variant={session.status === 'active' ? 'info' : 'warning'}
                      >
                        {session.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-600">Code:</span>
                          <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">
                            {session.code}
                          </code>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copySessionCode(session.code)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="text-sm text-gray-600">
                          {session.participantCount} participants
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500">
                          {formatTimeAgo(session.createdAt)}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(`/session/${session.code}`, '_blank')}
                        >
                          <ExternalLink className="h-4 w-4 mr-1" />
                          Join
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteSession(session.code)}
                          disabled={deletingSession === session.code}
                          className="text-red-500 hover:text-red-700 hover:border-red-300"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Already estimated */}
        <div>
          <h2 className="text-2xl font-semibold mb-4">Already estimated</h2>
          {estimatedSessions.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-gray-600">No completed sessions</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {estimatedSessions.map((session) => (
                <Card key={session.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{session.jiraKey}</CardTitle>
                        <CardDescription>{session.title}</CardDescription>
                      </div>
                      <Badge variant="success">
                        {session.finalEstimate} points
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-600">Code:</span>
                          <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">
                            {session.code}
                          </code>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copySessionCode(session.code)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="text-sm text-gray-600">
                          {session.participantCount} participants
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500">
                          {formatTimeAgo(session.createdAt)}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(`/session/${session.code}`, '_blank')}
                        >
                          <ExternalLink className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteSession(session.code)}
                          disabled={deletingSession === session.code}
                          className="text-red-500 hover:text-red-700 hover:border-red-300"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 
import { NextRequest, NextResponse } from 'next/server';
import { SessionManager } from '@/lib/sessions';
import { CreateSessionRequest } from '@/lib/types';

export async function GET() {
  try {
    const sessions = SessionManager.getAllSessions();
    return NextResponse.json(sessions);
  } catch (error) {
    console.error('Error fetching sessions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sessions' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateSessionRequest = await request.json();
    
    if (!body.jiraKey || !body.title) {
      return NextResponse.json(
        { error: 'JIRA key and title are required' },
        { status: 400 }
      );
    }
    
    const session = SessionManager.createSession(body.jiraKey, body.title);
    
    return NextResponse.json(session, { status: 201 });
  } catch (error) {
    console.error('Error creating session:', error);
    return NextResponse.json(
      { error: 'Failed to create session' },
      { status: 500 }
    );
  }
} 
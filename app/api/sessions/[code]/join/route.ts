import { NextRequest, NextResponse } from 'next/server';
import { SessionManager } from '@/lib/sessions';
import { JoinSessionRequest } from '@/lib/types';

export async function POST(
  request: NextRequest,
  { params }: { params: { code: string } }
) {
  try {
    const body: JoinSessionRequest = await request.json();
    
    if (!body.name || body.name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }
    
    const result = SessionManager.joinSession(params.code, body.name.trim());
    
    if (!result) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof Error && error.message === 'Name already taken') {
      return NextResponse.json(
        { error: 'Name already taken' },
        { status: 409 }
      );
    }
    
    console.error('Error joining session:', error);
    return NextResponse.json(
      { error: 'Failed to join session' },
      { status: 500 }
    );
  }
} 
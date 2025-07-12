import { NextRequest, NextResponse } from 'next/server';
import { SessionManager } from '@/lib/sessions';
import { VoteRequest, FIBONACCI_SCALE } from '@/lib/types';

export async function POST(
  request: NextRequest,
  { params }: { params: { code: string } }
) {
  try {
    const body: VoteRequest = await request.json();
    
    if (!body.participantId || body.value === undefined) {
      return NextResponse.json(
        { error: 'Participant ID and vote value are required' },
        { status: 400 }
      );
    }
    
    if (!FIBONACCI_SCALE.includes(body.value as any)) {
      return NextResponse.json(
        { error: 'Invalid vote value' },
        { status: 400 }
      );
    }
    
    const session = SessionManager.submitVote(params.code, body.participantId, body.value);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(session);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Participant not found or inactive') {
        return NextResponse.json(
          { error: 'Participant not found or inactive' },
          { status: 403 }
        );
      }
      if (error.message === 'Invalid vote value') {
        return NextResponse.json(
          { error: 'Invalid vote value' },
          { status: 400 }
        );
      }
    }
    
    console.error('Error submitting vote:', error);
    return NextResponse.json(
      { error: 'Failed to submit vote' },
      { status: 500 }
    );
  }
} 
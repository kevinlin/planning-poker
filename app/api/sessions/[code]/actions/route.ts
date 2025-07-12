import { NextRequest, NextResponse } from 'next/server';
import { SessionManager } from '@/lib/sessions';
import { FIBONACCI_SCALE } from '@/lib/types';

export async function POST(
  request: NextRequest,
  { params }: { params: { code: string } }
) {
  try {
    const body = await request.json();
    const { action, participantId, estimate } = body;
    
    let session;
    
    switch (action) {
      case 'reveal':
        session = SessionManager.revealVotes(params.code);
        break;
        
      case 'finalize':
        if (!estimate || !FIBONACCI_SCALE.includes(estimate)) {
          return NextResponse.json(
            { error: 'Valid estimate is required' },
            { status: 400 }
          );
        }
        session = SessionManager.finalizeEstimate(params.code, estimate);
        break;
        
      case 'reset':
        session = SessionManager.resetVoting(params.code);
        break;
        
      case 'remove_participant':
        if (!participantId) {
          return NextResponse.json(
            { error: 'Participant ID is required' },
            { status: 400 }
          );
        }
        session = SessionManager.removeParticipant(params.code, participantId);
        break;
        
      case 'update_activity':
        if (!participantId) {
          return NextResponse.json(
            { error: 'Participant ID is required' },
            { status: 400 }
          );
        }
        session = SessionManager.updateParticipantActivity(params.code, participantId);
        break;
        
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
    
    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(session);
  } catch (error) {
    console.error('Error performing session action:', error);
    return NextResponse.json(
      { error: 'Failed to perform action' },
      { status: 500 }
    );
  }
} 
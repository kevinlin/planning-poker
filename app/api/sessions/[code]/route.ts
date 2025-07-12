import { NextRequest, NextResponse } from 'next/server';
import { SessionManager } from '@/lib/sessions';

export async function GET(
  request: NextRequest,
  { params }: { params: { code: string } }
) {
  try {
    const session = SessionManager.getSession(params.code);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(session);
  } catch (error) {
    console.error('Error fetching session:', error);
    return NextResponse.json(
      { error: 'Failed to fetch session' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { code: string } }
) {
  try {
    const session = SessionManager.getSession(params.code);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }
    
    // Delete the session
    SessionManager.deleteSession(params.code);
    
    return NextResponse.json(
      { message: 'Session deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting session:', error);
    return NextResponse.json(
      { error: 'Failed to delete session' },
      { status: 500 }
    );
  }
} 
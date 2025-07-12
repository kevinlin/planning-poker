import { NextResponse } from 'next/server';
import { persistentStorage } from '@/lib/storage';

export async function GET() {
  try {
    const sessionCount = persistentStorage.getSessionCount();
    
    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      sessionCount,
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0'
    });
  } catch (error) {
    console.error('Health check failed:', error);
    return NextResponse.json(
      { 
        status: 'unhealthy', 
        error: 'Storage system unavailable',
        timestamp: new Date().toISOString()
      },
      { status: 503 }
    );
  }
} 
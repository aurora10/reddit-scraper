import { NextResponse } from 'next/server'
import { serverDb } from '@/lib/db-server'

export async function DELETE(
  request: Request
) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json(
        { error: 'Subreddit ID is required' },
        { status: 400 }
      )
    }

    const success = await serverDb.deleteSubreddit(id)
    
    if (!success) {
      return NextResponse.json(
        { error: 'Failed to delete subreddit' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    const err = error as Error & { 
      code?: string; 
      details?: string;
      hint?: string;
      stack?: string;
    };
    
    console.error('API route error deleting subreddit:', JSON.stringify({
      error,
      message: err.message,
      code: err.code,
      details: err.details,
      hint: err.hint,
      stack: err.stack
    }, null, 2));
    
    return NextResponse.json(
      { 
        error: 'Failed to delete subreddit',
        details: err.details,
        code: err.code
      },
      { status: 500 }
    )
  }
}

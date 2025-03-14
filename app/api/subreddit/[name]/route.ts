import { NextResponse } from 'next/server'
import { serverDb } from '@/lib/db-server'

export async function DELETE(
  request: Request,
  { params }: { params: { name: string } }
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
  } catch (error: any) {
    console.error('API route error deleting subreddit:', JSON.stringify({
      error,
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint,
      stack: error.stack
    }, null, 2));
    return NextResponse.json(
      { 
        error: 'Failed to delete subreddit',
        details: error.details,
        code: error.code
      },
      { status: 500 }
    )
  }
}

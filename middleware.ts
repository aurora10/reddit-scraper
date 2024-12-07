import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  try {
    // Refresh session if expired
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error) {
      console.error('Session error in middleware:', error)
    }
    
    if (session) {
      console.log('Session found in middleware:', {
        userId: session.user.id,
        email: session.user.email,
        hasAccessToken: !!session.access_token,
        hasRefreshToken: !!session.refresh_token
      })
    } else {
      console.log('No session found in middleware')
    }
  } catch (error) {
    console.error('Middleware error:', error)
  }

  return res
}

// Ensure the middleware is only run for relevant paths
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - auth folder (auth callbacks)
     */
    '/((?!_next/static|_next/image|favicon.ico|public|auth).*)',
  ],
}

import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get('code')

    if (code) {
      const cookieStore = cookies()
      const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
      
      console.log('Exchanging code for session...')
      const { data: { session }, error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (error) {
        console.error('Error exchanging code for session:', error)
        throw error
      }

      if (!session) {
        console.error('No session returned from code exchange')
        throw new Error('No session returned from code exchange')
      }

      console.log('Successfully authenticated:', {
        userId: session.user.id,
        email: session.user.email,
        hasAccessToken: !!session.access_token,
        hasRefreshToken: !!session.refresh_token
      })

      // Check if user exists in our users table
      const { data: existingUser, error: selectError } = await supabase
        .from('users')
        .select('id')
        .eq('id', session.user.id)
        .single()

      if (!existingUser) {
        const { error: insertError } = await supabase
          .from('users')
          .insert({
            id: session.user.id,
            email: session.user.email
          })

        if (insertError) {
          console.error('Error creating user:', insertError)
          throw insertError
        }
        console.log('Created new user record for:', session.user.email)
      }

      // Redirect back to the previous page or home
      return NextResponse.redirect(new URL('/', requestUrl.origin))
    }

    // If no code, redirect to home page
    return NextResponse.redirect(new URL('/', requestUrl.origin))
  } catch (error) {
    console.error('Auth callback error:', error)
    // Redirect to home page on error
    return NextResponse.redirect(new URL('/', request.url))
  }
}

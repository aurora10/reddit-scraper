import { createClient } from '@supabase/supabase-js'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { createSession } from '@/lib/auth'

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

      // Create and persist the session
      const createdSession = await createSession(
        session.access_token,
        session.refresh_token
      )

      if (!createdSession) {
        console.error('Failed to create session')
        throw new Error('Failed to create session')
      }

      // Ensure we have a valid session before proceeding
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        console.error('Failed to get authenticated user:', userError)
        throw new Error('Failed to get authenticated user')
      }

      console.log('Successfully authenticated:', {
        userId: user.id,
        email: user.email,
        hasAccessToken: !!session.access_token,
        hasRefreshToken: !!session.refresh_token
      })

      // Check if user exists in our users table
      console.log('Checking for existing user:', user.id)
      const { data: existingUser, error: selectError } = await supabase
        .from('users')
        .select('id')
        .eq('id', user.id)

      // Handle case where no rows are returned (new user)
      if (selectError && selectError.code !== 'PGRST116') {
        console.error('Error checking for existing user:', selectError)
        throw selectError
      }

      if (!existingUser || existingUser.length === 0) {
        console.log('Creating new user record for:', session.user.email)
        // Use the service role key for user creation to bypass RLS
        console.log('Creating service role client with URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
        console.log('Using service role key:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '***' : 'MISSING')

        if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
          throw new Error('SUPABASE_SERVICE_ROLE_KEY is required but missing')
        }

        const serviceRoleSupabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!
        )

        console.log('Inserting new user:', {
          id: user.id,
          email: user.email
        })

        const { data: newUser, error: insertError } = await serviceRoleSupabase
          .from('users')
          .insert({
            id: user.id,
            email: user.email
          })
          .select()
          .single()

        if (insertError) {
          console.error('Error creating user:', {
            message: insertError.message,
            code: insertError.code,
            details: insertError.details
          })
          throw insertError
        }
        
        if (!newUser) {
          console.error('No user returned after insert')
          throw new Error('No user returned after insert')
        }
        
        console.log('Successfully created user:', newUser)
      } else {
        console.log('User already exists:', existingUser)
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

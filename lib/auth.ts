import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

export async function getSession() {
  try {
    const cookieStore = cookies()
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    
    // Create a temporary client to get the session
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false
      }
    })
    
    // Try to get the session from cookies
    const authCookie = cookieStore.get('sb-auth-token')?.value
    
    if (authCookie) {
      // If we have a cookie, set it on the client
      supabase.auth.setSession({
        access_token: authCookie,
        refresh_token: ''
      })
    }
    
    const { data } = await supabase.auth.getSession()
    return data.session
  } catch (error) {
    console.error('Error getting session:', error)
    return null
  }
} 
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Create a reusable client instance
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: true,
    detectSessionInUrl: false
  }
})

export async function getSession() {
  try {
    const cookieStore = cookies()
    const authCookie = cookieStore.get('sb-auth-token')?.value
    const refreshCookie = cookieStore.get('sb-refresh-token')?.value

    if (authCookie && refreshCookie) {
      // Set the session with both tokens
      await supabase.auth.setSession({
        access_token: authCookie,
        refresh_token: refreshCookie
      })
      
      // Refresh the session if needed
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error) {
        console.error('Session refresh error:', error)
        return null
      }
      
      return session
    }
    
    // If no cookies, try to get the session directly
    const { data: { session } } = await supabase.auth.getSession()
    return session
  } catch (error) {
    console.error('Error getting session:', error)
    return null
  }
}

export async function getCurrentUser() {
  const session = await getSession()
  if (!session) return null
  
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error) {
    console.error('Error getting user:', error)
    return null
  }
  
  return user
}

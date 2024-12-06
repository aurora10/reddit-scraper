import { supabase } from './supabase'
import type { Database } from './supabase'

export type Subreddit = Database['public']['Tables']['subreddits']['Row']
export type Post = Database['public']['Tables']['posts']['Row']
export type PostAnalysis = Database['public']['Tables']['post_analyses']['Row']

// User operations
export async function createUserIfNotExists() {
  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError) {
      console.error('Session error:', JSON.stringify(sessionError, null, 2))
      throw new Error(`Authentication error: ${sessionError.message}`)
    }

    if (!session) {
      throw new Error('No active session')
    }

    const { user } = session
    if (!user) {
      throw new Error('No authenticated user')
    }

    console.log('Current user:', JSON.stringify(user, null, 2))

    // First try to create the user
    const { error: insertError } = await supabase.auth.updateUser({
      data: {
        full_name: user.user_metadata?.full_name || null,
        avatar_url: user.user_metadata?.avatar_url || null
      }
    })

    if (insertError) {
      console.error('Error updating user:', JSON.stringify(insertError, null, 2))
      throw new Error(`Error updating user: ${insertError.message}`)
    }

    // Get the user data
    const { data: userData, error: selectError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .limit(1)
      .maybeSingle()

    if (selectError) {
      console.error('Error fetching user:', JSON.stringify(selectError, null, 2))
      throw new Error(`Error fetching user: ${selectError.message}`)
    }

    if (!userData) {
      throw new Error('User not found after creation')
    }

    console.log('User data:', userData)
    return user
  } catch (error) {
    console.error('Error in createUserIfNotExists:', error instanceof Error ? error.message : JSON.stringify(error, null, 2))
    throw error
  }
}

// Subreddit operations
export async function getSubreddit(name: string) {
  const { data, error } = await supabase
    .from('subreddits')
    .select()
    .eq('name', name)
    .single()

  if (error) throw error
  return data
}

export async function createSubreddit(name: string, displayName: string) {
  try {
    // Ensure user exists in database
    const user = await createUserIfNotExists()

    console.log('Creating subreddit:', {
      name,
      display_name: displayName,
      user_id: user.id
    })

    // Create subreddit with user_id
    const { data, error } = await supabase
      .from('subreddits')
      .insert({
        name: name.toLowerCase(), // Ensure lowercase for consistency
        display_name: displayName,
        user_id: user.id
      })
      .select()
      .single()

    if (error) {
      console.error('Supabase error details:', JSON.stringify({
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      }, null, 2))
      throw new Error(`Database error: ${error.message}`)
    }
    
    if (!data) {
      throw new Error('No data returned from supabase')
    }

    console.log('Subreddit created successfully:', data)
    return data
  } catch (error) {
    console.error('Error in createSubreddit:', error instanceof Error ? error.message : JSON.stringify(error, null, 2))
    throw error
  }
}

export async function updateSubredditLastFetched(id: string) {
  const { error } = await supabase
    .from('subreddits')
    .update({ last_fetched_at: new Date().toISOString() })
    .eq('id', id)

  if (error) throw error
}

// Post operations
export async function createPost(post: Database['public']['Tables']['posts']['Insert']) {
  const { data, error } = await supabase
    .from('posts')
    .insert(post)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getPostsBySubreddit(subredditId: string) {
  const { data, error } = await supabase
    .from('posts')
    .select(`
      *,
      post_analyses (*)
    `)
    .eq('subreddit_id', subredditId)
    .order('created_utc', { ascending: false })

  if (error) throw error
  return data
}

// Post analysis operations
export async function createPostAnalysis(analysis: Database['public']['Tables']['post_analyses']['Insert']) {
  const { data, error } = await supabase
    .from('post_analyses')
    .insert(analysis)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getPostAnalysis(postId: string) {
  const { data, error } = await supabase
    .from('post_analyses')
    .select()
    .eq('post_id', postId)
    .single()

  if (error) throw error
  return data
}

// Utility function to check if data needs refresh (older than 24 hours)
export function needsRefresh(lastFetchedAt: string | null): boolean {
  if (!lastFetchedAt) return true
  
  const lastFetched = new Date(lastFetchedAt).getTime()
  const now = new Date().getTime()
  const hoursSinceLastFetch = (now - lastFetched) / (1000 * 60 * 60)
  
  return hoursSinceLastFetch > 24
}

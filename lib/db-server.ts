import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import type { Database } from './supabase'

export type Subreddit = Database['public']['Tables']['subreddits']['Row']
export type Post = Database['public']['Tables']['posts']['Row']
export type PostAnalysis = Database['public']['Tables']['post_analyses']['Row']

// Get the server-side Supabase client
function getSupabase() {
  const cookieStore = cookies()
  return createServerComponentClient({ cookies: () => cookieStore })
}

// User operations
export async function getCurrentUser() {
  const supabase = getSupabase()
  const { data: { session }, error: sessionError } = await supabase.auth.getSession()
  
  if (sessionError) {
    console.error('Session error:', sessionError)
    throw new Error(`Authentication error: ${sessionError.message}`)
  }

  if (!session?.user) {
    throw new Error('No authenticated user')
  }

  return session.user
}

// Authentication wrapper
async function withAuth<T>(operation: (supabase: ReturnType<typeof getSupabase>) => Promise<T>): Promise<T> {
  const supabase = getSupabase()
  await getCurrentUser() // This will throw if user is not authenticated
  return operation(supabase)
}

// Server-side database operations
export const serverDb = {
  getSubreddit: async (name: string) => {
    return withAuth(async (supabase) => {
      try {
        const { data, error } = await supabase
          .from('subreddits')
          .select()
          .eq('name', name.toLowerCase())
          .single()

        if (error) {
          if (error.code === 'PGRST116') { // Record not found
            return null;
          }
          throw error;
        }
        return data;
      } catch (error) {
        console.error('Error getting subreddit:', error)
        throw error;
      }
    })
  },

  createSubreddit: async (name: string, displayName: string) => {
    return withAuth(async (supabase) => {
      try {
        const user = await getCurrentUser();
        
        const { data, error } = await supabase
          .from('subreddits')
          .insert({
            name: name.toLowerCase(),
            display_name: displayName,
            user_id: user.id
          })
          .select()
          .single()

        if (error) throw error;
        if (!data) throw new Error('No data returned from supabase');

        return data;
      } catch (error) {
        console.error('Error creating subreddit:', error)
        throw error;
      }
    })
  },

  updateSubredditLastFetched: async (id: string) => {
    return withAuth(async (supabase) => {
      try {
        const { error } = await supabase
          .from('subreddits')
          .update({ last_fetched_at: new Date().toISOString() })
          .eq('id', id)

        if (error) throw error;
      } catch (error) {
        console.error('Error updating last_fetched_at:', error);
        throw error;
      }
    })
  },

  createPost: async (post: Database['public']['Tables']['posts']['Insert']) => {
    return withAuth(async (supabase) => {
      try {
        const { data, error } = await supabase
          .from('posts')
          .insert(post)
          .select()
          .single()

        if (error) throw error;
        return data;
      } catch (error) {
        console.error('Error creating post:', error);
        throw error;
      }
    })
  },

  getPostsBySubreddit: async (subredditId: string) => {
    return withAuth(async (supabase) => {
      try {
        const { data, error } = await supabase
          .from('posts')
          .select(`
            *,
            post_analyses (*)
          `)
          .eq('subreddit_id', subredditId)
          .order('created_utc', { ascending: false })

        if (error) throw error;
        return data || [];
      } catch (error) {
        console.error('Error getting posts:', error);
        throw error;
      }
    })
  },

  createPostAnalysis: async (analysis: Database['public']['Tables']['post_analyses']['Insert']) => {
    return withAuth(async (supabase) => {
      try {
        const { data, error } = await supabase
          .from('post_analyses')
          .insert(analysis)
          .select()
          .single()

        if (error) throw error;
        return data;
      } catch (error) {
        console.error('Error creating post analysis:', error);
        throw error;
      }
    })
  },

  getPostAnalysis: async (postId: string) => {
    return withAuth(async (supabase) => {
      try {
        const { data, error } = await supabase
          .from('post_analyses')
          .select()
          .eq('post_id', postId)
          .single()

        if (error) throw error;
        return data;
      } catch (error) {
        console.error('Error getting post analysis:', error);
        throw error;
      }
    })
  }
}

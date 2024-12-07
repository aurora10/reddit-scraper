import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import type { Database } from './types'

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
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error) {
    console.error('Auth error:', error)
    throw new Error(`Authentication error: ${error.message}`)
  }

  if (!user) {
    throw new Error('No authenticated user')
  }

  return user
}

// Authentication wrapper
async function withAuth<T>(operation: (supabase: ReturnType<typeof getSupabase>, userId: string) => Promise<T>): Promise<T> {
  const supabase = getSupabase()
  const user = await getCurrentUser() // This will throw if user is not authenticated
  return operation(supabase, user.id)
}

// Server-side database operations
export const serverDb = {
  getSubreddit: async (name: string) => {
    return withAuth(async (supabase, userId) => {
      try {
        const { data, error } = await supabase
          .from('subreddits')
          .select()
          .eq('name', name.toLowerCase())
          .eq('user_id', userId)
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
    return withAuth(async (supabase, userId) => {
      try {
        const { data, error } = await supabase
          .from('subreddits')
          .insert({
            name: name.toLowerCase(),
            display_name: displayName,
            user_id: userId
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
    return withAuth(async (supabase, userId) => {
      try {
        const { error } = await supabase
          .from('subreddits')
          .update({ last_fetched_at: new Date().toISOString() })
          .eq('id', id)
          .eq('user_id', userId)

        if (error) throw error;
      } catch (error) {
        console.error('Error updating last_fetched_at:', error);
        throw error;
      }
    })
  },

  createPost: async (post: Database['public']['Tables']['posts']['Insert']) => {
    return withAuth(async (supabase, userId) => {
      try {
        // First try to find existing post by reddit_id
        const { data: existingPost, error: findError } = await supabase
          .from('posts')
          .select('id')
          .eq('reddit_id', post.reddit_id)
          .eq('user_id', userId)
          .single();

        if (findError && findError.code !== 'PGRST116') {
          throw findError;
        }

        if (existingPost) {
          // Update existing post
          const { data, error } = await supabase
            .from('posts')
            .update({
              ...post,
              user_id: userId,
              updated_at: new Date().toISOString()
            })
            .eq('id', existingPost.id)
            .select()
            .single();

          if (error) throw error;
          return data;
        } else {
          // Create new post
          const { data, error } = await supabase
            .from('posts')
            .insert({
              ...post,
              user_id: userId,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .select()
            .single();

          if (error) throw error;
          return data;
        }
      } catch (error) {
        console.error('Error creating/updating post:', error);
        throw error;
      }
    })
  },

  getPostsBySubreddit: async (subredditId: string) => {
    return withAuth(async (supabase, userId) => {
      try {
        const { data, error } = await supabase
          .from('posts')
          .select(`
            *,
            post_analyses (*)
          `)
          .eq('subreddit_id', subredditId)
          .eq('user_id', userId)
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
    return withAuth(async (supabase, userId) => {
      try {
        // First try to find existing analysis
        const { data: existingAnalysis, error: findError } = await supabase
          .from('post_analyses')
          .select('id')
          .eq('post_id', analysis.post_id)
          .eq('user_id', userId)
          .single();

        if (findError && findError.code !== 'PGRST116') {
          throw findError;
        }

        if (existingAnalysis) {
          // Update existing analysis
          const { data, error } = await supabase
            .from('post_analyses')
            .update({
              ...analysis,
              user_id: userId,
              updated_at: new Date().toISOString()
            })
            .eq('id', existingAnalysis.id)
            .select()
            .single();

          if (error) throw error;
          return data;
        } else {
          // Create new analysis
          const { data, error } = await supabase
            .from('post_analyses')
            .insert({
              ...analysis,
              user_id: userId,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .select()
            .single();

          if (error) throw error;
          return data;
        }
      } catch (error) {
        console.error('Error creating/updating post analysis:', error);
        throw error;
      }
    })
  },

  getPostAnalysis: async (postId: string) => {
    return withAuth(async (supabase, userId) => {
      try {
        const { data, error } = await supabase
          .from('post_analyses')
          .select()
          .eq('post_id', postId)
          .eq('user_id', userId)
          .single()

        if (error) {
          if (error.code === 'PGRST116') { // Record not found
            return null;
          }
          throw error;
        }
        return data;
      } catch (error) {
        console.error('Error getting post analysis:', error);
        throw error;
      }
    })
  }
}

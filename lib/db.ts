import type { Database } from './supabase'
import { supabase } from './supabase-client'

// Re-export the supabase client for convenience
export { supabase }

// Database types
export type Subreddit = Database['public']['Tables']['subreddits']['Row']
export type Post = Database['public']['Tables']['posts']['Row']
export type PostAnalysis = Database['public']['Tables']['post_analyses']['Row']

// Client-side database operations
export const db = {
  getSubreddit: async (name: string) => {
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
  },

  createSubreddit: async (name: string, displayName: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No authenticated user')
      
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
  },

  updateSubredditLastFetched: async (id: string) => {
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
  },

  createPost: async (post: Database['public']['Tables']['posts']['Insert']) => {
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
  },

  getPostsBySubreddit: async (subredditId: string) => {
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
  },

  createPostAnalysis: async (analysis: Database['public']['Tables']['post_analyses']['Insert']) => {
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
  },

  getPostAnalysis: async (postId: string) => {
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
  }
}

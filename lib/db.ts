import { supabase } from './supabase-client'
import type { Database } from './types'

export type Subreddit = Database['public']['Tables']['subreddits']['Row']
export type Post = Database['public']['Tables']['posts']['Row']
export type PostAnalysis = Database['public']['Tables']['post_analyses']['Row']

// Client-side database operations
export async function createSubreddit(name: string, displayName: string): Promise<Subreddit> {
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError) throw userError;
  if (!user) throw new Error('No authenticated user');

  const { data, error } = await supabase
    .from('subreddits')
    .insert({
      name: name.toLowerCase(),
      display_name: displayName,
      user_id: user.id
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating subreddit:', error);
    throw error;
  }
  if (!data) throw new Error('No data returned from supabase');

  return data;
}

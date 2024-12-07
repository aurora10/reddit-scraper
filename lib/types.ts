import type { PostCategory } from './openai'

// Supabase Database Types
export type Database = {
  public: {
    Tables: {
      subreddits: {
        Row: {
          id: string
          name: string
          display_name: string
          user_id: string
          last_fetched_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          display_name: string
          user_id: string
          last_fetched_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          display_name?: string
          user_id?: string
          last_fetched_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      posts: {
        Row: {
          id: string
          subreddit_id: string
          reddit_id: string
          user_id: string
          title: string
          author: string
          content: string | null
          created_utc: number
          score: number
          num_comments: number
          url: string
          permalink: string
          fetched_at: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          subreddit_id: string
          reddit_id: string
          user_id: string
          title: string
          author: string
          content?: string | null
          created_utc: number
          score: number
          num_comments: number
          url: string
          permalink: string
          fetched_at?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          subreddit_id?: string
          reddit_id?: string
          user_id?: string
          title?: string
          author?: string
          content?: string | null
          created_utc?: number
          score?: number
          num_comments?: number
          url?: string
          permalink?: string
          fetched_at?: string
          created_at?: string
          updated_at?: string
        }
      }
      post_analyses: {
        Row: {
          id: string
          post_id: string
          user_id: string
          is_solution_request: boolean
          is_pain_or_anger: boolean
          is_advice_request: boolean
          is_money_talk: boolean
          analyzed_at: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          post_id: string
          user_id: string
          is_solution_request: boolean
          is_pain_or_anger: boolean
          is_advice_request: boolean
          is_money_talk: boolean
          analyzed_at?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          post_id?: string
          user_id?: string
          is_solution_request?: boolean
          is_pain_or_anger?: boolean
          is_advice_request?: boolean
          is_money_talk?: boolean
          analyzed_at?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}

export type Post = Database['public']['Tables']['posts']['Row']
export type PostAnalysis = Database['public']['Tables']['post_analyses']['Row']
export type Subreddit = Database['public']['Tables']['subreddits']['Row']

export interface RedditPost {
  id: string
  title: string
  author: string
  content: string
  created_utc: number
  score: number
  num_comments: number
  url: string
  permalink: string
}

// Helper function to convert database analysis to PostCategory format
export function convertDbAnalysisToPostCategory(dbAnalysis: PostAnalysis): PostCategory {
  return {
    isSolutionRequest: dbAnalysis.is_solution_request,
    isPainOrAnger: dbAnalysis.is_pain_or_anger,
    isAdviceRequest: dbAnalysis.is_advice_request,
    isMoneyTalk: dbAnalysis.is_money_talk
  };
}

export interface PostWithAnalysis extends RedditPost {
  analysis: PostCategory | null;
}

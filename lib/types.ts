// Remove unused import
// import type { PostCategory } from './openai'

// Supabase Database Types
export interface Database {
  public: {
    Tables: {
      subreddits: {
        Row: {
          id: string
          name: string
          display_name: string
          user_id: string
          created_at: string
          last_fetched_at: string | null
        }
        Insert: {
          id?: string
          name: string
          display_name: string
          user_id: string
          created_at?: string
          last_fetched_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          display_name?: string
          user_id?: string
          created_at?: string
          last_fetched_at?: string | null
        }
      }
      subreddit_analytics: {
        Row: SubredditAnalytics
        Insert: Omit<SubredditAnalytics, 'id'>
        Update: Partial<SubredditAnalytics>
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

export interface AnalysisResults {
  topKeywords: Array<{ word: string; count: number }>;
  sentimentScore: {
    average: number;
    distribution: {
      positive: number;
      neutral: number;
      negative: number;
    };
  };
  postFrequency?: {
    byHour: number[];
    mostActiveHour: number;
  };
  analyzedAt?: string;
  thematicAnalysis?: {
    categoryCounts: Record<string, number>;
    categorizedPosts: Array<{
      id: string;
      title: string;
      url: string;
      score: number;
      created_utc: number;
      num_comments: number;
      author: string;
      selftext?: string;
      permalink: string;
      categories: string[];
    }>;
  };
}

export interface SubredditAnalytics {
  id: string
  name: string
  display_name: string
  analysis_results: AnalysisResults
  post_count: number
  last_updated: string
  created_at: string
  user_id: string
}

export type DatabasePost = Database['public']['Tables']['posts']['Row']
export type DatabasePostAnalysis = Database['public']['Tables']['post_analyses']['Row']
export type Subreddit = Database['public']['Tables']['subreddits']['Row']

export interface PostAnalysisCategories {
  isSolutionRequest: boolean
  isPainOrAnger: boolean
  isAdviceRequest: boolean
  isMoneyTalk: boolean
}

// Add RedditPost type
export interface RedditPost {
  id: string
  title: string
  author: string
  selftext: string
  url: string
  created_utc: number
  score: number
  num_comments: number
  subreddit: string
  permalink: string
}

// Add PostWithAnalysis type
export interface PostWithAnalysis extends RedditPost {
  analysis: PostAnalysisCategories | null
}

export interface Post {
  id: string
  reddit_id: string
  title: string
  content: string | null
  url: string
  author: string
  created_at: string
  subreddit: string
  user_id: string
  analysis?: PostAnalysisCategories | null
  analyzed_at?: string | null
}

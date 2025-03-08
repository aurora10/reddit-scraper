import { createClient } from '@supabase/supabase-js'
import { SubredditAnalytics, RedditPost } from './types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseKey)

// Phase 1: Fetch existing data from database
export async function fetchSubredditFromDatabase(subredditName: string): Promise<SubredditAnalytics | null> {
  const { data, error } = await supabase
    .from('subreddit_analytics')
    .select('*')
    .eq('name', subredditName.toLowerCase())
    .single()
  
  if (error) {
    // If the error is "no rows returned", return null instead of throwing
    if (error.code === 'PGRST116') {
      return null
    }
    throw error
  }
  
  return data
}

// Fetch posts for a subreddit from Reddit API
export async function fetchRedditPosts(subredditName: string): Promise<RedditPost[]> {
  const response = await fetch(`https://www.reddit.com/r/${subredditName}/hot.json?limit=25`)
  
  if (!response.ok) {
    throw new Error(`Failed to fetch from Reddit API: ${response.statusText}`)
  }
  
  const data = await response.json()
  return data.data.children.map((child: any) => child.data)
}

// Phase 2: Analyze and store new data
export async function analyzeAndStoreSubredditData(subredditName: string): Promise<SubredditAnalytics> {
  // Get the current user
  const { data: userData, error: userError } = await supabase.auth.getUser()
  
  // Call the API to analyze the subreddit
  const response = await fetch(`/api/analyze-subreddit?name=${encodeURIComponent(subredditName)}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })
  
  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.message || 'Failed to analyze subreddit')
  }
  
  const analysisData = await response.json()
  
  // Store the results in the database if user is authenticated
  if (userData?.user) {
    const { data, error } = await supabase
      .from('subreddit_analytics')
      .upsert({
        name: subredditName.toLowerCase(),
        display_name: analysisData.display_name || subredditName,
        analysis_results: analysisData.analysis_results,
        post_count: analysisData.post_count || 0,
        last_updated: new Date().toISOString(),
        user_id: userData.user.id
      })
      .select()
      .single()
    
    if (error) {
      console.error('Database error:', error)
      // Continue with the analysis data even if storage fails
    } else {
      return data
    }
  }
  
  // If not authenticated or storage failed, return the analysis data directly
  return {
    id: 'temp-id',
    name: subredditName.toLowerCase(),
    display_name: analysisData.display_name || subredditName,
    analysis_results: analysisData.analysis_results,
    post_count: analysisData.post_count || 0,
    last_updated: new Date().toISOString(),
    created_at: new Date().toISOString(),
    user_id: userData?.user?.id || 'anonymous'
  }
}

// Helper function for analysis
function performAnalysis(posts: RedditPost[]) {
  // Extract top keywords from titles and content
  const keywords = extractKeywords(posts)
  
  // Calculate average sentiment score
  const sentimentScore = calculateSentiment(posts)
  
  // Analyze posting frequency
  const postFrequency = analyzePostFrequency(posts)
  
  return {
    topKeywords: keywords,
    sentimentScore,
    postFrequency,
    analyzedAt: new Date().toISOString()
  }
}

function extractKeywords(posts: RedditPost[]) {
  // Simple keyword extraction - in a real app, use NLP libraries
  const allText = posts.map(post => `${post.title} ${post.selftext || ''}`).join(' ')
  const words = allText.toLowerCase().split(/\W+/).filter(word => word.length > 3)
  
  // Count word frequencies
  const wordCounts: Record<string, number> = {}
  words.forEach(word => {
    wordCounts[word] = (wordCounts[word] || 0) + 1
  })
  
  // Sort by frequency and take top 20
  return Object.entries(wordCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([word, count]) => ({ word, count }))
}

function calculateSentiment(posts: RedditPost[]) {
  // Placeholder for sentiment analysis
  // In a real app, use a sentiment analysis library or API
  return {
    average: 0.2, // Example value between -1 (negative) and 1 (positive)
    distribution: {
      positive: 45,
      neutral: 30,
      negative: 25
    }
  }
}

function analyzePostFrequency(posts: RedditPost[]) {
  // Group posts by hour of day
  const hourCounts = Array(24).fill(0)
  
  posts.forEach(post => {
    const postDate = new Date(post.created_utc * 1000)
    const hour = postDate.getHours()
    hourCounts[hour]++
  })
  
  return {
    byHour: hourCounts,
    mostActiveHour: hourCounts.indexOf(Math.max(...hourCounts))
  }
} 
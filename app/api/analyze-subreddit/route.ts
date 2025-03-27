import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Database } from '@/lib/types'

// Define the categories as per the PRD
const CATEGORIES = {
  SOLUTION_REQUESTS: 'Solution Requests',
  PAIN_ANGER: 'Pain & Anger',
  ADVICE_REQUESTS: 'Advice Requests',
  MONEY_TALK: 'Money Talk'
}

// Define interfaces for Reddit post data
interface RedditPost {
  id: string;
  title: string;
  selftext?: string;
  score: number;
  created_utc: number;
  num_comments: number;
  author: string;
  url: string;
  permalink: string;
}

interface CategorizedPost extends RedditPost {
  categories: string[];
}

export async function GET(request: NextRequest) {
  // Get subreddit name from query params
  const searchParams = request.nextUrl.searchParams
  const subredditName = searchParams.get('name')
  
  if (!subredditName) {
    return NextResponse.json({ message: 'Subreddit name is required' }, { status: 400 })
  }
  
  try {
    // Check authentication - but don't require it for demo purposes
    const session = await getSession()
    const userId = session?.user?.id || 'anonymous-user'
    
    // Fetch data from Reddit API
    const response = await fetch(`https://www.reddit.com/r/${subredditName}/hot.json?limit=100`)
    
    if (!response.ok) {
      return NextResponse.json({ message: 'Failed to fetch subreddit data' }, { status: response.status })
    }
    
    const data = await response.json()
    const posts = data.data.children.map((child: { data: RedditPost }) => child.data)
    
    // Extract text content from posts
    const textContent = posts.map((post: RedditPost) => {
      return `${post.title} ${post.selftext || ''}`
    }).join(' ')
    
    // Simple keyword extraction (in a real app, use NLP libraries)
    const words = textContent.toLowerCase().split(/\W+/).filter((word: string) => 
      word.length > 3 && !['this', 'that', 'with', 'from', 'have', 'what'].includes(word)
    )
    
    const wordCounts: Record<string, number> = {}
    words.forEach((word: string) => {
      wordCounts[word] = (wordCounts[word] || 0) + 1
    })
    
    const topKeywords = Object.entries(wordCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([word, count]) => ({ word, count }))
    
    // Enhanced sentiment analysis
    const positiveWords = [
      'good', 'great', 'awesome', 'excellent', 'love', 'best', 'amazing', 'wonderful',
      'fantastic', 'terrific', 'outstanding', 'superb', 'brilliant', 'fabulous',
      'helpful', 'impressive', 'perfect', 'happy', 'excited', 'enjoy', 'pleased',
      'grateful', 'thankful', 'appreciate', 'positive', 'beautiful', 'recommend'
    ]

    const negativeWords = [
      'bad', 'worst', 'terrible', 'hate', 'awful', 'horrible', 'poor', 'disappointing',
      'frustrating', 'annoying', 'useless', 'waste', 'difficult', 'problem', 'issue',
      'broken', 'fail', 'failure', 'sucks', 'suck', 'disappointed', 'disappointing',
      'stupid', 'ridiculous', 'terrible', 'crap', 'garbage', 'junk', 'mess', 'disaster'
    ]

    // Get all text from posts for sentiment analysis
    const allText = posts.map((post: RedditPost) => `${post.title} ${post.selftext || ''}`).join(' ').toLowerCase()

    // Split into sentences for better context
    const sentences = allText.split(/[.!?]+/).filter((sentence: string) => sentence.trim().length > 0)

    let positiveCount = 0
    let negativeCount = 0
    let neutralCount = 0

    sentences.forEach((sentence: string) => {
      const words = sentence.toLowerCase().split(/\W+/).filter((word: string) => word.length > 2)
      
      // Check for negations that might flip sentiment
      const hasNegation = words.some((word: string) => ['not', 'no', "don't", 'never', 'neither', 'nor', 'without'].includes(word))
      
      let sentencePositive = 0
      let sentenceNegative = 0
      
      words.forEach((word: string) => {
        if (positiveWords.includes(word)) sentencePositive++
        else if (negativeWords.includes(word)) sentenceNegative++
      })
      
      // Determine sentence sentiment
      if (sentencePositive > sentenceNegative) {
        // If there's a negation, flip positive to negative
        if (hasNegation) negativeCount++
        else positiveCount++
      } else if (sentenceNegative > sentencePositive) {
        // If there's a negation, flip negative to positive
        if (hasNegation) positiveCount++
        else negativeCount++
      } else {
        // If equal or no sentiment words, count as neutral
        neutralCount++
      }
    })

    // Add individual word counts for more granularity
    words.forEach((word: string) => {
      if (positiveWords.includes(word)) positiveCount += 0.5
      else if (negativeWords.includes(word)) negativeCount += 0.5
    })

    const total = positiveCount + negativeCount + neutralCount || 1 // Avoid division by zero
    const sentimentScore = {
      average: (positiveCount - negativeCount) / (positiveCount + negativeCount || 1),
      distribution: {
        positive: Math.round((positiveCount / total) * 100),
        negative: Math.round((negativeCount / total) * 100),
        neutral: Math.round((neutralCount / total) * 100)
      }
    }
    
    // Thematic analysis - categorize posts
    const categorizedPosts = posts.map((post: RedditPost) => {
      const text = `${post.title} ${post.selftext || ''}`.toLowerCase()
      
      // Simple rule-based categorization (in a real app, use AI/ML)
      const categories = {
        [CATEGORIES.SOLUTION_REQUESTS]: containsAny(text, ['how to', 'solution', 'solve', 'fix', 'help me']),
        [CATEGORIES.PAIN_ANGER]: containsAny(text, ['angry', 'frustrated', 'annoyed', 'hate', 'terrible', 'worst']),
        [CATEGORIES.ADVICE_REQUESTS]: containsAny(text, ['advice', 'suggest', 'recommendation', 'what should', 'opinions']),
        [CATEGORIES.MONEY_TALK]: containsAny(text, ['money', 'cost', 'price', 'expensive', 'cheap', 'afford', 'dollar', 'payment'])
      }
      
      return {
        id: post.id,
        title: post.title,
        url: post.permalink ? `https://reddit.com${post.permalink}` : post.url,
        score: post.score,
        created_utc: post.created_utc,
        num_comments: post.num_comments,
        author: post.author,
        selftext: post.selftext || '',
        permalink: post.permalink,
        categories: Object.entries(categories)
          .filter(([, matches]) => matches)
          .map(([category]) => category)
      }
    }) as CategorizedPost[]
    
    // Count posts in each category
    const categoryCounts = {
      [CATEGORIES.SOLUTION_REQUESTS]: categorizedPosts.filter((post: CategorizedPost) => 
        post.categories.includes(CATEGORIES.SOLUTION_REQUESTS)).length,
      [CATEGORIES.PAIN_ANGER]: categorizedPosts.filter((post: CategorizedPost) => 
        post.categories.includes(CATEGORIES.PAIN_ANGER)).length,
      [CATEGORIES.ADVICE_REQUESTS]: categorizedPosts.filter((post: CategorizedPost) => 
        post.categories.includes(CATEGORIES.ADVICE_REQUESTS)).length,
      [CATEGORIES.MONEY_TALK]: categorizedPosts.filter((post: CategorizedPost) => 
        post.categories.includes(CATEGORIES.MONEY_TALK)).length
    }

    // Get or create subreddit record
    let subredditId: string | undefined;
    
    // Only perform database operations if we have a valid user
    if (userId && userId !== 'anonymous-user') {
      try {
        // First, enable service role to bypass RLS policies
        const supabaseAdmin = createRouteHandlerClient<Database>({ 
          cookies
        }, {
          supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
          options: {
            global: {
              headers: {
                'x-supabase-auth-token': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`
              }
            }
          }
        });

        // Check if subreddit exists
        const { data: existingSubreddit } = await supabaseAdmin
          .from('subreddits')
          .select('id')
          .eq('name', subredditName.toLowerCase())
          .maybeSingle();

        if (existingSubreddit?.id) {
          subredditId = existingSubreddit.id;
        } else {
          // Create subreddit
          const { data: newSubreddit, error: subredditError } = await supabaseAdmin
            .from('subreddits')
            .insert({
              name: subredditName.toLowerCase(),
              display_name: subredditName,
              user_id: userId,
              last_fetched_at: new Date().toISOString()
            })
            .select('id')
            .single();

          if (subredditError) {
            console.error('Error creating subreddit:', subredditError);
          } else {
            subredditId = newSubreddit.id;
          }
        }

        // Save subreddit analytics
        if (subredditId) {
          const { error: analyticsError } = await supabaseAdmin
            .from('subreddit_analytics')
            .insert({
              name: subredditName.toLowerCase(),
              display_name: subredditName,
              analysis_results: {
                topKeywords,
                sentimentScore,
                categoryCounts
              },
              post_count: posts.length,
              user_id: userId
            })
            .select()
            .single();

          if (analyticsError) {
            console.error('Error saving subreddit analytics:', analyticsError);
          }

          // Process and save individual posts
          for (const post of categorizedPosts) {
            try {
              // Check if post exists
              const { data: existingPost } = await supabaseAdmin
                .from('posts')
                .select('id, post_analyses (*)')
                .eq('reddit_id', post.id)
                .maybeSingle();

              // Skip if post already has analysis
              if (existingPost?.post_analyses && existingPost.post_analyses.length > 0) {
                console.log(`Post ${post.id} already analyzed, skipping`);
                continue;
              }

              // Insert or update post
              const { data: dbPost, error: postError } = await supabaseAdmin
                .from('posts')
                .upsert({
                  subreddit_id: subredditId,
                  user_id: userId,
                  reddit_id: post.id,
                  title: post.title,
                  author: post.author,
                  content: post.selftext || '',
                  created_utc: post.created_utc,
                  score: post.score || 0,
                  num_comments: post.num_comments || 0,
                  url: post.url,
                  permalink: post.permalink,
                  fetched_at: new Date().toISOString()
                }, {
                  onConflict: 'reddit_id',
                  ignoreDuplicates: false
                })
                .select()
                .single();

              if (postError) {
                console.error('Error saving post:', postError);
                continue;
              }

              // Save post analysis
              const categories = post.categories || [];
              const { error: analysisError } = await supabaseAdmin
                .from('post_analyses')
                .insert({
                  post_id: dbPost.id,
                  user_id: userId,
                  is_solution_request: categories.includes(CATEGORIES.SOLUTION_REQUESTS),
                  is_pain_or_anger: categories.includes(CATEGORIES.PAIN_ANGER),
                  is_advice_request: categories.includes(CATEGORIES.ADVICE_REQUESTS),
                  is_money_talk: categories.includes(CATEGORIES.MONEY_TALK),
                  analyzed_at: new Date().toISOString()
                });

              if (analysisError) {
                console.error('Error saving post analysis:', analysisError);
              }
            } catch (error) {
              console.error('Error processing post:', error);
            }

            // Add a small delay between posts to avoid rate limits
            await new Promise(resolve => setTimeout(resolve, 200));
          }
        }
      } catch (error) {
        console.error('Database operation error:', error);
      }
    }
    
    // Return analysis results
    return NextResponse.json({
      display_name: subredditName,
      post_count: posts.length,
      analysis_results: {
        topKeywords,
        sentimentScore,
        thematicAnalysis: {
          categoryCounts,
          categorizedPosts
        }
      }
    })
    
  } catch (error) {
    console.error('Error analyzing subreddit:', error)
    return NextResponse.json({ message: 'Failed to analyze subreddit' }, { status: 500 })
  }
}

// Helper function to check if text contains any of the keywords
function containsAny(text: string, keywords: string[]): boolean {
  return keywords.some(keyword => text.includes(keyword))
} 
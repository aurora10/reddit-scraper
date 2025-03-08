import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'

// Define the categories as per the PRD
const CATEGORIES = {
  SOLUTION_REQUESTS: 'Solution Requests',
  PAIN_ANGER: 'Pain & Anger',
  ADVICE_REQUESTS: 'Advice Requests',
  MONEY_TALK: 'Money Talk'
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
    const posts = data.data.children.map((child: any) => child.data)
    
    // Extract text content from posts
    const textContent = posts.map((post: any) => {
      return `${post.title} ${post.selftext || ''}`
    }).join(' ')
    
    // Simple keyword extraction (in a real app, use NLP libraries)
    const words = textContent.toLowerCase().split(/\W+/).filter(word => 
      word.length > 3 && !['this', 'that', 'with', 'from', 'have', 'what'].includes(word)
    )
    
    const wordCounts: Record<string, number> = {}
    words.forEach(word => {
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
    const allText = posts.map(post => `${post.title} ${post.selftext || ''}`).join(' ').toLowerCase()

    // Split into sentences for better context
    const sentences = allText.split(/[.!?]+/).filter(sentence => sentence.trim().length > 0)

    let positiveCount = 0
    let negativeCount = 0
    let neutralCount = 0

    sentences.forEach(sentence => {
      const words = sentence.toLowerCase().split(/\W+/).filter(word => word.length > 2)
      
      // Check for negations that might flip sentiment
      const hasNegation = words.some(word => ['not', 'no', "don't", 'never', 'neither', 'nor', 'without'].includes(word))
      
      let sentencePositive = 0
      let sentenceNegative = 0
      
      words.forEach(word => {
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
    words.forEach(word => {
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
    const categorizedPosts = posts.map(post => {
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
        categories: Object.entries(categories)
          .filter(([_, matches]) => matches)
          .map(([category]) => category)
      }
    })
    
    // Count posts in each category
    const categoryCounts = {
      [CATEGORIES.SOLUTION_REQUESTS]: categorizedPosts.filter(post => 
        post.categories.includes(CATEGORIES.SOLUTION_REQUESTS)).length,
      [CATEGORIES.PAIN_ANGER]: categorizedPosts.filter(post => 
        post.categories.includes(CATEGORIES.PAIN_ANGER)).length,
      [CATEGORIES.ADVICE_REQUESTS]: categorizedPosts.filter(post => 
        post.categories.includes(CATEGORIES.ADVICE_REQUESTS)).length,
      [CATEGORIES.MONEY_TALK]: categorizedPosts.filter(post => 
        post.categories.includes(CATEGORIES.MONEY_TALK)).length
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
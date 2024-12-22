import snoowrap from 'snoowrap'
import { RedditPost } from '@/lib/types'

// Initialize the Reddit client
const initRedditClient = () => {
  console.log('Initializing Reddit client...')
  
  const client = new snoowrap({
    userAgent: 'MyApp/1.0.0',
    clientId: process.env.REDDIT_CLIENT_ID,
    clientSecret: process.env.REDDIT_CLIENT_SECRET,
    username: process.env.REDDIT_USERNAME,
    password: process.env.REDDIT_PASSWORD
  })

  console.log('Reddit client initialized successfully')
  return client
}

// Export the function to fetch subreddit posts
export async function fetchSubredditPosts(subredditName: string): Promise<RedditPost[]> {
  const reddit = initRedditClient()
  
  try {
    return new Promise<RedditPost[]>((resolve, reject) => {
      reddit.getSubreddit(subredditName)
        .getNew({ limit: 10 })
        .then(posts => {
          const redditPosts = posts.map(post => ({
            id: String(post.id || ''),
            title: String(post.title || ''),
            author: typeof post.author === 'string' ? post.author : String(post.author.name),
            content: String(post.selftext || ''),
            created_utc: Number(post.created_utc),
            score: Number(post.score || 0),
            num_comments: Number(post.num_comments || 0),
            url: String(post.url || ''),
            permalink: String(post.permalink || `/r/${subredditName}/comments/${post.id}`),
          }))
          resolve(redditPosts)
        })
        .catch(reject)
    })
  } catch (error) {
    console.error('Error fetching Reddit posts:', error)
    throw error
  }
}

import { RedditPost } from './types'

// Define interface for Reddit API response
interface RedditApiResponse {
  data: {
    children: Array<{
      data: {
        id: string;
        title: string;
        author: string;
        selftext?: string;
        created_utc: number;
        score: number;
        num_comments: number;
        url: string;
        permalink: string;
      }
    }>
  }
}

// Export the function to fetch subreddit posts
export async function fetchSubredditPosts(subredditName: string): Promise<RedditPost[]> {
  return new Promise((resolve, reject) => {
    fetch(`https://www.reddit.com/r/${subredditName}/hot.json?limit=25`)
      .then(response => {
        if (!response.ok) {
          throw new Error(`Failed to fetch from Reddit API: ${response.statusText}`)
        }
        return response.json()
      })
      .then((data: RedditApiResponse) => {
        const redditPosts = data.data.children.map(child => ({
          id: child.data.id,
          title: child.data.title,
          author: child.data.author,
          selftext: child.data.selftext || '',
          content: child.data.selftext || '',
          created_utc: child.data.created_utc,
          score: child.data.score || 0,
          num_comments: child.data.num_comments || 0,
          subreddit: subredditName,
          url: child.data.url,
          permalink: String(child.data.permalink || `/r/${subredditName}/comments/${child.data.id}`),
        }))
        resolve(redditPosts)
      })
      .catch(reject)
  })
}

import Snoowrap from 'snoowrap';
import { PostCategory } from './openai';

let reddit: Snoowrap | null = null;

// Initialize the Reddit client only on the server side
if (typeof window === 'undefined') {
  const clientId = process.env.REDDIT_CLIENT_ID;
  const clientSecret = process.env.REDDIT_CLIENT_SECRET;
  const username = process.env.REDDIT_USERNAME;
  const password = process.env.REDDIT_PASSWORD;

  if (!clientId || !clientSecret || !username || !password) {
    console.warn('Missing Reddit API credentials. Please check your .env.local file.');
  } else {
    reddit = new Snoowrap({
      userAgent: 'reddit-analytics-platform:v1.0.0',
      clientId,
      clientSecret,
      username,
      password
    });
  }
}

export interface RedditPost {
  id: string;
  title: string;
  author: string;
  content: string;
  created_utc: number;
  score: number;
  num_comments: number;
  url: string;
  permalink: string;
  analysis?: PostCategory;
}

export async function getTopPosts(subredditName: string): Promise<RedditPost[]> {
  if (!reddit) {
    throw new Error('Reddit client not initialized. Please check your environment variables.');
  }

  const twentyFourHoursAgo = Math.floor(Date.now() / 1000) - 24 * 60 * 60;
  
  try {
    const subreddit = await reddit.getSubreddit(subredditName);
    const listing = await subreddit.getTop({ time: 'day' });
    const rawPosts = await listing.fetchAll();
    
    const posts: RedditPost[] = [];
    
    for (const post of rawPosts) {
      if (
        post.created_utc >= twentyFourHoursAgo &&
        post.author &&
        typeof post.author === 'object' &&
        'name' in post.author
      ) {
        posts.push({
          id: post.id,
          title: post.title,
          author: post.author.name,
          content: post.selftext || '',
          created_utc: post.created_utc,
          score: post.score,
          num_comments: post.num_comments,
          url: post.url,
          permalink: `https://reddit.com${post.permalink}`
        });
      }
    }

    return posts;
  } catch (error) {
    console.error('Error fetching Reddit posts:', error);
    throw new Error(`Failed to fetch posts from r/${subredditName}. Please check your Reddit API credentials.`);
  }
}

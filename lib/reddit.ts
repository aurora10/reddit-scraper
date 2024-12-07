import Snoowrap from 'snoowrap';
import { PostCategory } from './openai';
import type { Submission } from 'snoowrap';

let reddit: Snoowrap | null = null;

// Initialize the Reddit client only on the server side
if (typeof window === 'undefined') {
  const clientId = process.env.REDDIT_CLIENT_ID;
  const clientSecret = process.env.REDDIT_CLIENT_SECRET;
  const username = process.env.REDDIT_USERNAME;
  const password = process.env.REDDIT_PASSWORD;

  console.log('Reddit credentials check:', {
    hasClientId: !!clientId,
    hasClientSecret: !!clientSecret,
    hasUsername: !!username,
    hasPassword: !!password,
    clientId: clientId?.substring(0, 4) + '...',  // Log first 4 chars for debugging
    username: username
  });

  if (!clientId || !clientSecret || !username || !password) {
    console.error('Missing Reddit API credentials:', {
      clientId: !clientId ? 'missing' : 'present',
      clientSecret: !clientSecret ? 'missing' : 'present',
      username: !username ? 'missing' : 'present',
      password: !password ? 'missing' : 'present'
    });
    throw new Error('Missing Reddit API credentials. Please check your .env.local file.');
  } else {
    try {
      console.log('Initializing Reddit client...');
      reddit = new Snoowrap({
        userAgent: 'reddit-analytics-platform:v1.0.0',
        clientId,
        clientSecret,
        username,
        password
      });
      console.log('Reddit client initialized successfully');
    } catch (error) {
      console.error('Error initializing Reddit client:', error);
      throw new Error(`Failed to initialize Reddit client: ${error}`);
    }
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
  console.log(`Starting to fetch posts for r/${subredditName}`);
  
  if (!reddit) {
    console.error('Reddit client is not initialized. Current environment:', {
      nodeEnv: process.env.NODE_ENV,
      hasClientId: !!process.env.REDDIT_CLIENT_ID,
      hasClientSecret: !!process.env.REDDIT_CLIENT_SECRET,
      hasUsername: !!process.env.REDDIT_USERNAME,
      hasPassword: !!process.env.REDDIT_PASSWORD
    });
    throw new Error('Reddit client is not initialized. Check your environment variables.');
  }

  const twentyFourHoursAgo = Math.floor(Date.now() / 1000) - 24 * 60 * 60;

  try {
    console.log(`Getting subreddit instance for r/${subredditName}`);
    const subreddit = await reddit.getSubreddit(subredditName);
    
    console.log('Fetching top posts');
    const listing = await subreddit.getTop({ time: 'day' });
    
    console.log('Fetching all posts');
    const rawPosts: Submission[] = await listing.fetchAll();
    console.log(`Fetched ${rawPosts.length} raw posts`);

    const processedPosts: RedditPost[] = [];

    for (const post of rawPosts) {
      try {
        if (
          post.created_utc >= twentyFourHoursAgo &&
          post.author &&
          typeof post.author === 'object' &&
          'name' in post.author
        ) {
          processedPosts.push({
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
      } catch (postError) {
        console.error('Error processing individual post:', postError);
        // Continue processing other posts
      }
    }

    console.log(`Successfully processed ${processedPosts.length} posts`);
    return processedPosts;
  } catch (error) {
    console.error('Error fetching Reddit posts:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.stack);
      throw new Error(`Failed to fetch posts from r/${subredditName}: ${error.message}`);
    } else {
      throw new Error(`Failed to fetch posts from r/${subredditName}: An unknown error occurred.`);
    }
  }
}

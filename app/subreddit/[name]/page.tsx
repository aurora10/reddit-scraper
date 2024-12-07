import { SubredditTabs } from "@/components/SubredditTabs";
import { PostsTable } from "@/components/PostsTable";
import { ThemeAnalysis } from "@/components/ThemeAnalysis";
import { getTopPosts } from "@/lib/reddit";
import { analyzePostsConcurrently } from "@/lib/openai";
import { Suspense } from "react";
import { serverDb } from "@/lib/db-server";
import { cookies } from 'next/headers';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import type { PostWithAnalysis, RedditPost } from "@/lib/types";

interface SubredditPageProps {
  params: {
    name: string;
  };
}

async function fetchRedditPosts(subredditName: string): Promise<RedditPost[]> {
  try {
    console.log('Fetching posts from Reddit for:', subredditName);
    const posts = await getTopPosts(subredditName);
    console.log(`Fetched ${posts.length} posts from Reddit`);
    return posts;
  } catch (error) {
    console.error('Error fetching from Reddit:', error);
    throw error;
  }
}

async function getOrCreateSubreddit(name: string, createIfNotExists = false) {
  try {
    console.log('Attempting to get subreddit from database:', name);
    let subreddit = await serverDb.getSubreddit(name);
    
    if (!subreddit && createIfNotExists) {
      console.log('Creating subreddit in database');
      subreddit = await serverDb.createSubreddit(name, name);
      console.log('Created subreddit:', subreddit);
    }
    
    return subreddit;
  } catch (error) {
    console.error('Error in getOrCreateSubreddit:', error);
    return null;
  }
}

async function analyzeAndStorePosts(redditPosts: RedditPost[], subredditId: string): Promise<PostWithAnalysis[]> {
  try {
    // Analyze posts
    console.log('Starting post analysis');
    const analyses = await analyzePostsConcurrently(
      redditPosts.map(post => ({ title: post.title, content: post.content }))
    );
    console.log('Completed post analysis');

    return redditPosts.map((post, index) => ({
      ...post,
      analysis: analyses[index]
    }));
  } catch (error) {
    console.error('Error in analyzeAndStorePosts:', error);
    throw error;
  }
}

async function getAnalyzedPosts(subredditName: string, isAuthenticated: boolean): Promise<PostWithAnalysis[]> {
  try {
    console.log('Starting getAnalyzedPosts for:', subredditName, { isAuthenticated });
    
    // First try to get posts from Reddit
    const redditPosts = await fetchRedditPosts(subredditName);
    
    if (redditPosts.length === 0) {
      return [];
    }

    if (!isAuthenticated) {
      console.log('User not authenticated, returning Reddit posts without analysis');
      return redditPosts.map(post => ({
        ...post,
        analysis: null
      }));
    }

    // Try to get or create subreddit in database
    const subreddit = await getOrCreateSubreddit(subredditName, true);
    if (!subreddit) {
      console.log('Could not get/create subreddit, returning Reddit posts without analysis');
      return redditPosts.map(post => ({
        ...post,
        analysis: null
      }));
    }

    try {
      console.log('Analyzing posts with authentication');
      const analyzedPosts = await analyzeAndStorePosts(redditPosts, subreddit.id);
      
      if (analyzedPosts.length > 0) {
        // Only update last_fetched if we successfully analyzed posts
        console.log('Updating last fetched timestamp');
        await serverDb.updateSubredditLastFetched(subreddit.id);
        return analyzedPosts;
      }
    } catch (error) {
      console.error('Error processing posts:', error);
    }

    // If analysis fails, return posts without analysis
    console.log('Analysis failed, returning Reddit posts without analysis');
    return redditPosts.map(post => ({
      ...post,
      analysis: null
    }));
  } catch (error) {
    console.error('Error in getAnalyzedPosts:', error);
    throw error;
  }
}

async function PostsList({ subredditName, isAuthenticated }: { subredditName: string; isAuthenticated: boolean }) {
  try {
    console.log('Starting PostsList for:', subredditName, { isAuthenticated });
    const posts = await getAnalyzedPosts(subredditName, isAuthenticated);

    if (posts.length === 0) {
      return (
        <div className="text-center py-8">
          <p>No posts found in the last 24 hours</p>
        </div>
      );
    }

    return <PostsTable posts={posts} />;
  } catch (error) {
    console.error('Error in PostsList:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return (
      <div className="text-center py-8 text-red-500">
        <p>Error loading posts. Please try again later.</p>
        {process.env.NODE_ENV === 'development' && (
          <p className="mt-2 text-sm">{errorMessage}</p>
        )}
      </div>
    );
  }
}

async function ThemesList({ subredditName, isAuthenticated }: { subredditName: string; isAuthenticated: boolean }) {
  console.log('Starting ThemesList for:', subredditName, { isAuthenticated });

  if (!isAuthenticated) {
    console.log('Not authenticated in ThemesList');
    return (
      <div className="text-center py-8">
        <p>Please sign in to view theme analysis</p>
      </div>
    );
  }

  try {
    console.log('Authenticated in ThemesList, getting posts');
    const posts = await getAnalyzedPosts(subredditName, isAuthenticated);

    if (posts.length === 0) {
      return (
        <div className="text-center py-8">
          <p>No posts found in the last 24 hours</p>
        </div>
      );
    }

    if (!posts[0].analysis) {
      console.log('No analysis available for posts');
      return (
        <div className="text-center py-8">
          <p>Error analyzing posts. Please try again later.</p>
        </div>
      );
    }

    return <ThemeAnalysis posts={posts} />;
  } catch (error) {
    console.error('Error in ThemesList:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return (
      <div className="text-center py-8 text-red-500">
        <p>Error analyzing posts. Please try again later.</p>
        {process.env.NODE_ENV === 'development' && (
          <p className="mt-2 text-sm">{errorMessage}</p>
        )}
      </div>
    );
  }
}

export default async function SubredditPage({ params }: SubredditPageProps) {
  const cookieStore = cookies();
  const supabase = createServerComponentClient({ cookies: () => cookieStore });
  
  console.log('Checking session in SubredditPage');
  const { data: { session }, error } = await supabase.auth.getSession();
  
  if (error) {
    console.error('Error getting session:', error);
  }

  const isAuthenticated = !!session;
  console.log('Session state:', { 
    isAuthenticated, 
    userId: session?.user?.id,
    hasAccessToken: !!session?.access_token,
    hasRefreshToken: !!session?.refresh_token,
    email: session?.user?.email
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold mb-6 text-center">r/{params.name}</h1>

      <SubredditTabs
        postsContent={
          <Suspense fallback={
            <div className="text-center py-8">
              <p>Loading and analyzing posts...</p>
            </div>
          }>
            <PostsList subredditName={params.name} isAuthenticated={isAuthenticated} />
          </Suspense>
        }
        themesContent={
          <Suspense fallback={
            <div className="text-center py-8">
              <p>Analyzing themes...</p>
            </div>
          }>
            <ThemesList subredditName={params.name} isAuthenticated={isAuthenticated} />
          </Suspense>
        }
      />
    </div>
  );
}

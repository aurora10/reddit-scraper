import { SubredditTabs } from "@/components/SubredditTabs";
import { PostsTable } from "@/components/PostsTable";
import { ThemeAnalysis } from "@/components/ThemeAnalysis";
import { fetchSubredditPosts } from "@/lib/reddit";
import { analyzePostsConcurrently } from "@/lib/openai";
import { Suspense } from "react";
import { serverDb } from "@/lib/db-server";
import { cookies } from 'next/headers';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import type { PostWithAnalysis, RedditPost } from "@/lib/types";
import { Database } from "@/lib/types";

interface SubredditPageProps {
  params: {
    name: string;
  };
}

// ... keep all the helper functions (fetchRedditPosts, getOrCreateSubreddit, etc.)

async function fetchRedditPosts(subredditName: string): Promise<RedditPost[]> {
  try {
    console.log('Fetching posts from Reddit for:', subredditName);
    const posts = await fetchSubredditPosts(subredditName);
    console.log(`Fetched ${posts.length} posts from Reddit`);
    return posts;
  } catch (error) {
    console.error('Error fetching from Reddit:', error);
    throw error;
  }
}

/* eslint-disable @typescript-eslint/no-unused-vars */
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

async function analyzeAndStorePosts(redditPosts: RedditPost[], subredditId: string, userId: string): Promise<PostWithAnalysis[]> {
  try {
    console.log('Starting analyzeAndStorePosts with', redditPosts.length, 'posts');
    const postsToAnalyze: { post: RedditPost; dbId: string }[] = [];
    const existingAnalyses = new Map();
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    // First, create or update posts in the database and check for existing analyses
    for (const post of redditPosts) {
      try {
        const dbPost = await serverDb.createPost({
          subreddit_id: subredditId,
          user_id: userId,
          reddit_id: post.id,
          title: post.title,
          author: post.author,
          content: post.content || '',
          created_utc: post.created_utc,
          score: post.score || 0,
          num_comments: post.num_comments || 0,
          url: post.url,
          permalink: post.permalink,
          fetched_at: new Date().toISOString()
        });

        console.log('Created post in DB:', dbPost.id);

        const existingAnalysis = await serverDb.getPostAnalysis(dbPost.id);
        
        if (!existingAnalysis || new Date(existingAnalysis.analyzed_at) < new Date(twentyFourHoursAgo)) {
          postsToAnalyze.push({ post, dbId: dbPost.id });
        } else {
          // Convert existing analysis to the correct format
          existingAnalyses.set(post.id, {
            isSolutionRequest: existingAnalysis.is_solution_request,
            isPainOrAnger: existingAnalysis.is_pain_or_anger,
            isAdviceRequest: existingAnalysis.is_advice_request,
            isMoneyTalk: existingAnalysis.is_money_talk
          });
        }
      } catch (error) {
        console.error('Error processing individual post:', error);
        console.error('Post data:', post);
      }
    }

    // Analyze posts that need it
    if (postsToAnalyze.length > 0) {
      const analyses = await analyzePostsConcurrently(
        postsToAnalyze.map(({ post }) => ({ title: post.title, content: post.content }))
      );

      // Store new analyses in database
      for (let i = 0; i < postsToAnalyze.length; i++) {
        const { post, dbId } = postsToAnalyze[i];
        const analysis = analyses[i];
        
        if (analysis) {
          await serverDb.createPostAnalysis({
            post_id: dbId,
            user_id: userId,
            is_solution_request: analysis.isSolutionRequest,
            is_pain_or_anger: analysis.isPainOrAnger,
            is_advice_request: analysis.isAdviceRequest,
            is_money_talk: analysis.isMoneyTalk,
            analyzed_at: new Date().toISOString()
          });

          existingAnalyses.set(post.id, analysis);
        }
      }
    }

    return redditPosts.map(post => ({
      ...post,
      analysis: existingAnalyses.get(post.id) || null
    }));
  } catch (error) {
    console.error('Error in analyzeAndStorePosts:', error);
    throw error;
  }
}

async function getAnalyzedPosts(subredditName: string, isAuthenticated: boolean, userId: string): Promise<PostWithAnalysis[]> {
  try {
    console.log('Starting getAnalyzedPosts for:', subredditName, { isAuthenticated });
    
    // Create Supabase client
    const supabase = createServerComponentClient<Database>({ cookies });

    // First get the subreddit
    const { data: subredditData, error: subredditError } = await supabase
      .from('subreddits')
      .select('id')
      .eq('name', subredditName)
      .single();

    if (subredditError) {
      console.error('Error fetching subreddit:', subredditError);
      // If no subreddit found, fetch from Reddit directly
      const redditPosts = await fetchRedditPosts(subredditName);
      return redditPosts.map(post => ({
        ...post,
        analysis: null
      }));
    }

    // Immediately fetch existing posts from database
    const { data: existingPosts, error: postsError } = await supabase
      .from('posts')
      .select(`
        *,
        post_analyses (
          is_solution_request,
          is_pain_or_anger,
          is_advice_request,
          is_money_talk,
          analyzed_at
        )
      `)
      .eq('subreddit_id', subredditData.id)
      .order('created_at', { ascending: false });

    if (postsError) {
      console.error('Error fetching posts:', postsError);
      throw postsError;
    }

    // Transform existing posts to PostWithAnalysis format
    const existingAnalyzedPosts: PostWithAnalysis[] = existingPosts.map(post => ({
      id: post.reddit_id,
      title: post.title,
      author: post.author,
      content: post.content || '',
      created_utc: post.created_utc,
      score: post.score,
      num_comments: post.num_comments,
      url: post.url,
      permalink: post.permalink,
      analysis: post.post_analyses?.[0] ? {
        isSolutionRequest: post.post_analyses[0].is_solution_request,
        isPainOrAnger: post.post_analyses[0].is_pain_or_anger,
        isAdviceRequest: post.post_analyses[0].is_advice_request,
        isMoneyTalk: post.post_analyses[0].is_money_talk
      } : null
    }));

    // If we have existing posts, return them immediately
    if (existingAnalyzedPosts.length > 0) {
      // Start background fetch only if authenticated
      if (isAuthenticated) {
        fetchAndAnalyzeNewPosts(subredditName, subredditData.id, userId).catch(console.error);
      }
      return existingAnalyzedPosts;
    }

    // If no existing posts, fetch from Reddit
    const redditPosts = await fetchRedditPosts(subredditName);
    const postsWithoutAnalysis = redditPosts.map(post => ({
      ...post,
      analysis: null
    }));

    // Start background analysis if authenticated
    if (isAuthenticated) {
      fetchAndAnalyzeNewPosts(subredditName, subredditData.id, userId).catch(console.error);
    }

    return postsWithoutAnalysis;
  } catch (error) {
    console.error('Error in getAnalyzedPosts:', error);
    throw error;
  }
}

// New function to handle background fetching and analysis
async function fetchAndAnalyzeNewPosts(subredditName: string, subredditId: string, userId: string) {
  try {
    const redditPosts = await fetchRedditPosts(subredditName);
    await analyzeAndStorePosts(redditPosts, subredditId, userId);
  } catch (error) {
    console.error('Error in background fetch and analysis:', error);
  }
}

async function SharedPostsProvider({ 
  subredditName, 
  isAuthenticated, 
  userId 
}: { 
  subredditName: string
  isAuthenticated: boolean
  userId: string
}) {
  const posts = await getAnalyzedPosts(subredditName, isAuthenticated, userId);
  
  return (
    <SubredditTabs
      postsContent={<PostsList posts={posts} />}
      themesContent={<ThemesList posts={posts} />}
    />
  );
}

function PostsList({ posts }: { posts: PostWithAnalysis[] }) {
  if (!posts || posts.length === 0) {
    return (
      <div className="text-center py-8 text-blue-200">
        <p>No posts found. Fetching new posts...</p>
      </div>
    );
  }

  return <PostsTable posts={posts} />;
}

function ThemesList({ posts }: { posts: PostWithAnalysis[] }) {
  if (!posts || posts.length === 0) {
    return (
      <div className="text-center py-8 text-blue-200">
        <p>No posts found. Fetching new posts...</p>
      </div>
    );
  }

  return <ThemeAnalysis posts={posts} />;
}

export default async function SubredditPage({ params }: SubredditPageProps) {
  const cookieStore = cookies();
  const supabase = createServerComponentClient<Database>({ cookies: () => cookieStore });
  
  const { data: { session }, error } = await supabase.auth.getSession();
  
  if (error) {
    console.error('Error getting session:', error);
  }

  const isAuthenticated = !!session;
  const userId = session?.user?.id || '';

  // First check if subreddit exists
  const { data: subredditData } = await supabase
    .from('subreddits')
    .select('id')
    .eq('name', params.name)
    .single();

  // If no subreddit exists, create it
  if (!subredditData && isAuthenticated) {
    await supabase
      .from('subreddits')
      .insert([{
        name: params.name,
        display_name: params.name,
        user_id: userId
      }]);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-300 to-purple-300">
          r/{params.name}
        </h1>

        <div className="bg-navy-800 bg-opacity-50 rounded-lg shadow-xl p-6">
          <Suspense fallback={
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-300 mb-4"></div>
                <p className="text-blue-200">Loading posts...</p>
              </div>
            </div>
          }>
            <SharedPostsProvider 
              subredditName={params.name}
              isAuthenticated={isAuthenticated}
              userId={userId}
            />
          </Suspense>
        </div>
      </div>
    </div>
  );
}


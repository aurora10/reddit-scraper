import { SubredditTabs } from "@/components/SubredditTabs";
import { PostsTable } from "@/components/PostsTable";
import { ThemeAnalysis } from "@/components/ThemeAnalysis";
import { getTopPosts, type RedditPost } from "@/lib/reddit";
import { analyzePostsConcurrently, type PostCategory } from "@/lib/openai";
import { Suspense } from "react";
import { getSubreddit, createSubreddit, getPostsBySubreddit, createPost, createPostAnalysis, needsRefresh, updateSubredditLastFetched } from "@/lib/db";
import type { Post } from "@/lib/db";

interface SubredditPageProps {
  params: {
    name: string;
  };
}

async function getOrCreateSubreddit(name: string) {
  try {
    const subreddit = await getSubreddit(name);
    return subreddit;
  } catch (error) {
    // If not found, create it
    return await createSubreddit(name, name);
  }
}

async function getAnalyzedPosts(subredditName: string) {
  // Get or create subreddit
  const subreddit = await getOrCreateSubreddit(subredditName);
  
  // Check if we need to refresh the data
  if (needsRefresh(subreddit.last_fetched_at)) {
    // Fetch fresh data from Reddit
    const redditPosts = await getTopPosts(subredditName);
    
    if (redditPosts.length === 0) {
      return [];
    }

    // Analyze posts
    const analyses = await analyzePostsConcurrently(
      redditPosts.map(post => ({ title: post.title, content: post.content }))
    );

    // Store posts and analyses in database
    const storedPosts = await Promise.all(
      redditPosts.map(async (post, index) => {
        const storedPost = await createPost({
          subreddit_id: subreddit.id,
          reddit_id: post.id,
          title: post.title,
          author: post.author,
          content: post.content,
          created_utc: post.created_utc,
          score: post.score,
          num_comments: post.num_comments,
          url: post.url,
          permalink: post.permalink,
          fetched_at: new Date().toISOString()
        });

        const analysis = analyses[index];
        await createPostAnalysis({
          post_id: storedPost.id,
          is_solution_request: analysis.isSolutionRequest,
          is_pain_or_anger: analysis.isPainOrAnger,
          is_advice_request: analysis.isAdviceRequest,
          is_money_talk: analysis.isMoneyTalk,
          analyzed_at: new Date().toISOString()
        });

        return {
          ...storedPost,
          analysis
        };
      })
    );

    // Update last fetched timestamp
    await updateSubredditLastFetched(subreddit.id);

    return storedPosts;
  } else {
    // Get cached data from database
    const posts = await getPostsBySubreddit(subreddit.id);
    return posts.map(post => ({
      ...post,
      analysis: post.post_analyses?.[0] ? {
        isSolutionRequest: post.post_analyses[0].is_solution_request,
        isPainOrAnger: post.post_analyses[0].is_pain_or_anger,
        isAdviceRequest: post.post_analyses[0].is_advice_request,
        isMoneyTalk: post.post_analyses[0].is_money_talk
      } : null
    }));
  }
}

async function PostsList({ subredditName }: { subredditName: string }) {
  try {
    const posts = await getAnalyzedPosts(subredditName);

    if (posts.length === 0) {
      return (
        <div className="text-center py-8">
          <p>No posts found in the last 24 hours</p>
        </div>
      );
    }

    return <PostsTable posts={posts} />;
  } catch (error) {
    console.error('Error loading posts:', error);
    return (
      <div className="text-center py-8 text-red-500">
        <p>Error loading posts. Please try again later.</p>
      </div>
    );
  }
}

async function ThemesList({ subredditName }: { subredditName: string }) {
  try {
    const posts = await getAnalyzedPosts(subredditName);

    if (posts.length === 0) {
      return (
        <div className="text-center py-8">
          <p>No posts found in the last 24 hours</p>
        </div>
      );
    }

    return <ThemeAnalysis posts={posts} />;
  } catch (error) {
    console.error('Error analyzing posts:', error);
    return (
      <div className="text-center py-8 text-red-500">
        <p>Error analyzing posts. Please try again later.</p>
      </div>
    );
  }
}

export default function SubredditPage({ params }: SubredditPageProps) {
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
            <PostsList subredditName={params.name} />
          </Suspense>
        }
        themesContent={
          <Suspense fallback={
            <div className="text-center py-8">
              <p>Analyzing themes...</p>
            </div>
          }>
            <ThemesList subredditName={params.name} />
          </Suspense>
        }
      />
    </div>
  );
}

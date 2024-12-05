import { SubredditTabs } from "@/components/SubredditTabs";
import { PostsTable } from "@/components/PostsTable";
import { ThemeAnalysis } from "@/components/ThemeAnalysis";
import { getTopPosts, type RedditPost } from "@/lib/reddit";
import { analyzePostsConcurrently, type PostCategory } from "@/lib/openai";
import { Suspense } from "react";

interface SubredditPageProps {
  params: {
    name: string;
  };
}

async function PostsList({ subredditName }: { subredditName: string }) {
  try {
    const posts = await getTopPosts(subredditName);

    if (posts.length === 0) {
      return (
        <div className="text-center py-8">
          <p>No posts found in the last 24 hours</p>
        </div>
      );
    }

    return <PostsTable posts={posts} />;
  } catch (error) {
    return (
      <div className="text-center py-8 text-red-500">
        <p>Error loading posts. Please check your Reddit API credentials.</p>
      </div>
    );
  }
}

async function ThemesList({ subredditName }: { subredditName: string }) {
  try {
    const posts = await getTopPosts(subredditName);

    if (posts.length === 0) {
      return (
        <div className="text-center py-8">
          <p>No posts found in the last 24 hours</p>
        </div>
      );
    }

    const analyses = await analyzePostsConcurrently(
      posts.map(post => ({ title: post.title, content: post.content }))
    );

    const postsWithAnalysis = posts.map((post, index) => ({
      ...post,
      analysis: analyses[index]
    }));

    return <ThemeAnalysis posts={postsWithAnalysis} />;
  } catch (error) {
    console.error('Error analyzing posts:', error);
    return (
      <div className="text-center py-8 text-red-500">
        <p>Error analyzing posts. Please check your OpenAI API key.</p>
      </div>
    );
  }
}

export default function SubredditPage({ params }: SubredditPageProps) {
  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold mb-6">r/{params.name}</h1>

      <SubredditTabs 
        postsContent={
          <Suspense fallback={
            <div className="text-center py-8">
              <p>Loading posts...</p>
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

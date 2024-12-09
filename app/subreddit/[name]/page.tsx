// import { SubredditTabs } from "@/components/SubredditTabs";
// import { PostsTable } from "@/components/PostsTable";
// import { ThemeAnalysis } from "@/components/ThemeAnalysis";
// import { getTopPosts } from "@/lib/reddit";
// import { analyzePostsConcurrently } from "@/lib/openai";
// import { Suspense } from "react";
// import { serverDb } from "@/lib/db-server";
// import { cookies } from 'next/headers';
// import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
// import type { PostWithAnalysis, RedditPost } from "@/lib/types";
// import { convertDbAnalysisToPostCategory } from "@/lib/types";

// interface SubredditPageProps {
//   params: {
//     name: string;
//   };
// }

// async function fetchRedditPosts(subredditName: string): Promise<RedditPost[]> {
//   try {
//     console.log('Fetching posts from Reddit for:', subredditName);
//     const posts = await getTopPosts(subredditName);
//     console.log(`Fetched ${posts.length} posts from Reddit`);
//     return posts;
//   } catch (error) {
//     console.error('Error fetching from Reddit:', error);
//     throw error;
//   }
// }

// async function getOrCreateSubreddit(name: string, createIfNotExists = false) {
//   try {
//     console.log('Attempting to get subreddit from database:', name);
//     let subreddit = await serverDb.getSubreddit(name);
    
//     if (!subreddit && createIfNotExists) {
//       console.log('Creating subreddit in database');
//       subreddit = await serverDb.createSubreddit(name, name);
//       console.log('Created subreddit:', subreddit);
//     }
    
//     return subreddit;
//   } catch (error) {
//     console.error('Error in getOrCreateSubreddit:', error);
//     return null;
//   }
// }

// async function analyzeAndStorePosts(redditPosts: RedditPost[], subredditId: string): Promise<PostWithAnalysis[]> {
//   try {
//     console.log('Starting analyzeAndStorePosts with', redditPosts.length, 'posts');
//     const postsToAnalyze: { post: RedditPost; dbId: string }[] = [];
//     const existingAnalyses = new Map();
//     const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

//     // First, create or update posts in the database and check for existing analyses
//     for (const post of redditPosts) {
//       try {
//         console.log('Processing post:', post.id);
//         // Create or update post in database
//         const dbPost = await serverDb.createPost({
//           subreddit_id: subredditId,
//           reddit_id: post.id,
//           title: post.title,
//           author: post.author,
//           content: post.content || '',
//           created_utc: post.created_utc,
//           score: post.score,
//           num_comments: post.num_comments,
//           url: post.url,
//           permalink: post.permalink,
//           fetched_at: new Date().toISOString()
//         });

//         console.log('Post stored in DB:', dbPost.id);

//         // Check for existing analysis less than 24 hours old
//         const existingAnalysis = await serverDb.getPostAnalysis(dbPost.id);
//         console.log('Existing analysis:', existingAnalysis);
        
//         if (!existingAnalysis || new Date(existingAnalysis.analyzed_at) < new Date(twentyFourHoursAgo)) {
//           postsToAnalyze.push({ post, dbId: dbPost.id });
//         } else {
//           existingAnalyses.set(post.id, convertDbAnalysisToPostCategory(existingAnalysis));
//         }
//       } catch (error) {
//         console.error('Error processing individual post:', error);
//         // Continue with other posts even if one fails
//       }
//     }

//     // Analyze posts that need it
//     if (postsToAnalyze.length > 0) {
//       console.log(`Analyzing ${postsToAnalyze.length} posts`);
//       const analyses = await analyzePostsConcurrently(
//         postsToAnalyze.map(({ post }) => ({ title: post.title, content: post.content }))
//       );
//       console.log('Analyses completed:', analyses);

//       // Store new analyses in database
//       for (let i = 0; i < postsToAnalyze.length; i++) {
//         try {
//           const { post, dbId } = postsToAnalyze[i];
//           const analysis = analyses[i];
//           console.log('Storing analysis for post:', dbId, analysis);
          
//           await serverDb.createPostAnalysis({
//             post_id: dbId,
//             is_solution_request: analysis.isSolutionRequest,
//             is_pain_or_anger: analysis.isPainOrAnger,
//             is_advice_request: analysis.isAdviceRequest,
//             is_money_talk: analysis.isMoneyTalk,
//             analyzed_at: new Date().toISOString()
//           });

//           existingAnalyses.set(post.id, analysis);
//         } catch (error) {
//           console.error('Error storing individual analysis:', error);
//           // Continue with other analyses even if one fails
//         }
//       }
//     }

//     // Return all posts with their analyses
//     console.log('Returning posts with analyses');
//     return redditPosts.map(post => {
//       const analysis = existingAnalyses.get(post.id);
//       console.log('Post:', post.id, 'Analysis:', analysis);
//       return {
//         ...post,
//         analysis: analysis || null
//       };
//     });
//   } catch (error) {
//     console.error('Error in analyzeAndStorePosts:', error);
//     throw error;
//   }
// }

// async function getAnalyzedPosts(subredditName: string, isAuthenticated: boolean): Promise<PostWithAnalysis[]> {
//   try {
//     console.log('Starting getAnalyzedPosts for:', subredditName, { isAuthenticated });
    
//     // First try to get posts from Reddit
//     const redditPosts = await fetchRedditPosts(subredditName);
    
//     if (redditPosts.length === 0) {
//       return [];
//     }

//     if (!isAuthenticated) {
//       console.log('User not authenticated, returning Reddit posts without analysis');
//       return redditPosts.map(post => ({
//         ...post,
//         analysis: null
//       }));
//     }

//     // Try to get or create subreddit in database
//     const subreddit = await getOrCreateSubreddit(subredditName, true);
//     if (!subreddit) {
//       console.log('Could not get/create subreddit, returning Reddit posts without analysis');
//       return redditPosts.map(post => ({
//         ...post,
//         analysis: null
//       }));
//     }

//     try {
//       console.log('Analyzing posts with authentication');
//       const analyzedPosts = await analyzeAndStorePosts(redditPosts, subreddit.id);
      
//       if (analyzedPosts.length > 0) {
//         // Only update last_fetched if we successfully analyzed posts
//         console.log('Updating last fetched timestamp');
//         await serverDb.updateSubredditLastFetched(subreddit.id);
//         return analyzedPosts;
//       }
//     } catch (error) {
//       console.error('Error processing posts:', error);
//       throw error; // Propagate error to show proper error message
//     }

//     // If analysis fails, return posts without analysis
//     console.log('Analysis failed, returning Reddit posts without analysis');
//     return redditPosts.map(post => ({
//       ...post,
//       analysis: null
//     }));
//   } catch (error) {
//     console.error('Error in getAnalyzedPosts:', error);
//     throw error;
//   }
// }

// async function PostsList({ subredditName, isAuthenticated }: { subredditName: string; isAuthenticated: boolean }) {
//   try {
//     console.log('Starting PostsList for:', subredditName, { isAuthenticated });
//     const posts = await getAnalyzedPosts(subredditName, isAuthenticated);

//     if (posts.length === 0) {
//       return (
//         <div className="text-center py-8">
//           <p>No posts found in the last 24 hours</p>
//         </div>
//       );
//     }

//     return <PostsTable posts={posts} />;
//   } catch (error) {
//     console.error('Error in PostsList:', error);
//     const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
//     return (
//       <div className="text-center py-8 text-red-500">
//         <p>Error loading posts. Please try again later.</p>
//         {process.env.NODE_ENV === 'development' && (
//           <p className="mt-2 text-sm">{errorMessage}</p>
//         )}
//       </div>
//     );
//   }
// }

// async function ThemesList({ subredditName, isAuthenticated }: { subredditName: string; isAuthenticated: boolean }) {
//   console.log('Starting ThemesList for:', subredditName, { isAuthenticated });

//   if (!isAuthenticated) {
//     console.log('Not authenticated in ThemesList');
//     return (
//       <div className="text-center py-8">
//         <p>Please sign in to view theme analysis</p>
//       </div>
//     );
//   }

//   try {
//     console.log('Authenticated in ThemesList, getting posts');
//     const posts = await getAnalyzedPosts(subredditName, isAuthenticated);

//     if (posts.length === 0) {
//       return (
//         <div className="text-center py-8">
//           <p>No posts found in the last 24 hours</p>
//         </div>
//       );
//     }

//     if (!posts[0].analysis) {
//       console.log('No analysis available for posts');
//       return (
//         <div className="text-center py-8">
//           <p>Error analyzing posts. Please try again later.</p>
//         </div>
//       );
//     }

//     return <ThemeAnalysis posts={posts} />;
//   } catch (error) {
//     console.error('Error in ThemesList:', error);
//     const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
//     return (
//       <div className="text-center py-8 text-red-500">
//         <p>Error analyzing posts. Please try again later.</p>
//         {process.env.NODE_ENV === 'development' && (
//           <p className="mt-2 text-sm">{errorMessage}</p>
//         )}
//       </div>
//     );
//   }
// }

// export default async function SubredditPage({ params }: SubredditPageProps) {
//   const cookieStore = cookies();
//   const supabase = createServerComponentClient({ cookies: () => cookieStore });
  
//   console.log('Checking session in SubredditPage');
//   const { data: { session }, error } = await supabase.auth.getSession();
  
//   if (error) {
//     console.error('Error getting session:', error);
//   }

//   const isAuthenticated = !!session;
//   console.log('Session state:', { 
//     isAuthenticated, 
//     userId: session?.user?.id,
//     hasAccessToken: !!session?.access_token,
//     hasRefreshToken: !!session?.refresh_token,
//     email: session?.user?.email
//   });

//   return (
//     <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//       <h1 className="text-2xl font-bold mb-6 text-center">r/{params.name}</h1>

//       <SubredditTabs
//         postsContent={
//           <Suspense fallback={
//             <div className="text-center py-8">
//               <p>Loading and analyzing posts...</p>
//             </div>
//           }>
//             <PostsList subredditName={params.name} isAuthenticated={isAuthenticated} />
//           </Suspense>
//         }
//         themesContent={
//           <Suspense fallback={
//             <div className="text-center py-8">
//               <p>Analyzing themes...</p>
//             </div>
//           }>
//             <ThemesList subredditName={params.name} isAuthenticated={isAuthenticated} />
//           </Suspense>
//         }
//       />
//     </div>
//   );
// }

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
import { convertDbAnalysisToPostCategory } from "@/lib/types";

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
    console.log('Starting analyzeAndStorePosts with', redditPosts.length, 'posts');
    const postsToAnalyze: { post: RedditPost; dbId: string }[] = [];
    const existingAnalyses = new Map();
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    // First, create or update posts in the database and check for existing analyses
    for (const post of redditPosts) {
      try {
        console.log('Processing post:', post.id);
        // Create or update post in database
        const dbPost = await serverDb.createPost({
          subreddit_id: subredditId,
          reddit_id: post.id,
          title: post.title,
          author: post.author,
          content: post.content || '',
          created_utc: post.created_utc,
          score: post.score,
          num_comments: post.num_comments,
          url: post.url,
          permalink: post.permalink,
          fetched_at: new Date().toISOString()
        });

        console.log('Post stored in DB:', dbPost.id);

        // Check for existing analysis less than 24 hours old
        const existingAnalysis = await serverDb.getPostAnalysis(dbPost.id);
        console.log('Existing analysis:', existingAnalysis);
        
        if (!existingAnalysis || new Date(existingAnalysis.analyzed_at) < new Date(twentyFourHoursAgo)) {
          postsToAnalyze.push({ post, dbId: dbPost.id });
        } else {
          existingAnalyses.set(post.id, convertDbAnalysisToPostCategory(existingAnalysis));
        }
      } catch (error) {
        console.error('Error processing individual post:', error);
        // Continue with other posts even if one fails
      }
    }

    // Analyze posts that need it
    if (postsToAnalyze.length > 0) {
      console.log(`Analyzing ${postsToAnalyze.length} posts`);
      const analyses = await analyzePostsConcurrently(
        postsToAnalyze.map(({ post }) => ({ title: post.title, content: post.content }))
      );
      console.log('Analyses completed:', analyses);

      // Store new analyses in database
      for (let i = 0; i < postsToAnalyze.length; i++) {
        try {
          const { post, dbId } = postsToAnalyze[i];
          const analysis = analyses[i];
          console.log('Storing analysis for post:', dbId, analysis);
          
          await serverDb.createPostAnalysis({
            post_id: dbId,
            is_solution_request: analysis.isSolutionRequest,
            is_pain_or_anger: analysis.isPainOrAnger,
            is_advice_request: analysis.isAdviceRequest,
            is_money_talk: analysis.isMoneyTalk,
            analyzed_at: new Date().toISOString()
          });

          existingAnalyses.set(post.id, analysis);
        } catch (error) {
          console.error('Error storing individual analysis:', error);
          // Continue with other analyses even if one fails
        }
      }
    }

    // Return all posts with their analyses
    console.log('Returning posts with analyses');
    return redditPosts.map(post => {
      const analysis = existingAnalyses.get(post.id);
      console.log('Post:', post.id, 'Analysis:', analysis);
      return {
        ...post,
        analysis: analysis || null
      };
    });
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
      throw error; // Propagate error to show proper error message
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
        <div className="text-center py-8 text-blue-200">
          <p>No posts found in the last 24 hours</p>
        </div>
      );
    }

    return <PostsTable posts={posts} />;
  } catch (error) {
    console.error('Error in PostsList:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return (
      <div className="text-center py-8 text-red-400">
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
      <div className="text-center py-8 text-blue-200">
        <p>Please sign in to view theme analysis</p>
      </div>
    );
  }

  try {
    console.log('Authenticated in ThemesList, getting posts');
    const posts = await getAnalyzedPosts(subredditName, isAuthenticated);

    if (posts.length === 0) {
      return (
        <div className="text-center py-8 text-blue-200">
          <p>No posts found in the last 24 hours</p>
        </div>
      );
    }

    if (!posts[0].analysis) {
      console.log('No analysis available for posts');
      return (
        <div className="text-center py-8 text-blue-200">
          <p>Error analyzing posts. Please try again later.</p>
        </div>
      );
    }

    return <ThemeAnalysis posts={posts} />;
  } catch (error) {
    console.error('Error in ThemesList:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return (
      <div className="text-center py-8 text-red-400">
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-300 to-purple-300">
          r/{params.name}
        </h1>

        <div className="bg-navy-800 bg-opacity-50 rounded-lg shadow-xl p-6">
          <SubredditTabs
            postsContent={
              <Suspense fallback={
                <div className="text-center py-8 text-blue-200">
                  <p>Loading and analyzing posts...</p>
                </div>
              }>
                <PostsList subredditName={params.name} isAuthenticated={isAuthenticated} />
              </Suspense>
            }
            themesContent={
              <Suspense fallback={
                <div className="text-center py-8 text-blue-200">
                  <p>Analyzing themes...</p>
                </div>
              }>
                <ThemesList subredditName={params.name} isAuthenticated={isAuthenticated} />
              </Suspense>
            }
          />
        </div>
      </div>
    </div>
  );
}


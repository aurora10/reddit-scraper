import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { fetchSubredditPosts } from '@/lib/reddit'
import { analyzePostCategory } from '@/lib/openai'
import { Database } from '@/lib/types'

export async function POST(
  request: Request,
  { params }: { params: { name: string } }
) {
  const supabase = createRouteHandlerClient<Database>({ cookies })
  const { subredditId } = await request.json()

  // Get user ID from session
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    console.log('Starting analysis for subreddit:', params.name);
    const redditPosts = await fetchSubredditPosts(params.name)
    console.log(`Fetched ${redditPosts.length} posts to analyze`);

    // Process posts sequentially to avoid rate limits
    for (const post of redditPosts) {
      try {
        // Check if post exists and has analysis
        const { data: existingPost } = await supabase
          .from('posts')
          .select(`
            id,
            reddit_id,
            post_analyses (*)
          `)
          .eq('reddit_id', post.id)
          .single()

        // Skip if post already has analysis
        if (existingPost?.post_analyses?.length > 0) {
          console.log(`Post ${post.id} already analyzed, skipping`);
          continue;
        }

        // Get or create post
        const { data: dbPost, error: postError } = await supabase
          .from('posts')
          .upsert(
            {
              subreddit_id: subredditId,
              user_id: session.user.id,
              reddit_id: post.id,
              title: post.title,
              author: post.author,
              content: post.content || '',
              created_utc: post.created_utc,
              score: post.score || 0,
              num_comments: post.num_comments || 0,
              url: post.url,
              permalink: post.permalink,
              fetched_at: new Date().toISOString(),
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            },
            {
              onConflict: 'reddit_id',  // Use reddit_id as the unique constraint
              ignoreDuplicates: true    // Skip if already exists
            }
          )
          .select()
          .single()

        if (postError) {
          console.error('Error inserting/updating post:', postError);
          continue;
        }

        // If post already exists but has no analysis, analyze it
        console.log(`Analyzing post: ${post.title}`);
        const analysis = await analyzePostCategory({
          title: post.title,
          content: post.content || ''
        });

        if (!analysis) {
          console.error('No analysis returned for post:', post.id);
          continue;
        }

        // Save analysis
        const { data: savedAnalysis, error: analysisError } = await supabase
          .from('post_analyses')
          .insert({
            post_id: dbPost.id,
            user_id: session.user.id,
            is_solution_request: analysis.isSolutionRequest,
            is_pain_or_anger: analysis.isPainOrAnger,
            is_advice_request: analysis.isAdviceRequest,
            is_money_talk: analysis.isMoneyTalk,
            analyzed_at: new Date().toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single()

        if (analysisError) {
          console.error('Error saving analysis:', analysisError);
          continue;
        }

        console.log(`Successfully analyzed and saved post: ${post.id} (DB ID: ${dbPost.id})`);
        console.log('Saved analysis:', savedAnalysis);

        // Add a small delay between posts
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error('Error processing post:', error);
      }
    }

    // Update the subreddit's last_fetched_at timestamp
    const { error: updateError } = await supabase
      .from('subreddits')
      .update({ 
        last_fetched_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', subredditId)

    if (updateError) {
      console.error('Error updating subreddit last_fetched_at:', updateError)
    }

    return NextResponse.json({ status: 'Analysis completed' })
  } catch (error) {
    console.error('Error in analysis route:', error)
    return NextResponse.json(
      { error: 'Failed to process posts' },
      { status: 500 }
    )
  }
} 